
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    // Get the request body with file data
    const { fileUrl, fileName } = await req.json();
    
    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`Processing file: ${fileName}`);
    console.log(`File URL: ${fileUrl}`);

    // Fetch the file data
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
    }
    
    // Get file as blob
    const fileBlob = await fileResponse.blob();
    
    // Convert the file to base64
    const fileBuffer = await fileBlob.arrayBuffer();
    const fileBase64 = btoa(
      new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    console.log("Sending file to OpenAI Vision API for OCR extraction...");
    
    // Call OpenAI API with the Vision model to extract text and information
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at OCR extraction from receipts and invoices. Extract the following details in JSON format: date (YYYY-MM-DD), amount (number), vendor_name (string), expense_type (categorize as: "Salary", "Marketing", "Services", "Software", or "Other"). If you cannot determine a value, use null.'
          },
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: 'Extract the transaction information from this receipt/invoice document.' 
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${fileBase64}`,
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    const ocrData = await openAIResponse.json();
    console.log("Received response from OpenAI");
    
    if (!ocrData.choices || ocrData.choices.length === 0) {
      throw new Error('No data returned from OpenAI');
    }
    
    // Parse the response to extract structured data
    const responseText = ocrData.choices[0].message.content;
    console.log("OCR extraction result:", responseText);
    
    // Try to parse the JSON from the response
    let extractedData;
    try {
      // Find JSON in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON data not found in response');
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      
      // Fallback: attempt to extract basic info through regex if JSON parsing fails
      extractedData = {
        date: extractDateFromText(responseText),
        amount: extractAmountFromText(responseText),
        vendor_name: null,
        expense_type: "Other"
      };
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: extractedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in OCR extraction:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions to extract data using regex as a fallback
function extractDateFromText(text) {
  // Look for common date formats
  const datePatterns = [
    /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/, // YYYY-MM-DD or YYYY/MM/DD
    /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/, // DD-MM-YYYY or MM-DD-YYYY
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Try to parse and format as YYYY-MM-DD
      try {
        const dateParts = match[1].split(/[-/]/);
        if (dateParts.length === 3) {
          // If year appears to be first (length 4)
          if (dateParts[0].length === 4) {
            return `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
          } 
          // If year appears to be last (length 4)
          else if (dateParts[2].length === 4) {
            return `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
          }
        }
      } catch (e) {
        console.error("Date parsing error:", e);
      }
      return null;
    }
  }
  return null;
}

function extractAmountFromText(text) {
  // Look for currency amount patterns
  const amountPatterns = [
    /total:?\s*[\$€£¥]?\s*(\d+[.,]\d+)/i,
    /amount:?\s*[\$€£¥]?\s*(\d+[.,]\d+)/i,
    /[\$€£¥]\s*(\d+[.,]\d+)/,
    /(\d+[.,]\d+)(?:\s*[\$€£¥])/,
  ];
  
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Convert to number and return
      try {
        return parseFloat(match[1].replace(',', '.'));
      } catch (e) {
        console.error("Amount parsing error:", e);
      }
    }
  }
  return null;
}
