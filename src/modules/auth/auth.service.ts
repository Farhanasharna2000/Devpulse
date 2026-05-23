import bcrypt from "bcrypt";

import { pool } from "../../db/index.js";

import config from "../../config/index.js";
import type { TUser } from "./auth.interface.js";


const signupUser = async (payload: TUser) => {
  const { name, email, password, role } = payload;

  // check existing user
  const existingUser = await pool.query(
    `SELECT * FROM users WHERE email=$1`,
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("User already exists");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds )
  );

  // insert user
  const result = await pool.query(
    `
    INSERT INTO users(
      name,
      email,
      password,
      role
    )
    VALUES($1,$2,$3,$4)

    RETURNING
      id,
      name,
      email,
      role,
      created_at,
      updated_at
    `,
    [name, email, hashedPassword, role]
  );

  return result.rows[0];
};

export const AuthService = {
  signupUser,
};