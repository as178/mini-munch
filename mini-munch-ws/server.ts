import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { sendDataToAllTablesWS, startWSServer } from './wssService.js';
import dotenv from "dotenv";
import grpc from '@grpc/grpc-js';

// refactored Function gRPC Handler
function sendMenuUpdateHandler(call: any, callback: any) {
  try {
    const requestData = call.request;

    //  data back into an json object
    const data = requestData.json_payload ? JSON.parse(requestData.json_payload) : requestData;

    sendDataToAllTablesWS(data);

    // ack successful receipt and broadcast back to the remote gRPC client
    callback(null, { success: true, message: 'Menu update broadcasted to all tables.' });

  } catch (error: any) {
    callback({
      code: grpc.status.INTERNAL,
      details: `Failed to broadcast update: ${error.message}`
    });
  }
}

// load environment variable from .env file
dotenv.config();
const { WSS_PORT, GRPC_PORT } = process.env;

// load the proto file using modern ES modules dirname syntax
const PROTO_PATH = path.resolve(import.meta.dirname, '../proto/menu.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const menuProto = grpc.loadPackageDefinition(packageDefinition).menu as any;

// start gRPC server
const server = new grpc.Server();

// bind the handler to the Proto service definition
server.addService(menuProto.MenuService.service, {
  SendMenuUpdate: sendMenuUpdateHandler
});

if (GRPC_PORT) {
  server.bindAsync(GRPC_PORT, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
    if (err) {
      console.error(`gRPC Server failed to bind: ${err.message}`);
      return;
    }
    console.log(`gRPC Server running on localhost:${boundPort}`);
  });

  // Start the WebSocket server
  startWSServer(Number(WSS_PORT));
}
