import mongoose from "mongoose";

export const dbConnection = async () => {
	try {
		const connect = await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
		if (connect) {
			console.log(
				`successfully connected to database,  ${connect.connection.host}, ${connect.connection.name}`
			);
		}
	} catch (error) {
		console.log(error.message);
	}
};
