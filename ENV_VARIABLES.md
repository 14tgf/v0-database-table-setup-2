# Environment Variables Setup

## Required Environment Variables

To run this application with authentication and database functionality, you need to set the following environment variables in your Vercel project:

### 1. DATABASE_URL (Required)
Your Neon PostgreSQL connection string.

**Format:**
```
postgresql://[user]:[password]@[host]:5432/[database]
```

**How to get it:**
1. Go to https://console.neon.tech
2. Navigate to your project (neon-bisque-envelope)
3. Find the connection string in the dashboard
4. Copy the full connection string

**Example:**
```
DATABASE_URL=postgresql://user:password@ep-green-frost-12345.us-east-1.aws.neon.tech:5432/neondb
```

### 2. JWT_SECRET (Required)
A secret key used to sign and verify JWT authentication tokens.

**How to generate:**
Option A - Using OpenSSL:
```bash
openssl rand -base64 32
```

Option B - Using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important:**
- Keep this secret and never commit it to version control
- Use a different secret for production
- Change it if you suspect compromise

**Example:**
```
JWT_SECRET=your-random-secret-key-here-make-it-long-and-random
```

### 3. NODE_ENV (Recommended)
Specifies the environment (development, production, or test).

**Values:**
- `development` - Local development
- `production` - Production deployment
- `test` - Testing environment

**Example:**
```
NODE_ENV=production
```

## How to Set Environment Variables in Vercel

### Method 1: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Click "Add New"
5. Enter the variable name and value
6. Select which environments it applies to (Production, Preview, Development)
7. Click Save

### Method 2: Vercel CLI
```bash
# Set a production environment variable
vercel env add DATABASE_URL

# Set for a specific environment
vercel env add JWT_SECRET
```

### Method 3: .env.local (Local Development Only)
Create a `.env.local` file in your project root:
```env
DATABASE_URL=postgresql://user:password@your-neon-host:5432/neondb
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

**⚠️ IMPORTANT:** Never commit `.env.local` to Git. Add it to `.gitignore`.

## Verification

To verify environment variables are set correctly:

### In Production
1. Deploy your project to Vercel
2. Check the deployment logs
3. Visit your application at its Vercel URL

### Locally
```bash
# Check if variables are loaded
echo $DATABASE_URL
echo $JWT_SECRET
```

## Troubleshooting

### "DATABASE_URL not set" Error
- Verify the environment variable name is exactly `DATABASE_URL`
- Check it's set in the correct environment (production, preview, development)
- Redeploy after adding the variable

### Connection Refused
- Verify your DATABASE_URL is correct and complete
- Test the Neon connection in the Neon dashboard
- Check your Vercel function timeout isn't too short

### "JWT verification failed"
- Ensure JWT_SECRET is set in the environment
- Verify it's the same across all deployments
- Check that tokens aren't expired (24-hour expiration)

## Security Best Practices

1. **Never share secrets** - Keep JWT_SECRET and DATABASE_URL private
2. **Use strong secrets** - Generate random, long secrets (32+ characters)
3. **Rotate secrets regularly** - Change JWT_SECRET periodically
4. **Environment-specific secrets** - Use different secrets for dev/staging/production
5. **Monitor access** - Check Vercel's activity logs for suspicious changes
6. **Use .gitignore** - Never commit .env files to version control

## Next Steps

1. Get your DATABASE_URL from Neon console
2. Generate a secure JWT_SECRET
3. Add both to your Vercel project environment variables
4. Set NODE_ENV to production for your production deployment
5. Redeploy your application
6. Test the login/register flows

## Reference

- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables
- Neon Console: https://console.neon.tech
- Neon Connection Strings: https://neon.tech/docs/connect/connection-details
