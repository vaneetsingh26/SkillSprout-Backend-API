const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CourseProgress");

// ============================================
// MARK VIDEO AS COMPLETED
// ============================================
exports.updateCourseProgress = async (req, res) => {
    const { courseId, subsectionId } = req.body;
    const userId = req.user.id;

    try {
        // 1. Check if the subsection is valid
        const subsection = await SubSection.findById(subsectionId);
        if (!subsection) {
            return res.status(404).json({ error: "Invalid subsection" });
        }

        // 2. Find the course progress document
        let courseProgress = await CourseProgress.findOne({
            courseId: courseId,
            userId: userId,
        });

        if (!courseProgress) {
            return res.status(404).json({
                success: false,
                message: "Course progress does not exist. Please enroll in the course first.",
            });
        }
        
        // 3. Check if the subsection is already in the completed array
        // Convert array items to strings to ensure perfect matching
        const completedVideosStrings = courseProgress.completedVideos.map((id) => id.toString());
        
        if (completedVideosStrings.includes(subsectionId)) {
            return res.status(400).json({ error: "Subsection already completed" });
        }

        // 4. Push the new subsection and save
        courseProgress.completedVideos.push(subsectionId);
        await courseProgress.save();

        return res.status(200).json({ 
            success: true,
            message: "Course progress updated successfully" 
        });

    } catch (error) {
        console.error("Error updating course progress:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// ============================================
// FETCH PROGRESS PERCENTAGE
// ============================================
exports.getProgressPercentage = async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
        return res.status(400).json({ error: "Course ID not provided." });
    }

    try {
        // Find the course progress and deeply populate the course content
        let courseProgress = await CourseProgress.findOne({
            courseId: courseId,
            userId: userId,
        })
        .populate({
            path: "courseId", 
            populate: {
                path: "courseContent",
            },
        })
        .exec();

        if (!courseProgress) {
            return res.status(400).json({ 
                error: "Cannot find Course Progress with these IDs." 
            });
        }

        // Calculate total number of lectures (SubSections)
        let lectures = 0;
        
        // Use optional chaining (?.) to prevent crashes if courseContent is empty
        courseProgress.courseId?.courseContent?.forEach((sec) => {
            lectures += sec.subSection?.length || 0;
        });

        // Calculate Percentage safely
        let progressPercentage = 0;

        // Prevent division by zero!
        if (lectures > 0) {
            progressPercentage = (courseProgress.completedVideos.length / lectures) * 100;
        }

        // Format to 2 decimal places using JavaScript's built-in Number/toFixed method
        // This is much cleaner than doing the Math.pow(10, 2) multiplier math!
        const formattedPercentage = Number(progressPercentage.toFixed(2));

        return res.status(200).json({
            success: true,
            data: formattedPercentage,
            message: "Successfully fetched Course progress",
        });

    } catch (error) {
        console.error("Error calculating progress:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}