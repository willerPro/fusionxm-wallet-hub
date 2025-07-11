
import { supabase } from '@/integrations/supabase/client';

/**
 * Sign in a user with email (OTP will be sent)
 * @param email User's email
 * @returns Object containing error if any and data if successful
 */
export const signInWithOTP = async (email: string) => {
  try {
    // Trim email to prevent whitespace issues
    const trimmedEmail = email.trim().toLowerCase();
    
    console.log("Sending OTP to:", trimmedEmail);
    
    const { data, error } = await supabase.auth.signInWithOtp({ 
      email: trimmedEmail,
      options: {
        shouldCreateUser: false
      }
    });
    
    console.log("OTP send result:", error ? "Error" : "Success");
    
    if (error) {
      return { error };
    }
    
    return { error: null, data };
  } catch (error) {
    console.error("OTP send exception:", error);
    return { error };
  }
};

/**
 * Verify OTP code
 * @param email User's email
 * @param token OTP token
 * @returns Object containing error if any and data if successful
 */
export const verifyOTP = async (email: string, token: string) => {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    
    console.log("Verifying OTP for:", trimmedEmail);
    
    const { data, error } = await supabase.auth.verifyOtp({
      email: trimmedEmail,
      token,
      type: 'email'
    });
    
    console.log("OTP verify result:", error ? "Error" : "Success");
    
    if (error) {
      return { error };
    }
    
    if (data?.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    
    return { error: null, data };
  } catch (error) {
    console.error("OTP verify exception:", error);
    return { error };
  }
};

/**
 * Sign up a new user with email (OTP will be sent)
 * @param email User's email
 * @param firstName User's first name
 * @param lastName User's last name
 * @returns Object containing error if any and userCreated flag
 */
export const signUpWithOTP = async (email: string, firstName: string, lastName: string) => {
  try {
    // Trim and lowercase email to prevent issues
    const trimmedEmail = email.trim().toLowerCase();
    
    console.log("Attempting to sign up with:", trimmedEmail);
    
    // Sign up with OTP
    const { data, error } = await supabase.auth.signInWithOtp({ 
      email: trimmedEmail,
      options: {
        shouldCreateUser: true,
        data: {
          first_name: firstName,
          last_name: lastName,
          email: trimmedEmail
        }
      }
    });
    
    console.log("OTP signup result:", error ? "Error" : "Success");
    
    if (error) {
      // User already registered check
      if (error.message && error.message.includes("User already registered")) {
        return { error: { message: "An account with this email already exists. Please log in instead." } };
      }
      
      return { error };
    }
    
    return { error: null, userCreated: true };
  } catch (error) {
    console.error("OTP signup exception:", error);
    return { error };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    // Clear localStorage first
    localStorage.removeItem("user");
    localStorage.clear(); // Clear all storage to ensure complete logout
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      return { error };
    } else {
      console.log("Sign out completed");
      return { error: null };
    }
  } catch (error) {
    console.error("Exception during sign out:", error);
    return { error };
  }
};
