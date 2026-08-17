import { describe, expect, it } from "vitest";

import {
  RemoteCatalogResponseSchema,
  RemoteChannelSchema,
} from "../shared/mjtv-contract";

const liveDescribe =
  process.env.MJTV_LIVE_API_TEST === "1" ? describe : describe.skip;

const LIVE_TIMEOUT_MS = {
  health: 8_000,
  catalog: 90_000,
  channel: 20_000,
} as const;

liveDescribe("connexion à la référence MJTV", () => {
  const baseUrl = process.env.MJTV_API_BASE_URL ?? "https://tv.mjtv.app";

  it("valide la santé, la pagination et le détail d’une chaîne", async () => {
    const health = await fetch(new URL("/api/health", baseUrl), {
      signal: AbortSignal.timeout(LIVE_TIMEOUT_MS.health),
      headers: { Accept: "application/json" },
    });
    expect(health.ok).toBe(true);

    const firstPage = await fetch(new URL("/api/catalog?limit=2", baseUrl), {
      signal: AbortSignal.timeout(LIVE_TIMEOUT_MS.catalog),
      headers: { Accept: "application/json" },
    });
    expect(firstPage.ok).toBe(true);
    const catalog = RemoteCatalogResponseSchema.parse(await firstPage.json());
    expect(catalog.total).toBeGreaterThanOrEqual(catalog.items.length);
    expect(catalog.items.length).toBeGreaterThan(0);

    if (catalog.nextCursor) {
      const nextPageUrl = new URL("/api/catalog", baseUrl);
      nextPageUrl.searchParams.set("limit", "2");
      nextPageUrl.searchParams.set("cursor", catalog.nextCursor);
      const nextPage = await fetch(nextPageUrl, {
        signal: AbortSignal.timeout(LIVE_TIMEOUT_MS.catalog),
        headers: { Accept: "application/json" },
      });
      expect(nextPage.ok).toBe(true);
      const nextCatalog = RemoteCatalogResponseSchema.parse(
        await nextPage.json(),
      );
      const firstPageIds = new Set(catalog.items.map(({ id }) => id));
      expect(
        nextCatalog.items.filter(({ id }) => firstPageIds.has(id)),
      ).toHaveLength(0);
    }

    const detail = await fetch(
      new URL(
        `/api/channels/${encodeURIComponent(catalog.items[0]!.id)}`,
        baseUrl,
      ),
      {
        signal: AbortSignal.timeout(LIVE_TIMEOUT_MS.channel),
        headers: { Accept: "application/json" },
      },
    );
    expect(detail.ok).toBe(true);
    RemoteChannelSchema.parse(await detail.json());
  }, 210_000);
});
