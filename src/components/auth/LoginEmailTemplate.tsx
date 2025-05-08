
/**
 * Email template builder for login notifications
 */

/**
 * Builds HTML template for login notification email
 * @param email User's email address
 * @param datetime Formatted date and time of login
 * @param location Location of login (if available)
 * @returns Complete HTML email template as string
 */
export const buildLoginEmailTemplate = (email: string, datetime: string, location: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Login Alert</title>
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
          .alert {
            background-color: #f8f8f8;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin-bottom: 20px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #777;
          }
          .btn {
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>New Login to Your NEXORAVEST Account</h2>
        </div>
        <p>Hello,</p>
        <p>We detected a new sign-in to your NEXORAVEST account.</p>
        
        <div class="alert">
          <p><strong>Account:</strong> ${email}</p>
          <p><strong>Time:</strong> ${datetime}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Device:</strong> Web Browser</p>
        </div>
        
        <p>If this was you, no action is needed. You can disregard this email.</p>
        <p>If you <strong>did not</strong> sign in recently, someone else might have access to your account. Please secure your account immediately by changing your password.</p>
        
        <a href="https://nexoravest.com/reset-password" class="btn">Secure My Account</a>
        
        <div class="footer">
          <p>This is an automated security notification. Please do not reply directly to this email.</p>
          <p>NEXORAVEST Investment Management Platform</p>
        </div>
      </body>
    </html>
  `;
};
