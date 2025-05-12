'use server';

import { signIn } from '@/lib/services/auth';
import { AuthError } from 'next-auth';

function isAuthErrorWithType(error: unknown): error is { type: string } {
  return typeof error === 'object' && error !== null && 'type' in error;
}

export async function authenticateAction(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      await signIn('credentials', formData);
    } catch (error) {
      if (error instanceof AuthError && isAuthErrorWithType(error)) {
        switch (error.type) {
          case 'CredentialsSignin':
            return 'Invalid credentials.';
          default:
            return 'Something went wrong.';
        }
      }
      throw error;
    }
}