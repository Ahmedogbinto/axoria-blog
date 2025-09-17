export default class AppError extends Error {
    constructor(message = "An error occured ") {
        super(message)
        this.name = "AppError"
    }
}