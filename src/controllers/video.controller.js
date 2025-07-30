import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;
    const sortOrder = sortType === "asc" ? 1 : -1;

    // Match stage
    const matchStage = {};

    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if (userId) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    // Pipeline
    const pipeline = [
        { $match: matchStage },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: {
                path: "$ownerDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                title: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                thumbnail: 1,
                views: 1,
                "ownerDetails._id": 1,
                "ownerDetails.username": 1,
                "ownerDetails.avatar": 1
            }
        },
        { $sort: { [sortBy]: sortOrder } },
        { $skip: skip },
        { $limit: limitNumber }
    ];

    const videos = await Video.aggregate(pipeline);

    const totalVideos = await Video.countDocuments(matchStage);

    return res.status(200).json({
        success: true,
        message: "Videos fetched successfully",
        data: {
            total: totalVideos,
            page: pageNumber,
            limit: limitNumber,
            results: videos
        }
    });
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description,duration} = req.body
    if (!title || !description || !duration) {
    throw new ApiError(400, "Title and description are required");
}
    // TODO: get video, upload to cloudinary, create video
    const videoLocalPath = req.files?.videoFile[0]?.path;
    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required")
    }
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required")
    }
    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile || !thumbnailFile) {
        throw new ApiError(500, "Failed to upload video or thumbnail to cloudinary")
    }
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnailFile.url,
        title,
        description,
        duration, // Assuming duration is passed in the body
        owner: req.user._id // Assuming user is authenticated and user ID is available in req.user
    })
    
    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findById(videoId)
    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { title, description, thumbnail } = req.body
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required")
    }
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnailFile) {
        throw new ApiError(500, "Failed to upload thumbnail to cloudinary")
    }
    // TODO: update video details like title, description, thumbnail
    const video = await Video.findByIdAndUpdate(videoId,
        {
        $set:{
            title,
            description,
            thumbnail: thumbnailFile.url // Update the thumbnail URL
        }
        },
        {
            new: true,
        }
).select("-owner")
return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    //TODO: delete video
    const video = await Video.findByIdAndDelete(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        // Video does not exist, so no need to "set isPublished to false"
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = true; // or false, if you're trying to unpublish
    await video.save();

return res
    .status(200)
    .json(new ApiResponse(200, video, "Video publish status toggled successfully"));
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}