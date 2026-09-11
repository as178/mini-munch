import { TableModel, type TableDocument } from "../models/Table";

// defined type for the reasons a table service function can fail
export type TableServiceFailureReason =
  | "INVALID_TABLE_NUMBER"
  | "TABLE_NOT_FOUND"
  | "TABLE_OCCUPIED"
  | "TABLE_AVAILABLE";

// discriminated union for the result of table service functions
export type TableServiceResult =
  | { success: true; table: TableDocument } // successful result with the table document
  | { success: false; reason: TableServiceFailureReason }; // failure result with a reason

/**
 * validate table number
 * @param tableNumber the number of the table to validate
 * @returns true if the table number is valid, false otherwise
 */
export function validateTableNumber(tableNumber: number): boolean {
  // check if table number is a whole number and within the valid range of 1 to 20
  if (Number.isInteger(tableNumber) && 1 < tableNumber && tableNumber < 20) {
    return true;
  }
  return false;
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
    return { success: false, reason: "INVALID_TABLE_NUMBER" };
  }

  // find the table document in the database by table number
  const table = await TableModel.findOne({ tableNumber });

  // if the table does not exist, return a failed result
  if (!table) {
    return { success: false, reason: "TABLE_NOT_FOUND" };
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
  // validate and retrieve the table document by table number
  const getTableResult = await getTable(tableNumber);

  // return failure result if validation or retrieval of the table failed
  if (!getTableResult.success) {
    return getTableResult;
  }

  // else, retrieve the table document from the successful result
  const table = getTableResult.table;

  // if the table is already occupied, return a failure result
  if (!table.available) {
    return { success: false, reason: "TABLE_OCCUPIED" };
  }

  // else, set the table availability to false (occupied) and save the changes to the database
  table.available = false;
  await table.save();

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
  // validate and retrieve the table document by table number
  const getTableResult = await getTable(tableNumber);

  // return failure result if validation or retrieval of the table failed
  if (!getTableResult.success) {
    return getTableResult;
  }

  // else, retrieve the table document from the successful result
  const table = getTableResult.table;

  // if the table is already available, return a failure result
  if (table.available) {
    return { success: false, reason: "TABLE_AVAILABLE" };
  }

  // else, set the table availability to true (available) and save the changes to the database
  table.available = true;
  await table.save();

  // return the updated table document and a success result
  return { success: true, table };
}
