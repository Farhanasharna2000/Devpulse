import { Pool } from "pg";
import config from "../config/index.js";

export const pool = new Pool({
  connectionString: config.connection_String,
});

export const initDB = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users(
   
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password TEXT NOT NULL,
     role VARCHAR(20) DEFAULT 'contributor',
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      ) `);

    await pool.query(`CREATE TABLE IF NOT EXISTS issues(
   
     id SERIAL PRIMARY KEY,
     title VARCHAR(150) NOT NULL,
     description TEXT NOT NULL,
     type VARCHAR(50) NOT NULL,
     status VARCHAR(50) DEFAULT 'open',
     reporter_id INTEGER NOT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      ) `);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};
