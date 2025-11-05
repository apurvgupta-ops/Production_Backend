import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoURL = process.env.MONGO_URL || "mongodb://localhost:27017/docker_app_db";
        await mongoose.connect(mongoURL);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;