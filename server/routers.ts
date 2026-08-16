import { z } from "zod";

import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { fetchCatalog, fetchChannel, fetchChannelHealth } from "./mjtv-proxy";

const catalogInput = z.object({
  q: z.string().optional(),
  country: z.string().optional(),
  category: z.string().optional(),
  language: z.string().optional(),
  availability: z.enum(["recommended", "unverified", "limited", "blocked"]).optional(),
  sort: z.enum(["quality", "name", "country"]).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(40),
  source: z.enum(["iptv-org", "imported", "all"]).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  mjtv: router({
    catalog: publicProcedure.input(catalogInput).query(({ input }) => fetchCatalog(input)),
    channel: publicProcedure.input(z.object({ id: z.string().min(1) })).query(({ input }) => fetchChannel(input.id)),
    health: publicProcedure.input(z.object({ id: z.string().min(1) })).query(({ input }) => fetchChannelHealth(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
