
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { sendLoginNotificationEmail } from '@/services/authNotificationService';
import { signInWithOTP, signUpWithOTP, verifyOTP, signOut as authSignOut } from '@/services/authService';
import { useNavigate, useLocation } from 'react-router-dom';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signInWithOTP: (email: string) => Promise<{ error: any | null, data?: any }>;
  signUpWithOTP: (email: string, firstName: string, lastName: string) => Promise<{ error: any | null, userCreated?: boolean }>;
  verifyOTP: (email: string, token: string) => Promise<{ error: any | null, data?: any }>;
  signOut: () => Promise<{ error: any | null }>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
            // Use setTimeout to avoid potential auth deadlocks
            setTimeout(async () => {
              try {
                await sendLoginNotificationEmail(currentSession.user);
              } catch (error) {
                console.error("Error in login notification flow:", error);
              }
            }, 0);
          } catch (error) {
            console.error("Error in login notification flow:", error);
            // Don't block the auth flow if notification fails
          }
          
          // Redirect to dashboard after successful sign in if on login page
          if (location.pathname === '/login' || location.pathname === '/signup') {
            navigate('/dashboard');
          }
        }
        
        // Update localStorage for MainLayout authorization check
        if (currentSession?.user) {
          localStorage.setItem("user", JSON.stringify(currentSession.user));
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem("user");
          // Redirect to login page after sign out
          navigate('/login');
        }
      }
    );

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
          
          // Redirect to dashboard if already logged in and on login page
          if (location.pathname === '/login' || location.pathname === '/signup') {
            navigate('/dashboard');
          }
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
  }, [navigate, location.pathname]);

  // Use the extracted auth functions but keep them in context
  const signOut = authSignOut;

  return (
    <AuthContext.Provider value={{ session, user, signInWithOTP, signUpWithOTP, verifyOTP, signOut, loading }}>
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
