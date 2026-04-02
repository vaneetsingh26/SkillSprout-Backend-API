const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpgenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utilities/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const emailValidator = require("deep-email-validator");

//sendOTP while sign up
exports.sendOTP = async (req, res) => {
    try {
        //fetch mail
        const { email } = req.body;


        // Validate the email
        const { valid, reason, validators } = await emailValidator.validate(email);
        
        // This package automatically checks regex, typos, and thousands of disposable email domains!
        if (!valid && validators.disposable.reason) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid, permanent email address.",
            });
        }


        //check user already exist or not
        const UserPresent = await User.findOne({ email });
        if (UserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already registered.",
            });
        }

        //generate otp
        var otp = otpgenerator.generate(6, {
            upperCaseAlphabets: true,
            numericalDigits: true,
        });
        console.log("OTP generated: ", otp);

        //is otp unique?
        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpgenerator.generate(6, {
                upperCaseAlphabets: true,
                lowerCaseAlphabets: true,
                specialChars: true,
            });
            result = await OTP.findOne({ otp: otp });
        }

        //create otp object
        const otpPayload = { email, otp };
        //create an entry in db for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response
        res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
            OTP: otp,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//signUp
exports.signUp = async (req, res) => {
    try {
        //fetch data from req body
        //now how can you fetch otp from req.body? frontend will have to send
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        //apply validation
        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !otp ||
            !accountType
        ) {
            return res.status(403).json({
                success: false,
                message: "All fields are mandatory",
            });
        }

        //match password and confirm password
        if (password != confirmPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Password and Confirm Password does not match, please try again.",
            });
        }

        //check user already exist or not
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered.",
            });
        }

        // Sanitize the email (remove spaces and make lowercase) to guarantee a match
        const sanitizedEmail = email.trim().toLowerCase();

        //find most recent OTP for the user from db
        const recentOtp = await OTP.find({ email: sanitizedEmail })
            .sort({ createdAt: -1 })
            .limit(1);

        console.log("Searching for OTP with email:", sanitizedEmail);
        console.log("Database returned:", recentOtp);


        //validate opt
        if (recentOtp.length === 0) {
            //otp not found
            return res.status(400).json({
                success: false,
                message: "OTP not found",
            });
        } else if (otp !== recentOtp[0].otp) {
            //invalid otp
            return res.status(400).json({
                success: false,
                message: "Invalid OTP,",
            });
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create entry in db
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            contactNumber,
            additionalDetails: profileDetails._id,
            //we can use a random image for profile using dicebear api
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        //return res
        return res.status(200).json({
            success: true,
            message: "User is registered Successfully",
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User can not be registered. Try again.",
        });
    }
};

//login
exports.logIn = async (req, res) => {
    try {
        //fetch data from req body
        const { email, password } = req.body;

        //validate data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required. Please try again.",
            });
        }

        //check user exists or not
        const user = await User.findOne({ email }).select("+password").populate(
            "additionalDetails"
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered. Please signUp first.",
            });
        }

        if (user.scheduledForDeletion) {
            user.scheduledForDeletion = false;
            user.deletionDate = null;
            await user.save();
        }

        //generate JWT after password matching
        if (await bcrypt.compare(password, user.password)) {
            //payload creation
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            };

            //token creation
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "3h",
            });

            const userData = user.toObject();
            userData.token = token;
            userData.password = undefined;

            //create cookie and return response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: true,
                sameSite: "none",
            };
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                userData,
                message: "Logged In Successfully.",
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Email or Password is Incorrect.",
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Login Failure. Try again.",
        });
    }
};

//ChangePassword
exports.changePassword = async (req, res) => {
    try {
        //fetch data (old pass, new pass, confirmpass)
        const { oldPassword, newPassword, confirmPassword } = req.body;

        //validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "All fields are required. Please try again.",
            });
        }
        if (newPassword === oldPassword) {
            return res.status(400).json({
                success: false,
                message: "Please use a different password.",
            });
        }
        if (newPassword != confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match.",
            });
        }

        //Get user from Database
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        //Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "The old password filled is incorrect.",
            });
        }

        //update password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        //send mail - password updated
        // Send notification email
        try {
            const emailhtml = passwordUpdated(
                user.email,
                user.firstName + " " + user.lastName
            );
            const emailResponse = await mailSender(
                user.email,
                "Password Updated",
                emailhtml
            );
            console.log("Email sent successfully:", emailResponse.response);
        } catch (error) {
            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.error("Error occurred while sending email:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            });
        }

        //return response
        return res.status(200).json({
            success: true,
            message: "Password Updated Successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Unable to change password. Try again.",
        });
    }
};
