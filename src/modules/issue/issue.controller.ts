import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { IssueService } from "./issue.service.js";
import { pool } from "../../db/index.js";
import { handleError } from "../../utils/handleError .js";

//Create issue

const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;

    if (!title || !description || !type) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (req.user.role !== "contributor" && req.user.role !== "maintainer") {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Forbidden access",
      });
    }

    const reporterId = req.user.id;

    const result = await IssueService.createIssue(req.body, reporterId);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error) {
    handleError(error, res);
  }
};

//get issues

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await IssueService.getAllIssues(req.query);

    res.status(StatusCodes.OK).json({
      success: true,
       message: "Issues retrived successfully",
      data: result,
    });
  } catch (error) {
    handleError(error, res);
  }
};

//get single issue

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const issueId = Number(req.params.id);

    if (isNaN(issueId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid issue id",
      });
    }

    const result = await IssueService.getSingleIssue(issueId);

    if (!result) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Issues retrived successfully",
      data: result,
    });
  } catch (error) {
    handleError(error, res);
  }
};

//update issue
const updateIssue = async (req: Request, res: Response) => {
  try {
    const issueId = Number(req.params.id);

    if (isNaN(issueId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid issue id",
      });
    }

    const { title, description, type } = req.body;

    if (!title && !description && !type) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "At least one field is required",
      });
    }

    if (type && !["bug", "feature_request"].includes(type)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid issue type",
      });
    }

    const issueResult = await pool.query(
      `
      SELECT *
      FROM issues
      WHERE id = $1
      `,
      [issueId],
    );

    const issue = issueResult.rows[0];

    if (!issue) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Issue not found",
      });
    }

    const user = req.user;

    // maintainer
    if (user.role === "maintainer") {
      const result = await IssueService.updateIssue(issueId, {
        title,
        description,
        type,
      });

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Issue updated successfully",
        data: result,
      });
    }

    // contributor
    if (user.role === "contributor") {
      if (issue.reporter_id !== user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "You can update only your own issues",
        });
      }

      if (issue.status !== "open") {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "You can update only open issues",
        });
      }

      const result = await IssueService.updateIssue(issueId, {
        title,
        description,
        type,
      });

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Issue updated successfully",
        data: result,
      });
    }

    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: "Forbidden access",
    });
  } catch (error) {
    handleError(error, res);
  }
};

//delete issue
const deleteIssue = async (req: Request, res: Response) => {
  try {
    const issueId = Number(req.params.id);

    if (isNaN(issueId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid issue id",
      });
    }

    // only maintainer can delete
    if (req.user.role !== "maintainer") {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Forbidden access",
      });
    }

    const existingIssue = await pool.query(
      `
        SELECT *
        FROM issues
        WHERE id = $1
        `,
      [issueId],
    );

    if (existingIssue.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Issue not found",
      });
    }

    await IssueService.deleteIssue(issueId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const IssueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
