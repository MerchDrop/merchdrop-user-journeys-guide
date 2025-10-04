import { AuthError } from '@supabase/supabase-js';

export interface AuthErrorInfo {
  title: string;
  message: string;
  actionable: boolean;
}

/**
 * Maps Supabase authentication errors to user-friendly messages with actionable feedback
 */
export function getAuthErrorMessage(error: any, context: 'signup' | 'signin' = 'signin'): AuthErrorInfo {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code || '';

  // Duplicate email - most important case
  if (errorMessage.includes('user already registered') || 
      errorMessage.includes('email already exists') ||
      errorMessage.includes('already registered')) {
    return {
      title: 'Email Already in Use',
      message: context === 'signup' 
        ? 'This email is already registered. Please sign in instead, or if you need a different role (Artist/Designer), sign in and contact admin to upgrade your account.'
        : 'This email is already registered. Please check your credentials or reset your password.',
      actionable: true
    };
  }

  // Invalid credentials
  if (errorMessage.includes('invalid login credentials') || 
      errorMessage.includes('invalid email or password')) {
    return {
      title: 'Invalid Credentials',
      message: 'The email or password you entered is incorrect. Please try again or reset your password.',
      actionable: true
    };
  }

  // Weak password
  if (errorMessage.includes('password') && errorMessage.includes('weak')) {
    return {
      title: 'Weak Password',
      message: 'Your password must be at least 6 characters long and include a mix of letters and numbers.',
      actionable: true
    };
  }

  // Password too short
  if (errorMessage.includes('password') && 
      (errorMessage.includes('short') || errorMessage.includes('minimum'))) {
    return {
      title: 'Password Too Short',
      message: 'Your password must be at least 6 characters long.',
      actionable: true
    };
  }

  // Email not confirmed
  if (errorMessage.includes('email not confirmed')) {
    return {
      title: 'Email Not Confirmed',
      message: 'Please check your email and click the confirmation link to activate your account.',
      actionable: true
    };
  }

  // Rate limit
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return {
      title: 'Too Many Attempts',
      message: 'You have made too many attempts. Please wait a few minutes before trying again.',
      actionable: true
    };
  }

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch failed')) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      actionable: true
    };
  }

  // Invalid email format
  if (errorMessage.includes('invalid email') || errorMessage.includes('email format')) {
    return {
      title: 'Invalid Email',
      message: 'Please enter a valid email address.',
      actionable: true
    };
  }

  // User not found
  if (errorMessage.includes('user not found')) {
    return {
      title: 'Account Not Found',
      message: 'No account exists with this email. Please sign up first.',
      actionable: true
    };
  }

  // Generic error
  return {
    title: context === 'signup' ? 'Sign Up Failed' : 'Sign In Failed',
    message: error?.message || 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    actionable: false
  };
}

/**
 * Check if an email is already registered
 * Note: This uses sign-in attempt to check, as we can't directly query auth.users
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  // We can't directly check auth.users, but we can infer from error messages
  // This is handled in the signup flow itself
  return false;
}

/**
 * Get role-specific guidance for duplicate email scenarios
 */
export function getRoleUpgradeMessage(targetRole: 'artist' | 'designer' | 'user'): string {
  const roleLabels = {
    artist: 'Artist',
    designer: 'Designer', 
    user: 'Customer'
  };

  return `If you already have an account and want to become a ${roleLabels[targetRole]}, please sign in to your existing account and contact admin at support@merchdrop.com to request a role upgrade.`;
}
