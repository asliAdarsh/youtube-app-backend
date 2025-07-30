import express from 'express';//Importing express module
import cors from 'cors';//Importing cors module
import cookieParser from 'cookie-parser'; //Importing cookie-parser module

const app = express();//Creating an instance of express

app.use(cors({
    origin: process.env.CORS_ORIGIN, //Allowing requests from the client URL
    credentials: true, //Allowing credentials
}))

app.use(express.json({limit: "20kb"}))//Parsing incoming JSON requests {Middle Ware 1}
 
app.use(express.urlencoded({extended: true, limit: "20kb"}))//Parsing incoming URL-encoded requests {Middle Ware 2} 

app.use(express.static('public'))//Serving static files from the public directory {Middle Ware 3}

app.use(cookieParser())//Parsing cookies from incoming requests {Middle Ware 4}



// Importing routes
import userRouter from './routes/user.routes.js';//Importing user routes
import subscriptionRouter from './routes/subscription.routes.js';//Importing subscription routes
import videoRouter from './routes/video.routes.js';
import playlistRouter from './routes/playlist.routes.js';
import healthcheckrouter from './routes/healthcheck.routes.js';
import commentRouter from './routes/comment.routes.js';
import tweetRouter from './routes/tweet.routes.js';
import likeRouter from './routes/like.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
//Router Declaration

app.use('/api/v1/users', userRouter)//Using user routes for user-related API endpoints
app.use('/api/v1/subscriptions', subscriptionRouter)//Using subscription routes for subscription-related API endpoints
app.use('/api/v1/video', videoRouter)
app.use('/api/v1/playlist', playlistRouter)
app.use('/api/v1/healthcheck', healthcheckrouter)
app.use('/api/v1/comment', commentRouter)
app.use('/api/v1/tweet', tweetRouter)
app.use('/api/v1/like', likeRouter)
app.use('/api/v1/dashboard', dashboardRouter)

export {app};//Exporting the app instance