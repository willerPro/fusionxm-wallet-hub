
import { emailService } from '@/services/emailService';
import { buildLoginEmailTemplate } from '@/components/auth/LoginEmailTemplate';
import { User } from '@supabase/supabase-js';

/**
 * Send login notification email to the user
 * @param user The user who just logged in
 * @returns Promise resolving when email is sent
 */
export const sendLoginNotificationEmail = async (user: User): Promise<void> => {
  try {
    const userEmail = user.email;
    if (!userEmail) {
      console.error("Cannot send login notification: user email is undefined");
      return;
    }
    
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    // Get approximate location based on IP (for demo purposes this is simplified)
    const location = "Unknown Location"; // In a real app, you'd use a geolocation service
    
    // Use the HTML email template
    const htmlContent = buildLoginEmailTemplate(userEmail, formattedDate, location);
    
    await emailService.sendEmail({
      to: userEmail,
      subject: "New Login Detected - NEXORAVEST",
      html: htmlContent,
      text: `We detected a new login to your NEXORAVEST account on ${formattedDate} from ${location}. If this was you, no action is needed. If you didn't log in, please secure your account immediately.`
    });
    
    console.log("Login notification email sent");
  } catch (error) {
    console.error("Error sending login notification email:", error);
    // Don't block the auth flow if email fails
  }
};
