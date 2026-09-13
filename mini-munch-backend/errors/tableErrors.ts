import type { TableServiceFailureReason } from "../services/tableService";

// defined service failure reasons and messages for table service functions
export const tableServiceErrors = {
  INVALID_TABLE_NUMBER: {
    reason: "INVALID_TABLE_NUMBER",
    message:
      "Table number must be a whole number between 1 and 20 (inclusive).",
  },
  TABLE_NOT_FOUND: {
    reason: "TABLE_NOT_FOUND",
    message: "Table does not exist.",
  },
  TABLE_OCCUPIED: {
    reason: "TABLE_OCCUPIED",
    message: "Table is already occupied.",
  },
  TABLE_AVAILABLE: {
    reason: "TABLE_AVAILABLE",
    message: "Table is already available.",
  },
} as const;

// defined mapping of table service failure reasons to HTTP status codes
export const tableHttpErrorResponses: Record<
  TableServiceFailureReason["reason"],
  { statusCode: number }
> = {
  INVALID_TABLE_NUMBER: { statusCode: 400 },
  TABLE_NOT_FOUND: { statusCode: 404 },
  TABLE_OCCUPIED: { statusCode: 409 },
  TABLE_AVAILABLE: { statusCode: 409 },
};
