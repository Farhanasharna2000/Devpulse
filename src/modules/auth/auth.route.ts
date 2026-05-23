import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Auth route working");
});

export const AuthRoutes = router;