import mongoose from "mongoose";
import dotenv from "dotenv";

// load environment variable from .env file
dotenv.config();
const { MONGODB_URI } = process.env;

export async function connectToDatabase(): Promise<void> {
  try {
    // connect to the MongoDB database using the connection string from environment variables
    // create a single shared connection pool using mongodb node.js driver; every request will reuse connections from this pool
    await mongoose.connect(MONGODB_URI as string);
    console.log("database connected successfully!");
  } catch (error) {
    // log the error and exit the process if the connection fails
    console.error("error connecting to the database:", error);
    process.exit(1);
  }
}
