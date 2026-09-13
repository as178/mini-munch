import { AppError } from "../middleware/errorMiddleware";
import { type OrderServiceFailureReason } from "../services/orderService";

// defined mapping of order service failure reasons to HTTP status codes and error messages
const orderFailureResponses: Record<
  OrderServiceFailureReason["reason"],
  { statusCode: number }
> = {
  INVALID_QUANTITY: { statusCode: 400 },
  INVALID_STATUS: { statusCode: 400 },
  TABLE_NOT_OCCUPIED: { statusCode: 409 },
  ORDER_ALREADY_EXISTS: { statusCode: 409 },
  ORDER_NOT_FOUND: { statusCode: 404 },
  ORDER_ITEM_ALREADY_EXISTS: { statusCode: 409 },
  ORDER_NOT_DRAFT: { statusCode: 409 },
  ORDER_NOT_READY: { statusCode: 409 },
  INVALID_STATUS_TRANSITION: { statusCode: 409 },
  ORDER_HAS_NO_ITEMS: { statusCode: 409 },
  ORDER_ITEM_NOT_FOUND: { statusCode: 404 },
};

/**
 * creates an AppError for a order service failure
 * @param reason the order service failure reason
 * @returns an AppError with the corresponding HTTP status code, failure reason, and error message
 */
function createOrderServiceError(
  serviceError: OrderServiceFailureReason,
): AppError {
  // retrieve the corresponding HTTP status code, failure reason, and error message for the failure reason
  const response = orderFailureResponses[serviceError.reason];
  // create and return an AppError for the controller to pass to the global error middleware
  return new AppError(
    response.statusCode,
    serviceError.reason,
    serviceError.message,
  );
}
