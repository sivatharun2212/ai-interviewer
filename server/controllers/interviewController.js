import { GoogleGenerativeAI } from "@google/generative-ai";
import { userModel } from "../models/userModel.js";
import { interviewModel } from "../models/interviewModel.js";
const genAI = new GoogleGenerativeAI("AIzaSyCZ7tdFSeWuWBNV27OonjrHOaZ4V84hc3c");

async function askAi(prompt) {
	const model = genAI.getGenerativeModel({ model: "gemini-pro" });
	const result = await model.generateContent(prompt);
	const response = await result.response;
	const text = response.text();
	console.log("text", text);
	return text;
}

const cleanResponse = (string) => {
	const startIndex = string.indexOf("[");
	const lastIndex = string.lastIndexOf("]");
	const cleanedString = string.substring(startIndex, lastIndex + 1);
	return cleanedString;
};

export const test = async (req, res) => {
	const { topic, type } = req.body;
	const { _id } = req.user;
	try {
		const prompt = `generate an array of 5 simple questions on topic ${topic}.
		in  json array. format = ["","",""] don't include objects in array like [{},{},{}]. give fresh question other than previous questions`;
		const aiRes = await askAi(prompt);
		const cleanRes = cleanResponse(aiRes);
		if (cleanRes) {
			console.log("aiRes", aiRes);
			const user = await userModel.findOne({ userId: _id });
			const newInterview = await interviewModel.create({
				userId: _id,
				interviewType: type,
				topic,
				questions: {
					q: cleanRes,
					a: [],
				},
			});
			if (newInterview) {
				user.interviews.push(newInterview._id);
				await user.save();
				res.status(200).json({
					status: "success",
					message: "got questions for interview",
					aiContent: cleanRes,
					userInterviewData: newInterview,
				});
			}
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: "error", message: error.message });
	}
};

export const updateAnswers = async (req, res) => {
	console.log("a");
	const { answers, interviewId } = req.body;
	console.log("b", answers, interviewId);

	const { _id } = req.user;
	console.log("c", _id);

	try {
		console.log("d");

		const user = await userModel.findOne({ userId: _id });
		if (user) {
			console.log("e", user);

			const checkInterview = user.interviews.includes(interviewId);
			if (checkInterview) {
				console.log("f", checkInterview);

				const interview = await interviewModel.findOne({ _id: interviewId });
				interview.questions.a = answers;
				await interview.save();
				console.log("g", interview);

				res.status(200).json({
					status: "success",
					message: "answers updated",
					interviewDAta: interview,
				});
				console.log("h", "res sent");
			} else {
				res.status(400).json({ status: "failed", message: "interview not found" });
			}
		} else {
			res.status(400).json({ status: "failed", message: "user has no interviews" });
		}
	} catch (error) {
		res.status(500).json({ status: "error", message: error.message });
	}
};

const combineQandA = (q, a) => {
	let arr = [];
	for (let i = 0; i < 5; i++) {
		const obj = {
			q: q[i],
			a: a[i],
		};
		arr.push(obj);
	}
	return arr;
};
export const answersValidate = async (req, res) => {
	const { _id } = req.user;
	const { q, a, interviewId } = req.body;
	try {
		const combinedRes = combineQandA(JSON.parse(q), a);
		if (combinedRes) {
			console.log("combinedRes", combinedRes);
			let prompt = "";
			combinedRes.forEach((item, index) => {
				prompt += `Question ${index + 1}: ${item.q}\nAnswer: ${item.a}\n\n`;
			});
			prompt += `Please analyze the provided questions and answers and provide validations based on the accuracy and completeness of each answer in relation to its corresponding question. The questions are given in the format: [{q: "",a:""}].
			Your response should be structured as follows:
			{
			  "validations": [
				{
				  "isAnswerCorrect": Boolean,
				  "percentageOfCorrectness": "30%" // Percentage representing the accuracy of the answer
				},
				{
				  "isAnswerCorrect": Boolean,
				  "percentageOfCorrectness": "10%"
				},
				// Repeat for each question-answer pair
			  ],
			  "suggestion": "Two or three lines suggestion for improvement."
			}
			
			Evaluation Guidelines =>
			Accuracy: Assess if the answer directly and correctly addresses the question's core concepts.
			Completeness: Evaluate if the answer covers all relevant aspects of the question or if it lacks important details.
			Relevance: Determine if the answer is related to the question's topic or if it's completely off-topic.
			Percentage of Correctness =>
			90-100%: The answer is accurate, complete, and demonstrates a thorough understanding of the subject matter.
			70-89%: The answer is mostly accurate but may lack some details or have minor inaccuracies.
			50-69%: The answer partially addresses the question but is missing key information or contains significant inaccuracies.
			0-49%: The answer is incorrect, irrelevant, or completely fails to address the question.
			Suggestions for Improvement =>
			Focus on providing specific feedback such as:
			Missing information: Mention the key concepts or details that are absent from the answer.
			Inaccuracies: Point out any incorrect statements or misconceptions present in the answer.
			Clarity and conciseness: Suggest ways to improve the clarity and conciseness of the answer.
			Examples: Encourage the use of relevant examples to illustrate the concepts discussed.`;

			let aiRes = await askAi(prompt);

			aiRes = JSON.parse(
				aiRes.substring(aiRes.indexOf("{"), aiRes.lastIndexOf("}") + 1)
			);

			const { validations, suggestion } = aiRes;
			console.log(validations, suggestion);

			const result = await saveValidationsAndSuggestions(
				validations,
				suggestion,
				_id,
				interviewId
			);
			if (result) {
				res.status(200).json({
					status: "success",
					message: "validation completed",
					userInterviewData: result,
				});
			}
		}
	} catch (error) {
		console.error("Error:", error);
	}
};

const saveValidationsAndSuggestions = async (val, sug, id, interviewId) => {
	try {
		const user = await userModel.findOne({ userId: id });
		if (user) {
			const checkInterview = user.interviews.includes(interviewId);
			if (checkInterview) {
				const interviewDoc = await interviewModel.findOne({ _id: interviewId });
				interviewDoc.validations = val;
				interviewDoc.suggestion = sug;
				await interviewDoc.save();
				return interviewDoc;
			}
		}
	} catch (error) {}
};

export const getInterviews = async (req, res) => {
	const { _id, email } = req.user;
	console.log(email);
	try {
		const userinfo = await userModel.findOne({ userId: _id });
		const interviewIds = userinfo.interviews; // Array of ObjectIds
		console.log("userinfo", interviewIds);

		// Use $in operator to find documents with matching IDs
		const interviews = await interviewModel.find({ _id: { $in: interviewIds } });

		// Now 'interviews' array contains all the documents matching the IDs
		console.log("Interviews:", interviews);

		res.status(200).json({
			status: "success",
			message: "got user Interviews data",
			userInterviews: interviews,
		});
	} catch (error) {
		console.error("Error fetching interviews:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// const g = {
// 	validations : [
// 		{
// 			isAnswerCorrect: Boolean,
// 			persentageOfCorrectness: "30%",
// 		},
// 		{
// 			isAnswerCorrect: Boolean,
// 			persentageOfCorrectness: "30%",
// 		},
// 		{...},{...},{...}
// 	],
// 	suggestion: "two or three lines suggestion for improvement"
// }
// i will provide array of questions in format ["...","...","..."] and array of answers for those questions in order. analyze the respective question and answer and give response as i mentioned as followed format {    validations : [        {            isAnswerCorrect: Boolean,            persentageOfCorrectness: "30%",        },        {            isAnswerCorrect: Boolean,            persentageOfCorrectness: "30%",        },        {...},{...},{...}    ],    suggestion: "two or three lines suggestion for improvement"}. i need only in this formate  questions are ["What is the purpose of a firewall?", "Name a common type of cyberattack that involves stealing sensitive data.", "What is the difference between encryption and decryption?", "What are the best practices for creating strong passwords?", "What is phishing and how can you protect yourself from it?"] and answers are [ 'A firewall is a security system designed to prevent unauthorized access into or out of a computer network', 'Phishing is a method used to trick victims into sharing sensitive information or installing malicious files', 'Encryption is the process by which a readable message is converted to an unreadable form to prevent unauthorized parties from reading it. Decryption is the process of converting an encrypted message back to its original (readable) format.', 'At least 12 characters long but 14 or more is better', 'Phishing is a popular form of cybercrime because of how effective it is.' ]
// {
// 	"validations": [
// 	  {
// 		"isAnswerCorrect": true,
// 		"persentageOfCorrectness": "100%"
// 	  },
// 	  {
// 		"isAnswerCorrect": false,
// 		"persentageOfCorrectness": "0%"
// 	  },
// 	  {
// 		"isAnswerCorrect": true,
// 		"persentageOfCorrectness": "100%"
// 	  },
// 	  {
// 		"isAnswerCorrect": true,
// 		"persentageOfCorrectness": "50%"
// 	  },
// 	  {
// 		"isAnswerCorrect": true,
// 		"persentageOfCorrectness": "50%"
// 	  }
// 	],
// 	"suggestion": "The answer to question 2 should describe a cyberattack like malware or ransomware. For question 4, mention additional best practices like using a mix of upper/lower case, symbols, and numbers. For question 5, add ways to protect against phishing such as being cautious of suspicious emails and links."
//   }

// Please analyze the provided questions and answers and provide validations based on the accuracy and completeness of each answer in relation to its corresponding question. The questions are given in the format: [{q: "",a:""}].

// Your response should be structured as follows:

// {
//   "validations": [
//     {
//       "isAnswerCorrect": Boolean,
//       "percentageOfCorrectness": "30%" // Percentage representing the accuracy of the answer
//     },
//     {
//       "isAnswerCorrect": Boolean,
//       "percentageOfCorrectness": "10%"
//     },
//     // Repeat for each question-answer pair
//   ],
//   "suggestion": "Two or three lines suggestion for improvement."
// }

// Evaluation Guidelines:
// Accuracy: Assess if the answer directly and correctly addresses the question's core concepts.
// Completeness: Evaluate if the answer covers all relevant aspects of the question or if it lacks important details.
// Relevance: Determine if the answer is related to the question's topic or if it's completely off-topic.
// Percentage of Correctness:
// 90-100%: The answer is accurate, complete, and demonstrates a thorough understanding of the subject matter.
// 70-89%: The answer is mostly accurate but may lack some details or have minor inaccuracies.
// 50-69%: The answer partially addresses the question but is missing key information or contains significant inaccuracies.
// 0-49%: The answer is incorrect, irrelevant, or completely fails to address the question.
// Suggestions for Improvement:
// Focus on providing specific feedback such as:
// Missing information: Mention the key concepts or details that are absent from the answer.
// Inaccuracies: Point out any incorrect statements or misconceptions present in the answer.
// Clarity and conciseness: Suggest ways to improve the clarity and conciseness of the answer.
// Examples: Encourage the use of relevant examples to illustrate the concepts discussed.

// `Please analyze the provided questions and answers and provide validations based on the accuracy of each answer in relation to its corresponding question. The questions are given in the format: "Question: Answer". Your response should be structured as follows:

//             {
//               "validations": [
//                 {
//                   "isAnswerCorrect": Boolean,
//                   "percentageOfCorrectness": "30%" // Percentage representing the accuracy of the answer
//                 },
//                 {
//                   "isAnswerCorrect": Boolean,
//                   "percentageOfCorrectness": "10%"
//                 },
//                 // Repeat for each question-answer pair
//               ],
//               "suggestion": "Two or three lines suggestion for improvement."
//             }

//             Ensure that each answer is evaluated comprehensively. If an answer accurately addresses the question, mark it as correct with a high percentage. If it partially addresses the question, assign a lower percentage. If it's completely unrelated or incorrect, mark it as incorrect. Provide specific feedback for improvement where necessary, focusing on providing more details and examples if applicable.
//             `;
