import { v2 as cloudinary } from "cloudinary";
import { nanoid } from "nanoid";
import { authModel } from "../models/authModel.js";
import { userModel } from "../models/userModel.js";
// cloudinary configuration
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export const saveInfo = async (req, res) => {
	console.log("started");
	const { firstName, lastName, age, gender, collegeName, space, userSpaces, profileBase64 } =
		req.body;
	const { _id, email } = req.user;
	try {
		console.log("uploading");
		const uploadResult = await cloudinary.uploader.upload(profileBase64, {
			public_id: nanoid(),
		});
		console.log("uploaded", uploadResult);
		const user = await authModel.findOne({ email });
		console.log("user", user);
		if (!user) {
			console.log("not user");
			res.status(400).json({
				status: "failed",
				message: "user not found please register",
			});
		} else {
			console.log("creating");
			const newUserData = await userModel.create({
				userId: _id,
				firstName,
				lastName,
				age,
				gender,
				collegeName,
				space,
				userSpaces,
				image: {
					url: uploadResult.secure_url,
					public_id: uploadResult.public_id,
				},
			});
			console.log("created", newUserData);
			if (newUserData) {
				console.log("res sent");
				res.status(200).json({
					status: "success",
					message: "onBoarding data saved",
					newUserData,
				});
			}
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: "error", message: error.message });
	}
};

export const uploadImage = async (req, res) => {
	try {
		const { profileBase64 } = req.body;
		const { email } = req.user;

		const authUser = await authModel.findOne({ email });
		if (authUser) {
			const user = await userModel.findOne({ userId: authUser._id });
			if (user) {
				const uploadResult = await cloudinary.uploader.upload(profileBase64, {
					public_id: nanoid(),
				});
				user.image.url = uploadResult.secure_url;
				user.image.public_id = uploadResult.public_id;
				await user.save();
				res.status(200).json({
					status: "success",
					message: "Image Uploaded",
					newUserData: user,
				});
			} else {
				res.status(400).json({ status: "failed", message: "user not found" });
			}
		} else {
			res.status(400).json({
				status: "failed",
				message: "user not found please register",
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: "error", message: error.message });
	}
};

export const updateInfo = async (req, res) => {
	console.log("started");
	const { firstName, lastName, age, gender, collegeName, space, userSpaces } = req.body;
	const { _id, email } = req.user;
	try {
		const user = await authModel.findOne({ email });
		console.log("user", user);
		if (!user) {
			console.log("not user");
			res.status(400).json({
				status: "failed",
				message: "user not found please register",
			});
		} else {
			const userInfo = await userModel.findOne({ userId: _id });

			if (userInfo) {
				userInfo.firstName = firstName;
				userInfo.lastName = lastName;
				userInfo.age = age;
				userInfo.gender = gender;
				userInfo.collegeName = collegeName;
				userInfo.space = space;
				userInfo.userSpaces = userSpaces;
				await userInfo.save();
			}
			res.status(200).json({
				status: "success",
				message: "onBoarding data saved",
				newUserData: userInfo,
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: "error", message: error.message });
	}
};
