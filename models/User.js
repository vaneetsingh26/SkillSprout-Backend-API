const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        firstName:{
            type:String,
            required:true,
            trim:true,
            index:true,
            trim:true,
        },
        lastName:{
            type:String,
            required:true,
            index: true,
            trim:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        password:{
            type:String,
            required:true,
            minlength: 8,
            select: false,
        },
        accountType:{
            type:String,
            enum:["Admin", "Student", "Instructor"],
            required: true,
        },
        active: {
			type: Boolean,
			default: true,
		},
        approved: {
			type: Boolean,
			default: true,
		},
        additionalDetails:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Profile",
            required:true,
        },
        courses:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Course",
            }
        ],
        image:{
            type:String,
            required:true,
        },
        courseProgress:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"CourseProgress",
            }
        ],
        token:{
            type:String,
        },
        resetPasswordExpire:{
            type:Date,
        },
        scheduledForDeletion: {
            type: Boolean,
            default: false,
        },
        deletionDate: {
            type: Date,
            default: null,
        }
    }, {timestamps: true}
);


module.exports = mongoose.model("User", userSchema);