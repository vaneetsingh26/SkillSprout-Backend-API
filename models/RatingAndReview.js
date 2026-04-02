const mongoose = require('mongoose');

const ratingAndReviewsSchema = new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"User",
        },
        rating:{
            type:Number,
            required: true,
            min: 1,
            max: 5,
        },
        review:{
            type:String,
            required:true,
            trim: true,
            maxlength: 500,
        },
        course:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Course",
            index: true
        },
    }, { timestamps: true }
);

ratingAndReviewsSchema.index({ course: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("RatingAndReview", ratingAndReviewsSchema);