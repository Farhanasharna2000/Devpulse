# Devpulse

Devpulse is a backend API built with Node.js, Express, TypeScript, and PostgreSQL. It provides user authentication and an issue management system.

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
   git clone <repository-url>
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
- `POST /signup` - Register a new user
- `POST /login` - Authenticate a user and receive a JWT

### Issues (`/api/issues`)
- `GET /` - Retrieve all issues
- `GET /:id` - Retrieve a single issue by its ID
- `POST /` - Create a new issue (Requires Auth)
- `PATCH /:id` - Update an existing issue (Requires Auth)
- `DELETE /:id` - Delete an issue (Requires Auth)