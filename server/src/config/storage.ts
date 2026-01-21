import { env } from './env';

export const storageConfig = {
    accessKeyId: env.IDRIVE_ACCESS_KEY || '',
    secretAccessKey: env.IDRIVE_SECRET_KEY || '',
    bucket: env.IDRIVE_BUCKET || '',
    endpoint: env.IDRIVE_ENDPOINT || '',
    region: env.IDRIVE_REGION,
    isConfigured: Boolean(
        env.IDRIVE_ACCESS_KEY &&
        env.IDRIVE_SECRET_KEY &&
        env.IDRIVE_BUCKET &&
        env.IDRIVE_ENDPOINT
    ),
};

export const fileConstraints = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'] as const,
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] as const,
};

export type AllowedMimeType = typeof fileConstraints.allowedMimeTypes[number];
