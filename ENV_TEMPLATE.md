# Environment Variables Template

Copy this to `.env.local` and fill in your values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dormchef"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Optional: Email service (for password reset, etc.)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@dormchef.com"
```

## Development Setup

1. Set up PostgreSQL database
2. Copy this template to `.env.local`
3. Fill in the database URL and other required values
4. Run `npm run dev` to start the development server