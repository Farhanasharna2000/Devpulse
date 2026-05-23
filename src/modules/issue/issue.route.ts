import { Router } from "express";
import { IssueController } from "./issue.controller.js";
import auth from "../../middleware/auth.js";

const router = Router();

router.post("/", auth, IssueController.createIssue);
router.get("/", IssueController.getAllIssues);
router.get("/:id", IssueController.getSingleIssue);
router.patch("/:id", auth, IssueController.updateIssue);
router.delete("/:id", auth, IssueController.deleteIssue);

export const IssueRoutes = router;
