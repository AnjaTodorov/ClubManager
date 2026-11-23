import { z } from 'zod';

const shema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL ni nastavljen'),
  SESSION_SECRET: z.string().min(16, 'SESSION_SECRET mora imeti vsaj 16 znakov'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  FRONTEND_DIST: z.string().optional(),
  INITIAL_ADMIN_EMAIL: z.string().trim().toLowerCase().email().optional(),
  INITIAL_ADMIN_PASSWORD: z.string().min(12).optional(),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),
  MAIL_FROM: z.string().default('ClubManager <no-reply@clubmanager.local>'),
}).refine(
  (env) => Boolean(env.INITIAL_ADMIN_EMAIL) === Boolean(env.INITIAL_ADMIN_PASSWORD),
  { path: ['INITIAL_ADMIN_EMAIL'], message: 'Nastavi INITIAL_ADMIN_EMAIL in INITIAL_ADMIN_PASSWORD skupaj' },
).refine(
  (env) => Boolean(env.SMTP_USER) === Boolean(env.SMTP_PASSWORD),
  { path: ['SMTP_USER'], message: 'Nastavi SMTP_USER in SMTP_PASSWORD skupaj' },
);

const rezultat = shema.safeParse(process.env);

if (!rezultat.success) {
  const napake = rezultat.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Neveljavne nastavitve okolja (preveri datoteko .env):\n${napake}`);
}

export const config = rezultat.data;
export const jeProdukcija = config.NODE_ENV === 'production';
export const jeTest = config.NODE_ENV === 'test';
