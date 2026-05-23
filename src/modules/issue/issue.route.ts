import { Router } from "express";
import { IssueController } from "./issue.controller.js";
import auth from "../../middleware/auth.js";

const router = Router();

router.post("/", auth, IssueController.createIssue);

export const IssueRoutes = router;
