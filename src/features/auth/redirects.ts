const DEFAULT_AUTHENTICATED_PATH = "/app";

export function getSafeRedirectPath(
  requestedPath: string | null | undefined,
): string {
  if (!requestedPath || !requestedPath.startsWith("/")) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  if (requestedPath.startsWith("//") || requestedPath.includes("\\")) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  try {
    const parsedUrl = new URL(requestedPath, "https://quiet-library.local");

    if (parsedUrl.origin !== "https://quiet-library.local") {
      return DEFAULT_AUTHENTICATED_PATH;
    }

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return DEFAULT_AUTHENTICATED_PATH;
  }
}
