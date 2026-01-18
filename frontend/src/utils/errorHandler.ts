/**
 * Extracts a safe error message from any error (RTK Query, Axios, or Serialized)
 */
export function getErrorMessage(
  error: any,
  fallback = "Something went wrong",
): string {
  if (!error) return fallback;

  // RTK Query FetchBaseQueryError
  if (error.data) {
    const data = error.data;
    if (typeof data.message === "string") return data.message;
    if (Array.isArray(data.message)) return data.message.join(", ");
    if (typeof data.error === "string") return data.error;
    if (typeof data === "string") return data;
  }

  // SerializedError
  if (error.message && typeof error.message === "string") {
    return error.message;
  }

  // Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback
  return typeof error === "string" ? error : fallback;
}
