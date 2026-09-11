import express, { type Application } from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/database";
import swaggerUi from "swagger-ui-express";
import { swagger } from "./config/swagger";
import { errorMiddleware } from "./middleware/errorMiddleware";

// load environment variable from .env file
dotenv.config();
const { PORT } = process.env;

// create the express app
const app: Application = express();

// configure parser middleware to handle JSON requests
app.use(express.json());

// Swagger UI configuration to serve API documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swagger));

// global error handling middleware
app.use(errorMiddleware);

// connect to the database before starting the server
await connectToDatabase();

// start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`server on http://localhost:${PORT}`);
});
