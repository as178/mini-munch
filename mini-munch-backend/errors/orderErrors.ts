import type { OrderServiceFailureReason } from "../services/orderService";

// defined service failure reasons and messages for order service functions
export const orderServiceErrors = {
  INVALID_QUANTITY: {
    reason: "INVALID_QUANTITY",
    message: "Quantity must be a whole number between 1 and 10.",
  },
  TABLE_NOT_OCCUPIED: {
    reason: "TABLE_NOT_OCCUPIED",
    message: "The table must be occupied before creating an order.",
  },
  ORDER_ALREADY_EXISTS: {
    reason: "ORDER_ALREADY_EXISTS",
    message: "An order already exists for this table.",
  },
  ORDER_NOT_FOUND: {
    reason: "ORDER_NOT_FOUND",
    message: "Order does not exist.",
  },
  ORDER_ITEM_ALREADY_EXISTS: {
    reason: "ORDER_ITEM_ALREADY_EXISTS",
    message: "Menu item is already in the order.",
  },
  ORDER_NOT_DRAFT: {
    reason: "ORDER_NOT_DRAFT",
    message: "Order items can only be changed while the order status is DRAFT.",
  },
  ORDER_NOT_READY: {
    reason: "ORDER_NOT_READY",
    message: "Only a READY order can be deleted.",
  },
  INVALID_STATUS_TRANSITION: {
    reason: "INVALID_STATUS_TRANSITION",
    message: "The requested order status transition is not allowed.",
  },
  ORDER_HAS_NO_ITEMS: {
    reason: "ORDER_HAS_NO_ITEMS",
    message: "An order must contain at least one item before submission.",
  },
  ORDER_ITEM_NOT_FOUND: {
    reason: "ORDER_ITEM_NOT_FOUND",
    message: "The menu item is not in this order.",
  },
} as const;

// defined mapping of order service failure reasons to HTTP status codes
export const orderHttpErrorResponses: Record<
  OrderServiceFailureReason["reason"],
  { statusCode: number }
> = {
  INVALID_QUANTITY: { statusCode: 400 },
  TABLE_NOT_OCCUPIED: { statusCode: 409 },
  ORDER_ALREADY_EXISTS: { statusCode: 409 },
  ORDER_NOT_FOUND: { statusCode: 404 },
  ORDER_ITEM_ALREADY_EXISTS: { statusCode: 409 },
  ORDER_NOT_DRAFT: { statusCode: 409 },
  ORDER_NOT_READY: { statusCode: 409 },
  INVALID_STATUS_TRANSITION: { statusCode: 409 },
  ORDER_HAS_NO_ITEMS: { statusCode: 400 },
  ORDER_ITEM_NOT_FOUND: { statusCode: 404 },
};
