const User = require('../models/User');
const Profile = require('../models/Profile');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const Section = require('../models/Section');
const Subsection = require('../models/SubSection');
const RatingAndReview = require('../models/RatingAndReview');

const mailSender = require('./mailSender');
const {accountDeletedEmail} = require('../mail/templates/userDeletionResponse');
const {getPublicIdFromUrl} = require('./getPublicId');
const cloudinary = require('cloudinary').v2;

const deleteExpiredUsers = async () => {
    try {
        const now = new Date();

        const usersToDelete = await User.find({
            scheduledForDeletion: true,
            deletionDate:{ $lte: now }
        });

        for(const user of usersToDelete){
            console.log(`[Deletion Process Started] User: ${user.email} | Role: ${user.accountType}`);

            // 1. Delete the user's Profile
            await Profile.findByIdAndDelete(user.additionalDetails);

            // 2. Remove user from all courses they were enrolled in (Students & Instructors can both be enrolled)
            await Course.updateMany(
                { studentsEnrolled: user._id },
                { $pull: { studentsEnrolled: user._id } },
            );

            // 3. Delete user's Course Progress
            await CourseProgress.deleteMany({ userId: user._id });

            // 4. Delete all Ratings and Reviews left by this user
            await RatingAndReview.deleteMany({ user: user._id });

            // 5. Delete user-uploaded profile image from Cloudinary (if not default API image)
            if (user.image && !user.image.includes('dicebear')) {
                const publicId = getPublicIdFromUrl(user.image);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }

            // ========================================================
            // 6. INSTRUCTOR SPECIFIC CLEANUP (The Cascading Delete)
            // ========================================================
            if (user.accountType === "Instructor") {
                // Find all courses created by this instructor
                const instructorCourses = await Course.find({ instructor: user._id });

                for (const course of instructorCourses) {
                    // A. Delete Course Thumbnail from Cloudinary
                    if (course.thumbnail) {
                        const thumbnailId = getPublicIdFromUrl(course.thumbnail);
                        if (thumbnailId) await cloudinary.uploader.destroy(thumbnailId);
                    }

                    // B. Loop through Sections
                    for (const sectionId of course.courseContent) {
                        const section = await Section.findById(sectionId);
                        if (section) {
                            // C. Loop through SubSections (Videos)
                            for (const subSectionId of section.subSection) {
                                const subSection = await SubSection.findById(subSectionId);
                                if (subSection) {
                                    // Delete Video from Cloudinary (MUST specify resource_type: "video")
                                    if (subSection.videoUrl) {
                                        const videoId = getPublicIdFromUrl(subSection.videoUrl);
                                        if (videoId) {
                                            await cloudinary.uploader.destroy(videoId, { resource_type: "video" });
                                        }
                                    }
                                    // Delete SubSection from DB
                                    await SubSection.findByIdAndDelete(subSectionId);
                                }
                            }
                            // Delete Section from DB
                            await Section.findByIdAndDelete(sectionId);
                        }
                    }

                    // D. Delete all Reviews associated with this specific Course
                    await RatingAndReview.deleteMany({ course: course._id });

                    // E. Finally, delete the Course itself
                    await Course.findByIdAndDelete(course._id);
                }
            }
            // ========================================================

            // 7. Delete the User document itself
            await User.findByIdAndDelete(user._id);


            // 8. Send the beautiful HTML confirmation email (Using await!)
            const emailHtml = accountDeletedEmail(user.email, user.firstName);
            await mailSender(
                user.email, 
                'Account Deletion Confirmation - SkillSprout', 
                emailHtml
            );

            console.log(`[Deletion Complete] User fully wiped: ${user.email}`);
        }
    } 
    catch (error) {
        console.error("[DELETION ERROR]:", error.message);
    }
}

module.exports = deleteExpiredUsers;