import mongoose, { mongo } from "mongoose";

const schema = {
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "authentication",
	},
	interviewType: {
		type: String,
	},
	topic: {
		type: String,
	},
	questions: {
		q: {
			type: Array,
		},
		a: {
			type: Array,
		},
	},
	validations: {
		type: Array,
	},
	suggestion: {
		type: String,
	},
};

const interviewSchema = mongoose.Schema(schema, { timestamps: true });
export const interviewModel = mongoose.model("interview", interviewSchema);
