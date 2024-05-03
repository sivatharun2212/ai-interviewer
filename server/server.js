import express from "express";
import cors from "cors";
import { authRouter } from "./routes/authRouter.js";
import { userRouter } from "./routes/userRouter.js";
import { interviewRouter } from "./routes/interviewRouter.js";
import { dbConnection } from "./db-config/dbConnection.js";
const app = express();

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ parameterLimit: 100000, limit: "100mb" }));
app.use(cors());
// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
dbConnection();
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
const PORT = process.env.PORT;

app.listen(PORT, () => {
	console.log(`server is running on port ${PORT}`);
});
