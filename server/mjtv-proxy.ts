import { TRPCError } from "@trpc/server";

const BASE_ENV_KEY = "MJTV_API_BASE_URL";

function getBaseUrl(): string {
  const value = process.env[BASE_ENV_KEY]?.trim();
  if (!value) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "La source MJTV n’est pas configurée." });
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("protocol");
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "La base MJTV configurée est invalide." });
  }
}

async function fetchMjtv(path: string, params: Record<string, string | number | undefined> = {}) {
  const url = new URL(`${getBaseUrl()}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });
  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12_000) });
  } catch (error) {
    throw new TRPCError({ code: "TIMEOUT", message: "La source MJTV ne répond pas.", cause: error });
  }
  const body = await response.text();
  let payload: unknown = null;
  try { payload = body ? JSON.parse(body) : null; } catch { payload = { message: body }; }
  if (!response.ok) {
    throw new TRPCError({ code: response.status === 404 ? "NOT_FOUND" : "BAD_GATEWAY", message: "La source MJTV a renvoyé une erreur.", cause: payload });
  }
  return payload;
}

export function fetchCatalog(params: Record<string, string | number | undefined>) {
  return fetchMjtv("/api/catalog", params);
}

export function fetchChannel(id: string) {
  return fetchMjtv(`/api/channels/${encodeURIComponent(id)}`);
}

export function fetchChannelHealth(id: string) {
  return fetchMjtv(`/api/channels/${encodeURIComponent(id)}/health`);
}
