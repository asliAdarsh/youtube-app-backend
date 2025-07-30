class ApiResponse{
    constructor(
        status,
        data,
        message = "Success" //Default message
        )
    {
        this.status = status;
        this.message = message;
        this.data = data;
        this.success = status < 300; //Success if status code is in the range of 299
    }
}

export {ApiResponse};