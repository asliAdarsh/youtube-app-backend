import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.models.js";

export const verifyJWT =  asyncHandler(async (req, _, next) => {// Middleware to verify JWT token
    try {
        // Check for access token in cookies or Authorization header
        const token = req.cookies?.accessToken || req.header// Access token can be in cookies or Authorization header
        ("Authorization")?.replace("Bearer ", "") // Extract the token from the Authorization header if present
    
        if (!token) {
            throw new ApiError(401, "Unauthorized request");// If no token is provided, throw an error
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)// Verify the token using the secret key from environment variables
    
        const user = await User.findById(decodedToken?._id).select("-password -referseToken")   // Find user by ID from the decoded token, excluding password and refresh token 
    
        if (!user) {
            throw new ApiError(401, "Invalid token");// If user not found, token is invalid
        }
    
        req.user = user; // Attach the user to the request object
        next(); // Call the next middleware or route handler
    } catch (error) {
            throw new ApiError(401, error?.message || "Invalid access token"); // Handle other errors

        }

})