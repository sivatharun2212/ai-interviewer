import jsonwentoken from "jsonwebtoken";

export const validateToken = async (req, res, next) => {
	let token = "";
	const authHeader = req.header("Authorization");
	try {
		if (authHeader && authHeader.startsWith("Bearer")) {
			token = authHeader.split(" ")[1];
			const validUser = jsonwentoken.verify(token, process.env.ACCESS_TOKEN_SECRET);
			if (validUser) {
				req.user = {
					_id: validUser._id,
					email: validUser.email,
				};
				next();
			}
		}
	} catch (error) {
		res.status(500).json({ status: "error", message: error.message });
	}
};
