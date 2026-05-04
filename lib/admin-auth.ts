import { sql } from './db';
import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';

export interface Admin {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
  last_login: Date | null;
  created_at: Date;
}

export interface AdminSession {
  id: string;
  admin_id: string;
  token_hash: string;
  expires_at: Date;
  user_agent: string | null;
  ip_address: string | null;
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

export async function createAdmin(email: string, password: string, fullName: string): Promise<Admin> {
  const passwordHash = await hashPassword(password);
  
  const result = await sql`
    INSERT INTO admins (email, password_hash, full_name)
    VALUES (${email}, ${passwordHash}, ${fullName})
    RETURNING id, email, full_name, status, last_login, created_at
  `;
  
  if (!result || result.length === 0) {
    throw new Error('Failed to create admin');
  }
  
  return result[0] as Admin;
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const result = await sql`
    SELECT id, email, full_name, status, last_login, created_at
    FROM admins
    WHERE email = ${email} AND status = 'active'
  `;
  
  return result.length > 0 ? (result[0] as Admin) : null;
}

export async function getAdminById(id: string): Promise<Admin | null> {
  const result = await sql`
    SELECT id, email, full_name, status, last_login, created_at
    FROM admins
    WHERE id = ${id} AND status = 'active'
  `;
  
  return result.length > 0 ? (result[0] as Admin) : null;
}

export async function getAdminPasswordHash(email: string): Promise<string | null> {
  const result = await sql`
    SELECT password_hash FROM admins
    WHERE email = ${email} AND status = 'active'
  `;
  
  return result.length > 0 ? result[0].password_hash : null;
}

export async function createAdminSession(
  adminId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<{ token: string; sessionId: string }> {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const sessionId = randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  
  await sql`
    INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at, user_agent, ip_address)
    VALUES (${sessionId}, ${adminId}, ${tokenHash}, ${expiresAt}, ${userAgent || null}, ${ipAddress || null})
  `;
  
  return { token, sessionId };
}

export async function getAdminSession(tokenHash: string): Promise<AdminSession | null> {
  const result = await sql`
    SELECT id, admin_id, token_hash, expires_at, user_agent, ip_address
    FROM admin_sessions
    WHERE token_hash = ${tokenHash} AND expires_at > NOW()
  `;
  
  return result.length > 0 ? (result[0] as AdminSession) : null;
}

export async function invalidateAdminSession(sessionId: string): Promise<void> {
  await sql`
    DELETE FROM admin_sessions WHERE id = ${sessionId}
  `;
}

export async function updateAdminLastLogin(adminId: string): Promise<void> {
  await sql`
    UPDATE admins SET last_login = NOW() WHERE id = ${adminId}
  `;
}
