import type { NextFunction, Request, Response } from "express";
import { AppError } from "../middleware/errorMiddleware";
import {
  getTable,
  occupyTable,
  releaseTable,
  type TableServiceFailureReason,
} from "../services/tableService";
import { parseSafeInteger } from "../utils/validation";

// defined mapping of table service failure reasons to HTTP status codes and error messages
const tableFailureResponses: Record<
  TableServiceFailureReason,
  { statusCode: number; message: (tableNumber: number) => string }
> = {
  INVALID_TABLE_NUMBER: {
    statusCode: 400,
    message: () =>
      "Table number must be a whole number between 1 and 20 (inclusive).",
  },
  TABLE_NOT_FOUND: {
    statusCode: 404,
    message: (tableNumber) => `Table ${tableNumber} does not exist.`,
  },
  TABLE_OCCUPIED: {
    statusCode: 409,
    message: (tableNumber) => `Table ${tableNumber} is already occupied.`,
  },
  TABLE_AVAILABLE: {
    statusCode: 409,
    message: (tableNumber) => `Table ${tableNumber} is already available.`,
  },
};

/**
 * creates an AppError for a table service failure
 * @param reason the table service failure reason
 * @param tableNumber table number associated with the failure
 * @returns an AppError with the corresponding HTTP status code, failure reason, and error message
 */
function createTableServiceError(
  reason: TableServiceFailureReason,
  tableNumber: number,
): AppError {
  // retrieve the corresponding HTTP status code and error message for the failure reason
  const response = tableFailureResponses[reason];
  // create and return an AppError for the controller to pass to the global error middleware
  return new AppError(
    response.statusCode,
    reason,
    response.message(tableNumber),
  );
}

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
  const tableNumber = parseSafeInteger(req.params.tableNumber);
  if (tableNumber instanceof AppError) {
    next(tableNumber);
    return;
  }

  // call the table service to retrieve the table document by table number
  try {
    const tableServiceResult = await getTable(tableNumber);

    // handle table service failure by passing an AppError to the global error middleware
    if (!tableServiceResult.success) {
      next(createTableServiceError(tableServiceResult.reason, tableNumber));
      return;
    }

    res.status(200).json({
      table: {
        id: tableServiceResult.table._id,
        tableNumber: tableServiceResult.table.tableNumber,
        available: tableServiceResult.table.available,
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
  const tableNumber = parseSafeInteger(req.params.tableNumber);
  if (tableNumber instanceof AppError) {
    next(tableNumber);
    return;
  }

  // call the table service to occupy the table by table number
  try {
    const tableServiceResult = await occupyTable(tableNumber);

    // handle table service failure by passing an AppError to the global error middleware
    if (!tableServiceResult.success) {
      next(createTableServiceError(tableServiceResult.reason, tableNumber));
      return;
    }

    // else, return a success response with the occupied table document
    res.status(200).json({
      message: `Table ${tableServiceResult.table.tableNumber} has been occupied.`,
      table: {
        id: tableServiceResult.table._id,
        tableNumber: tableServiceResult.table.tableNumber,
        available: tableServiceResult.table.available,
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
  const tableNumber = parseSafeInteger(req.params.tableNumber);
  if (tableNumber instanceof AppError) {
    next(tableNumber);
    return;
  }

  // call the table service to release the table by table number
  try {
    const tableServiceResult = await releaseTable(tableNumber);

    // handle table service failure by passing an AppError to the global error middleware
    if (!tableServiceResult.success) {
      next(createTableServiceError(tableServiceResult.reason, tableNumber));
      return;
    }

    // else, return a success response with the released table document
    res.status(200).json({
      message: `Table ${tableServiceResult.table.tableNumber} has been released.`,
      table: {
        id: tableServiceResult.table._id,
        tableNumber: tableServiceResult.table.tableNumber,
        available: tableServiceResult.table.available,
      },
    });

    // catch any unexpected errors and pass them to the global error middleware
  } catch (error: unknown) {
    next(error);
  }
}
