exports.getPublicIdFromUrl = (url) => {
    try {
        if (!url) return null;

        const urlObj = new URL(url);
        const pathname = urlObj.pathname; 

        // Split the path and remove any empty strings
        const parts = pathname.split('/').filter(Boolean);
        const uploadIndex = parts.indexOf('upload');
        
        if (uploadIndex === -1) {
            throw new Error('Invalid Cloudinary URL format');
        }

        // Grab everything AFTER the word 'upload'
        let publicIdParts = parts.slice(uploadIndex + 1);

        // Check if the first part is a version string (starts with 'v' followed by numbers)
        // If it is, remove it from our array. If not, leave the array alone.
        if (publicIdParts[0].match(/^v\d+$/)) {
            publicIdParts.shift(); 
        }

        // Isolate the actual filename
        const lastPart = publicIdParts.pop(); 

        // Safely remove the extension without breaking extensionless files
        const lastDotIndex = lastPart.lastIndexOf('.');
        const filenameWithoutExt = lastDotIndex !== -1 
            ? lastPart.substring(0, lastDotIndex) 
            : lastPart; 

        // Reattach the clean filename to the folder structure
        publicIdParts.push(filenameWithoutExt); 

        return publicIdParts.join('/');
    } catch (err) {
        console.error('Error extracting public ID:', err.message);
        return null;
    }
};