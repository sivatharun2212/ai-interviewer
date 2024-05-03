import express from "express";
import { login, register, verifyEmail } from "../controllers/authController.js";
export const authRouter = express.Router();

authRouter.post("/login", login).post("/register", register).post("/verify-email", verifyEmail);
// authRouter.get("/user", validateToken, getUser);
