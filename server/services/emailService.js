import nodemailer from "nodemailer";

const generateOtp = () => {
	let otp = "";
	for (let i = 0; i < 6; i++) {
		otp += Math.floor(Math.random() * 10);
	}
	return otp;
};

const transporter = nodemailer.createTransport({
	service: "gmail",
	host: "smtp.gmail.com",
	port: 587,
	secure: false,
	auth: {
		user: process.env.EMAIL_SENDER,
		pass: process.env.EMAIL_APP_PASSWORD,
	},
});

export const sendOtp = async (email, subject, text) => {
	try {
		const otp = generateOtp();
		const info = await transporter.sendMail({
			from: process.env.EMAIL_SENDER,
			to: email,
			subject: subject,
			text: `${text} ${otp}`,
		});
		return { otp, info };
	} catch (error) {
		console.log(error.message);
		return null;
	}
};
