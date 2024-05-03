import { authModel } from "../models/authModel.js";
import { userModel } from "../models/userModel.js";
import { hash, compare } from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { sendOtp } from "../services/emailService.js";

export const register = async (req, res) => {
	const { email, password } = req.body;
	try {
		const userExists = await authModel.findOne({ email });
		if (userExists) {
			res.status(409).json({ status: "failed", message: "user already exists!" });
		} else {
			const saveOtp = await sendOtp(
				email,
				"AI Mock-Interviewer Verification",
				"your 6 digits code is"
			);
			if (saveOtp.info) {
				const hashedPassword = await hash(password, 10);
				const user = await authModel.create({
					email,
					password: hashedPassword,
				});
				const token = jsonwebtoken.sign(
					{ _id: user._id, email: user.email },
					process.env.ACCESS_TOKEN_SECRET,
					{ expiresIn: "7d" }
				);

				if (user) {
					const { password, ...rest } = user._doc;
					res.status(201).json({
						status: "success",
						message: "sign up successful",
						token,
						userData: rest,
					});
					user.otp = saveOtp.otp;
					await user.save();
				} else {
					res.status(500).json({
						status: "error",
						message: "Failed to create user",
					});
				}
			}
		}
	} catch (err) {
		res.status(500).json({ status: "error", message: err.message });
		console.log(err);
	}
};

//login route
//post
export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const userExists = await authModel.findOne({ email });
		if (!userExists) {
			res.status(400).json({ status: "failure", message: "User not found!" });
		} else {
			const passwordMatch = await compare(password, userExists.password);
			if (!passwordMatch) {
				res.status(401).json({
					status: "Unauthorized",
					message: "wrong password!",
				});
			} else {
				const token = jsonwebtoken.sign(
					{ _id: userExists._id, email: userExists.email },
					process.env.ACCESS_TOKEN_SECRET,
					{ expiresIn: "7d" }
				);
				const userInfo = await userModel.findOne({ userId: userExists._id });
				if (userInfo) {
					res.status(200).json({
						status: "success",
						message: "login successful",
						token,
						userData: userExists,
						userInfo,
					});
				}
			}
		}
	} catch (err) {
		res.status(500).json({ status: "error", message: err.message });
	}
};

export const verifyEmail = async (req, res) => {
	try {
		const { email, verificationCode } = req.body;
		const user = await authModel.findOne({ email });
		if (user && user.otp === verificationCode) {
			const token = jsonwebtoken.sign(
				{ _id: user._id, email: user.email },
				process.env.ACCESS_TOKEN_SECRET,
				{ expiresIn: "7d" }
			);
			const { password, ...rest } = user._doc;
			res.status(200).json({
				status: "success",
				message: "Verification Completed",
				token,
				userData: rest,
			});
		} else {
			res.status(200).json({
				status: "failed",
				message: "Incorrect Verification code",
			});
		}
	} catch (error) {
		res.status(500).json({ status: "error", message: err.message });
	}
};

// export const getUser = async (req, res) => {
// 	try {
// 		const { _id } = req.body;
// 		const user = await authModel.findOne({ _id });
// 		if (user) {
// 			res.status(200).json({ status: "success", message: "got user", userData: user });
// 		}
// 	} catch (error) {
// 		res.status(500).json({ status: "error", message: error.message });
// 	}
// };
