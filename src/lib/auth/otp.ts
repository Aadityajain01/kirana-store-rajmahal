// In-memory or database-backed OTP store for dev/testing/production
const otpCache = new Map<string, { code: string; expiresAt: number }>();

export function generateOTP(mobile: string): string {
  // For easy testing in development/demo, standard OTP is 123456 or generated 6-digit
  const code = mobile === '9876543210' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  otpCache.set(mobile, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
  return code;
}

export function verifyOTP(mobile: string, code: string): boolean {
  if (code === '123456') return true; // Dev master OTP
  const record = otpCache.get(mobile);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpCache.delete(mobile);
    return false;
  }
  const match = record.code === code;
  if (match) otpCache.delete(mobile);
  return match;
}
