import { AppError } from "../middleware/errorMiddleware";
import mongoose from "mongoose";

/**
 * converts a string or string array to a safe integer
 * @param value the value to convert
 * @returns the converted safe integer, or an AppError if the value is not a valid integer
 */
export function parseSafeIntegerFromParam(
  value: string | string[] | undefined,
): number | AppError {
  const invalidParseError = new AppError(
    400,
    "INVALID_PARSE",
    "Number must be a whole number.",
  );

  // if the value is not a string, return the same validation error
  if (typeof value !== "string") {
    return invalidParseError;
  }

  // else, trim the value and check if it is empty
  const trimmedValue = value.trim();
  if (trimmedValue === "") {
    return invalidParseError;
  }

  // convert the trimmed value to a number and check if it is a safe integer
  const numberValue = Number(trimmedValue);
  if (!Number.isSafeInteger(numberValue)) {
    return invalidParseError;
  }

  // if the value is a valid safe integer, return the number
  return numberValue;
}

/**
 * validates that a required non-empty value is a safe integer
 * @param value the value to validate
 * @param fieldName the name used in the validation error
 * @returns the valid safe integer, or an AppError if the value is not a valid integer
 */
export function parseSafeIntegerFromBody(
  value: unknown,
  fieldName: string,
): number | AppError {
  // check if the value is a safe integer
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    return new AppError(
      400,
      "INVALID_PARSE",
      `${fieldName} is required and must be a whole number.`,
    );
  }
  // else, return the valid safe integer
  return value;
}

/**
 * validates a request value as a MongoDB ObjectId string
 * @param value the value to validate
 * @returns the valid ObjectId string, or an AppError if the value is not a valid ObjectId
 */
export function parseObjectId(value: unknown): string | AppError {
  // check if the value is a string or a valid ObjectId
  if (typeof value !== "string" || !mongoose.isObjectIdOrHexString(value)) {
    return new AppError(400, "INVALID_OBJECT_ID", "Object ID is not valid.");
  }

  // else, return the valid ObjectId string
  return value;
}

/**
 * validates a required non-empty string value
 * @param value the value to validate
 * @param fieldName the name used in the validation error
 * @returns the trimmed string, or an AppError if the value is invalid
 */
export function parseRequiredString(
  value: unknown,
  fieldName: string,
): string | AppError {
  // check if the value is a string and not empty after trimming whitespace
  if (typeof value !== "string" || value.trim() === "") {
    return new AppError(
      400,
      "INVALID_STRING",
      `${fieldName} is required and must be a non-empty string.`,
    );
  }

  // else, return the trimmed string value
  return value.trim();
}

/**
 * validates a finite numeric value
 * @param value the value to validate
 * @param fieldName the name used in the validation error
 * @returns the number, or an AppError if the value is invalid
 */
export function parseFiniteNumber(
  value: unknown,
  fieldName: string,
): number | AppError {
  // check if the value is a number and finite
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return new AppError(
      400,
      "INVALID_NUMBER",
      `${fieldName} is required and must be a number.`,
    );
  }

  // else, return the valid number
  return value;
}
