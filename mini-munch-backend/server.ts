import express, { raw, type Application } from "express";
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

// map to keep track of topics, in our case tabls
const subscriptions = new Map();

// wss connection event handler 
wss.on('connection', (ws) => {
  console.log('New WS client connected');

  // send welcome message to client
  ws.send('Welcome to the Mini-Munch WSS server!');

  // message event handler
  ws.on('message', (rawData) => {
    try {
      const { type, payload } = JSON.parse(String(rawData));

      switch (type) {
        // handle subscription event
        case 'subscribe':
          const subTable = payload.table;

          if (!subscriptions.has(subTable)) {
            subscriptions.set(subTable, new Set());
          }

          subscriptions.get(subTable).add(ws);
          console.log(`Client subscribed to: ${subTable}`);

          // send ack back to client 
          ws.send(JSON.stringify({ 
            type: 'subscribed', 
            payload: { topic: subTable }}));
          break; 
      
        // handle un-subscription event
        case 'unsubscribe':

          const unsubTable = payload.topic;

          if(subscriptions.has(unsubTable)) {
            subscriptions.get(unsubTable).delete(ws);
            console.log(`Client unsubscribed from: ${unsubTable}`);
          }

          break;

        // handle publish / event creation
        case 'publish': 
          const pubTable = payload.table;
          const eventData = payload.data;

          // Broadcast to all clients subscribed to this table
          if (subscriptions.has(pubTable)) {
            const message = JSON.stringify({
              type: 'event',
              payload: { topic: pubTable, data: eventData } 
            });

            // subscriptions.get(pubTable).array.forEach(cleint => {
            //   if cleint.readyState === cleint.OPEN) {
            //     cleint.send(message); 
            // });
          }
          break; 

        default:
          console.warn(`Unknown event type: ${type}`);
      }
    } catch (err) {
      console.error('Failed to parse WSS message: ', err);
    }
  });

  // close event handler
  ws.on('close', () => {
    for (const [topic, clients] of subscriptions.entries()) {
      if (clients.has(ws)) {
        clients.delete(ws);
        if (clients.size === 0) {
          subscriptions.delete(topic);
        }
      }
    }
    console.log('Client disconnected and cleaned up');
  });
})