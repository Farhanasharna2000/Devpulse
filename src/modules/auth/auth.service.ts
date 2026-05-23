import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../db/index.js";

import config from "../../config/index.js";
import type { TUser } from "./auth.interface.js";

//Register user

const signupUser = async (payload: TUser) => {
  const { name, email, password, role } = payload;

  // check existing user
  const existingUser = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);

  if (existingUser.rows.length > 0) {
    throw new Error("User already exists");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
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
    [name, email, hashedPassword, role],
  );

  return result.rows[0];
};

//Login user

const loginUser = async (email: string, password: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);

  const user = result.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  const passwordMatched = await bcrypt.compare(password, user.password);

  if (!passwordMatched) {
    throw new Error("Incorrect password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role,
    },
    config.jwt_secret,
    {
      expiresIn: config.jwt_expires_in,
    },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
};

export const AuthService = {
  signupUser,
  loginUser,
};
