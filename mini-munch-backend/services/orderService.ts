import { orderServiceErrors } from "../errors/orderErrors";
import {
  OrderModel,
  type OrderDocument,
  type OrderItem,
  type OrderStatus,
} from "../models/Order";
import {
  getMenuItemById,
  type MenuItemServiceFailureReason,
} from "./menuItemService";
import type { ServiceResult } from "./serviceResult";
import { getTable, type TableServiceFailureReason } from "./tableService";

// defined type for the reasons specific to an order service function failure
export type OrderServiceFailureReason =
  (typeof orderServiceErrors)[keyof typeof orderServiceErrors];

// discriminated union for all order service function failures (including those from table and menu item services)
export type OrderFailureReason =
  | OrderServiceFailureReason
  | TableServiceFailureReason
  | MenuItemServiceFailureReason;

// defined type for order service function results (one order)
export type OrderServiceResult = ServiceResult<
  OrderDocument,
  OrderFailureReason
>;

// calculate the order total (starting from 0) from the stored price snapshots
// (serves as one source of truth for the order total, rather than relying on the stored total in the order document)
function calculateTotal(items: OrderItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

// helper function to retrieve a DRAFT status order by its id, or return a failure result if the order does not exist or is not in DRAFT status
async function retrieveDraftOrder(
  orderId: string,
): Promise<OrderServiceResult> {
  const existingOrder = await OrderModel.findById(orderId);
  if (!existingOrder) {
    return { success: false, serviceError: orderServiceErrors.ORDER_NOT_FOUND };
  }
  if (existingOrder.status !== "DRAFT") {
    return { success: false, serviceError: orderServiceErrors.ORDER_NOT_DRAFT };
  }
  return { success: true, data: existingOrder };
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
  if (tableServiceResult.data.available) {
    return {
      success: false,
      serviceError: orderServiceErrors.TABLE_NOT_OCCUPIED,
    };
  }

  // if the occupied table already has an order, do not make a new order and return a failure result with the appropriate reason
  // (concurrent requests to create an order for the same table will be handled by the unique index constraint in the schema)
  const existingOrderResult = await getOrderByTable(tableNumber);
  if (existingOrderResult.success) {
    return {
      success: false,
      serviceError: orderServiceErrors.ORDER_ALREADY_EXISTS,
    };
  }

  // else, if the occupied table does not have an order
  if (existingOrderResult.serviceError === orderServiceErrors.ORDER_NOT_FOUND) {
    // create a new order document with DRAFT status for the occupied table + populate the table reference with its table number
    const order = await OrderModel.create({
      table: tableServiceResult.data._id,
      items: [],
      total: 0,
      status: "DRAFT",
    });
    await order.populate("table", "tableNumber");

    // and return a successful result
    return { success: true, data: order };
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
    table: tableServiceResult.data._id,
  });

  // if the order does not exist, return a failed result
  if (!order) {
    return { success: false, serviceError: orderServiceErrors.ORDER_NOT_FOUND };
  }

  // populate the table reference with its table number + return a success result with the found order document
  await order.populate("table", "tableNumber");
  return { success: true, data: order };
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
  const existingOrder = await retrieveDraftOrder(orderId);
  if (!existingOrder.success) {
    return existingOrder;
  }

  // retrieve the menu item document by its id, return a failure result if the menu item does not exist
  const menuItemServiceResult = await getMenuItemById(menuItemId);
  if (!menuItemServiceResult.success) {
    return menuItemServiceResult;
  }

  // if the menu item is already in the order, return a failure result with the appropriate reason
  const existingItem = existingOrder.data.items.find((item) =>
    item.menuItem.equals(menuItemId),
  );
  if (existingItem) {
    return {
      success: false,
      serviceError: orderServiceErrors.ORDER_ITEM_ALREADY_EXISTS,
    };
  }

  // else, add the menu item to the order with a quantity of 1 and store its current details as a snapshot
  existingOrder.data.items.push({
    menuItem: menuItemServiceResult.data._id,
    name: menuItemServiceResult.data.name,
    price: menuItemServiceResult.data.price,
    quantity: 1,
  });

  // recalculate the order total, save, populate the table reference, and return a successful result with the updated existing order
  existingOrder.data.total = calculateTotal(existingOrder.data.items);
  await existingOrder.data.save();
  await existingOrder.data.populate("table", "tableNumber");
  return { success: true, data: existingOrder.data };
}

/**
 * changes the quantity of an existing item in a DRAFT status order
 * @param orderId the order document id
 * @param menuItemId the menu item document id
 * @param quantity the new quantity
 * @returns a successful result with the updated order, or a failure result with a reason
 */
export async function updateOrderItem(
  orderId: string,
  menuItemId: string,
  quantity: number,
): Promise<OrderServiceResult> {
  // if quantity is invalid, return a failure result with the appropriate reason
  if (1 > quantity || quantity > 10) {
    return {
      success: false,
      serviceError: orderServiceErrors.INVALID_QUANTITY,
    };
  }

  // retrieve the order document by its id, return a failure result if the order does not exist or is not in DRAFT status
  const existingOrder = await retrieveDraftOrder(orderId);
  if (!existingOrder.success) {
    return existingOrder;
  }

  // find the order item in the order's items array by menu item id, return a failure result if the item does not exist
  const orderItem = existingOrder.data.items.find((item) =>
    item.menuItem.equals(menuItemId),
  );
  if (!orderItem) {
    return {
      success: false,
      serviceError: orderServiceErrors.ORDER_ITEM_NOT_FOUND,
    };
  }

  // update the order item's quantity, recalculate the order total, save, populate the table reference
  // and return a successful result with the updated order
  orderItem.quantity = quantity;
  existingOrder.data.total = calculateTotal(existingOrder.data.items);
  await existingOrder.data.save();
  await existingOrder.data.populate("table", "tableNumber");
  return { success: true, data: existingOrder.data };
}

/**
 * removes an item from a DRAFT status order
 * @param orderId the order document id
 * @param menuItemId the menu item document id
 * @returns a successful result with the updated order, or a failure result with a reason
 */
export async function removeOrderItem(
  orderId: string,
  menuItemId: string,
): Promise<OrderServiceResult> {
  // retrieve the order document by its id, return a failure result if the order does not exist or is not in DRAFT status
  const existingOrder = await retrieveDraftOrder(orderId);
  if (!existingOrder.success) {
    return existingOrder;
  }

  // remove the item from the order, return a failure result if the item does not exist
  const originalLength = existingOrder.data.items.length;
  existingOrder.data.items = existingOrder.data.items.filter(
    (item) => !item.menuItem.equals(menuItemId),
  );
  if (existingOrder.data.items.length === originalLength) {
    return {
      success: false,
      serviceError: orderServiceErrors.ORDER_ITEM_NOT_FOUND,
    };
  }

  // recalculate the order total, save and return a successful result with the updated order
  existingOrder.data.total = calculateTotal(existingOrder.data.items);
  await existingOrder.data.save();
  return { success: true, data: existingOrder.data };
}

/**
 * updates an order status, ensuring it progresses through valid transitions
 * @param orderId the order document id
 * @param status the requested next status (only SUBMITTED, PREPARING, or READY are valid)
 * @returns a successful result with the updated order, or a failure result with a reason
 */
export async function updateOrderStatus(
  orderId: string,
  status: Exclude<OrderStatus, "DRAFT">,
): Promise<OrderServiceResult> {
  // if the order does not exist, return a failure result with the appropriate reason
  const existingOrder = await OrderModel.findById(orderId);
  if (!existingOrder) {
    return { success: false, serviceError: orderServiceErrors.ORDER_NOT_FOUND };
  }

  // if the requested status is not a valid transition from the current status, return a failure result with the appropriate reason
  const validTransition =
    (existingOrder.status === "DRAFT" && status === "SUBMITTED") ||
    (existingOrder.status === "SUBMITTED" && status === "PREPARING") ||
    (existingOrder.status === "PREPARING" && status === "READY");
  if (!validTransition) {
    return {
      success: false,
      serviceError: orderServiceErrors.INVALID_STATUS_TRANSITION,
    };
  }

  // if the order is being submitted but has no items, return a failure result with the appropriate reason
  if (status === "SUBMITTED" && existingOrder.items.length === 0) {
    return {
      success: false,
      serviceError: orderServiceErrors.ORDER_HAS_NO_ITEMS,
    };
  }

  // update the order status, save, populate the table reference, and return a successful result with the updated order
  existingOrder.status = status;
  await existingOrder.save();
  await existingOrder.populate("table", "tableNumber");
  return { success: true, data: existingOrder };
}

/**
 * retrieves all orders for the staff dashboard (excludes DRAFT orders)
 * @returns a successful result with the orders, or a failure result with a reason
 */
export async function getOrders(): Promise<
  ServiceResult<OrderDocument[], OrderFailureReason>
> {
  // retrieve all orders with status SUBMITTED, PREPARING, or READY
  const orders = await OrderModel.find({
    status: { $in: ["SUBMITTED", "PREPARING", "READY"] },
  })
    .sort({ createdAt: 1 }) // sort the orders by creation time in ascending order (oldest first)
    .populate("table", "tableNumber"); // populate the table reference with its table number
  return { success: true, data: orders };
}

/**
 * deletes a READY or DRAFT status order
 * @param orderId the order document id
 * @returns a successful result with no content, or a failure result with a reason
 */
export async function deleteOrder(
  orderId: string,
): Promise<ServiceResult<void, OrderFailureReason>> {
  // if the order does not exist, return a failure result with the appropriate reason
  const existingOrder = await OrderModel.findById(orderId);
  if (!existingOrder) {
    return { success: false, serviceError: orderServiceErrors.ORDER_NOT_FOUND };
  }

  // if the order is not in READY or DRAFT status, return a failure result with the appropriate reason
  if (existingOrder.status !== "READY" && existingOrder.status !== "DRAFT") {
    return {
      success: false,
      serviceError: orderServiceErrors.ORDER_CANNOT_BE_DELETED,
    };
  }

  // delete the order and return a successful result with no content
  await existingOrder.deleteOne();
  return { success: true, data: undefined };
}
