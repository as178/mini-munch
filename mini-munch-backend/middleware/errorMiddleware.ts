import type { ErrorRequestHandler } from "express";
import { Error as MongooseError } from "mongoose";
import type { TableServiceFailureReason } from "../services/tableService";
import type { MenuItemServiceFailureReason } from "../services/menuItemService";
import type { OrderServiceFailureReason } from "../services/orderService";
import { tableHttpErrorResponses } from "../errors/tableErrors";
import { menuItemHttpErrorResponses } from "../errors/menuItemErrors";
import { orderHttpErrorResponses } from "../errors/orderErrors";

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

// defined mapping of service failure reasons to HTTP status codes
const httpErrorResponses = {
  ...tableHttpErrorResponses,
  ...menuItemHttpErrorResponses,
  ...orderHttpErrorResponses,
};

// defined type for service failure reasons
type ServiceError =
  | TableServiceFailureReason
  | MenuItemServiceFailureReason
  | OrderServiceFailureReason;

/**
 * creates an AppError for a service failure
 * @param serviceError the service failure reason
 * @returns an AppError with the corresponding HTTP status code, failure reason, and error message
 */
export function createAppServiceError(serviceError: ServiceError): AppError {
  // retrieve the corresponding HTTP status code, failure reason, and error message for the failure reason
  const response = httpErrorResponses[serviceError.reason];
  // create and return an AppError for the controller to pass to the global error middleware
  return new AppError(
    response.statusCode,
    serviceError.reason,
    serviceError.message,
  );
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
    console.error("Handled application error:", error);
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
      // returns an array of validation errors with the field and message for each error
      // e.g. [{ field: "name", message: "..." }]
      errors: Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });

    return;
  }

  // MongoDB driver error for duplicate key (e.g. unique index violation)
  if (error.name === "MongoServerError" && error.code === 11000) {
    // extract the fields that caused the duplicate key error
    const fields = Object.keys(error.keyValue || {});

    return res.status(409).json({
      code: "DUPLICATE_RESOURCE",
      message: "A resource with those details already exists.",

      // returns an array of duplicate field errors with the field and message for each error
      // e.g. [{ field: "name", message: "Name is already used." }]
      errors: fields.map((field) => ({
        field: field,
        message: `The ${field} is already used.`,
      })),
    });
  }

  // unexpected server errors
  console.error("Unhandled server error:", error);
  res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected server error occurred.",
  });
};
