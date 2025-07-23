import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI
        if (!mongoURI) {
            throw new Error("Invalid MongoDB URI !")
        }
        const conn = await mongoose.connect(mongoURI);
        console.log(`DB connected to : ${conn.connection.host}`);
    } catch (error) {
        console.log({error});
    }
}

export default connectDB;