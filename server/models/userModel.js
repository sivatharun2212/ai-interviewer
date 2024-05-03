import mongoose from "mongoose";

const schema = {
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "authentication",
	},
	firstName: {
		type: String,
	},
	lastName: {
		type: String,
	},
	age: {
		type: Number,
	},
	gender: {
		type: String,
	},
	collegeName: {
		type: String,
	},
	space: {
		type: String,
	},
	userSpaces: {
		type: Array,
	},
	image: {
		url: {
			type: String,
		},
		public_id: {
			type: String,
		},
	},
	interviews: {
		type: Array,
	},
};

const userSchema = mongoose.Schema(schema, { timestamps: true });
export const userModel = mongoose.model("users", userSchema);
