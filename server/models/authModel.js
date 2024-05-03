import mongoose, { mongo } from "mongoose";

const schema = {
	email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
	},
	password: {
		type: String,
		required: true,
	},
};

const authSchema = mongoose.Schema(schema, { timestamps: true });
export const authModel = mongoose.model("authentication", authSchema);
