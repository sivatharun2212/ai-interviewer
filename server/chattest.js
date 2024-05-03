// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI("AIzaSyCZ7tdFSeWuWBNV27OonjrHOaZ4V84hc3c");

// async function run() {
// 	const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// 	const prompt = `generate an array of 5 simple questions on topic database.
//      in  json array []. give fresh question other than previous`;
// 	const result = await model.generateContent(prompt);
// 	console.log("result", result);
// 	const response = await result.response;
// 	console.log("response", response.candidates);
// 	const text = response.text();
// 	console.log("text", text);
// }

// run();

// Sample string
const stringWithArray = "questions are [{},{},{}]";

// Find the index of the first occurrence of '[' and the last occurrence of ']'
const startIndex = stringWithArray.indexOf("[");
const endIndex = stringWithArray.lastIndexOf("]");

// Extract the substring containing only the array portion
const cleanedString = stringWithArray.substring(startIndex, endIndex + 1);

// Log the cleaned string
console.log(cleanedString);
