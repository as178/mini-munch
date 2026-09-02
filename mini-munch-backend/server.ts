import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import dotenv from "dotenv";

// load environment variables from .env file
dotenv.config();
const { PORT, MONGO_URI } = process.env;

// create the express app
const app: Application = express();

// configure parser middleware to handle JSON requests
app.use(express.json());

// testing route to check if the server is running
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "server is running" });
});

// start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`server on http://localhost:${PORT}`);
});
