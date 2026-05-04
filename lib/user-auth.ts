import { sql as getSql } from './db';
import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  kyc_status: string;
  account_type: string;
  status: string;
  wallet_balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  user_agent: string | null;
  ip_address: string | null;
  created_at: Date;
}

const SALT_ROUNDS = 12;
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Register a new user account
 */
export async function registerUser(
  email: string,
  password: string,
  fullName: string
): Promise<{ user: User; token: string } | null> {
  try {
    const sql = getSql();
    const passwordHash = await hashPassword(password);
    
    // Check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;
    
    if (existing && existing.length > 0) {
      return null; // User already exists
    }

    // Create new user
    const result = await sql`
      INSERT INTO users (email, password_hash, full_name, account_type, wallet_balance)
      VALUES (${email}, ${passwordHash}, ${fullName}, 'standard', 0)
      RETURNING id, email, full_name, phone, kyc_status, account_type, status, wallet_balance, created_at, updated_at
    `;

    if (!result || result.length === 0) {
      throw new Error('Failed to create user');
    }

    const user = result[0] as User;
    const token = generateSessionToken();
    
    // Create session
    await createUserSession(user.id, token);

    return { user, token };
  } catch (error) {
    console.error('[v0] Registration error:', error);
    return null;
  }
}

/**
 * Authenticate user with email and password
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  try {
    const sql = getSql();

    // Get user by email
    const result = await sql`
      SELECT id, email, full_name, phone, kyc_status, account_type, status, wallet_balance, password_hash, created_at, updated_at
      FROM users
      WHERE email = ${email} AND status = 'active'
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      return null; // User not found
    }

    const user = result[0] as User & { password_hash: string };

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return null; // Invalid password
    }

    const token = generateSessionToken();
    
    // Create session
    await createUserSession(user.id, token);

    // Remove password hash from return value
    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  } catch (error) {
    console.error('[v0] Login error:', error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const sql = getSql();
    const result = await sql`
      SELECT id, email, full_name, phone, kyc_status, account_type, status, wallet_balance, created_at, updated_at
      FROM users
      WHERE id = ${userId} AND status = 'active'
      LIMIT 1
    `;

    return result.length > 0 ? (result[0] as User) : null;
  } catch (error) {
    console.error('[v0] Get user error:', error);
    return null;
  }
}

/**
 * Create user session
 */
export async function createUserSession(
  userId: string,
  token: string,
  userAgent?: string,
  ipAddress?: string
): Promise<UserSession | null> {
  try {
    const sql = getSql();
    const tokenHash = hashToken(token);
    const sessionId = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    const result = await sql`
      INSERT INTO sessions (id, user_id, token_hash, expires_at, user_agent, ip_address)
      VALUES (${sessionId}, ${userId}, ${tokenHash}, ${expiresAt}, ${userAgent || null}, ${ipAddress || null})
      RETURNING id, user_id, token_hash, expires_at, user_agent, ip_address, created_at
    `;

    return result.length > 0 ? (result[0] as UserSession) : null;
  } catch (error) {
    console.error('[v0] Create session error:', error);
    return null;
  }
}

/**
 * Get user session by token hash
 */
export async function getUserSession(tokenHash: string): Promise<UserSession | null> {
  try {
    const sql = getSql();
    const result = await sql`
      SELECT id, user_id, token_hash, expires_at, user_agent, ip_address, created_at
      FROM sessions
      WHERE token_hash = ${tokenHash} AND expires_at > NOW()
      LIMIT 1
    `;

    return result.length > 0 ? (result[0] as UserSession) : null;
  } catch (error) {
    console.error('[v0] Get session error:', error);
    return null;
  }
}

/**
 * Validate session and return user if valid
 */
export async function validateUserSession(token: string): Promise<User | null> {
  try {
    const tokenHash = hashToken(token);
    const session = await getUserSession(tokenHash);

    if (!session) {
      return null;
    }

    const user = await getUserById(session.user_id);
    return user;
  } catch (error) {
    console.error('[v0] Validate session error:', error);
    return null;
  }
}

/**
 * Invalidate session
 */
export async function invalidateUserSession(sessionId: string): Promise<void> {
  try {
    const sql = getSql();
    await sql`
      DELETE FROM sessions WHERE id = ${sessionId}
    `;
  } catch (error) {
    console.error('[v0] Invalidate session error:', error);
  }
}

/**
 * Invalidate all sessions for a user (logout from all devices)
 */
export async function invalidateAllUserSessions(userId: string): Promise<void> {
  try {
    const sql = getSql();
    await sql`
      DELETE FROM sessions WHERE user_id = ${userId}
    `;
  } catch (error) {
    console.error('[v0] Invalidate all sessions error:', error);
  }
}
