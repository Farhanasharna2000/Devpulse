import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const config = {
  connection_String: process.env.CONNECTIONSTRING as string,
  port: process.env.PORT,
  becrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS as string,
  jwt_secret: process.env.JWT_SECRET as string,
  jwt_expires_in: process.env.JWT_EXPIRES_IN as string,
};

export default config;
