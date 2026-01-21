/**
 * @fileoverview Storage service for IDrive e2 (S3-compatible) operations
 * @module shared/storage.service
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { storageConfig, fileConstraints } from '../config/storage';
import { logger } from './logger';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
    if (!s3Client) {
        if (!storageConfig.isConfigured) {
            throw new Error('Storage is not configured. Please set IDrive e2 environment variables.');
        }

        s3Client = new S3Client({
            region: storageConfig.region,
            endpoint: storageConfig.endpoint,
            credentials: {
                accessKeyId: storageConfig.accessKeyId,
                secretAccessKey: storageConfig.secretAccessKey,
            },
            forcePathStyle: true,
        });
    }
    return s3Client;
}

/**
 * Generate a unique file path for storage
 * Format: /absences/{userId}/{absenceId}/{uuid}-{timestamp}.{ext}
 */
export function generateFilePath(
    userId: string,
    absenceId: string,
    originalFileName: string
): string {
    const ext = path.extname(originalFileName).toLowerCase();
    const timestamp = Date.now();
    const uuid = uuidv4();
    return `absences/${userId}/${absenceId}/${uuid}-${timestamp}${ext}`;
}

/**
 * Validate file type based on MIME type
 */
export function isValidMimeType(mimeType: string): boolean {
    return fileConstraints.allowedMimeTypes.includes(mimeType as typeof fileConstraints.allowedMimeTypes[number]);
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number): boolean {
    return size <= fileConstraints.maxFileSize;
}

/**
 * Upload a file to IDrive e2 storage
 */
export async function uploadFile(
    fileBuffer: Buffer,
    filePath: string,
    mimeType: string
): Promise<string> {
    const client = getS3Client();

    const command = new PutObjectCommand({
        Bucket: storageConfig.bucket,
        Key: filePath,
        Body: fileBuffer,
        ContentType: mimeType,
    });

    try {
        logger.info(`Attempting to upload file: ${filePath}`);
        await client.send(command);
        const fileUrl = `${storageConfig.endpoint}/${storageConfig.bucket}/${filePath}`;
        logger.info(`File uploaded successfully: ${filePath}`);
        return fileUrl;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to upload file to storage', { 
            error: errorMessage, 
            filePath,
            bucket: storageConfig.bucket,
            endpoint: storageConfig.endpoint 
        });
        throw new Error(`Failed to upload file to storage: ${errorMessage}`);
    }
}

/**
 * Delete a file from IDrive e2 storage
 */
export async function deleteFile(fileUrl: string): Promise<void> {
    const client = getS3Client();

    // Extract file path from URL
    const urlPattern = new RegExp(`${storageConfig.endpoint}/${storageConfig.bucket}/(.+)`);
    const match = fileUrl.match(urlPattern);

    if (!match) {
        logger.warn(`Invalid file URL format: ${fileUrl}`);
        return;
    }

    const filePath = match[1];

    const command = new DeleteObjectCommand({
        Bucket: storageConfig.bucket,
        Key: filePath,
    });

    try {
        await client.send(command);
        logger.info(`File deleted successfully: ${filePath}`);
    } catch (error) {
        logger.error('Failed to delete file from storage', { error, filePath });
        throw new Error('Failed to delete file from storage');
    }
}

/**
 * Get a signed URL for downloading a file
 * The URL will be valid for the specified duration (default: 1 hour)
 */
export async function getSignedDownloadUrl(
    fileUrl: string,
    expiresIn: number = 3600
): Promise<string> {
    const client = getS3Client();

    // Extract file path from URL
    const urlPattern = new RegExp(`${storageConfig.endpoint}/${storageConfig.bucket}/(.+)`);
    const match = fileUrl.match(urlPattern);

    if (!match) {
        throw new Error('Invalid file URL format');
    }

    const filePath = match[1];

    const command = new GetObjectCommand({
        Bucket: storageConfig.bucket,
        Key: filePath,
    });

    try {
        const signedUrl = await getSignedUrl(client, command, { expiresIn });
        return signedUrl;
    } catch (error) {
        logger.error('Failed to generate signed URL', { error, filePath });
        throw new Error('Failed to generate download URL');
    }
}

/**
 * Check if storage is configured and available
 */
export function isStorageConfigured(): boolean {
    return storageConfig.isConfigured;
}
