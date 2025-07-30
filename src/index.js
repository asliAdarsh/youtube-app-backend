import dotenv from 'dotenv';    // Importing dotenv to load environment variables
import connectDB from './db/index.js';  // Importing the database connection function
import { app } from './app.js';     // Importing the Express app instance

dotenv.config({     // Loading environment variables from .env file
    path: './env'
});

connectDB() // Connecting to the database
.then(()=>{  // If the connection is successful
    app.on('error', (err) => {  // Handling server errors
        console.error('Server error:', err);    
        throw err;
    })
    app.listen(process.env.PORT, () => { // Starting the server
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((err)=>{ // If the connection fails
    console.log(err); // Logging the error
    console.log('Database connection failed');
});