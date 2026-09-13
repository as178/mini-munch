import { AppError } from "../middleware/errorMiddleware";
import { type OrderServiceFailureReason } from "../services/orderService";

// defined mapping of order service failure reasons to HTTP status codes and error messages
const orderFailureResponses: Record<
  OrderServiceFailureReason,
  { statusCode: number; message: string }
> = {
  INVALID_QUANTITY: {
    statusCode: 400,
    message: "Quantity must be a whole number between 1 and 10.",
  },
  INVALID_STATUS: {
    statusCode: 400,
    message: "Order status is invalid.",
  },
  TABLE_NOT_OCCUPIED: {
    statusCode: 409,
    message: "The table must be occupied before creating an order.",
  },
  ORDER_ALREADY_EXISTS: {
    statusCode: 409,
    message: "An order already exists for this table.",
  },
  ORDER_NOT_FOUND: {
    statusCode: 404,
    message: "Order does not exist.",
  },
  ORDER_ITEM_ALREADY_EXISTS: {
    statusCode: 409,
    message: "Menu item is already in the order.",
  },
  ORDER_NOT_DRAFT: {
    statusCode: 409,
    message: "Order items can only be changed while the order status is DRAFT.",
  },
  ORDER_NOT_READY: {
    statusCode: 409,
    message: "Only a READY order can be deleted.",
  },
  INVALID_STATUS_TRANSITION: {
    statusCode: 409,
    message: "The requested order status transition is not allowed.",
  },
  ORDER_HAS_NO_ITEMS: {
    statusCode: 409,
    message: "An order must contain at least one item before submission.",
  },
  ORDER_ITEM_NOT_FOUND: {
    statusCode: 404,
    message: "The menu item is not in this order.",
  },
};

/**
 * creates an AppError for a order service failure
 * @param reason the order service failure reason
 * @returns an AppError with the corresponding HTTP status code, failure reason, and error message
 */
function createOrderServiceError(reason: OrderServiceFailureReason): AppError {
  const response = orderFailureResponses[reason];
  return new AppError(response.statusCode, reason, response.message);
}
