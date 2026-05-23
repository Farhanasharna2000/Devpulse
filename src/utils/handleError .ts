import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

export const handleError = (error: unknown, res: Response) => {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Something went wrong",
    errors: errorMessage,
  });
};
