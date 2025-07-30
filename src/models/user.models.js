import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { use } from "react";

const userSchema = new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true,
        },
        avatar:{
            type:String, //Cloudinary URL
            required:true,
        },
        coverImage:{
            type:String, //Cloudinary URL
        },
        watchHistory:[{
            type: Schema.Types.ObjectId,
            ref: "Video"
        }],
        password:{
            type:String,
            required:[true,"Password is required"],
        },
        referseToken:{
            type:String,
        }
    },
    {
        timestamps:true,
    })

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return
    next(); 
    }
    this.password = await bcrypt.hash(this.password,10);
})    

userSchema.methods.isCorrectPassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

// userSchema.methods.generateAccessToken = function(){
//     jwt.sign({
//         _id: this._id,
//         email: this.email,
//         username: this.username,
//         fullName: this.fullName,
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     process.env.ACCESS_TOKEN_EXPIRY,
// )
// }

// userSchema.methods.generateRefreshToken = function(){
//     jwt.sign({
//         _id: this._id,
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     process.env.ACCESS_TOKEN_EXPIRY,
// )

// }

userSchema.methods.generateAccessToken = function(){// Method to generate an access token for the user
    return jwt.sign(        // Create a JWT token with user details
        {
            _id: this._id,  // Include user ID in the token payload
            email: this.email,  // Include email in the token payload
            username: this.username,    // Include username in the token payload
            fullName: this.fullName // Include user details in the token payload
        },
        process.env.ACCESS_TOKEN_SECRET,    // Secret key for signing the token, stored in environment variables
        {       
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY   // Set the token expiration time from environment variables
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema);