import path = require('path');
import grpc = require('@grpc/grpc-js');
import protoLoader = require('@grpc/proto-loader');

import type { ProtoGrpcType } from './generated/todo';
import type { TodoServiceHandlers } from './generated/todopackage/TodoService';
import type { TodoRequest } from './generated/todopackage/TodoRequest';
import type { TodoResponse } from './generated/todopackage/TodoResponse';

const PROTO_PATH = path.join(__dirname, 'todo.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const todoProto = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType;

const todoServiceImplementation: TodoServiceHandlers = {
  GetTodo: (
    call: grpc.ServerUnaryCall<TodoRequest, TodoResponse>,
    callback: grpc.sendUnaryData<TodoResponse>
  ) => {
    console.log(`Received request for Todo ID: ${call.request.id}`);

    const mockTodo: TodoResponse = {
      id: call.request.id,
      title: "Strict NodeNext gRPC call",
      completed: true,
    };

    callback(null, mockTodo);
  }
};

function main() {
  const server = new grpc.Server();
  server.addService(todoProto.todopackage.TodoService.service, todoServiceImplementation);
  
  const address = '0.0.0.0:50051';
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`TypeScript Server running on port ${port}`);
  });
}

main();
