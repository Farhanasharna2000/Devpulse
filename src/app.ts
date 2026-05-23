import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import cors from 'cors'
import { AuthRoutes } from "./modules/auth/auth.route";

const app: Application = express();

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Devpulse!");
});

app.use("/api/auth",AuthRoutes);
export default app;
