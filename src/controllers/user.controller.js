import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {User} from '../models/user.models.js'; // Assuming you have a User model defined in models/user.model.js
import {uploadOnCloudinary} from '../utils/cloudinary.js'; // Assuming you have a cloudinary utility for uploading files
import { ApiResponse } from '../utils/ApiResponse.js';
import { use } from 'react';
import jwt from 'jsonwebtoken'; // Importing JWT for token generation
import mongoose from 'mongoose';

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async(req, res)=>{ // Register a new user
//Get user data from frontend
const {fullName, email, username, password} = req.body // Destructure user data from request body
// console.log("email:", email )

//validation
if([fullName, email, username, password].some((field) =>  //^\s*$/.test(field) ||  // Check if field is empty or contains only whitespace
    field?.trim() === "")){
    throw new ApiError(400, "All fields are required");
}

//check if user already exists using email and username
const existedUser = await User.findOne({ // Check if user exists with either email or username
    $or: [
        {username},{email}
    ]
})
if (existedUser) {
    throw new ApiError(409, "User already exists with this email or username");
}

//check for images, check for Avatar
const avatarLocalPath = req.files?.avatar?.[0]?.path; // Accessing the uploaded avatar file
// const coverImageLocalPath = req.files?.coverImage?.[0]?.path; // Accessing the uploaded cover image file

let coverImageLocalPath; // Initialize coverImageLocalPath to undefined
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) { // Check if coverImage exists and is an array with at least one file
    coverImageLocalPath = req.files.coverImage[0].path; // Accessing the uploaded cover image file
}

if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
}

//Upload images to cloudinary

const avatar = await uploadOnCloudinary(avatarLocalPath) // Upload avatar image to Cloudinary
const coverImage = await uploadOnCloudinary(coverImageLocalPath) // Upload cover image to Cloudinary, it can be undefined if not provided
if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar image");
}
// Create user object - create entry in db
const user =  await User.create({ // Create a new user in the database
    fullName,
    avatar : avatar.url,
    coverImage : coverImage?.url || "",
    email,
    username : username.toLowerCase(),
    password
})
// remove password and refersh token from user object
const createdUser = await User.findById(user._id).select("-password -referseToken"); // Fetch the created user without password and refresh token

// check for user creation
if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
}

// return response to frontend
return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
)
})

const loginUser = asyncHandler(async(req,res)=>{
    // get user data from frontend or req.body

    const {username, email, password} = req.body; // Destructure user data from request body

    
    //usernname or email and password
    if (!username && !email) { // Check if neither username nor email is provided
        throw new ApiError(400, "Username or email is required");
    }

    // find user by username or email
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) { // Check if user does not exist
        throw new ApiError(404, "User not found");
    }

    //password check

 const isPasswordValid =  await user.isCorrectPassword(password)
 if (!isPasswordValid) { // Check if password is incorrect
        throw new ApiError(401, "Invalid password");
    } 

    //access and refresh token generation

   const {accessToken, refreshToken } =  await generateAccessAndRefereshTokens(user._id)


    // send cookies

    const loogedInUser = await User.findById(user._id).select("-password -referseToken"); // Fetch the logged-in user without password and refresh token

    const options = {
        httpOnly : true, // Prevents client-side JavaScript from accessing the cookie
        secure: true, // Set to true in production for HTTPS

    }
    return res
        .status (200)
        .cookie("accessToken", accessToken, options) // Set access token cookie
        .cookie("refreshToken", refreshToken, options) // Set refresh token cookie
        .json(new ApiResponse(
            200,
            { loogedInUser, accessToken, refreshToken},
            "User logged in successfully")
        );

})

const logoutUser = asyncHandler(async(req, res) => {
   await User.findByIdAndUpdate(
        req.user._id, 
        {
            $unset:{
                refreshToken: 1 // Clear the refresh token in the user document
            }
        },
        {
            new: true
        }
    )

        const options = {
        httpOnly : true, // Prevents client-side JavaScript from accessing the cookie
        secure: true, // Set to true in production for HTTPS

    }


    return res
    .status(200)
    .clearCookie("accessToken", options) // Clear access token cookie
    .clearCookie("refreshToken", options) // Clear refresh token cookie
    .json(new ApiResponse(200, {}, "User logged out successfully"));
})

const refereshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken; // Get refresh token from cookies or request body


if (!incomingRefreshToken) { // Check if refresh token is not provided
    throw new ApiError(401, "Unauthorized token");
}
try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET); // Verify the refresh token
    
    const user = await User.findById(decodedToken._id); // Find the user by ID from the decoded token
    
    if(!user){
        throw new ApiError(404, "Invalid token");
    }
    
    if(user.refreshToken !== incomingRefreshToken) { 
        throw new ApiError(401, "Refersh Token is expired or used"); // Check if the refresh token in the database matches the incoming token
    }// Check if the refresh token in the database matches the incoming token
    
    const options = {
        httpOnly : true, // Prevents client-side JavaScript from accessing the cookie
        secure: true, // Set to true in production for HTTPS
    }
    
    const {accessToken, newRefreshToken}= await generateAccessAndRefereshTokens(user._id) // Generate new access and refresh tokens
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options) // Set new access token cookie
    .cookie("refreshToken", newRefreshToken, options) // Set new refresh token cookie
    .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed successfully"
        )
    )
} catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized token"); // Handle errors related to token verification
}
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body; // Get the new password from the request body
    const user = await User.findById(req.user?._id); // Find the user by ID from the request object
    const isPasswordValid = await user.isCorrectPassword(oldPassword); // Check if the old password is correct

    if(!isPasswordValid){
        throw new ApiError(401, "Old password is incorrect"); // If the old password is incorrect, throw an error
    }

    user.password = newPassword; // Set the new password
    await user.save({ validateBeforeSave: false }); // Save the user with the new password, skipping validation
    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully")); // Return a success response

})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Cutrrent user fetched successfully"));
})

const updateUserDetails = asyncHandler(async (req,res)=> {
    const {fullName, username, email} = req.body; // Get user details from request body
    if (!fullName || !username || !email) { // Check if any of the required fields are missing
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id, 
        { // Update user details in the database)
            $set: {
                fullName,
                email,
                username: username.toLowerCase() // Convert username to lowercase
            }
        },
        {
            new: true
        }
    ).select("-password "); // Exclude password and refresh token from the response
    return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully")); // Return the updated user details

    }        
)

const updateUserAvatar = asyncHandler(async(req,res)=> 
{
    const avatarLocalPath =  req.file?.path;

    if (!avatarLocalPath) { // Check if avatar file is provided
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath) // Upload avatar image to Cloudinary
    
    if(!avatar.url){
        throw new ApiError(500, "Failed to upload avatar image");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar: avatar.url // Update user's avatar URL in the database
            }
        },
        {
            new: true
        }
    ).select("-password "); // Exclude password and refresh token from the response
    return res
    .status(200)
    .json(new ApiResponse(200, user, "User avatar updated successfully")); // Return the updated user details
})

const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) { // Check if cover image file is provided
        throw new ApiError(400, "Cover image is required");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath) // Upload cover image to Cloudinary
    if(!coverImage.url){
        throw new ApiError(500, "Failed to upload cover image");
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage: coverImage.url // Update user's cover image URL in the database
            }
        },
        {
            new: true
        }
    ).select("-password "); // Exclude password and refresh token from the response
    return res
    .status(200)
    .json(new ApiResponse(200, user, "User cover image updated successfully")); // Return the updated user details
})

const getUserChannelProfile = asyncHandler(async (req,res)=> {
    const {username} = req.params; // Get the username from request parameters
    if (!username) { // Check if username is provided
        throw new ApiError(400, "Username is required");
    }
    const channel = await User.aggregate([
        {
            $match:{
                username : username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscription", // Join with the subscriptions collection
                localField: "_id", // Local field in the user collection
                foreignField: "channel", // Foreign field in the subscriptions collection
                as: "subscribers" // Name of the field to store the joined data
            }
        },
        {
            $lookup:{
                from: "subscription", // Join with the subscriptions collection
                localField: "_id", // Local     field in the user collection
                foreignField: "subscriber", // Foreign field in the subscriber collection
                as: "subscribedTo" // Name of the field to store the joined data
            }
        },
        {
            $addFields:{ //added a new field to count subscribers and channel
                subscribersCount:{ // field to count subscriber
                    $size: "$subscribers"  // method to count subscriber in this we added $ brfore subscriber cause now its a field
                },
                channelSubscribedToCount :{
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: [
                        { $in: [req.user?._id, "$subscribers.subscriber"] },
                        true,
                        false
                    ]
                }
            }
        },
        {
            $project:{
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])
    if(!channel?.length){
        throw new ApiError(404, "Channel not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User channel profile fetched successfully")); // Return the channel profile
})

const getUserWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id) // Match the user by ID
            }
        },
        {
            $lookup:{
                from: "videos", // Join with the videos collection
                localField: "watchHistory", // Local field in the user collection
                foreignField: "_id", // Foreign field in the videos collection
                as: "watchHistoryVideos", // Name of the field to store the joined data
                pipeline:[
                    {
                        $lookup:{ 
                            from :"users",
                            "localField": "owner",
                            "foreignField": "_id",
                            "as": "ownerDetails", // Join with the users collection to get owner details
                            pipeline:[
                                {
                                    $project:{
                                        fullName: 1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }   
                    },
                    {
                        $addFields:{ 
                            owner:{
                                $first: "$ownerDetails" // Add owner details to the video
                            }
                        }
                    }
                ]
            }
        }
    ])
    if(!user?.length){
        throw new ApiError(404, "User not found");
    }
    return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistoryVideos, "User watch history fetched successfully")); // Return the user's watch history
})

export {
    registerUser, 
    loginUser,
    logoutUser, 
    refereshAccessToken,
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getUserWatchHistory
}   