import { WebSocketServer } from "ws";
import { getTable } from "./tableService";

// map to keep track of topics, in our case tabls
const subscriptions = new Map();

// function to send data to specific tables and table 0
export function sendDataToSelectTablesWS(tables: string[], data: any) {
  const jsonData = JSON.stringify(data);

  // iterate through the subscriptions map
  for (const [topic, wsConnection] of subscriptions.entries()) {
    // check if the topic is in the list of tables or if it's table 0
    if (tables.includes(topic) || topic === '0') {
      // Send the data to the websocket
      wsConnection.send(jsonData);
    }
  }
}

// function to send data to all tables, for menu updates
export function sendDataToAllTablesWS(data: any) {
  const jsonData = JSON.stringify(data);

  // iterate through the subscriptions map
  for (const [topic, wsConnection] of subscriptions.entries()) {
    // Send the data to the websocket
    wsConnection.send(jsonData);
  }
}

export async function startWSServer(WSS_PORT: number) {
  // start the WebSocket server
  const wss = new WebSocketServer({ port: Number(WSS_PORT) }); 
  wss.on('listening', () => {
    console.log(`WebSocket server is running on ws://localhost:${WSS_PORT}`);
  });

  // wss connection event handler 
  wss.on('connection', (ws) => {
    console.log('New WS client connected');

    // send welcome message to client
    ws.send('Welcome to the Mini-Munch WSS server!');

    // message event handler
    ws.on('message', async (rawData) => {
      try {
        //covert socket data into JSON
        const { type, payload } = JSON.parse(String(rawData));

        switch (type) {
          // handle subscription event
          case 'subscribe':
            const subTable = payload.table;
            const tableServiceResult = await getTable(Number(subTable));

            // table 0 is for staff, should recive all websocket data
            if (subTable === '0') {
              subscriptions.set(subTable, ws);
              console.log(`Client subscribed to staff table (table 0)`);
              
              // send ack back to client with table data 
              ws.send(JSON.stringify({ 
                type: 'subscribed', 
                payload: { 
                  topic: subTable, 
                  message: `Subscribed to table ${subTable}, will recive all events`
                }
              }));
              return;
            }

            //check if there was an error getting the table
            if (!tableServiceResult.success) {
              console.log(tableServiceResult.serviceError);
              
              //send error though socket
              ws.send(JSON.stringify({ 
              type: 'error', 
              payload: { message: tableServiceResult.serviceError }}));
              return;
            }

            // check if there is an exsisting socket
            if (subscriptions.has(subTable)) {
              // log error for table already having socket bound
              console.log(`Table ${subTable} already has a ws`);
              
              // pass error though socket
              ws.send(JSON.stringify({ 
              type: 'error', 
              payload: { message: `Table ${subTable} already has a ws ` }}));
              return;
            }          

            const table = tableServiceResult.data;
            // if table occupied, then create web socket
            if (!table.available){
              subscriptions.set(subTable, ws);
              console.log(`Client subscribed to: ${subTable}`);
              
              // send ack back to client with table data 
              ws.send(JSON.stringify({ 
              type: 'subscribed', 
              payload: { 
                topic: subTable, 
                table: tableServiceResult.data
              }}));
            } else {
              // table is not occupied, user should occupy table first
              console.log(`Table ${subTable} is not occupied, can't bind ws`);
              
              // send message though socket
              ws.send(JSON.stringify({ 
                type: 'error', 
                payload: { message: `Table ${subTable} is not occupied, can't bind ws` }
              }));
            }
            break; 
        
          // handle un-subscription event
          case 'unsubscribe':

            // get topic to unsub from
            const unsubTable = payload.table;

            // check for topic and delete it form the subscription 
            if(subscriptions.has(unsubTable)) {
              subscriptions.delete(unsubTable);

              // log the change
              console.log(`Client unsubscribed from: ${unsubTable}`);

              // send the change to the client
              ws.send(JSON.stringify({ 
              type: 'unsubscribed', 
              payload: { message: `Client has unsubscribed from table ${unsubTable}` }}));
            }
            break;

          // fall back for unknow events
          default:
            console.warn(`Unknown event type: ${type}`);
        }
      } catch (err) {
        console.error('Failed to parse WSS message: ', err);
      }
    });

    // close event handler
    ws.on('close', () => {
      for (const [topic, wsConnection] of subscriptions.entries()) {
        if (wsConnection === ws) {
          subscriptions.delete(topic);
          console.log(`Client disconnected and unsubscribed from: ${topic}`);
        }
      }
    });
  })
}