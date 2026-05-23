import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import cors from "cors";
import { AuthRoutes } from "./modules/auth/auth.route";
import { IssueRoutes } from "./modules/issue/issue.route";

const app: Application = express();

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Devpulse!");
});

app.use("/api/auth", AuthRoutes);
app.use("/api/issues", IssueRoutes);

export default app;
