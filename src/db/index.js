import mongoose from "mongoose";// import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";// import {DB_NAME} from "../constants.js";

const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONOGODB_URI}/${DB_NAME}`) // const connectionInstance = await mongoose.connect(`${process.env.MONOGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB is Connected!!, DB Host : ${connectionInstance.connection.host}`);  // console.log(`\n MongoDB is Connected!!, DB Host : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Error connecting to DB", error);   // console.log("Error connecting to DB", error);
        process.exit(1);
    }
}


export default connectDB;