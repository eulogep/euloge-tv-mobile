import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import config from "../app.config";
import { resolveOAuthFrontendUrl } from "../server/_core/oauth-redirect";

describe("release permissions", () => {
  it("excludes unused audio and notification integrations", () => {
    const plugins = (config.plugins ?? []).map((plugin) =>
      typeof plugin === "string" ? plugin : plugin[0],
    );
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
    );

    expect(plugins).not.toContain("expo-audio");
    expect(packageJson.dependencies).not.toHaveProperty("expo-audio");
    expect(packageJson.dependencies).not.toHaveProperty("expo-notifications");
  });

  it("blocks permissions that MJTV does not use", () => {
    expect(config.android?.blockedPermissions).toEqual(
      expect.arrayContaining([
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.WRITE_EXTERNAL_STORAGE",
      ]),
    );
  });

  it("keeps expo-video background playback and picture-in-picture enabled", () => {
    const videoPlugin = (config.plugins ?? []).find(
      (plugin) => Array.isArray(plugin) && plugin[0] === "expo-video",
    );

    expect(videoPlugin).toEqual([
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ]);
  });
});

describe("OAuth release safety", () => {
  it("keeps the localhost fallback for development", () => {
    expect(resolveOAuthFrontendUrl({ NODE_ENV: "development" })).toBe(
      "http://localhost:8081",
    );
  });

  it("requires an explicit frontend URL in production", () => {
    expect(() => resolveOAuthFrontendUrl({ NODE_ENV: "production" })).toThrow(
      "OAuth frontend URL is not configured",
    );
  });

  it("rejects local and insecure production URLs", () => {
    expect(() =>
      resolveOAuthFrontendUrl({
        NODE_ENV: "production",
        EXPO_WEB_PREVIEW_URL: "http://localhost:8081",
      }),
    ).toThrow("Production OAuth frontend URL must use non-local HTTPS");
    expect(() =>
      resolveOAuthFrontendUrl({
        NODE_ENV: "production",
        EXPO_WEB_PREVIEW_URL: "http://auth.example.test",
      }),
    ).toThrow("Production OAuth frontend URL must use non-local HTTPS");
  });

  it("accepts an explicit HTTPS frontend URL in production", () => {
    expect(
      resolveOAuthFrontendUrl({
        NODE_ENV: "production",
        EXPO_WEB_PREVIEW_URL: "https://mobile.mjtv.app/oauth/callback",
      }),
    ).toBe("https://mobile.mjtv.app/oauth/callback");
  });
});

describe("sensitive logging guardrail", () => {
  it.each(["app/oauth/callback.tsx", "hooks/use-auth.ts", "lib/_core/auth.ts"])(
    "does not log values from %s",
    (relativePath) => {
      const source = readFileSync(resolve(process.cwd(), relativePath), "utf8");
      expect(source).not.toMatch(/console\.(?:debug|error|info|log|warn)/);
    },
  );

  it("does not log API auth payloads or response metadata", () => {
    const source = readFileSync(
      resolve(process.cwd(), "lib/_core/api.ts"),
      "utf8",
    );
    expect(source).not.toMatch(
      /Full URL|OAuth exchange result|Response headers|Set-Cookie header|sessionToken\.substring/,
    );
  });

  it.each(["server/db.ts", "server/_core/oauth.ts", "server/_core/sdk.ts"])(
    "does not attach raw errors to authentication logs in %s",
    (relativePath) => {
      const source = readFileSync(resolve(process.cwd(), relativePath), "utf8");
      expect(source).not.toMatch(
        /console\.(?:error|warn)\([^;]*(?:,\s*error|String\(error\))/,
      );
    },
  );
});
