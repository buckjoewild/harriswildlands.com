import { z } from 'zod';
import { 
  insertLogSchema, 
  insertIdeaSchema, 
  insertTeachingRequestSchema, 
  insertHarrisContentSchema,
  insertSettingsSchema,
  logs,
  ideas,
  teachingRequests,
  harrisContent,
  settings
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  dashboard: {
    get: {
      method: 'GET' as const,
      path: '/api/dashboard',
      responses: {
        200: z.object({
          logsToday: z.number(),
          openLoops: z.number(),
          driftFlags: z.array(z.string()),
        }),
      },
    },
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: {
        200: z.array(z.custom<typeof logs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/logs',
      input: insertLogSchema,
      responses: {
        201: z.custom<typeof logs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    generateSummary: {
      method: 'POST' as const,
      path: '/api/logs/summary',
      input: z.object({ date: z.string() }),
      responses: {
        200: z.object({ summary: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
  ideas: {
    list: {
      method: 'GET' as const,
      path: '/api/ideas',
      responses: {
        200: z.array(z.custom<typeof ideas.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/ideas',
      input: insertIdeaSchema,
      responses: {
        201: z.custom<typeof ideas.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/ideas/:id',
      input: z.object({
        status: z.string().optional(),
        promotedSpec: z.any().optional(),
        title: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof ideas.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    runRealityCheck: {
      method: 'POST' as const,
      path: '/api/ideas/:id/reality-check',
      responses: {
        200: z.custom<typeof ideas.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  teaching: {
    list: {
      method: 'GET' as const,
      path: '/api/teaching',
      responses: {
        200: z.array(z.custom<typeof teachingRequests.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/teaching',
      input: insertTeachingRequestSchema,
      responses: {
        201: z.custom<typeof teachingRequests.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  harris: {
    create: {
      method: 'POST' as const,
      path: '/api/harris',
      input: insertHarrisContentSchema,
      responses: {
        201: z.custom<typeof harrisContent.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  settings: {
    list: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.array(z.custom<typeof settings.$inferSelect>()),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/settings/:key',
      input: z.object({ value: z.string() }),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
