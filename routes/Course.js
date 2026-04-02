// Import the required modules
const express = require("express");
const router = express.Router();

// Course Controllers Import
const {
    createCourse,
    editCourse,
    getAllCourses,
    getCourseDetails,
    getFullCourseDetails,
    getInstructorCourses,
    deleteCourse,
} = require("../controllers/Course");

// Categories Controllers Import
const {
    createCategory,
    showAllCategories,
    categoryDetails,
} = require("../controllers/Category");

// Sections Controllers Import
const {
    createSection,
    updateSection,
    deleteSection,
} = require("../controllers/Section");

// Sub-Sections Controllers Import
const {
    createSubSection,
    updateSubSection,
    deleteSubSection,
} = require("../controllers/SubSection");

// Rating Controllers Import
const {
    createRatingAndReview,
    getAllRatingAndReview,
    getAverageRating,
} = require("../controllers/RatingAndReview");

// Course Progress Controllers Import
const {
  updateCourseProgress,
  getProgressPercentage // FIXED: Imported the missing controller
} = require("../controllers/courseProgress");

// Importing Middlewares
const {
    auth,
    isInstructor,
    isStudent,
    isAdmin,
} = require("../middlewares/auth");

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse);
//Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection);
// Update a Section
router.post("/updateSection", auth, isInstructor, updateSection);
// Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection);
// Edit Sub Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection);
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses);
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails);
// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails);
// Edit Course routes
router.post("/editCourse", auth, isInstructor, editCourse);
// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
// Delete a Course
router.delete("/deleteCourse", auth, isInstructor, deleteCourse);

// Course Progress Routes
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);
// FIXED: Added the missing route for the frontend progress bar
router.post("/getProgressPercentage", auth, isStudent, getProgressPercentage);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryDetails", categoryDetails);

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, createRatingAndReview);
router.post("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRatingAndReview);

module.exports = router;
