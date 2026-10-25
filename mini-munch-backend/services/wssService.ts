import { WebSocketServer, WebSocket } from "ws";
import { getTable } from "./tableService";

// Map to keep track of topics (table numbers) mapped to a Set of sockets
const subscriptions = new Map<number, Set<WebSocket>>();

// Helper to safely add a connection to a table set
function addSubscription(table: number, ws: WebSocket) {
  if (!subscriptions.has(table)) {
    subscriptions.set(table, new Set());
  }
  subscriptions.get(table)!.add(ws);
}

// Helper to safely remove a connection from a table set
function removeSubscription(table: number, ws: WebSocket) {
  const tableSet = subscriptions.get(table);
  if (tableSet) {
    tableSet.delete(ws);
    if (tableSet.size === 0) {
      subscriptions.delete(table);
    }
  }
}

// Function to send data to specific tables and table 0
export function sendDataToSelectTableWS(table: string | number, data: any) {
  const targetTable = Number(table);
  const staffTable = 0;

  const tablesToNotify = [targetTable, staffTable];

  for (const tableNum of tablesToNotify) {
    const clients = subscriptions.get(tableNum);
    if (clients) {
      const message = JSON.stringify({
        topic: String(tableNum),
        payload: data
      });
      for (const wsConnection of clients) {
        if (wsConnection.readyState === WebSocket.OPEN) {
          wsConnection.send(message);
        }
      }
    }
  }
}

// Function to send data to all tables, for menu updates
export function sendDataToAllTablesWS(data: any) {
  for (const [tableNum, clients] of subscriptions.entries()) {
    const message = JSON.stringify({
      topic: String(tableNum),
      payload: {
        type: 'menu',
        ...data
      }
    });
    for (const wsConnection of clients) {
      if (wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.send(message);
      }
    }
  }
}

export async function startWSServer(WSS_PORT: number) {
  // Start the WebSocket server
  const wss = new WebSocketServer({ port: Number(WSS_PORT) }); 
  wss.on('listening', () => {
    console.log(`WebSocket server is running on ws://localhost:${WSS_PORT}`);
  });

  // WSS connection event handler 
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WS client connected');

    // Message event handler
    ws.on('message', async (rawData) => {
      try {
        // Convert socket data into JSON
        const { type, topic } = JSON.parse(String(rawData));
        const numericTable = Number(topic);

        if (isNaN(numericTable)) {
          console.log(`Invalid table number incoming: ${topic}`);
          ws.send(JSON.stringify({ 
            topic: 'error', 
            payload: { message: `Invalid table number: ${topic}` } 
          }));
          return;
        }

        switch (type) {
          // Handle subscription event
          case 'subscribe':
            // Table 0 is for staff, should receive all websocket data
            if (numericTable === 0) {
              addSubscription(numericTable, ws);
              console.log(`Client subscribed to staff table (table 0)`);
              
              // Send ack back to client
              ws.send(JSON.stringify({ 
                topic: 'subscribed', 
                payload: { 
                  topic: numericTable, 
                  message: `Subscribed to table ${numericTable}, will receive all events`
                }
              }));
              return;
            }

            const tableServiceResult = await getTable(numericTable);

            // Check if there was an error getting the table
            if (!tableServiceResult.success) {
              console.log(tableServiceResult.serviceError);
              ws.send(JSON.stringify({ 
                topic: 'error', 
                payload: { message: tableServiceResult.serviceError }
              }));
              return;
            }       

            const table = tableServiceResult.data;
            // If table occupied, then register the web socket to the Set
            if (!table.available){
              addSubscription(numericTable, ws);
              console.log(`Client subscribed to table: ${numericTable}`);
              
              // Send ack back to client with table data 
              ws.send(JSON.stringify({ 
                topic: 'subscribed', 
                payload: { 
                  topic: numericTable, 
                  table: tableServiceResult.data
                }
              }));
            } else {
              // Table is unoccupied, user should occupy table first
              console.log(`Table ${numericTable} is unoccupied, can't bind ws`);
              ws.send(JSON.stringify({ 
                topic: 'error', 
                payload: { message: `Table ${numericTable} is unoccupied, can't bind ws` }
              }));
            }
            break; 
        
          // Handle un-subscription event
          case 'unsubscribe':
            removeSubscription(numericTable, ws);
            console.log(`Client unsubscribed from table: ${numericTable}`);

            // Send the change verification to the client
            ws.send(JSON.stringify({ 
              topic: 'unsubscribed', 
              payload: { message: `Client has unsubscribed from table ${numericTable}` }
            }));
            break;

          // Fallback for unknown events
          default:
            console.warn(`Unknown event type: ${type}`);
        }
      } catch (err) {
        console.error('Failed to parse WSS message: ', err);
      }
    });

    // Close event handler
    ws.on('close', () => {
      for (const [tableNum, clients] of subscriptions.entries()) {
        if (clients.has(ws)) {
          removeSubscription(tableNum, ws);
          console.log(`Client disconnected and scrubbed from table subscription: ${tableNum}`);
        }
      }
    });
  });
}
