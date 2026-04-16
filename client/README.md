# Personal Expense Tracker (Frontend)

A mobile-first web app to track your daily, weekly, and monthly expenses.

## Features

- User authentication (register/login)
- Add, edit, and delete expenses
- Filter expenses by category and date
- Dashboard with charts and summaries
- Responsive design (mobile-first)

## Tech Stack

- React.js (Vite)
- Tailwind CSS
- Axios
- React Router

## Getting Started

Use Node.js 18+ for local development.

1. **Install dependencies:**
   ```bash
   cd client
   npm install
   ```

2. **Create your local environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Run the app locally:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env` file in the `client` directory:

```bash
VITE_API_URL=
VITE_API_PROXY_TARGET=http://localhost:5000
```

- Leave `VITE_API_URL` empty during local development to use the Vite proxy.
- Set `VITE_API_URL` to your deployed backend URL when the frontend and backend are hosted separately.


## Deployment

- Deploy the frontend on [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/).
- Set the build command to `npm run build` and the output directory to `dist`.
- Deployment link - https://budget-zen.onrender.com ( For backend. Frontend not yet deployed but currently runs locally via Vite [npm run dev] and is fully functional.

## Author
Joan Munyi - (J-MUNYI)GitHub
