import mongoose from "mongoose";

export async function connectToBD() {
    if(mongoose.connection.readyState) {
        console.log("Using existng connection", mongoose.connection.name)
        return
    }
    try {
        await mongoose.connect(process.env.MONGO)
        console.log("Connected to Database", mongoose.connection.name)
    } catch(err) {
        throw new Error ("failed to connect to the Database")
    }
}