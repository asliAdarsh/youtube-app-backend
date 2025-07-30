import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
    try {
        if(!filePath) return null;
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(filePath,{
            resource_type: "auto"
        })
        //file uploaded successfully
        // console.log("File uploaded successfully", response.url);
        fs.unlinkSync(filePath); // Delete the file from local storage
        return response;
    } catch (error) {
        fs.unlinkSync(filePath); // Delete the file from local storage
        console.error("Error uploading file to Cloudinary", error);
        return null;
    }
}


export { uploadOnCloudinary };