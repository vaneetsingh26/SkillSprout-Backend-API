const mongoose = require("mongoose");
const mailSender = require("../utilities/mailSender");
const { otpTemplate } = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 10 * 60,
    },
});

//a function -> to send email
async function sendVerificationEmail(email, otp) {
    try {
        const emailBody = otpTemplate(otp);
        const mailResponse = await mailSender(
            email,
            "Verification Email from SkillSprout",
            emailBody
        );
        console.log("Email sent Successfully", mailResponse);
    } catch (error) {
        console.log("Error occured while sending mail: ", error);
        throw error;
    }
}

//Pre middleware
//using mailSender in Utilities
OTPSchema.pre("save", async function (next) {
    try {
        if (this.isNew) {
            await sendVerificationEmail(this.email, this.otp);
        }
        next();
    } catch (error) {
        console.log("Error occurred while sending email: ", error);
        next(error);
    }
});

module.exports = mongoose.model("OTP", OTPSchema);
