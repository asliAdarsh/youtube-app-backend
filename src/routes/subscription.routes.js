import { Router } from 'express';
import {
    getSubscribedChannels,         // Fetch channels a user has subscribed to
    getUserChannelSubscribers,     // Fetch subscribers of a channel
    toggleSubscription             // Subscribe/unsubscribe to a channel
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();

// Subscribe or unsubscribe to a channel
subscriptionRouter.post("/c/:channelId", verifyJWT, toggleSubscription);

// Get all subscribers of a given channel
subscriptionRouter.get("/c/:channelId", verifyJWT, getUserChannelSubscribers);

// Get all channels a subscriber is subscribed to
subscriptionRouter.get("/u/:subscriberId", verifyJWT, getSubscribedChannels);

export default subscriptionRouter;
