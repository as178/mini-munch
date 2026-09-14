import { api } from "./api";

/**
 * GET /api/tables/:tableNumber
 * @returns a success response with a table document retrieved by table number, else returns an error response
 */
function getTable(tableNumber: number): Promise<unknown> {
  const response = api.get(`/tables/${tableNumber}`);
  return response;
}

/**
 * PATCH /api/tables/:tableNumber/occupy
 * @returns a success response with the occupied table document, else returns an error response
 */
export function occupyTable(tableNumber: number): Promise<unknown> {
  const response = api.patch(`/tables/${tableNumber}/occupy`);
  return response;
}

/**
 * PATCH /api/tables/:tableNumber/release
 * @returns a success response with the released table document, else returns an error response
 */
export function releaseTable(tableNumber: number): Promise<unknown> {
  const response = api.patch(`/tables/${tableNumber}/release`);
  return response;
}
