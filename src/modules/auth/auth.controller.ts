import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { StatusCodes } from "http-status-codes/build/cjs/status-codes";

const signup = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.signupUser(req.body);

    //201 status code for resource created successfully
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Failed to register user",
      data: error,
    });
  }
};

export const AuthController = {
  signup,
};
