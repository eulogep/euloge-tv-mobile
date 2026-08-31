import { z } from "zod";

const nullableString = z.string().nullable().optional();

export const RemoteProgramSchema = z
  .object({
    title: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    startAt: z.string().optional(),
    endAt: z.string().optional(),
  })
  .passthrough();

export const RemoteEpgSchema = z
  .object({
    currentProgram: RemoteProgramSchema.nullable().optional(),
    nextProgram: RemoteProgramSchema.nullable().optional(),
    laterPrograms: z.array(RemoteProgramSchema).optional(),
    status: z.string().optional(),
    updatedAt: nullableString,
    source: z
      .object({ name: z.string(), kind: z.string() })
      .nullable()
      .optional(),
  })
  .passthrough();

export const RemoteHealthSchema = z
  .object({
    status: z.string().optional(),
    checkedAt: nullableString,
    sourceCount: z.number().optional(),
    playableSourceCount: z.number().optional(),
    reasonCode: z.string().optional(),
    reasonMessage: z.string().optional(),
  })
  .passthrough();

export const RemoteStreamSchema = z
  .object({
    id: z.string(),
    url: z.string(),
    title: nullableString,
    quality: nullableString,
    label: nullableString,
    kind: z.string().optional(),
    browserCompatibility: z.string().optional(),
    requiresReferrer: z.boolean().optional(),
    requiresCustomUserAgent: z.boolean().optional(),
    availability: z
      .object({
        status: z.string().optional(),
        playbackStrategy: nullableString,
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const RemoteChannelSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    countryName: nullableString,
    countryCode: nullableString,
    languageCodes: z.array(z.string()).optional(),
    primaryCategory: z.string().optional(),
    categories: z.array(z.string()).optional(),
    streamCount: z.number().int().nonnegative().optional(),
    bestCompatibility: z.string().optional(),
    bestAvailability: z.string().optional(),
    logoUrl: nullableString,
    streams: z.array(RemoteStreamSchema).optional(),
    health: RemoteHealthSchema.optional(),
    epg: RemoteEpgSchema.optional(),
  })
  .passthrough();

const FilterOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  count: z.number().int().nonnegative(),
});

export const RemoteCatalogResponseSchema = z.object({
  items: z.array(RemoteChannelSchema),
  nextCursor: z.string().nullable(),
  total: z.number().int().nonnegative(),
  filters: z
    .object({
      countries: z.array(FilterOptionSchema),
      categories: z.array(FilterOptionSchema),
      languages: z.array(FilterOptionSchema),
    })
    .optional(),
  generatedAt: z.string(),
});

export type RemoteCatalogResponse = z.infer<typeof RemoteCatalogResponseSchema>;
export type RemoteChannel = z.infer<typeof RemoteChannelSchema>;
export type RemoteEpg = z.infer<typeof RemoteEpgSchema>;
export type RemoteStream = z.infer<typeof RemoteStreamSchema>;
export type RemoteFilterOption = z.infer<typeof FilterOptionSchema>;
