const User = require("../models/User");
const Profile = require("../models/Profile");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
require("dotenv").config();
const { uploadImageToCloudinary } = require("../utilities/imageUploader");
const { getPublicIdFromUrl } = require("../utilities/getPublicId");
const cloudinary = require("cloudinary").v2;
const { convertSecondsToDuration } = require("../utilities/secToDuration");

//updating a profile
exports.updateProfile = async (req, res) => {
    try {
        //get data
        const {
            about = "",
            contactNumber = "",
            dateOfBirth = "",
            gender = "", // Added default empty string
        } = req.body;

        //get userid
        const id = req.user.id;

        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update fields
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;

        await profileDetails.save();

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully.",
            profileDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//delete account
exports.deleteAccount = async (req, res) => {
    try {
        //get id
        const { id } = req.user;

        //validation
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Check if already scheduled
        if (userDetails.scheduledForDeletion) {
            return res.status(400).json({
                success: false,
                message: "Account deletion is already scheduled.",
            });
        }

        //schedule deletion
        userDetails.scheduledForDeletion = true;
        userDetails.deletionDate = new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000
        );
        await userDetails.save();

        return res.status(200).json({
            success: true,
            message:
                "Account deletion scheduled for 5 days later. You may cancel before that.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//Cancel deletion
exports.cancelDeletionRequest = async (req, res) => {
    try {
        // SECURITY FIX: Use the authenticated user's ID, not a body email
        const id = req.user.id;
        const user = await User.findById(id);

        if (!user || !user.scheduledForDeletion) {
            return res.status(400).json({
                success: false,
                message: "No deletion scheduled.",
            });
        }

        user.scheduledForDeletion = false;
        user.deletionDate = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Account deletion request has been cancelled.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while cancelling deletion request.",
            error: error.message,
        });
    }
};

//getAllUser details
exports.getAllUserDetails = async (req, res) => {
    try {
        //get id
        const { id } = req.user;

        //validation
        const userDetails = await User.findById(id)
            .populate("additionalDetails")
            .exec();
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        //return response
        return res.status(200).json({
            success: true,
            message: "User details fetched successfully.",
            userDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//update profile picture
exports.updateDisplayPicture = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const profile = await Profile.findById(user.additionalDetails);

        const image = req.files?.displayPicture;
        if (!image) {
            return res.status(400).json({
                status: false,
                message: "No image provided.",
            });
        }

        // upload new image
        const upload = await uploadImageToCloudinary(
            image,
            process.env.FOLDER_NAME
        );

        if (!upload) {
            return res.status(400).json({
                status: false,
                message: "Failed to upload image.",
            });
        }

        //delete old image
        if (user.image && !user.image.includes("dicebear")) {
            const publicId = getPublicIdFromUrl(user.image);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }

        //update user image
        user.image = upload.secure_url;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully.",

            image: user.image,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update profile picture.",
            error: error.message,
        });
    }
};

//get enrolled courses (FIXED VERSION)
exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id;
        let userDetails = await User.findOne({ _id: userId })
            .populate({
                path: "courses",
                populate: {
                    path: "courseContent",
                    populate: { path: "subSection" },
                },
            })
            .exec();

        // FIXED: Moved this check to the TOP!
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userId}`,
            });
        }

        userDetails = userDetails.toObject();
        var subSectionLength = 0;

        for (var i = 0; i < userDetails.courses.length; i++) {
            let totalDurationInSeconds = 0;
            subSectionLength = 0;

            for (
                var j = 0;
                j < userDetails.courses[i].courseContent.length;
                j++
            ) {
                totalDurationInSeconds += userDetails.courses[i].courseContent[
                    j
                ].subSection.reduce(
                    (acc, curr) => acc + parseInt(curr.timeDuration || 0),
                    0
                );
                userDetails.courses[i].totalDuration = convertSecondsToDuration(
                    totalDurationInSeconds
                );
                subSectionLength +=
                    userDetails.courses[i].courseContent[j].subSection.length;
            }
            userDetails.courses[i].subSectionLength = subSectionLength;

            // FIXED: courseId instead of courseID
            let courseProgressCount = await CourseProgress.findOne({
                courseId: userDetails.courses[i]._id,
                userId: userId,
            });

            courseProgressCount =
                courseProgressCount?.completedVideos.length || 0;

            if (subSectionLength === 0) {
                userDetails.courses[i].progressPercentage = 100;
            } else {
                const multiplier = Math.pow(10, 2);
                userDetails.courses[i].progressPercentage =
                    Math.round(
                        (courseProgressCount / subSectionLength) *
                            100 *
                            multiplier
                    ) / multiplier;
            }
        }

        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch enrolled courses.",
            error: error.message,
        });
    }
};

//get instructor dashboard data (FIXED VERSION)
exports.instructorDashboard = async (req, res) => {
    try {
        const courseDetails = await Course.find({ instructor: req.user.id });

        const courseData = courseDetails.map((course) => {
            // FIXED: studentsEnrolled spelling
            const totalStudentsEnrolled = course.studentsEnrolled.length;
            const totalAmountGenerated = totalStudentsEnrolled * course.price;

            const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                totalStudentsEnrolled,
                totalAmountGenerated,
            };

            return courseDataWithStats;
        });

        res.status(200).json({ courses: courseData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
