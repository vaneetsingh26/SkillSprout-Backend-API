const User = require('../models/User');
const mailSender = require('../utilities/mailSender');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require("dotenv").config(); // Make sure to require dotenv!

//fn -> resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email not found.",
            });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const token = crypto.randomUUID();

        //update user by adding token and expiration time
        await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpire: Date.now() + 5 * 60 * 1000,
            },
            { new: true }
        );

        // CREATE URL DYNAMICALLY USING .ENV
        // Ensure you add FRONTEND_URL=http://localhost:3000 to your .env file locally!
        const url = `${process.env.FRONTEND_URL}/update-password/${token}`

        //send mail containing the url
        await mailSender(email, "Password Reset Request", `Password Reset Link: ${url}`);

        return res.status(200).json({
            success: true,
            message: "Email Sent Successfully. Please check your mailbox."
        })
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Unable to reset password. Please try again later.",
        });
    }
}


//resetpassword
exports.resetPassword = async(req, res) => {
    try {
        const {password, confirmPassword, token} = req.body;

        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Password and Confirm password are not matching.",
            });
        }

        const userDetails = await User.findOne({token: token});

        if(!userDetails) {
            return res.status(404).json({
                success: false,
                message: "Token is invalid.",
            });
        }

        if(userDetails.resetPasswordExpire < Date.now()){
            return res.status(400).json({
                success:false,
                message:'Token expired. Please regenerate your token.'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // SECURITY FIX: Clear the token and expiry date after successful reset!
        await User.findOneAndUpdate(
            { token: token }, 
            {
                password: hashedPassword,
                token: undefined,
                resetPasswordExpire: undefined
            }, 
            { new: true }
        );

        return res.status(200).json({
            success:true,
            message:'Password Reset Successful.'
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Failed to reset Password.",
        });
    }
}