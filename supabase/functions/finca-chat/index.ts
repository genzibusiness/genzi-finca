
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

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
    // Get OpenAI API key from environment variables
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Parse the request body
    const { query, authToken } = await req.json();

    if (!query) {
      throw new Error('Query is required');
    }

    // Create a Supabase client using the provided auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://pbnxbxnapcsjttlbehyu.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseKey) {
      throw new Error('Supabase key not found');
    }
    
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    });

    // Fetch relevant data based on the query
    // This is a simplified implementation - we'll fetch transactions data
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*');

    if (error) {
      throw new Error(`Error fetching data: ${error.message}`);
    }

    // Format transaction data for OpenAI
    const formattedData = transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      date: t.date,
      category: t.expense_type,
      status: t.status,
      currency: t.currency,
    }));

    // Create a prompt with the financial data
    const systemPrompt = `
You are FincaBot, a financial assistant for Genzi Finca, a financial management application.
You help users analyze their financial data and answer questions about their finances.
You have access to their transaction data which looks like this:
${JSON.stringify(formattedData.slice(0, 10))}

(This is just a sample of the data, there are ${formattedData.length} total transactions)

When analyzing financial data:
1. If the user asks about specific time periods like months or years, filter the data accordingly
2. Only include relevant transactions based on the user's question (income, expenses, or specific categories)
3. If doing calculations, explain your process step by step
4. Present monetary values with the correct currency symbol
5. Present your answers in a professional but friendly tone
6. Format numbers for readability (e.g., 1,000,000 instead of 1000000)
7. If providing monthly analyses, organize by month
8. If the user's question is unclear, ask for clarification
9. If you don't have enough data to answer the question, explain why and suggest alternatives

Always maintain a professional tone and be helpful.
`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
      }),
    });

    const openAIResponse = await response.json();

    if (!openAIResponse.choices || openAIResponse.choices.length === 0) {
      throw new Error('Invalid response from OpenAI API');
    }

    // Return the response
    return new Response(
      JSON.stringify({
        answer: openAIResponse.choices[0].message.content,
        rawData: {
          transactionCount: formattedData.length
        },
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in finca-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
