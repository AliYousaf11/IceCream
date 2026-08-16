import crypto from 'crypto';

export interface SafeUser {
  id: string;
  name: string;
  phone: string;
  role?: string;
  createdAt: string;
}

export interface DbUser extends SafeUser {
  passwordHash: string;
  salt: string;
}

/**
 * Hash password securely with salt using SHA-256
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .createHmac('sha256', generatedSalt)
    .update(password)
    .digest('hex');
  return { hash, salt: generatedSalt };
}

/**
 * Verify password against stored hash and salt
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = crypto
    .createHmac('sha256', salt)
    .update(password)
    .digest('hex');
  return computed === hash;
}

/**
 * Clean phone number (removes non-digit characters)
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9+]/g, '').trim();
}

/**
 * Generate secure session token
 */
export function generateToken(userId: string): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(24).toString('hex');
  return `tkn_${userId}_${timestamp}_${random}`;
}
