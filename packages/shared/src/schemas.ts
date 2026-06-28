import { z } from "zod";

export const createInboxSchema = z.object({
  domain: z.string().min(1).max(253).optional(),
  ttlSeconds: z
    .number()
    .int()
    .min(60)
    .max(7 * 24 * 60 * 60)
    .optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
});

export const addDomainSchema = z.object({
  domain: z
    .string()
    .min(1)
    .max(253)
    .regex(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
      "Invalid domain format"
    ),
  isDefault: z.boolean().optional(),
});

export const apiKeyHeaderSchema = z.string().min(1).startsWith("inbix_");

export type CreateInboxInput = z.infer<typeof createInboxSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type AddDomainInput = z.infer<typeof addDomainSchema>;

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export const notificationPreferencesSchema = z.object({
  pushEnabled: z.boolean().optional(),
  quietHoursStart: z.number().int().min(0).max(23).nullable().optional(),
  quietHoursEnd: z.number().int().min(0).max(23).nullable().optional(),
  notifyOnNewMessage: z.boolean().optional(),
});

export type PushSubscribeInput = z.infer<typeof pushSubscribeSchema>;
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
