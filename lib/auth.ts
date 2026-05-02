'use client';

// Authentication validation and business logic
// Future: Integrate with Neon PostgreSQL or auth provider

export interface AuthCredentials {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requirements: min 8 chars, at least 1 number, 1 uppercase, 1 lowercase
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Process authentication - either login or register based on email existence
 * Future: Replace with actual database/auth provider logic
 */
export async function authenticateUser(
  credentials: AuthCredentials
): Promise<AuthResponse> {
  try {
    // Validate input
    if (!validateEmail(credentials.email)) {
      return {
        success: false,
        message: 'Please enter a valid email address',
      };
    }

    const passwordValidation = validatePassword(credentials.password);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        message: passwordValidation.errors[0],
      };
    }

    // TODO: Implement actual authentication
    // For now, mock success response
    const userId = `user_${Date.now()}`;
    const mockToken = `token_${userId}`;

    return {
      success: true,
      message: 'Authentication successful',
      token: mockToken,
      user: {
        id: userId,
        email: credentials.email,
        fullName: credentials.fullName || 'User',
      },
    };
  } catch (error) {
    console.error('[v0] Auth error:', error);
    return {
      success: false,
      message: 'Authentication failed. Please try again.',
    };
  }
}
