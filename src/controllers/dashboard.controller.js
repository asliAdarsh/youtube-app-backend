import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Aggregate video-related stats
    const videoStats = await Video.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likeCount: { $size: "$likes" }
            }
        },
        {
            $group: {
                _id: "$channel",
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: "$likeCount" },
                totalVideos: { $sum: 1 }
            }
        }
    ]);

    // Count subscribers separately
    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    });

    if (!videoStats || videoStats.length === 0) {
        throw new ApiError(404, "Channel not found or no videos uploaded");
    }

    const finalStats = {
        ...videoStats[0],
        totalSubscribers
    };

    res.status(200).json(
        new ApiResponse(200, finalStats, "Channel stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    const channelVideos = await Video.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId) // Match videos where the channel matches the provided channelId
            }
        },
        {
            $lookup:{
                from: "users", // Join with the users collection to get channel details
                localField: "channel", // channel is the field in the Video model that references the User model
                foreignField: "_id", // _id is the field in the User model that references the Video model
                as: "channelDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1, // Project only the necessary fields from the user document
                            firstName: 1,
                            avatar: 1,
                        }
                    }
                ] // Join with the users collection to get channel details
            }
        },
        {
            $unwind: "$channelDetails" // Unwind the channelDetails array to get a single object
        },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                channelDetails: 1 // Include channel details in the output
            }
        }
    ])
    if (channelVideos.length === 0) {
        throw new ApiError(404, "No videos found for this channel")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, channelVideos, "Channel videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }