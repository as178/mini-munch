import type { NextFunction, Request, Response } from "express";
import { AppError, createAppServiceError } from "../middleware/errorMiddleware";
import { getTable, occupyTable, releaseTable } from "../services/tableService";
import { parseSafeIntegerFromParam } from "../utils/validation";

/**
 * GET /api/tables/:tableNumber
 * @returns a success response with a table document retrieved by table number, else returns an error response
 */
export async function getTableController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // parse the table number from the request parameter, return an error if it is not a valid number
  const tableNumber = parseSafeIntegerFromParam(req.params.tableNumber);
  if (tableNumber instanceof AppError) {
    next(tableNumber);
    return;
  }

  // call the table service to retrieve the table document by table number
  try {
    const tableServiceResult = await getTable(tableNumber);

    // handle table service failure by passing an AppError to the global error middleware
    if (!tableServiceResult.success) {
      next(createAppServiceError(tableServiceResult.serviceError));
      return;
    }

    res.status(200).json({
      table: {
        id: tableServiceResult.data._id,
        tableNumber: tableServiceResult.data.tableNumber,
        available: tableServiceResult.data.available,
      },
    });

    // catch any unexpected errors and pass them to the global error middleware
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * PATCH /api/tables/:tableNumber/occupy
 * @returns a success response with the occupied table document, else returns an error response
 */
export async function occupyTableController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // parse the table number from the request parameter, return an error if it is not a valid number
  const tableNumber = parseSafeIntegerFromParam(req.params.tableNumber);
  if (tableNumber instanceof AppError) {
    next(tableNumber);
    return;
  }

  // call the table service to occupy the table by table number
  try {
    const tableServiceResult = await occupyTable(tableNumber);

    // handle table service failure by passing an AppError to the global error middleware
    if (!tableServiceResult.success) {
      next(createAppServiceError(tableServiceResult.serviceError));
      return;
    }

    // else, return a success response with the occupied table document
    res.status(200).json({
      message: `Table ${tableServiceResult.data.tableNumber} has been occupied.`,
      table: {
        id: tableServiceResult.data._id,
        tableNumber: tableServiceResult.data.tableNumber,
        available: tableServiceResult.data.available,
      },
    });

    // catch any unexpected errors and pass them to the global error middleware
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * PATCH /api/tables/:tableNumber/release
 * @returns a success response with the released table document, else returns an error response
 */
export async function releaseTableController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // parse the table number from the request parameter, return an error if it is not a valid number
  const tableNumber = parseSafeIntegerFromParam(req.params.tableNumber);
  if (tableNumber instanceof AppError) {
    next(tableNumber);
    return;
  }

  // call the table service to release the table by table number
  try {
    const tableServiceResult = await releaseTable(tableNumber);

    // handle table service failure by passing an AppError to the global error middleware
    if (!tableServiceResult.success) {
      next(createAppServiceError(tableServiceResult.serviceError));
      return;
    }

    // else, return a success response with the released table document
    res.status(200).json({
      message: `Table ${tableServiceResult.data.tableNumber} has been released.`,
      table: {
        id: tableServiceResult.data._id,
        tableNumber: tableServiceResult.data.tableNumber,
        available: tableServiceResult.data.available,
      },
    });

    // catch any unexpected errors and pass them to the global error middleware
  } catch (error: unknown) {
    next(error);
  }
}
