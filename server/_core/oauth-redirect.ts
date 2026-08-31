type OAuthRedirectEnvironment = Partial<
  Pick<
    NodeJS.ProcessEnv,
    "EXPO_PACKAGER_PROXY_URL" | "EXPO_WEB_PREVIEW_URL" | "NODE_ENV"
  >
>;

const DEVELOPMENT_FRONTEND_URL = "http://localhost:8081";

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
  );
}

export function resolveOAuthFrontendUrl(
  env: OAuthRedirectEnvironment = process.env,
): string {
  const configuredUrl =
    env.EXPO_WEB_PREVIEW_URL?.trim() || env.EXPO_PACKAGER_PROXY_URL?.trim();

  if (!configuredUrl) {
    if (env.NODE_ENV === "production") {
      throw new Error("OAuth frontend URL is not configured");
    }
    return DEVELOPMENT_FRONTEND_URL;
  }

  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error("OAuth frontend URL is invalid");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("OAuth frontend URL must use HTTP or HTTPS");
  }

  if (
    env.NODE_ENV === "production" &&
    (url.protocol !== "https:" || isLocalHostname(url.hostname))
  ) {
    throw new Error("Production OAuth frontend URL must use non-local HTTPS");
  }

  return configuredUrl;
}
