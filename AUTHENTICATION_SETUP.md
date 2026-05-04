# Authentication Setup & Configuration Guide

## Overview

This project uses:
- **Database**: Neon (PostgreSQL serverless)
- **Authentication**: JWT with HTTP-only cookies
- **Password Hashing**: bcryptjs
- **Pages**: Separate `/login` and `/register` pages

## Database Schema

The `users` table has been created in your Neon database with the following structure:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) DEFAULT 'standard',
  status VARCHAR(50) DEFAULT 'active',
  wallet_balance NUMERIC DEFAULT 0,
  preferred_currency VARCHAR(10) DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## File Structure

### Pages
- `/login` - Login page for existing users
- `/register` - Registration page for new users
- `/dashboard` - Protected dashboard (requires authentication)

### Components
- `components/auth/auth-layout.tsx` - Shared layout for auth pages
- `components/auth/login-form.tsx` - Login form component
- `components/auth/register-form.tsx` - Registration form component
- `components/auth/social-login.tsx` - Social login buttons

### API Routes
- `/api/auth/login` - Login endpoint
- `/api/auth/register` - Registration endpoint
- `/api/auth/logout` - Logout endpoint
- `/api/auth/verify` - Session verification endpoint

### Hooks
- `hooks/useAuth.ts` - Authentication hook for managing auth state and redirects

### Middleware
- `middleware.ts` - Protects routes and handles authentication redirects

## Environment Variables Required

Make sure these environment variables are set in your Vercel project:

```env
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

## How to Use

### 1. Register a New Account
1. Navigate to `/register`
2. Enter your full name, email, and password
3. Confirm your password
4. Click "Create Account"
5. You'll be automatically redirected to `/dashboard`

### 2. Login
1. Navigate to `/login`
2. Enter your email and password
3. Click "Sign In"
4. You'll be automatically redirected to `/dashboard`

### 3. Protected Routes
The following routes require authentication:
- `/dashboard` and all sub-routes
- Any route starting with `/dashboard/`
- Attempting to access these without authentication redirects to `/login`

### 4. Logout
Users can logout through the dashboard navigation, which will:
1. Clear the authentication cookie
2. Redirect to `/login`

## Authentication Flow

```
User Registration:
1. User fills out form on /register
2. Data sent to /api/auth/register
3. Password is hashed with bcryptjs
4. User record created in database
5. JWT token generated and set as HTTP-only cookie
6. User redirected to /dashboard

User Login:
1. User fills out form on /login
2. Data sent to /api/auth/login
3. User lookup by email
4. Password verified against hash
5. JWT token generated and set as HTTP-only cookie
6. User redirected to /dashboard

Protected Route Access:
1. Middleware intercepts request
2. Checks for auth_token cookie
3. Verifies JWT signature
4. If valid, allows access
5. If invalid or missing, redirects to /login
```

## Security Features

1. **Password Hashing**: Passwords are hashed with bcryptjs (10 salt rounds) before storage
2. **JWT Tokens**: Secure JSON Web Tokens with 24-hour expiration
3. **HTTP-Only Cookies**: Auth tokens stored in HTTP-only secure cookies (prevents XSS attacks)
4. **Database Constraints**: Email uniqueness enforced at database level
5. **Token Verification**: All protected routes verify token before granting access
6. **Input Validation**: Client-side validation before sending to server

## API Endpoints

### POST /api/auth/register
```json
Request:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (201):
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

### POST /api/auth/login
```json
Request:
{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

### GET /api/auth/verify
```json
Response (200):
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "user"
  }
}
```

### POST /api/auth/logout
```json
Response (200):
{
  "success": true,
  "message": "Logout successful"
}
```

## Troubleshooting

### Users can't register
- Check that `DATABASE_URL` is set correctly
- Verify the Neon database is accessible
- Check browser console for error messages
- Look at server logs for database connection errors

### Login not working
- Verify the password is correct (case-sensitive)
- Check that the email exists in the database
- Ensure `JWT_SECRET` is set

### Can't access dashboard after login
- Check that the auth cookie was set in the browser (Developer Tools > Application > Cookies)
- Verify the JWT_SECRET matches between login and middleware
- Check middleware.ts is properly configured

### Redirect loops
- Ensure `/login` and `/register` are listed in `PUBLIC_AUTH_ROUTES` in middleware.ts
- Verify protected routes use correct path patterns
- Check that authenticated users aren't stuck redirecting

## Next Steps

1. Test the registration and login flows
2. Customize the auth forms to match your branding
3. Add additional user fields as needed
4. Implement password reset functionality
5. Add email verification
6. Set up social authentication (OAuth)

## Support

For issues with Neon database:
- Visit: https://neon.tech/docs
- Check Neon Console: https://console.neon.tech

For Next.js middleware issues:
- Visit: https://nextjs.org/docs/app/building-your-application/routing/middleware

For JWT issues:
- Check the jose library: https://github.com/panva/jose
