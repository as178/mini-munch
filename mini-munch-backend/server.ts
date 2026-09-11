import express, { type Application } from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/database";

// load environment variable from .env file
dotenv.config();
const { PORT } = process.env;

// create the express app
const app: Application = express();

// configure parser middleware to handle JSON requests
app.use(express.json());

// connect to the database before starting the server
await connectToDatabase();

// start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`server on http://localhost:${PORT}`);
});
