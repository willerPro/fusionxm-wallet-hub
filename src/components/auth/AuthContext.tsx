
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Update localStorage for MainLayout authorization check
        if (currentSession?.user) {
          localStorage.setItem("user", JSON.stringify(currentSession.user));
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem("user");
        }
      }
    );

    // Get the initial session
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log("Sign in result:", error ? "Error" : "Success", data?.user?.email);
      
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
      const { data, error } = await supabase.auth.signUp({ email, password });
      console.log("Sign up result:", error ? "Error" : "Success", data?.user?.email);
      
      if (!error && data?.user) {
        // Don't store user in localStorage yet as they need to confirm their email
        console.log("User created, waiting for email confirmation");
      }
      
      return { error };
    } catch (error) {
      console.error("Sign up exception:", error);
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      localStorage.removeItem("user");
      console.log("Sign out completed");
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
