import { NextRequest, NextResponse } from 'next/server';
import { getAdminById } from '@/lib/admin-auth';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

export async function verifyAdminAuth(request: NextRequest) {
  try {
    const cookie = request.cookies.get('admin_session')?.value;
    
    if (!cookie) {
      return null;
    }
    
    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const adminId = payload.sub as string;
    
    if (!adminId) {
      return null;
    }
    
    const admin = await getAdminById(adminId);
    return admin;
  } catch (error) {
    return null;
  }
}

export function adminMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Public paths that don't require auth
  const publicPaths = ['/admin/login'];
  
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }
  
  // For protected admin paths, verification happens in the component/route
  return NextResponse.next();
}
