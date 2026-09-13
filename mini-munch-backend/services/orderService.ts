import {
  OrderModel,
  type OrderDocument,
  type OrderItem,
  type OrderStatus,
} from "../models/Order";
import {
  getMenuItemById,
  type MenuItemServiceFailure,
} from "./menuItemService";
import { getTable, type TableServiceFailure } from "./tableService";

// defined type for the reasons an order service function can fail
export type OrderServiceFailureReason =
  | "INVALID_QUANTITY"
  | "INVALID_STATUS"
  | "TABLE_NOT_OCCUPIED"
  | "ORDER_ALREADY_EXISTS"
  | "ORDER_NOT_FOUND"
  | "ORDER_ITEM_ALREADY_EXISTS"
  | "ORDER_NOT_DRAFT"
  | "ORDER_ALREADY_SUBMITTED"
  | "ORDER_NOT_READY"
  | "INVALID_STATUS_TRANSITION"
  | "ORDER_HAS_NO_ITEMS"
  | "ORDER_ITEM_NOT_FOUND";

// defined type for the failure result of order service functions
export type OrderServiceFailure = {
  success: false;
  reason: OrderServiceFailureReason;
};

// defined type for the success result of order service functions
export type OrderServiceSuccess = {
  success: true;
  order: OrderDocument;
};

// discriminated union for order service function results (one order)
export type OrderServiceResult =
  | OrderServiceSuccess
  | OrderServiceFailure
  | TableServiceFailure
  | MenuItemServiceFailure;

// discriminated union for order service function results (multiple orders)
export type OrderListServiceResult =
  | { success: true; orders: OrderDocument[] }
  | OrderServiceFailure;

// ensure an order item's quantity is within the allowed range
function validateQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && 1 <= quantity && quantity <= 10;
}

// calculate the order total (starting from 0) from the stored price snapshots
function calculateTotal(items: OrderItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

/**
 * creates an empty DRAFT status order for an occupied table
 * @param tableNumber the number of the table to create an order for
 * @returns a successful result with the DRAFT status order, or a failure result with a reason
 */
export async function createOrder(
  tableNumber: number,
): Promise<OrderServiceResult> {
  // retrieve the table document by its number, return a failure result if the table service function fails
  const tableServiceResult = await getTable(tableNumber);
  if (!tableServiceResult.success) {
    return tableServiceResult;
  }

  // if the table is available, return a failure result with the appropriate reason
  if (tableServiceResult.table.available) {
    return { success: false, reason: "TABLE_NOT_OCCUPIED" };
  }

  // if the occupied table already has an order, do not make a new order and return a failure result with the appropriate reason
  // (concurrent requests to create an order for the same table will be handled by the unique index constraint in the schema)
  const existingOrderResult = await getOrderByTable(tableNumber);
  if (existingOrderResult.success) {
    return { success: false, reason: "ORDER_ALREADY_EXISTS" };
  }

  // else, if the occupied table does not have an order
  if (existingOrderResult.reason === "ORDER_NOT_FOUND") {
    // create a new order document with DRAFT status for the occupied table
    const order = await OrderModel.create({
      table: tableServiceResult.table._id,
      items: [],
      total: 0,
      status: "DRAFT",
    });

    // and return a successful result
    return { success: true, order };
  } else {
    // if the existing order retrieval failed for any other reason, do not make a new order and return that failure result
    return existingOrderResult;
  }
}

/**
 * retrieves the order belonging to a table
 * @param tableNumber the table number
 * @returns a successful result with the order, or a failure result with a reason
 */
export async function getOrderByTable(
  tableNumber: number,
): Promise<OrderServiceResult> {
  // retrieve the table document by its number, return a failure result if the table service function fails
  const tableServiceResult = await getTable(tableNumber);
  if (!tableServiceResult.success) {
    return tableServiceResult;
  }

  // retrieve the order for specified table
  const order = await OrderModel.findOne({
    table: tableServiceResult.table._id,
  });

  // if the order does not exist, return a failed result
  if (!order) {
    return { success: false, reason: "ORDER_NOT_FOUND" };
  }

  // else, return a success result with the found order document
  return { success: true, order };
}

/**
 * adds an existing menu item to a DRAFT status order and stores its current details as a snapshot
 * @param orderId the order document id
 * @param menuItemId the menu item document id
 * @returns a successful result with the updated order, or a failure result with a reason
 */
export async function addOrderItem(
  orderId: string,
  menuItemId: string,
): Promise<OrderServiceResult> {
  // retrieve the order document by its id, return a failure result if the order does not exist or is not in DRAFT status
  const existingOrder = await OrderModel.findById(orderId);
  if (!existingOrder) {
    return { success: false, reason: "ORDER_NOT_FOUND" };
  }
  if (existingOrder.status !== "DRAFT") {
    return { success: false, reason: "ORDER_NOT_DRAFT" };
  }

  // retrieve the menu item document by its id, return a failure result if the menu item does not exist
  const menuItemServiceResult = await getMenuItemById(menuItemId);
  if (!menuItemServiceResult.success) {
    return menuItemServiceResult;
  }

  // if the menu item is already in the order, return a failure result with the appropriate reason
  const existingItem = existingOrder.items.find((item) =>
    item.menuItem.equals(menuItemId),
  );
  if (existingItem) {
    return { success: false, reason: "ORDER_ITEM_ALREADY_EXISTS" };
  }

  // else, add the menu item to the order with a quantity of 1 and store its current details as a snapshot
  existingOrder.items.push({
    menuItem: menuItemServiceResult.menuItem._id,
    name: menuItemServiceResult.menuItem.name,
    price: menuItemServiceResult.menuItem.price,
    quantity: 1,
  });

  // recalculate the order total, save and return a successful result with the updated existing order
  existingOrder.total = calculateTotal(existingOrder.items);
  await existingOrder.save();
  return { success: true, order: existingOrder };
}
