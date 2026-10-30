import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { sendDataToAllTablesWS, startWSServer } from './wssService.js';
import dotenv from "dotenv";
import grpc from '@grpc/grpc-js';

// load environment variable from .env file
dotenv.config();
const { WSS_PORT, GRPC_URL } = process.env;

// fucntion to send menu updates to all websockets
function sendMenuUpdateHandler(call: any, callback: any) {
  try {
    const requestData = call.request;

    //  data back into an json object
    const message = requestData.json_payload ? JSON.parse(requestData.json_payload) : requestData;

    // send message to all websockets
    sendDataToAllTablesWS(message);

    // return ack for successful receipt and broadcast back to the remote gRPC client
    callback(null, { success: true, message: 'Menu update broadcasted to all tables.' });

  } catch (error: any) {
    callback({
      code: grpc.status.INTERNAL,
      details: `Failed to broadcast update: ${error.message}`
    });
  }
}

// load the shared menu proto file 
const PROTO_PATH = path.resolve(import.meta.dirname, '../proto/menu.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// load fucntion definition
const menuProto = grpc.loadPackageDefinition(packageDefinition).menu as any;

// start gRPC server
const server = new grpc.Server();

// bind the handler to the Proto service definition
server.addService(menuProto.MenuService.service, {
  SendMenuUpdate: sendMenuUpdateHandler
});

// if 
if (GRPC_URL && WSS_PORT) {
  // bind gRCP server to port
  server.bindAsync(GRPC_URL, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
    if (err) {
      console.error(`gRPC Server failed to bind: ${err.message}`);
      return;
    }
    console.log(`gRPC Server running on localhost:${boundPort}`);
  });

  // Start the WebSocket server
  startWSServer(Number(WSS_PORT));
} else {
  console.error('Ports and url were unable to load');
}
