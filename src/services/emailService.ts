
import { supabase } from "@/integrations/supabase/client";

interface SendEmailProps {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Sends an email using the Supabase Edge Function
 * @param emailData The email data to send
 * @returns A promise that resolves with the function result
 */
const sendEmail = async (emailData: SendEmailProps) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: emailData,
    });

    if (error) {
      console.error('Error invoking send-email function:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in sendEmail service:', error);
    throw error;
  }
};

/**
 * Sends a simple text email
 * @param to Recipient email address
 * @param subject Email subject
 * @param message Plain text message
 * @returns A promise that resolves with the function result
 */
const sendTextEmail = (to: string, subject: string, message: string) => {
  return sendEmail({
    to,
    subject,
    text: message,
  });
};

/**
 * Sends an HTML email
 * @param to Recipient email address
 * @param subject Email subject
 * @param htmlContent HTML content as a string
 * @param textFallback Optional plain text fallback
 * @returns A promise that resolves with the function result
 */
const sendHtmlEmail = (to: string, subject: string, htmlContent: string, textFallback?: string) => {
  return sendEmail({
    to,
    subject,
    html: htmlContent,
    text: textFallback || stripHtmlTags(htmlContent),
  });
};

/**
 * A simple function to strip HTML tags from a string to create plain text
 * @param html HTML content
 * @returns Plain text with HTML tags removed
 */
const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>?/gm, '');
};

/**
 * Builds a simple HTML email template
 * @param title Email title
 * @param content Main content sections as HTML strings
 * @returns Complete HTML template as a string
 */
const buildHtmlTemplate = (title: string, ...content: string[]): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            padding-bottom: 10px;
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${title}</h2>
        </div>
        <div class="content">
          ${content.join('\n')}
        </div>
        <div class="footer">
          <p>This is an automated email, please do not reply directly.</p>
        </div>
      </body>
    </html>
  `;
};

/**
 * Sends a withdrawal notification email
 * @param params Object containing email, amount, coinType and address
 * @returns A promise that resolves with the function result
 */
const sendWithdrawalNotification = async (params: {
  email: string;
  amount: number;
  coinType: string;
  address: string;
}) => {
  const { email, amount, coinType, address } = params;
  
  const subject = `Withdrawal Request for ${amount} ${coinType}`;
  const content = buildHtmlTemplate(
    'Withdrawal Request Initiated',
    `<p>Your withdrawal request has been received and is being processed.</p>`,
    `<p><strong>Amount:</strong> ${amount} ${coinType}</p>`,
    `<p><strong>Destination Address:</strong> ${address}</p>`,
    `<p>You will be notified once the transaction has been processed.</p>`
  );
  
  return sendHtmlEmail(email, subject, content);
};

// Export as an object with all the methods
export const emailService = {
  sendEmail,
  sendTextEmail,
  sendHtmlEmail,
  buildHtmlTemplate,
  sendWithdrawalNotification
};
