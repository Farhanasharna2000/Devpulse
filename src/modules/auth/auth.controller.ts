import type { Request,Response } from "express";

const signup = async (
  req: Request,
  res: Response
) => {
  res.json({
    success: true,
    message: "Signup working",
  });
};

export const AuthController = {
  signup,
};