import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import {Subscription} from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"



const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params // channelId is the ID of the channel to which the user wants to subscribe or unsubscribe
    // TODO: toggle subscription

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID") // Validate the channelId to ensure it's a valid MongoDB ObjectId
    }

    const user = await User?.findById(req.user?._id) // req.user._id is the ID of the user making the request, assumed to be set by authentication middleware

    if (!user) {
        throw new ApiError(404, "User not found") // Check if the user exists in the database
    }

    const subscription = await Subscription.findOne({ // Check if the user is already subscribed to the channel
        subscriber: user._id, // subscriber is the ID of the user who is subscribing or unsubscribing
        channel: channelId // channel is the ID of the channel to which the user is subscribing or unsubscribing
    })
    
    if (subscription) {
        // User is already subscribed, so we unsubscribe them
        await Subscription.findByIdAndDelete(subscription._id) // Remove the subscription from the database
        // Alternatively, you could also use subscription.remove() if you prefer
    } else{
        // User is not subscribed, so we subscribe them
        const newSubscription = new Subscription({ // Create a new subscription document
            subscriber: user._id, // subscriber is the ID of the user who is subscribing
            channel: channelId // channel is the ID of the channel to which the user is subscribing
        })
        await newSubscription.save() // Save the new subscription to the database
    } 

    return res
    .status(200)
    .json(new ApiResponse(200,{subscribed: !subscription}, "Subscription toggled successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    // if (!channelId) {
    //     throw new ApiError(400, "Invalid channel ID") // Validate the channelId to ensure it's a valid MongoDB ObjectId
    // }
    const subscriberList = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId) // Match subscriptions where the channel matches the provided channelId
            }
        },
        {
            $lookup:{
                from: "users",// Join with the users collection to get subscriber details
                localField: "subscriber",// subscriber is the field in the Subscription model that references the User model
                foreignField: "_id",// _id is the field in the User model that references the Subscription model
                as: "subscriberDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1, // Project only the necessary fields from the user document
                            firstName: 1,
                            avatar: 1,
                        }
                    }
                ] // Join with the users collection to get subscriber details
            }
        },
        {
        $unwind: "$subscriberDetails"
        },
        {
        $replaceRoot: { newRoot: "$subscriberDetails" } // Now the root object is the user object
        }                 
        ])

    return res
    .status(200)
    .json(new ApiResponse(200, "Subscriber list fetched successfully", {
        subscribers: subscriberList// Return the subscriber details from the aggregation result
    }))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID") // Validate the subscriberId to ensure it's a valid MongoDB ObjectId
    }
    if ((!subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID") // Validate the subscriberId to ensure it's a valid MongoDB ObjectId
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match:{
                subscriber : new mongoose.Types.ObjectId(subscriberId) // Match subscriptions where the subscriber matches the provided subscriberId
            }
        },
        {
            $lookup:{
                from: "users",
                localField:"channel",
                foreignField: "_id",
                as: "channelDetails", // Join with the users collection to get channel details
                pipeline:[
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            firstName: 1,
                            avatar: 1,
                        } // Project only the necessary fields from the user document
                    }
                ]   
            }
        },
            {
        $unwind: "$channelDetails"
    },
        {
        $replaceRoot: { newRoot: "$channelDetails" } // Now the root object is the user object
    }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, "Subscribed channels fetched successfully", {
        channels: subscribedChannels
    }))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}