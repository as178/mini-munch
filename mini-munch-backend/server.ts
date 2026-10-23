import express, { type Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import WebSocket, { WebSocketServer } from 'ws';
import { connectToDatabase } from "./config/database";
import swaggerUi from "swagger-ui-express";
import { swagger } from "./config/swagger";
import { errorMiddleware } from "./middleware/errorMiddleware";
import tableRoutes from "./routes/tableRoutes";
import menuItemRoutes from "./routes/menuItemRoutes";
import orderRoutes from "./routes/orderRoutes";

// load environment variable from .env file
dotenv.config();
const { PORT, WSS_PORT } = process.env;

// create the express app
const app: Application = express();

// configure CORS middleware to allow cross-origin requests
app.use(cors());

// configure parser middleware to handle JSON requests
app.use(express.json());

// Swagger UI configuration to serve API documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swagger));

// register mini-munch routes
app.use("/api/tables", tableRoutes);
app.use("/api/menu", menuItemRoutes);
app.use("/api/orders", orderRoutes);

// global error handling middleware
app.use(errorMiddleware);

// connect to the database before starting the server
await connectToDatabase();

// start the server and listen on the specified port
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`server on http://localhost:${PORT}`);
});

// create websocket and on specified port
const wss = new WebSocketServer({ port:  Number(WSS_PORT) });  
console.log(`WebSocket server is running on ws://localhost:${WSS_PORT}`);

// wss connection event handler 
wss.on('connection', (ws) => {
  console.log('New WSS client connected');

  // send welcome message to client
  ws.send('Welcome to the Mini-Munch WSS server!');

  // message event handler
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    // Echo the message back to the client
    ws.send(`Server received: ${message}`);
  });

  // close event handler
  ws.on('close', () => {
    console.log('Client disconnected');
  });
})