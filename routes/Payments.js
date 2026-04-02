const express = require("express");
const router = express.Router();

// FIXED: Imported verifyPayment instead of verifySignature
const {
    capturePayment,
    verifyPayment,
    sendPaymentSuccessEmail,
} = require("../controllers/Payments");
const {
    auth,
    isInstructor,
    isStudent,
    isAdmin,
} = require("../middlewares/auth");

router.post("/capturePayment", auth, isStudent, capturePayment);

// Route name changed, and added auth + isStudent middlewares!
router.post("/verifyPayment", auth, isStudent, verifyPayment);

router.post(
    "/sendPaymentSuccessEmail",
    auth,
    isStudent,
    sendPaymentSuccessEmail
);

module.exports = router;
