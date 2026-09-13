import { tableServiceErrors } from "../errors/tableErrors";
import { TableModel, type TableDocument } from "../models/Table";

// defined type for the reasons a table service function can fail
export type TableServiceFailureReason =
  (typeof tableServiceErrors)[keyof typeof tableServiceErrors];

// defined type for the failure result of table service functions
export type TableServiceFailure = {
  success: false;
  serviceError: TableServiceFailureReason;
};

// defined type for the success result of table service functions
export type TableServiceSuccess = {
  success: true;
  table: TableDocument;
};

// discriminated union for the result of table service functions
export type TableServiceResult = TableServiceSuccess | TableServiceFailure;

/**
 * validate table number
 * @param tableNumber the number of the table to validate
 * @returns true if the table number is valid, false otherwise
 */
export function validateTableNumber(tableNumber: number): boolean {
  // check if table number is a whole number and within the valid range of 1 to 20
  return Number.isInteger(tableNumber) && 1 <= tableNumber && tableNumber <= 20;
}

/**
 * find table by table number
 * @param tableNumber the number of the table to find
 * @returns a successful result with the table document, or a failure result with a reason
 */
export async function getTable(
  tableNumber: number,
): Promise<TableServiceResult> {
  // validate the table number before querying the database
  if (!validateTableNumber(tableNumber)) {
    return {
      success: false,
      serviceError: tableServiceErrors.INVALID_TABLE_NUMBER,
    };
  }

  // find the table document in the database by table number
  const table = await TableModel.findOne({ tableNumber });

  // if the table does not exist, return a failed result
  if (!table) {
    return { success: false, serviceError: tableServiceErrors.TABLE_NOT_FOUND };
  }

  // else, return a success result with the found table document
  return { success: true, table };
}

/**
 * set table availability to false (occupied)
 * @param tableNumber the number of the table to find
 * @returns a successful result with the updated table, or a failure result with a reason
 */
export async function occupyTable(
  tableNumber: number,
): Promise<TableServiceResult> {
  // validate the table number before updating the database
  if (!validateTableNumber(tableNumber)) {
    return {
      success: false,
      serviceError: tableServiceErrors.INVALID_TABLE_NUMBER,
    };
  }

  // check availability and occupy the table in one atomic database operation
  const table = await TableModel.findOneAndUpdate(
    { tableNumber, available: true },
    { $set: { available: false } },
    { returnDocument: "after" },
  );

  // if the table is not found or already occupied, return a failure result with the appropriate reason
  if (!table) {
    const existingTable = await TableModel.findOne({ tableNumber });

    if (!existingTable) {
      return {
        success: false,
        serviceError: tableServiceErrors.TABLE_NOT_FOUND,
      };
    }

    return { success: false, serviceError: tableServiceErrors.TABLE_OCCUPIED };
  }

  // return the updated table document and a success result
  return { success: true, table };
}

/**
 * set table availability to true (available)
 * @param tableNumber the number of the table to find
 * @returns a successful result with the updated table document, or a failure result with a reason
 */
export async function releaseTable(
  tableNumber: number,
): Promise<TableServiceResult> {
  // validate the table number before updating the database
  if (!validateTableNumber(tableNumber)) {
    return {
      success: false,
      serviceError: tableServiceErrors.INVALID_TABLE_NUMBER,
    };
  }

  // check occupancy and release the table in one atomic database operation
  const table = await TableModel.findOneAndUpdate(
    { tableNumber, available: false },
    { $set: { available: true } },
    { returnDocument: "after" },
  );

  // if the table is not found or already available, return a failure result with the appropriate reason
  if (!table) {
    const existingTable = await TableModel.findOne({ tableNumber });

    if (!existingTable) {
      return {
        success: false,
        serviceError: tableServiceErrors.TABLE_NOT_FOUND,
      };
    }

    return { success: false, serviceError: tableServiceErrors.TABLE_AVAILABLE };
  }

  // return the updated table document and a success result
  return { success: true, table };
}
