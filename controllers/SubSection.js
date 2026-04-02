const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utilities/imageUploader");
const cloudinary = require("cloudinary").v2;
const { getPublicIdFromUrl } = require("../utilities/getPublicId");
require("dotenv").config();

//create subsection
exports.createSubSection = async (req, res) => {
  try {
    //fetch data
    const { title, description, sectionId, timeDuration } = req.body;

    //extract file/video
    const video = req.files.videoFile;

    //validation
    if (!title || !description || !video || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    //upload video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME,
    );

    //create subsection
    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    //update section with subsection obj id
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: { subSection: subSectionDetails._id },
      },
      { new: true },
    ).populate("subSection");

    //return response
    return res.status(200).json({
      success: true,
      message: "Subsection created successfully.",
      updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create Subsection. Please try again.",
      error: error.message,
    });
  }
};

//update subsection
exports.updateSubSection = async (req, res) => {
  try {
    //fetch data
    const { title, description, sectionId, subSectionId, timeDuration } =
      req.body;

    //validation
    if (!subSectionId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Section ID and SubSection ID are required.",
      });
    }

    // Find the existing subsection
    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "Subsection not found",
      });
    }

    if (title !== undefined) subSection.title = title;
    if (description !== undefined) subSection.description = description;

    if (req.files && req.files.videoFile) {
      const video = req.files.videoFile;

      const publicId = getPublicIdFromUrl(subSection.videoUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
      }

      //upload new video
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME,
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.timeDuration}`;
    }

    await subSection.save();

    //update sub-section
    const updatedSection =
      await Section.findById(sectionId).populate("subSection");

    //return response
    return res.status(200).json({
      success: true,
      message: "Subsection updated successfully.",
      data: updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update Subsection. Please try again.",
      error: error.message,
    });
  }
};

//delete subsection
exports.deleteSubSection = async (req, res) => {
  try {
    //fetch data
    const { sectionId, subSectionId } = req.body;

    if (!subSectionId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Both Section ID and Subsection ID are required.",
      });
    }

    //find the subsection
    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "Subsection not found.",
      });
    }

    //extract public id from video url
    const publicId = getPublicIdFromUrl(subSection.videoUrl);
    if (publicId) {
      //delete video from cloudinary
      await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    }

    //delete subsection
    await SubSection.findByIdAndDelete(subSectionId);

    //update section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $pull: { subSection: subSectionId } },
      { new: true },
    ).populate("subSection");

    //return response
    return res.status(200).json({
      success: true,
      message: "Subsection deleted successfully.",
      data: updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete Subsection. Please try again.",
      error: error.message,
    });
  }
};
