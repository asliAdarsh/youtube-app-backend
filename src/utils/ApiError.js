class ApiError extends Error{ //Custom error class extending the built-in Error class
    constructor( //Constructor
        statusCode,  
        message = "Internal Server Error", //Default message
        error =[], //Array of errors
        stack = "" //Stack trace
    ){
        super(message); //Calling the parent constructor with the message
        this.name = this.constructor.name; //Setting the name of the error
        this.statusCode = statusCode;//Setting the status code
        this.message = message;//Setting the message
        this.success = false;//Setting the success to false
        this.data = null;//Setting the data to null
        this.errors = error;//Setting the errors to an empty array



        if(stack){ //If stack is provided
            this.stack = stack; //Setting the stack trace

        }else{
            Error.captureStackTrace(this, this.constructor);//Capturing the stack trace
        }
    }
}

export {ApiError};