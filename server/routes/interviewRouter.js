import express from "express";
import {
	test,
	updateAnswers,
	answersValidate,
	getInterviews,
} from "../controllers/interviewController.js";
import { validateToken } from "../middleware/validateToken.js";
export const interviewRouter = express.Router();

interviewRouter
	.post("/test", validateToken, test)
	.post("/answers-validate", validateToken, answersValidate);
interviewRouter.put("/update-answers", validateToken, updateAnswers);
interviewRouter.get("/get-interviews", validateToken, getInterviews);
