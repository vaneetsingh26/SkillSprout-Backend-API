const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
    {
        gender:{
            type:String,
            enum:["Male", "Female", "Others", "Prefer not to say", null],
            default: null
        },
        dateOfBirth:{
            type:Date,
            default: null,
        },
        about:{
            type:String,
            trim:true,
            default: null,
            maxlength: 500,
        },
        contactNumber:{
            type:String,
            trim: true,
        }
    }, { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);