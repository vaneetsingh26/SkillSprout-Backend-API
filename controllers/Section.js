const Section = require("../models/Section");
const Course = require("../models/Course");
const cloudinary = require('cloudinary').v2;
const {getPublicIdFromUrl} = require('../utilities/getPublicId');
const SubSection = require("../models/SubSection");

//create section
exports.createSection = async(req, res) => {
    try {
        //datafetch
        const {sectionName, courseId} = req.body;

        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'All fields are required.'
            });
        }

        //create section
        const newSection = await Section.create({sectionName});

        //update course with new section
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId, {
            $push:{courseContent: newSection._id},
        }, {new:true})
        .populate('courseContent')
        .populate('courseContent.subSection');

        //return response
        return res.status(200).json({
            success:true,
            message:'Section created successfully.',
            updatedCourseDetails,
        })
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message: "Unable to create section. Please try again.",
            error:error.message,
        })
    }
}


//update section
exports.updateSection = async(req, res) => {

    try {
        //datafetch
        const {sectionId, sectionName, courseId} = req.body;

        //data validation
        if(!sectionId || !sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'All fields are required.'
            });
        }

        //update section
        const updatedSectionDetails = await Section.findByIdAndUpdate(sectionId, {
            sectionName,
        }, {new:true});

        // Fetch updated course to send back to frontend
        const course = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"subSection",
			},
		})
		.exec();

        //return response
        return res.status(200).json({
            success:true,
            message:'Section updated successfully.',
            data: course
        })
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message: "Unable to update section. Please try again.",
            error:error.message,
        })
    }
}


//delete section
exports.deleteSection = async(req, res) => {
    try {
        //get id assuming that we are sending id in params
        const{sectionId, courseId} = req.body;

        //validation
        if(!sectionId || !courseId){
            return res.status(400).json({
                success:false,
                message:'All fields are required.',
            });
        }

        //find by id and delete
        const section = await Section.findById(sectionId);
        if(!section){
            return res.status(404).json({
                success:false,
                message:"Section not found."
            });
        }

        for(const subSectionId of section.subSection) {
            const subSection = await SubSection.findById(subSectionId);
            if(subSection && subSection.videoUrl) {
                const publicId = getPublicIdFromUrl(subSection.videoUrl);
                if(publicId) {
                    await cloudinary.uploader.destroy(publicId, {resource_type: 'video'});
                }
                await SubSection.findByIdAndDelete(subSectionId);
            }
        }

        //delete the section
        await Section.findByIdAndDelete(sectionId);

        //update course
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId, {
            $pull:{courseContent: sectionId}
        }, {new:true})
        .populate({
            path: 'courseContent',
            populate: { path: 'subSection' }
        });

        //return response
        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully.",
            data: updatedCourseDetails
        })
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message: "Unable to delete section. Please try again.",
            error:error.message,
        })
    }
}