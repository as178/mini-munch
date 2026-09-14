import type { NextFunction, Request, Response } from "express";
import { AppError, createAppServiceError } from "../middleware/errorMiddleware";
import {
  addOrderItem,
  createOrder,
  deleteOrder,
  getOrderByTable,
  getOrders,
  removeOrderItem,
  updateOrderItem,
  updateOrderStatus,
} from "../services/orderService";
import {
  parseObjectId,
  parseSafeIntegerFromBody,
  parseSafeIntegerFromParam,
} from "../utils/validation";

/**
 * POST /api/orders
 * @returns a success response with the created order document, else returns an error response
 */
export async function createOrderController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // parse the table number from the request body and validate it
  const { tableNumber: rawTableNumber } = req.body || {};
  const tableNumber = parseSafeIntegerFromBody(rawTableNumber, "Table number");
  if (tableNumber instanceof AppError) {
    next(tableNumber);
    return;
  }

  // call the order service to create a new order document for the specified table number
  try {
    const orderServiceResult = await createOrder(tableNumber);

    // handle order service failure by passing an AppError to the global error middleware
    if (!orderServiceResult.success) {
      next(createAppServiceError(orderServiceResult.serviceError));
      return;
    }

    res.status(201).json({ order: orderServiceResult.data });

    // catch any unexpected errors and pass them to the global error middleware
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * GET /api/orders/table/:tableNumber
 * @returns a success response with an order document retrieved by table number (i.e. order for the table), else returns an error response
 */
export async function getOrderByTableController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // parse the table number from the request parameter and return an error if it is not a valid number
  const tableNumber = parseSafeIntegerFromParam(req.params.tableNumber);
  if (tableNumber instanceof AppError) {
    next(tableNumber);
    return;
  }

  // call the order service to retrieve the order document by table number
  try {
    const orderServiceResult = await getOrderByTable(tableNumber);

    // handle order service failure by passing an AppError to the global error middleware
    if (!orderServiceResult.success) {
      next(createAppServiceError(orderServiceResult.serviceError));
      return;
    }

    res.status(200).json({ order: orderServiceResult.data });

    // catch any unexpected errors and pass them to the global error middleware
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * POST /api/orders/:id/items
 * @returns a success response with the updated order document, else returns an error response
 */
export async function addOrderItemController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // parse the order id from the request parameter and return an error if it is not a valid ObjectId
  const orderId = parseObjectId(req.params.id);
  if (orderId instanceof AppError) {
    next(orderId);
    return;
  }

  // parse the menu item id from the request body and return an error if it is not a valid ObjectId
  const body = req.body || {};
  const menuItemId = parseObjectId(body.menuItemId);
  if (menuItemId instanceof AppError) {
    next(menuItemId);
    return;
  }

  // else, call the order service to add the menu item to the order
  try {
    const result = await addOrderItem(orderId, menuItemId);

    // handle order service failure by passing an AppError to the global error middleware
    if (!result.success) {
      next(createAppServiceError(result.serviceError));
      return;
    }

    res.status(200).json({ order: result.data });

    // catch any unexpected errors and pass them to the global error middleware
  } catch (error: unknown) {
    next(error);
  }
}
