/**
 * @fileoverview Health check routes
 * @module health/health.routes
 */

import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { storageConfig } from '../../config/storage';

const router: RouterType = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Basic health check
 *     responses:
 *       200:
 *         description: Server is running
 */
router.get('/', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

/**
 * @swagger
 * /api/health/storage:
 *   get:
 *     tags: [Health]
 *     summary: Check IDrive storage connection
 *     responses:
 *       200:
 *         description: Storage is connected and working
 *       503:
 *         description: Storage is not available or misconfigured
 */
router.get('/storage', async (_req: Request, res: Response) => {
    try {
        // Check if storage is configured
        if (!storageConfig.isConfigured) {
            return res.status(503).json({
                status: 'error',
                message: 'Storage is not configured',
                details: {
                    configured: false,
                    hasAccessKey: !!storageConfig.accessKeyId,
                    hasSecretKey: !!storageConfig.secretAccessKey,
                    hasBucket: !!storageConfig.bucket,
                    hasEndpoint: !!storageConfig.endpoint,
                    region: storageConfig.region,
                },
            });
        }

        // Try to connect to storage
        const client = new S3Client({
            region: storageConfig.region,
            endpoint: storageConfig.endpoint,
            credentials: {
                accessKeyId: storageConfig.accessKeyId,
                secretAccessKey: storageConfig.secretAccessKey,
            },
            forcePathStyle: true,
        });

        // Test connection by checking if bucket exists
        const command = new HeadBucketCommand({
            Bucket: storageConfig.bucket,
        });

        await client.send(command);

        res.json({
            status: 'ok',
            message: 'Storage connection is working',
            details: {
                configured: true,
                bucket: storageConfig.bucket,
                endpoint: storageConfig.endpoint,
                region: storageConfig.region,
            },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        res.status(503).json({
            status: 'error',
            message: 'Storage connection failed',
            error: errorMessage,
            details: {
                configured: storageConfig.isConfigured,
                bucket: storageConfig.bucket,
                endpoint: storageConfig.endpoint,
                region: storageConfig.region,
            },
        });
    }
});

export default router;
