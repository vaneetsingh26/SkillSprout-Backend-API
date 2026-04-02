const mongoose = require('mongoose');

const subSectionSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            trim: true,
        },
        timeDuration:{
            type: Number,
            required: true,
        },
        description:{
            type:String,
            trim: true,
        },
        videoUrl:{
            type:String,
            required: true,
        },
    }, { timestamps: true }
);

module.exports = mongoose.models.SubSection || mongoose.model("SubSection", subSectionSchema);