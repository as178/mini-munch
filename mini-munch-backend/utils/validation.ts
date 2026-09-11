import { AppError } from "../middleware/errorMiddleware";

/**
 * converts a string or string array to a number, returning null if the value is not a valid number
 * @param value the value to convert
 * @returns the converted number, or null if the value is not a valid number
 */
export function parseSafeInteger(
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
