import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    const {videoId} = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const user = req.user._id // Assuming req.user is set by authentication middleware
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isLiked = await Like.findOne({
        likedBy: user,
        video: videoId
    })

    if(isLiked){
        await Like.findByIdAndDelete(isLiked._id)
    }else {
        const newLike = new Like({
            likedBy: user,
            video: videoId
        })
        await newLike.save()
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {liked: !isLiked}, "Video like toggled successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment
    const {commentId} = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    const user = req.user._id // Assuming req.user is set by authentication middleware
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const isLiked = await Like.findOne({
        likedBy: user,
        comment: commentId
    })
    if(isLiked){
        await Like.findByIdAndDelete(isLiked._id)
    }
    else {
        const newLike = new Like({
            likedBy: user,
            comment: commentId
        })
        await newLike.save()
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {liked: !isLiked}, "Comment like toggled successfully"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet
    const {tweetId} = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }
    const user = req.user._id // Assuming req.user is set by authentication middleware
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const isLiked = await Like.findOne({
        likedBy: user,
        tweet: tweetId
    })
    if(isLiked){
        await Like.findByIdAndDelete(isLiked._id)
    }
    else {
        const newLike = new Like({
            likedBy: user,
            tweet: tweetId
        })
        await newLike.save()
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {liked: !isLiked}, "Tweet like toggled successfully") )

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedBy: new mongoose.Types.ObjectId(req.user._id), // Ensure we only get likes by the current user
                video: {$ne: null} // Ensure we only get likes on videos
            }
        },
        {
            $lookup:{
                from: "videos", // Assuming the videos collection is named "videos"
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            title: 1,
                            videoFile: 1,
                            thumbnail: 1,
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$videoDetails" // Unwind the videoDetails array to get a flat structure
        },
        {
            $project: {
                _id: 1,
                video: "$videoDetails",
                likedBy: 1,
                createdAt: 1
            }
        }

    ])
    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}