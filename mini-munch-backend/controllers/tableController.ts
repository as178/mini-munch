import type { NextFunction, Request, Response } from "express";
import { AppError } from "../middleware/errorMiddleware";
import {
  getTable,
  occupyTable,
  releaseTable,
  type TableServiceFailureReason,
} from "../services/tableService";

// defined mapping of table service failure reasons to HTTP status codes and error messages
const serviceFailureResponses: Record<
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
 * @returns an HTTP-aware application error
 */
function handleTableServiceFailure(
  reason: TableServiceFailureReason,
  tableNumber: number,
): AppError {
  // retrieve the corresponding HTTP status code and error message for the failure reason
  const response = serviceFailureResponses[reason];
  // create and return an AppError for the controller to pass to the global error middleware
  return new AppError(
    response.statusCode,
    reason,
    response.message(tableNumber),
  );
}

// creates AppError for an invalid table number in the request parameter
function handleInvalidTableNumber(): AppError {
  return new AppError(
    400,
    "INVALID_TABLE_PARSE",
    "Table number must be a whole number.",
  );
}

/**
 * converts a string or string array to a number, returning null if the value is not a valid number
 * @param value the value to convert
 * @returns the converted number, or null if the value is not a valid number
 */
function parseTableNumber(value: string | string[] | undefined): number | null {
  // if the value is not a string, return null
  if (typeof value !== "string") {
    return null;
  }

  // else, trim the value and check if it is empty
  const trimmedValue = value.trim();
  if (trimmedValue === "") {
    return null;
  }

  // convert the trimmed value to a number and check if it is a safe integer
  const tableNumber = Number(trimmedValue);
  if (!Number.isSafeInteger(tableNumber)) {
    return null;
  }

  // finally, return the table number if it is a safe integer
  return tableNumber;
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
  const tableNumber = parseTableNumber(req.params.tableNumber);
  if (tableNumber === null) {
    next(handleInvalidTableNumber());
    return;
  }

  // call the table service to retrieve the table document by table number
  try {
    const tableServiceResult = await getTable(tableNumber);

    // handle table service failure by passing an AppError to the global error middleware
    if (!tableServiceResult.success) {
      next(handleTableServiceFailure(tableServiceResult.reason, tableNumber));
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
  const tableNumber = parseTableNumber(req.params.tableNumber);
  if (tableNumber === null) {
    next(handleInvalidTableNumber());
    return;
  }

  // call the table service to occupy the table by table number
  try {
    const result = await occupyTable(tableNumber);

    // handle table service failure by passing an AppError to the global error middleware
    if (!result.success) {
      next(handleTableServiceFailure(result.reason, tableNumber));
      return;
    }

    // else, return a success response with the occupied table document
    res.status(200).json({
      message: `Table ${result.table.tableNumber} has been occupied.`,
      table: {
        id: result.table._id,
        tableNumber: result.table.tableNumber,
        available: result.table.available,
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
  const tableNumber = parseTableNumber(req.params.tableNumber);
  if (tableNumber === null) {
    next(handleInvalidTableNumber());
    return;
  }

  // call the table service to release the table by table number
  try {
    const result = await releaseTable(tableNumber);

    // handle table service failure by passing an AppError to the global error middleware
    if (!result.success) {
      next(handleTableServiceFailure(result.reason, tableNumber));
      return;
    }

    // else, return a success response with the released table document
    res.status(200).json({
      message: `Table ${result.table.tableNumber} has been released.`,
      table: {
        id: result.table._id,
        tableNumber: result.table.tableNumber,
        available: result.table.available,
      },
    });

    // catch any unexpected errors and pass them to the global error middleware
  } catch (error: unknown) {
    next(error);
  }
}
