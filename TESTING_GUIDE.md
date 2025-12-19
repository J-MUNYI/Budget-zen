# Testing Guide for Login and Register Pages

## Prerequisites

Before testing, make sure you have:

1. **Backend server running** on port 5000
2. **Frontend dev server running** (usually on port 5173 or similar)
3. **MongoDB connection** configured in your backend `.env` file

## Starting the Servers

### 1. Start the Backend Server

```bash
cd server
npm install  # if you haven't already
npm run dev  # or npm start
```

The server should start on `http://localhost:5000`

### 2. Start the Frontend Server

```bash
cd client
npm install  # if you haven't already
npm run dev
```

The frontend should start on `http://localhost:5173` (or another port if 5173 is in use)

## Testing the Register Page

### Step 1: Navigate to Register Page
- Open your browser and go to `http://localhost:5173/register`
- Or click "Create an account" link from the Login page

### Step 2: Test Registration Form

1. **Test Empty Fields Validation:**
   - Try submitting without filling any fields
   - Should show error: "Please fill in all fields."

2. **Test Password Mismatch:**
   - Fill in name and email
   - Enter different passwords in "Password" and "Confirm Password"
   - Should show error: "Passwords do not match."

3. **Test Short Password:**
   - Enter a password less than 6 characters
   - Should show error: "Password must be at least 6 characters long."

4. **Test Successful Registration:**
   - Fill in all fields correctly:
     - Name: "John Doe"
     - Email: "john@example.com"
     - Password: "password123"
     - Confirm Password: "password123"
   - Click "Create account"
   - Should redirect to `/dashboard` on success
   - User data should be stored in localStorage

### Step 3: Verify Registration in Backend
- Check your MongoDB database to see if the user was created
- Check the server console for any errors

## Testing the Login Page

### Step 1: Navigate to Login Page
- Go to `http://localhost:5173/login`
- Or click "Log in" link from the Register page

### Step 2: Test Login Form

1. **Test Empty Fields Validation:**
   - Try submitting without email or password
   - Should show error: "Please enter both email and password."

2. **Test Invalid Credentials:**
   - Enter email that doesn't exist: "wrong@example.com"
   - Enter any password
   - Should show error: "Invalid credentials"

3. **Test Wrong Password:**
   - Use the email you registered with
   - Enter wrong password
   - Should show error: "Invalid credentials"

4. **Test Successful Login:**
   - Use the credentials you registered with:
     - Email: "john@example.com"
     - Password: "password123"
   - Click "Start now"
   - Should redirect to `/dashboard` on success
   - User data should be stored in localStorage

### Step 3: Verify Login in Browser
- Open browser DevTools (F12)
- Go to Application/Storage tab
- Check localStorage for:
  - `token`: Should contain JWT token
  - `user`: Should contain user object with id, name, email

## Testing User Persistence

1. **Test Remember Me (UI only for now):**
   - The checkbox is visible but functionality can be enhanced later

2. **Test Session Persistence:**
   - After logging in, refresh the page
   - User should remain logged in (check AuthContext)
   - Navigate away and come back - should still be logged in

3. **Test Logout (if implemented):**
   - After logging in, logout should clear localStorage
   - User should be redirected to login page

## Common Issues and Solutions

### Issue: "Failed to fetch" or Network Error
**Solution:**
- Make sure backend server is running on port 5000
- Check if CORS is properly configured (should be enabled in server.js)
- Verify API_URL in AuthContext.jsx matches your backend URL

### Issue: "User already exists" on Registration
**Solution:**
- This is expected if you try to register with the same email twice
- Use a different email or delete the user from MongoDB

### Issue: "Invalid credentials" on Login
**Solution:**
- Make sure you registered the user first
- Verify the email and password match what you registered
- Check MongoDB to see if user exists

### Issue: Page doesn't redirect after login/register
**Solution:**
- Check browser console for errors
- Verify navigation is working (check App.jsx routes)
- Make sure dashboard route exists

## API Endpoints Being Used

- **POST** `/api/auth/register`
  - Body: `{ name, email, password }`
  - Returns: `{ token, user: { id, name, email } }`

- **POST** `/api/auth/login`
  - Body: `{ email, password }`
  - Returns: `{ token, user: { id, name, email } }`

## Environment Variables

If you need to change the API URL, create a `.env` file in the `client` directory:

```
VITE_API_URL=http://localhost:5000
```

Or for production:
```
VITE_API_URL=https://your-backend-url.com
```

## Next Steps

After successful testing:
1. Implement protected routes (redirect to login if not authenticated)
2. Add logout functionality
3. Add token refresh mechanism
4. Enhance error handling and user feedback
5. Add loading states and better UX

