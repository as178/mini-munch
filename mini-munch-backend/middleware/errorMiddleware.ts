import type { ErrorRequestHandler } from "express";
import { Error as MongooseError } from "mongoose";

// reusable application error used by services and controllers
export class AppError extends globalThis.Error {
  public readonly statusCode: number; // HTTP status code associated with the error
  public readonly code: string; // custom error code for identifying the type of error

  constructor(statusCode: number, code: string, message: string) {
    // call the constructor of the base Error class with the error message
    super(message);

    // set custom error name for the program
    this.name = "MiniMunchError";

    // set the HTTP status code and custom error code
    this.statusCode = statusCode;
    this.code = code;
  }
}

// global error handling middleware
export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  // custom application errors thrown by services or controllers
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
    });

    return;
  }

  // Mongoose schema validation error
  if (error instanceof MongooseError.ValidationError) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Validation failed.",
      errors: Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });

    return;
  }

  // unexpected server errors
  console.error("Unhandled server error:", error);
  res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected server error occurred.",
  });
};
