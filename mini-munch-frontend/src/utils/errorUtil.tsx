import { AxiosError } from "axios";
import { toast } from "react-hot-toast";

/**
 * utility function to handle api errors and display appropriate toast notifications
 * @param error the error object received from the api call
 * @param fallbackMessage in case the error object does not contain a message, this fallback message will be displayed
 */
export default function handleApiError(
  error: unknown,
  fallbackMessage: string,
): void {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const message = error.response?.data?.message ?? { fallbackMessage };

    // show an error toast notification with the constructed error message
    toast.error(
      <span>
        {statusCode && (
          <>
            [<b>{statusCode}</b>]:{" "}
          </>
        )}
        {message}
      </span>,
    );
  } else {
    toast.error("An unexpected error occurred. Please try again.");
  }
}
