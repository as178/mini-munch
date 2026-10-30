import path = require('path');
import grpc = require('@grpc/grpc-js');
import protoLoader = require('@grpc/proto-loader');

import type { ProtoGrpcType } from './generated/todo';

const PROTO_PATH = path.join(__dirname, 'todo.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const todoProto = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType;

function main() {
  const client = new todoProto.todopackage.TodoService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  client.getTodo({ id: 101 }, (error, response) => {
    if (error) {
      console.error('gRPC Error:', error);
      return;
    }
    console.log('Response from server:', response);
  });
}

main();