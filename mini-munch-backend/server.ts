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
import { getTable } from "./services/tableService";

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
  ws.on('message', async (rawData) => {
    try {
      const { type, payload } = JSON.parse(String(rawData));

      switch (type) {
        // handle subscription event
        case 'subscribe':
          const subTable = payload.table;

          if (!subscriptions.has(subTable)) {
            subscriptions.set(subTable, ws);
            console.log(`Client subscribed to: ${subTable}`);

            const tableServiceResult = await getTable(subTable);

            if (!tableServiceResult.success) {
              console.log(`Table is occupied ${subTable}`);
              
              ws.send(JSON.stringify({ 
              type: 'error', 
              payload: { message: `Table is occupied ${subTable}` }}));
              return;
            }
              // send ack back to client 
              ws.send(JSON.stringify({ 
              type: 'subscribed', 
              payload: { topic: subTable }}));
          } else {
            console.log(`Client already subscribed to table ${subTable}`);
            
            ws.send(JSON.stringify({ 
            type: 'error', 
            payload: { message: `Client already subscribed to table ${subTable}` }}));
          }
          break; 
      
        // handle un-subscription event
        case 'unsubscribe':
          const unsubTable = payload.table;

          if(subscriptions.has(unsubTable)) {

            subscriptions.delete(unsubTable);

            console.log(`Client unsubscribed from: ${unsubTable}`);

            ws.send(JSON.stringify({ 
            type: 'unsubscribed', 
            payload: { message: `Client has unsubscribed from table ${unsubTable}` }}));
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
    for (const [topic, clientSet] of subscriptions.entries()) {
      clientSet.delete(ws);

      if (clientSet.size === ws) {
        subscriptions.delete(topic);
        console.log('Client disconnected and cleaned up');
      }
    }
  });
})