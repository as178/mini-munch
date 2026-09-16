import { menuItemHttpErrorResponses } from "../errors/menuItemErrors";
import { orderHttpErrorResponses } from "../errors/orderErrors";
import { tableHttpErrorResponses } from "../errors/tableErrors";
import type { MenuItemServiceFailureReason } from "../services/menuItemService";
import type { OrderServiceFailureReason } from "../services/orderService";
import type { TableServiceFailureReason } from "../services/tableService";

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
