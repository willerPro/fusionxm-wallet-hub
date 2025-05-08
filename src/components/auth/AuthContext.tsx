import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { emailService } from '@/services/emailService';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null, userCreated?: boolean }>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Send login notification email when user signs in
        if (event === 'SIGNED_IN' && currentSession?.user) {
          try {
            const userEmail = currentSession.user.email;
            if (userEmail) {
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
            }
          } catch (error) {
            console.error("Error sending login notification email:", error);
            // Don't block the auth flow if email fails
          }
        }
        
        // Update localStorage for MainLayout authorization check
        if (currentSession?.user) {
          localStorage.setItem("user", JSON.stringify(currentSession.user));
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem("user");
        }
      }
    );

    // Build HTML template for login notification email
    const buildLoginEmailTemplate = (email: string, datetime: string, location: string): string => {
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

    // Then get the initial session
    const fetchSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", currentSession?.user?.email || "No session");
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Update localStorage for MainLayout authorization check
        if (currentSession?.user) {
          localStorage.setItem("user", JSON.stringify(currentSession.user));
        } else {
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Trim email to prevent whitespace issues
      const trimmedEmail = email.trim().toLowerCase();
      
      console.log("Attempting to sign in with:", trimmedEmail);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: trimmedEmail, 
        password 
      });
      
      console.log("Sign in result:", error ? "Error" : "Success");
      
      if (!error && data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      
      return { error };
    } catch (error) {
      console.error("Sign in exception:", error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Trim and lowercase email to prevent issues
      const trimmedEmail = email.trim().toLowerCase();
      
      console.log("Attempting to sign up with:", trimmedEmail);
      
      // First try to sign up the user
      const { data, error } = await supabase.auth.signUp({ 
        email: trimmedEmail, 
        password 
      });
      
      console.log("Sign up result:", error ? "Error" : "Success");
      
      if (error) {
        // If we got a database error but the user might have been created, inform the user
        if (error.message && error.message.includes("Database error saving new user")) {
          console.log("Database error occurred, but user may have been created. Attempting to login...");
          
          // Try to log in with the credentials to see if the user was actually created
          const { error: loginError } = await supabase.auth.signInWithPassword({ 
            email: trimmedEmail, 
            password 
          });
          
          if (!loginError) {
            // User was created and can log in, so this was just an error with the user_settings table
            return { error: null, userCreated: true };
          }
        }
        
        // User already registered check
        if (error.message && error.message.includes("User already registered")) {
          return { error: { message: "An account with this email already exists. Please log in instead." } };
        }
        
        return { error };
      }
      
      return { error: null, userCreated: true };
    } catch (error) {
      console.error("Sign up exception:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      } else {
        localStorage.removeItem("user");
        console.log("Sign out completed");
      }
    } catch (error) {
      console.error("Exception during sign out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
