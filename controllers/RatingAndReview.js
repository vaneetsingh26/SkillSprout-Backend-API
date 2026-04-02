const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const mongoose = require("mongoose");

//create rating and review
exports.createRatingAndReview = async (req, res) => {
  try {
    const { courseId, rating, review } = req.body;
    const userId = req.user.id;

    //validation
    if (!userId || !courseId || !rating || !review) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    //check if user is enrolled in the course or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: userId,
    });

    if (!courseDetails) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You are not enrolled in this course.",
        });
    }

    // Check for existing review by same user on same course (optional but recommended)
    const existingReview = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this course.",
      });
    }

    //create rating and review
    const ratingAndReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });

    //update course with rating and review
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      { $push: { ratingAndReviews: ratingAndReview._id } },
      { new: true },
    );
    console.log("Updated course: ", updatedCourseDetails);

    //return response
    return res
      .status(200)
      .json({
        success: true,
        message: "Rating and review created successfully.",
        ratingAndReview,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//get all rating and review
exports.getAllRatingAndReview = async (req, res) => {
  try {
    const allRatingAndReview = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({ path: "course", select: "courseName" })
      .exec();

    //return response
    return res
      .status(200)
      .json({
        success: true,
        message: "All rating and review fetched successfully.",
        allRatingAndReview,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//get average rating
exports.getAverageRating = async (req, res) => {
  try {
    //get id
    const { courseId } = req.body;

    //validation
    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    //get average rating
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          //course id nu string to object convert kr taa
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    //return rating
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Average rating fetched successfully.",
        averageRating: result[0].averageRating,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Average rating fetched successfully.",
        averageRating: 0,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
