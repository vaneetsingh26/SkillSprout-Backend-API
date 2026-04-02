const jwt = require('jsonwebtoken');
const User = require("../models/User");

// ==============================
// AUTH MIDDLEWARE
// ==============================
exports.auth = async (req, res, next) => {
    try {
        //extract token
        const token = req.cookies?.token
            || req.header("Authorization")?.replace("Bearer ", "")
            || req.body?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing.",
            });
        }

        //verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            if (user.scheduledForDeletion) {
                return res.status(403).json({
                    success: false,
                    message: "Account is scheduled for deletion. Please cancel the request to regain access."
                });
            }

            req.user = user;  // or req.user = decoded
        } 
        catch (error) {
            //verification issue
            return res.status(401).json({
                success: false,
                message: 'Token is Invalid or expired.'
            });
        }
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating the token."
        });
    }
}

// ==============================
// IS STUDENT MIDDLEWARE
// ==============================
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== 'Student') {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Students Only."
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User Role Verification issue. Please Try Again."
        });
    }
}

// ==============================
// IS INSTRUCTOR MIDDLEWARE
// ==============================
exports.isInstructor = async (req, res, next) => {
    try {
        if (req.user.accountType !== 'Instructor') {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Instructor Only."
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User Role Verification issue. Please Try Again."
        });
    }
}

//isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== 'Admin') {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Admin Only."
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User Role Verification issue. Please Try Again."
        });
    }
}
