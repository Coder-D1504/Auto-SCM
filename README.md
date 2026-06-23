# Auto-SCM

Auto-SCM is a vehicle marketplace and comparison platform built with a React + Vite frontend, an Express + MySQL backend, and Socket.IO for live compare-state sync. It supports cars, bikes, and heavy-duty vehicles, with authentication, admin management, bookings, recommendations, and image uploads.

## Features

- Browse vehicles by category: cars, bikes, and heavy-duty vehicles
- Compare up to four vehicles side by side
- View detailed vehicle pages with specs and pricing
- Register, log in, and manage user sessions with JWT-based auth
- Admin dashboard for managing vehicles, brands, users, and bookings
- Personalized recommendations based on stored preferences
- Test-drive booking flow with booking history
- Logo and vehicle image uploads
- Live compare list sync with Socket.IO

## Tech Stack

- Frontend: React 19, Vite, React Router, Bootstrap, Framer Motion, Lucide React
- Backend: Node.js, Express, Socket.IO, MySQL2, bcryptjs, jsonwebtoken, multer, dotenv
- Tooling: ESLint, Nodemon

## Project Structure

```text
.
├── backend
│   ├── config
│   ├── controllers
│   ├── middlewares
│   ├── routes
│   ├── services
│   ├── uploads
│   ├── server.js
│   └── .env
├── frontend
│   ├── src
│   ├── public
│   ├── dist
│   └── package.json
├── schema.sql
├── automobiledb.sql
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MySQL 8+

## Setup

### 1) Clone the repository

```bash
git clone <your-repo-url>
cd FullScaleProject
```

### 2) Set up the database

Create a MySQL database named `automobiledb`, then import one of the provided SQL files:

- `schema.sql` for the base schema
- `automobiledb.sql` for the full sample dataset

You can also run the helper scripts in `backend/`:

```bash
cd backend
node import_schema.js
```

or

```bash
cd backend
node import_automobiledb.js
```

### 3) Configure backend environment variables

Create `backend/.env` with values similar to these:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=automobiledb
JWT_SECRET=your_super_secret_jwt_key
```

### 4) Install and run the backend

```bash
cd backend
npm install
npm run dev
```

The API runs at `http://localhost:5000`.

### 5) Install and run the frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Available Scripts

### Backend

- `npm run dev` - start the API with Nodemon
- `npm start` - start the API with Node

### Frontend

- `npm run dev` - start the Vite dev server
- `npm run build` - create a production build
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint

## API Overview

The backend exposes routes under `/api`:

- `/api/auth` - register, login, logout, current user
- `/api/vehicles` - vehicle listing, details, comparison, recommendations, dashboard stats
- `/api/users` - user-related operations and preferences
- `/api/brands` - brand data and logo management
- `/api/bookings` - booking creation and booking history
- `/api/upload` - file upload handling

## Sample Access

If your imported data includes seeded credentials, the admin account is commonly:

```text
admin@autoscm.com / admin123
```

If your local seed data differs, use the credentials from the database seed you imported.

## Notes

- The frontend expects the backend API at `http://localhost:5000/api`.
- Vehicle and brand images are served from the backend `uploads/` and `public/` folders.
- The compare experience is capped at four vehicles at a time.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run the frontend and backend checks.
5. Open a pull request.

