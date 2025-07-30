//Method 1
const asyncHandler = (requestHandler)=> { //Creating a higher-order function
    //requestHandler is a function that takes req, res, and next as arguments
    return(req,res,next)=> {
        Promise.resolve(requestHandler(req,res,next))//Handling the request
        .catch((err)=> next(err)) //Handling errors
    }
}

export  {asyncHandler}


//Method 2 
// const asyncHandler = (fn)=> async(req,res,next) =>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         })
//     }
// }
