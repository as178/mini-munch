import { AppError } from "../middleware/errorMiddleware";
import { TableModel, type TableDocument } from "../models/Table";

/**
 * validate table number
 * @param tableNumber the number of the table to validate
 * @returns throws an error if the table number is not a whole number or is outside the range of 1 to 20
 */
function validateTableNumber(tableNumber: number): void {
  // check if table number is a whole number
  if (!Number.isInteger(tableNumber)) {
    throw new AppError(
      400,
      "INVALID_TABLE_NUMBER",
      "Table number must be a whole number.",
    );
  }

  // check if table number is within the valid range of 1 to 20
  if (tableNumber < 1 || tableNumber > 20) {
    throw new AppError(
      400,
      "INVALID_TABLE_NUMBER",
      "Table number must be between 1 and 20.",
    );
  }
}

/**
 * find table by table number
 * @param tableNumber the number of the table to find
 * @returns the table document if found, otherwise throws an error
 */
export async function getTable(tableNumber: number): Promise<TableDocument> {
  // validate the table number before querying the database
  validateTableNumber(tableNumber);

  // find the table document in the database by table number
  const table = await TableModel.findOne({ tableNumber });

  // if the table does not exist, throw an error
  if (!table) {
    throw new AppError(
      404,
      "TABLE_NOT_FOUND",
      `Table ${tableNumber} does not exist.`,
    );
  }

  // return the found table document
  return table;
}

/**
 * set table availability to false (occupied)
 * @param tableNumber the number of the table to find
 * @returns the updated table document if found and updated, throws an error if the table is already occupied
 */
export async function occupyTable(tableNumber: number): Promise<TableDocument> {
  // validate and retrieve the table document by table number
  const table = await getTable(tableNumber);

  // if the table is already occupied, throw an error
  if (!table.available) {
    throw new AppError(
      409,
      "TABLE_OCCUPIED",
      `Table ${tableNumber} is already occupied.`,
    );
  }

  // else, set the table availability to false (occupied) and save the changes to the database
  table.available = false;
  await table.save();

  // return the updated table document
  return table;
}

/**
 * set table availability to true (available)
 * @param tableNumber the number of the table to find
 * @returns the updated table document if found and updated
 */
export async function releaseTable(
  tableNumber: number,
): Promise<TableDocument> {
  // validate and retrieve the table document by table number
  const table = await getTable(tableNumber);

  // set the table availability to true (available) and save the changes to the database
  table.available = true;
  await table.save();

  // return the updated table document
  return table;
}
