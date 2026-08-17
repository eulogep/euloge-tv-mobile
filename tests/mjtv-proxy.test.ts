import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchCatalog } from "../server/mjtv-proxy";

const catalogPayload = {
  items: [{ id: "channel-1", name: "Channel 1", streamCount: 1 }],
  nextCursor: "page-2",
  total: 2,
  filters: { countries: [], categories: [], languages: [] },
  generatedAt: "2026-08-17T10:00:00.000Z",
};

describe("proxy MJTV", () => {
  beforeEach(() => {
    process.env.MJTV_API_BASE_URL = "https://tv.example.test";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.MJTV_API_BASE_URL;
  });

  it("transmet le curseur et les filtres au catalogue", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(catalogPayload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      fetchCatalog({
        cursor: "page-1",
        q: "info",
        category: "news",
        limit: 20,
      }),
    ).resolves.toEqual(catalogPayload);

    const requestUrl = new URL(String(vi.mocked(fetch).mock.calls[0]![0]));
    expect(requestUrl.pathname).toBe("/api/catalog");
    expect(requestUrl.searchParams.get("cursor")).toBe("page-1");
    expect(requestUrl.searchParams.get("q")).toBe("info");
    expect(requestUrl.searchParams.get("category")).toBe("news");
    expect(requestUrl.searchParams.get("limit")).toBe("20");
  });

  it("refuse un corps JSON invalide", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("not-json", { status: 200 }),
    );

    await expect(fetchCatalog({ limit: 20 })).rejects.toMatchObject({
      code: "BAD_GATEWAY",
      message: "La source MJTV a renvoyé une réponse invalide.",
    });
  });

  it("refuse une réponse qui ne respecte pas le contrat", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ items: [] }), { status: 200 }),
    );

    await expect(fetchCatalog({ limit: 20 })).rejects.toMatchObject({
      code: "BAD_GATEWAY",
      message: "Le contrat de réponse MJTV est invalide.",
    });
  });

  it("propage une indisponibilité amont comme une erreur et jamais comme un catalogue vide", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "offline" }), { status: 502 }),
    );

    await expect(fetchCatalog({ limit: 20 })).rejects.toMatchObject({
      code: "BAD_GATEWAY",
      message: "La source MJTV a renvoyé une erreur.",
    });
  });
});
