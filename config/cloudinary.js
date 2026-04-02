const cloudinary = require('cloudinary').v2;
require('dotenv').config();

exports.cloudinaryConnect = () => {
    try {

        if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
            console.warn("Cloudinary environment variables are missing!");
        }

        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET,
        });
        console.log("Cloudinary Configured Successfully.");
    } 
    catch (error) {
        console.log("Error configuring Cloudinary: ", error);
    }
}