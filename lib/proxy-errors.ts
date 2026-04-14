export function isConnectionTerminatedError(error: unknown): boolean {
  if (error instanceof Error) {
    if (error.name === "AbortError") return true;
    const msg = error.message?.toLowerCase() ?? "";
    return (
      msg.includes("terminated") ||
      msg.includes("aborted") ||
      msg.includes("econnreset") ||
      msg.includes("econnrefused")
    );
  }
  return false;
}

export function imageProxyErrorMessage(error: unknown): string {
  if (isConnectionTerminatedError(error)) {
    return "Request timed out or connection closed. Please try again.";
  }
  if (error instanceof Error) return error.message;
  return "Failed to proxy image";
}

export function videoProxyErrorMessage(error: unknown): string {
  if (isConnectionTerminatedError(error)) {
    return "Request timed out or connection closed. Please try again.";
  }
  if (error instanceof Error) return error.message;
  return "Failed to proxy video";
}
