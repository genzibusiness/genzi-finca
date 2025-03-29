
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";
import * as puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { Resend } from "npm:resend@1.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const { emails, options } = await req.json();
    
    // Validate inputs
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Initialize Supabase client with environment variables
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get transactions data
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .limit(50);
    
    if (transactionsError) {
      throw new Error(`Error fetching transactions: ${transactionsError.message}`);
    }
    
    // Generate PDF report (mock implementation - would be replaced with actual PDF generation)
    // In a production environment, you would use Puppeteer or similar to render a dashboard and capture as PDF
    
    // For now, we'll send a simple HTML email with transaction data
    const totalIncome = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netCashflow = totalIncome - totalExpenses;
    
    // Create HTML content for the email
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .summary-item { display: flex; justify-content: space-between; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
            .positive { color: green; }
            .negative { color: red; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Finca Financial Report</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            ${options.includeSummary ? `
              <h2>Financial Summary</h2>
              <div class="summary">
                <div class="summary-item">
                  <strong>Total Income:</strong>
                  <span class="positive">$${totalIncome.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                  <strong>Total Expenses:</strong>
                  <span class="negative">$${totalExpenses.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                  <strong>Net Cashflow:</strong>
                  <span class="${netCashflow >= 0 ? 'positive' : 'negative'}">
                    $${netCashflow.toFixed(2)}
                  </span>
                </div>
              </div>
            ` : ''}
            
            ${options.includeTransactions ? `
              <h2>Recent Transactions</h2>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  ${transactions.slice(0, 10).map(transaction => `
                    <tr>
                      <td>${transaction.date}</td>
                      <td>${transaction.type}</td>
                      <td class="${transaction.type === 'income' ? 'positive' : 'negative'}">
                        ${transaction.currency} ${transaction.amount}
                      </td>
                      <td>${transaction.expense_type || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
            
            <div class="footer">
              <p>Powered by <a href="https://genzi.ai">genzi.ai</a></p>
              <p>This is an automated report from your Finca financial management application.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Send email to each recipient
    const emailPromises = emails.map(async (email) => {
      return resend.emails.send({
        from: "Finca Reports <onboarding@resend.dev>",
        to: email,
        subject: "Your Finca Financial Report",
        html: htmlContent,
      });
    });
    
    await Promise.all(emailPromises);
    
    return new Response(
      JSON.stringify({ success: true, message: "Reports sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-report function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
