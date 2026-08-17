import { describe, expect, it } from "vitest";

const liveDescribe =
  process.env.MJTV_LIVE_API_TEST === "1" ? describe : describe.skip;

liveDescribe("connexion à la référence MJTV", () => {
  const baseUrl = process.env.MJTV_API_BASE_URL ?? "https://tv.mjtv.app";

  it("valide la santé, la pagination et le détail d’une chaîne", async () => {
    const health = await fetch(new URL("/api/health", baseUrl), {
      signal: AbortSignal.timeout(8_000),
      headers: { Accept: "application/json" },
    });
    expect(health.ok).toBe(true);

    const firstPage = await fetch(new URL("/api/catalog?limit=2", baseUrl), {
      signal: AbortSignal.timeout(8_000),
      headers: { Accept: "application/json" },
    });
    expect(firstPage.ok).toBe(true);
    const catalog = (await firstPage.json()) as {
      items: { id: string }[];
      nextCursor: string | null;
      total: number;
    };
    expect(catalog.total).toBeGreaterThanOrEqual(catalog.items.length);
    expect(catalog.items.length).toBeGreaterThan(0);

    if (catalog.nextCursor) {
      const nextPageUrl = new URL("/api/catalog", baseUrl);
      nextPageUrl.searchParams.set("limit", "2");
      nextPageUrl.searchParams.set("cursor", catalog.nextCursor);
      const nextPage = await fetch(nextPageUrl, {
        signal: AbortSignal.timeout(8_000),
        headers: { Accept: "application/json" },
      });
      expect(nextPage.ok).toBe(true);
    }

    const detail = await fetch(
      new URL(
        `/api/channels/${encodeURIComponent(catalog.items[0]!.id)}`,
        baseUrl,
      ),
      {
        signal: AbortSignal.timeout(8_000),
        headers: { Accept: "application/json" },
      },
    );
    expect(detail.ok).toBe(true);
  }, 30_000);
});
