# OAuth Setup Guide for Google and Instagram

This guide will help you set up Google and Instagram OAuth authentication for Budget Zen.

## Prerequisites

- A Google account
- An Instagram/Facebook developer account
- Access to your backend server environment variables

## Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required information (App name, User support email, etc.)
   - Add your email to test users if needed
   - Click **Save and Continue** through the steps
6. For **Application type**, select **Web application**
7. Add **Authorized JavaScript origins**:
   - `http://localhost:5000` (for local development)
   - `https://your-backend-domain.com` (for production)
8. Add **Authorized redirect URIs**:
   - `http://localhost:5000/api/auth/google/callback` (for local development)
   - `https://your-backend-domain.com/api/auth/google/callback` (for production)
9. Click **Create**
10. Copy the **Client ID** and **Client Secret**

### Step 2: Add Google Credentials to Backend

Add these to your `.env` file in the `server` directory:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=/api/auth/google/callback
```

## Instagram OAuth Setup

### Step 1: Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Choose **Consumer** as the app type
4. Fill in:
   - **App Display Name**: Budget Zen (or your preferred name)
   - **App Contact Email**: Your email
5. Add Instagram as a product for the app if prompted
6. Click **Create App**

### Step 2: Configure Instagram Login

1. In your app dashboard, find the Instagram product and click **Set Up**
2. Choose **Web** as the platform
3. Add your site URL:
   - `http://localhost:5173` (for local development)
   - `https://your-frontend-domain.com` (for production)
4. Go to **Settings** > **Basic** and note your **App ID** and **App Secret**
5. Add **Valid OAuth Redirect URIs**:
   - `http://localhost:5000/api/auth/instagram/callback` (for local development)
   - `https://your-backend-domain.com/api/auth/instagram/callback` (for production)
6. Click **Save Changes**

### Step 3: Add Instagram Credentials to Backend

Add these to your `.env` file in the `server` directory:

```env
INSTAGRAM_CLIENT_ID=your-instagram-client-id-here
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret-here
INSTAGRAM_CALLBACK_URL=/api/auth/instagram/callback
```

## Additional Environment Variables

Make sure your `.env` file also includes:

```env
# Backend Configuration
PORT=5000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret-key

# Frontend URL (for OAuth callbacks)
CLIENT_URL=http://localhost:5173

# OAuth Callbacks (full URLs if needed)
# For production, you might need:
# GOOGLE_CALLBACK_URL=https://your-backend-domain.com/api/auth/google/callback
# INSTAGRAM_CALLBACK_URL=https://your-backend-domain.com/api/auth/instagram/callback
```

## Testing OAuth

1. Make sure your backend server is running (`npm run dev` in the `server` directory)
2. Make sure your frontend is running (`npm run dev` in the `client` directory)
3. Go to the login or register page
4. Click **Continue with Google** or **Continue with Instagram**
5. You should be redirected to the OAuth provider's login page
6. After authentication, you'll be redirected back to your app

## Troubleshooting

### "Route not found" Error

- Make sure your backend server is running
- Check that `VITE_API_URL` in your frontend `.env` matches your backend URL
- Verify CORS is configured correctly in `server.js`

### OAuth Redirect Issues

- Ensure redirect URIs match exactly in both OAuth provider settings and your backend
- Check that `CLIENT_URL` in your backend `.env` matches your frontend URL
- For production, use HTTPS URLs

### "Invalid Credentials" Error

- Verify your Google and Instagram client credentials are correct
- Make sure environment variables are loaded (restart server after adding them)
- Check that OAuth consent screen is properly configured (Google)

### CORS Errors

- Ensure `CLIENT_URL` in backend `.env` includes your frontend URL
- Check that CORS middleware allows credentials

## Production Deployment

When deploying to production:

1. Update all callback URLs to use HTTPS
2. Update `CLIENT_URL` to your production frontend URL
3. Ensure your OAuth provider settings include production URLs
4. Use secure session cookies (already configured in `server.js`)
5. Keep your secrets secure - never commit `.env` files

## Security Notes

- Never commit `.env` files to version control
- Use strong, random values for `JWT_SECRET` and `SESSION_SECRET`
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in your provider dashboards
