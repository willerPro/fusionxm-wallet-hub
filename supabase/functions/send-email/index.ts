
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const GMAIL_EMAIL = Deno.env.get("GMAIL_EMAIL") || "";
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD") || "";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if we have the required credentials
    if (!GMAIL_EMAIL || !GMAIL_APP_PASSWORD) {
      console.error("Missing email credentials");
      return new Response(
        JSON.stringify({ error: "Email service not properly configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse the request body
    const requestData: EmailRequest = await req.json();
    
    // Validate required fields
    if (!requestData.to || !requestData.subject || (!requestData.text && !requestData.html)) {
      return new Response(
        JSON.stringify({ error: "Missing required email fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Configure SMTP client
    const client = new SmtpClient();
    
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: GMAIL_EMAIL,
      password: GMAIL_APP_PASSWORD,
    });

    // Send the email
    const from = requestData.from || `App <${GMAIL_EMAIL}>`;
    
    await client.send({
      from: from,
      to: requestData.to,
      subject: requestData.subject,
      content: requestData.html || "",
      html: requestData.html || "",
      text: requestData.text || "",
    });

    await client.close();

    console.log(`Email sent successfully to ${requestData.to}`);
    
    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
