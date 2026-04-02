// 1. Load env variables first
require("dotenv").config();

// 2. Third-party packages
const express = require("express");
const cron = require("node-cron");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");

// 3. Internal imports
const database = require("./config/database");
const { cloudinaryConnect } = require("./config/cloudinary");
const deleteExpiredUsers = require("./utilities/deleteExpiredUsers");

// Routes Imports
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");

const app = express();
const PORT = process.env.PORT || 5000;

// Database & Cloudinary connect
database.connect();
cloudinaryConnect();

// Schedule cron job to run at midnight every 5th day
cron.schedule("0 0 */5 * *", async () => {
    console.log("Running scheduled task: Deleting expired users");
    await deleteExpiredUsers();
});

// Middlewares
app.use(express.json());
app.use(cookieParser());

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const additionalDevOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
];
const allowedOrigins = [CLIENT_URL, ...additionalDevOrigins];

app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (like mobile apps, curl, or Postman)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                return callback(
                    new Error("CORS policy: Origin not allowed"),
                    false
                );
            }
        },
        credentials: true,
    })
);

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp",
    })
);

// ==========================================
// MOUNTING THE ROUTES
// ==========================================
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/reach", contactUsRoute);

// Default Route
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Your SkillSprout server is up and running securely.",
    });
});

// Standard HTTP Server Configuration (Cloud providers handle SSL)
app.listen(PORT, () => {
    console.log(`App is running at PORT ${PORT}`);
});