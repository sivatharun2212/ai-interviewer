import express from "express";
import { saveInfo, uploadImage, updateInfo } from "../controllers/userController.js";
import { validateToken } from "../middleware/validateToken.js";
export const userRouter = express.Router();

userRouter.post("/save-info", validateToken, saveInfo);
userRouter.post("/upload-profileImg", validateToken, uploadImage);
userRouter.post("/update-info", validateToken, updateInfo);
