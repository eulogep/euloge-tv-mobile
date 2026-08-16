import { describe, expect, it } from "vitest";

describe("connexion à la référence MJTV", () => {
  it("répond sur son endpoint de santé public", async () => {
    const baseUrl = process.env.MJTV_API_BASE_URL;
    expect(baseUrl).toBeTruthy();
    const response = await fetch(new URL("/api/health", baseUrl).toString(), {
      signal: AbortSignal.timeout(8_000),
      headers: { Accept: "application/json" },
    });
    expect(response.ok).toBe(true);
  });
});
