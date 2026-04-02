const cloudinary = require('cloudinary').v2;

exports.uploadImageToCloudinary = async(file, folder, height, quality) => {
    try {
        const options = {folder};
        if(height){
            options.height = height;
        }
        if(quality){
            options.quality = quality;
        }
        options.resource_type = 'auto';

        return await cloudinary.uploader.upload(file.tempFilePath, options)
    } 
    catch (error) {
        console.error("Cloudinary Upload Error:", error.message);
        //Throw the error so the calling controller knows it failed!
        throw new Error(`Image upload failed: ${error.message}`);
    }
}