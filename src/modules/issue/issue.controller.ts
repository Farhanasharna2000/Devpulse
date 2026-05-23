import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { IssueService } from "./issue.service.js";
import { pool } from "../../db/index.js";

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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

//get issues

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await IssueService.getAllIssues(req.query);

    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
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
      data: result,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

//update issue
const updateIssue = async (
  req: Request,
  res: Response
) => {
  try {
    const issueId = Number(
      req.params.id
    );

    if (isNaN(issueId)) {
      return res
        .status(
          StatusCodes.BAD_REQUEST
        )
        .json({
          success: false,
          message: "Invalid issue id",
        });
    }

    const issueResult =
      await pool.query(
        `
        SELECT *
        FROM issues
        WHERE id = $1
        `,
        [issueId]
      );

    const issue =
      issueResult.rows[0];

    if (!issue) {
      return res
        .status(
          StatusCodes.NOT_FOUND
        )
        .json({
          success: false,
          message: "Issue not found",
        });
    }

    const user = req.user;

    // maintainer can update any issue
    if (user.role === "maintainer") {
      const result =
        await IssueService.updateIssue(
          issueId,
          req.body
        );

      return res
        .status(StatusCodes.OK)
        .json({
          success: true,
          message:
            "Issue updated successfully",
          data: result,
        });
    }

    // contributor can update own open issue only
    if (
      user.role === "contributor"
    ) {
      if (
        issue.reporter_id !== user.id
      ) {
        return res
          .status(
            StatusCodes.FORBIDDEN
          )
          .json({
            success: false,
            message:
              "You can update only your own issues",
          });
      }

      if (
        issue.status !== "open"
      ) {
        return res
          .status(
            StatusCodes.FORBIDDEN
          )
          .json({
            success: false,
            message:
              "You can update only open issues",
          });
      }

      const result =
        await IssueService.updateIssue(
          issueId,
          req.body
        );

      return res
        .status(StatusCodes.OK)
        .json({
          success: true,
          message:
            "Issue updated successfully",
          data: result,
        });
    }

    return res
      .status(StatusCodes.FORBIDDEN)
      .json({
        success: false,
        message:
          "Forbidden access",
      });
  } catch (error) {
    res
      .status(
        StatusCodes.INTERNAL_SERVER_ERROR
      )
      .json({
        success: false,
        message:
          "Something went wrong",
      });
  }
};

export const IssueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue
};
