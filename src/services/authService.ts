
import { supabase } from '@/integrations/supabase/client';

/**
 * Sign in a user with email and password
 * @param email User's email
 * @param password User's password
 * @returns Object containing error if any
 */
export const signIn = async (email: string, password: string) => {
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
    
    return { error, data };
  } catch (error) {
    console.error("Sign in exception:", error);
    return { error };
  }
};

/**
 * Sign up a new user with email and password
 * @param email User's email
 * @param password User's password
 * @returns Object containing error if any and userCreated flag
 */
export const signUp = async (email: string, password: string) => {
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

/**
 * Sign out the current user
 */
export const signOut = async () => {
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
