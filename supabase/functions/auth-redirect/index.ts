
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const type = searchParams.get('type');
    const token = searchParams.get('token');
    const host = url.hostname;
    const protocol = url.protocol;
    
    // Create Supabase client using environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Determine base URL for redirects based on host
    const baseUrl = `${protocol}//${host}/`;
    
    // Email confirmation flow
    if (type === 'signup' && token) {
      // The token will be automatically verified by Supabase when requested with this URL format
      const redirectUrl = `${baseUrl}confirm-signup#access_token=${token}`;
      console.log(`Email confirmation requested. Redirecting to: ${redirectUrl}`);
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': redirectUrl,
        },
      });
    }
    
    // Password reset flow
    if (type === 'recovery' && token) {
      // Redirect to the password reset page with the token
      const redirectUrl = `${baseUrl}reset-password#access_token=${token}`;
      console.log(`Password reset requested. Redirecting to: ${redirectUrl}`);
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': redirectUrl,
        },
      });
    }
    
    // Magic link flow
    if (type === 'magiclink' && token) {
      const redirectUrl = `${baseUrl}`;
      console.log(`Magic link login successful. Redirecting to: ${redirectUrl}`);
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': redirectUrl,
        },
      });
    }
    
    // If type is not recognized or token is missing
    return new Response(
      JSON.stringify({ 
        error: 'Invalid request parameters', 
        details: 'Missing or invalid type/token' 
      }), 
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error) {
    console.error('Error handling auth redirect:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
