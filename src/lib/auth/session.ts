import { cookies } from 'next/headers';
import { AppError } from '@/lib/errors/app-error';

export interface AuthSession {
  userId: string;
  shopId: string;
  role: string;
  userName: string;
  shopName: string;
  mobile: string;
}

export const SESSION_COOKIE_NAME = 'kirana_session';
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds (persists across device browser closures)

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE,
    expires: new Date(Date.now() + SESSION_MAX_AGE * 1000),
  };
}

export function createSessionToken(session: AuthSession): string {
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

export function decodeSessionToken(token: string): AuthSession | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.userId && parsed.shopId && parsed.role) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get current session from cookie, or auto-provision default demo shop if completely empty so the app works seamlessly out of the box!
 */
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const parsed = decodeSessionToken(token);
    if (parsed) return parsed;
  }

  return null;
}

export async function requireAuthSession(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    throw new AppError({
      code: 'AUTH_REQUIRED',
      message: 'Authentication required. Please sign in.',
      statusCode: 401,
    });
  }
  return session;
}
