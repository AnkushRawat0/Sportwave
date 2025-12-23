import mongoose from "mongoose";

const connectDB = async () => {
  // Check if already connected using mongoose's built-in state
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    
    console.log("✅ MongoDB Connected successfully");
  } catch (err) {
    console.error("❌ Error in MongoDB Connection:", err.message);
    throw err;
  }
};

export default connectDB;
