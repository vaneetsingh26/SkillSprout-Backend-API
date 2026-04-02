const { default: mongoose } = require("mongoose");
const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utilities/mailSender");
const CourseProgress = require("../models/CourseProgress");
const crypto = require("crypto");
const {
    courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const {
    paymentSuccessEmail,
} = require("../mail/templates/paymentSuccessEmail");

// =========================================================
// 1. CAPTURE PAYMENT (Initiate Razorpay Order)
// =========================================================
exports.capturePayment = async (req, res) => {
    // Note: We now accept an ARRAY of courses to support a Shopping Cart feature
    const { courses } = req.body;
    const userId = req.user.id;

    if (courses.length === 0) {
        return res.json({
            success: false,
            message: "Please provide Course Id",
        });
    }

    let totalAmount = 0;

    for (const course_id of courses) {
        let course;
        try {
            course = await Course.findById(course_id);
            if (!course) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message: "Could not find the course",
                    });
            }

            // Check if user is already enrolled
            const uid = new mongoose.Types.ObjectId(userId);
            if (course.studentsEnrolled.includes(uid)) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message: "Student is already Enrolled",
                    });
            }

            totalAmount += course.price;
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: error.message });
        }
    }

    const currency = "INR";
    const options = {
        amount: totalAmount * 100, // Convert to paise
        currency,
        receipt: Math.random(Date.now()).toString(),
    };

    try {
        const paymentResponse = await instance.orders.create(options);
        res.json({
            success: true,
            message: paymentResponse,
        });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ success: false, message: "Could not Initiate Order" });
    }
};

// =========================================================
// 2. VERIFY PAYMENT (Called by Frontend after Razorpay success)
// =========================================================
exports.verifyPayment = async (req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !courses ||
        !userId
    ) {
        return res
            .status(400)
            .json({ success: false, message: "Payment Failed: Missing Data" });
    }

    // Verify the signature securely using crypto
    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    // If signature matches, payment is legit!
    if (expectedSignature === razorpay_signature) {
        // Enroll the student using our helper function
        await enrollStudents(courses, userId, res);

        // Return success response to frontend
        return res
            .status(200)
            .json({ success: true, message: "Payment Verified" });
    }

    // If signature doesn't match, it's a fake request
    return res.status(400).json({ success: false, message: "Payment Failed" });
};

// =========================================================
// 3. INTERNAL HELPER: ENROLL STUDENTS
// =========================================================
const enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
        return res.status(400).json({
            success: false,
            message: "Please Provide data for Courses or UserId",
        });
    }

    for (const courseId of courses) {
        try {
            // Find the course and enroll the student
            const enrolledCourse = await Course.findOneAndUpdate(
                { _id: courseId },
                { $push: { studentsEnrolled: userId } },
                { new: true }
            );

            if (!enrolledCourse) {
                return res
                    .status(500)
                    .json({ success: false, message: "Course not Found" });
            }

            // Initialize Course Progress (Starts with 0 completed videos)
            const courseProgress = await CourseProgress.create({
                courseId: courseId,
                userId: userId,
                completedVideos: [],
            });

            // Find the student and add the course to their list
            const enrolledStudent = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        courses: courseId,
                        courseProgress: courseProgress._id,
                    },
                },
                { new: true }
            );

            // Send enrollment email
            await mailSender(
                enrolledStudent.email,
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(
                    enrolledCourse.courseName,
                    `${enrolledStudent.firstName}`
                )
            );
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: error.message });
        }
    }
};

// =========================================================
// 4. SEND PAYMENT SUCCESS EMAIL
// =========================================================
exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body;
    const userId = req.user.id;

    if (!orderId || !paymentId || !amount || !userId) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Please provide all the details",
            });
    }

    try {
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Payment Received`,
            paymentSuccessEmail(
                `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
                amount / 100, // Convert paise back to rupees for the email
                orderId,
                paymentId
            )
        );
    } catch (error) {
        console.log("error in sending mail", error);
        return res
            .status(500)
            .json({ success: false, message: "Could not send email" });
    }
};
