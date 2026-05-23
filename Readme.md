# Devpulse

Devpulse is a backend API built with Node.js, Express, TypeScript, and PostgreSQL. It provides user authentication and an issue management system.

## Live URL

https://devpulse-black.vercel.app

## Features

- **User Authentication:** Secure signup and login functionality using JSON Web Tokens (JWT) and `bcrypt` for password hashing.
- **Issue Management:** Complete CRUD (Create, Read, Update, Delete) operations for issues.
- **Protected Routes:** Endpoints for creating, updating, and deleting issues are secured via authentication middleware.
- **TypeScript Support:** Strongly typed codebase for better maintainability and error checking.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (`pg`)
- **Authentication:** `jsonwebtoken`, `bcrypt`

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) database

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/Farhanasharna2000/Devpulse.git
   cd Devpulse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env` file in the root directory:
   ```env
   PORT=9000
   CONNECTIONSTRING=postgresql://username:password@localhost:5432/devpulse
   BCRYPT_SALT_ROUNDS=10
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=1d
   ```

### Running the Application

- **Development Mode:** Runs with `tsx` and restarts on file changes.
  ```bash
  npm run dev
  ```
- **Build:** Compiles the TypeScript code into JavaScript using `tsup`.
  ```bash
  npm run build
  ```
- **Production Mode:** Runs the compiled code.
  ```bash
  npm start
  ```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate a user and receive a JWT

### Issues (`/api/issues`)
- `GET /api/issues` - Retrieve all issues
- `GET /api/issues/:id` - Retrieve a single issue by its ID
- `POST /api/issues` - Create a new issue (Requires Auth)
- `PATCH /api/issues/:id` - Update an existing issue (Requires Auth)
- `DELETE /api/issues/:id` - Delete an issue (Requires Auth)

## Database Schema Summary

### users Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | User full name |
| email | VARCHAR(255) | Unique user email |
| password | TEXT | Hashed password |
| role | VARCHAR(20) | User role (default: contributor) |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

### issues Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| title | VARCHAR(150) | Issue title |
| description | TEXT | Issue description |
| type | VARCHAR(50) | Issue type (bug/feature) |
| status | VARCHAR(50) | Issue status (default: open) |
| reporter_id | INTEGER | ID of issue reporter |
| created_at | TIMESTAMP | Issue creation time |
| updated_at | TIMESTAMP | Last update time |