import { Router } from "express";// Importing the Router from express
import { 
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
    getUserWatchHistory, 
} from "../controllers/user.controller.js"; // Importing the registerUser controller
import {upload} from "../middlewares/multer.middleware.js"; // Importing the multer configuration for file uploads
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();// Creating a new router instance for user-related routes

userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1 // Limiting the avatar upload to one file

        },
        {
            name: "coverImage",
            maxCount: 1 // Limiting the cover image upload to one file
        }
    ]),
    registerUser
)// Defining the route for user registration, which will handle POST requests to "/register" and call the registerUser controller

userRouter.route("/login").post(loginUser)// Defining the route for user login, which will handle POST requests to "/login" and call the loginUser controller

//secure routes

userRouter.route("/logout").post(verifyJWT, logoutUser)// Defining the route for user logout, which will handle POST requests to "/logout" and call the logoutUser controller after verifying the JWT token

userRouter.route("/referesh-token").post(verifyJWT,refereshAccessToken)// Defining the route for refreshing access tokens, which will handle GET requests to "/referesh-token" and call the refereshAccessToken controller after verifying the JWT token

userRouter.route("/change-password").post(verifyJWT,changeCurrentPassword)// Defining the route for changing the current password, which will handle POST requests to "/change-password" and call the changeCurrentPassword controller after verifying the JWT token

userRouter.route("/get-user").get(verifyJWT,getCurrentUser) // Defining the route for getting the current user, which will handle GET requests to "/get-user" and call the getCurrentUser controller after verifying the JWT token

userRouter.route("/update-user").patch(verifyJWT,updateUserDetails) // Defining the route for updating user details, which will handle PUT requests to "/update-user" and call the updateUserDetails controller after verifying the JWT token

userRouter.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)//  Defining the route for updating the user's avatar, which will handle PATCH requests to "/update-avatar" and call the updateUserAvatar controller after verifying the JWT token and uploading a single file named "avatar"

userRouter.route("/update-cover-image").patch(verifyJWT,upload.single("coverImage"),updateCoverImage)//  Defining the route for updating the user's avatar, which will handle PATCH requests to "/update-avatar" and call the updateUserAvatar controller after verifying the JWT token and uploading a single file named "avatar"I

userRouter.route("/c/:username").get(verifyJWT, getUserChannelProfile)// Defining the route for getting a user's channel profile by username, which will handle GET requests to "/c/:username" and call the getUserChannelProfile controller after verifying the JWT token

userRouter.route("/history").get(verifyJWT,getUserWatchHistory)// Defining the route for getting the user's watch history, which will handle GET requests to "/history" and call the getUserWatchHistory controller after verifying the JWT token

export default userRouter;