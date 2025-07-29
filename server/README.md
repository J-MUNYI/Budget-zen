
###  Run the server

For development (with auto-restart):
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will run on `http://localhost:5000` by default.

---

## API Endpoints

| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| POST   | /api/auth/register    | Register a new user   |
| POST   | /api/auth/login       | Login user            |
| GET    | /api/expenses         | Get all user expenses |
| POST   | /api/expenses         | Add new expense       |
| PUT    | /api/expenses/:id     | Update expense        |
| DELETE | /api/expenses/:id     | Delete expense        |

---

## Deployment

- Deploy on [Render](https://render.com/), [Railway](https://railway.app/), [Heroku](https://heroku.com/), or similar.
- Set your environment variables (`MONGO_URI`, `JWT_SECRET`) in the platform dashboard.
- Use the following settings:
  - **Root Directory:** `server`
  - **Build Command:** `echo "No build step"`
  - **Start Command:** `npm start`
  - Deployment link -  https://budget-zen.onrender.com

---

## Author
Joan Munyi - J_MUNYI ( GitHub )
