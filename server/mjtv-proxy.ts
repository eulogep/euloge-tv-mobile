import { TRPCError } from "@trpc/server";
import type { z } from "zod";

import {
  RemoteCatalogResponseSchema,
  RemoteChannelSchema,
  RemoteHealthSchema,
  type RemoteCatalogResponse,
  type RemoteChannel,
} from "../shared/mjtv-contract";

const BASE_ENV_KEY = "MJTV_API_BASE_URL";

function getBaseUrl(): string {
  const value = process.env[BASE_ENV_KEY]?.trim();
  if (!value) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "La source MJTV n’est pas configurée.",
    });
  }
  try {
    const url = new URL(value);
    const allowed =
      url.protocol === "https:" ||
      (process.env.NODE_ENV !== "production" && url.protocol === "http:");
    if (!allowed) throw new Error("protocol");
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "La base MJTV configurée est invalide.",
    });
  }
}

async function fetchMjtv<T>(
  path: string,
  schema: z.ZodType<T>,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const url = new URL(`${getBaseUrl()}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "")
      url.searchParams.set(key, String(value));
  });

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      ["AbortError", "TimeoutError"].includes(error.name);
    throw new TRPCError({
      code: timedOut ? "TIMEOUT" : "BAD_GATEWAY",
      message: timedOut
        ? "La source MJTV ne répond pas dans le délai imparti."
        : "La source MJTV est inaccessible.",
      cause: error,
    });
  }

  const body = await response.text();
  let payload: unknown;
  try {
    payload = body ? JSON.parse(body) : null;
  } catch (error) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "La source MJTV a renvoyé une réponse invalide.",
      cause: error,
    });
  }

  if (!response.ok) {
    throw new TRPCError({
      code: response.status === 404 ? "NOT_FOUND" : "BAD_GATEWAY",
      message: "La source MJTV a renvoyé une erreur.",
      cause: payload,
    });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "Le contrat de réponse MJTV est invalide.",
      cause: parsed.error,
    });
  }
  return parsed.data;
}

export function fetchCatalog(
  params: Record<string, string | number | undefined>,
): Promise<RemoteCatalogResponse> {
  return fetchMjtv("/api/catalog", RemoteCatalogResponseSchema, params);
}

export function fetchChannel(id: string): Promise<RemoteChannel> {
  return fetchMjtv(
    `/api/channels/${encodeURIComponent(id)}`,
    RemoteChannelSchema,
  );
}

export function fetchChannelHealth(id: string) {
  return fetchMjtv(
    `/api/channels/${encodeURIComponent(id)}/health`,
    RemoteHealthSchema,
  );
}
