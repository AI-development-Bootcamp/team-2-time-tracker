/**
 * @fileoverview Unit tests for storage.service.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock AWS SDK
const mockSend = vi.fn();
const mockS3Client = {
    send: mockSend,
};

vi.mock('@aws-sdk/client-s3', () => {
    const PutObjectCommand = vi.fn();
    const DeleteObjectCommand = vi.fn();
    const GetObjectCommand = vi.fn();
    // Create a proper class constructor
    class S3Client {
        send = mockSend;
    }
    return {
        S3Client,
        PutObjectCommand,
        DeleteObjectCommand,
        GetObjectCommand,
    };
});

vi.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: vi.fn(),
}));

// Mock storage config
vi.mock('../../src/config/storage', () => ({
    storageConfig: {
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key',
        bucket: 'test-bucket',
        endpoint: 'https://storage.example.com',
        region: 'us-east-1',
        isConfigured: true,
    },
    fileConstraints: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
    },
}));

// Mock logger
vi.mock('../../src/shared/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

// Mock uuid
vi.mock('uuid', () => ({
    v4: vi.fn(() => 'test-uuid-1234'),
}));

// Import after mocks are set up
import * as storageService from '../../src/shared/storage.service';

describe('storage.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSend.mockReset();
    });

    describe('generateFilePath', () => {
        it('should generate correct file path format', () => {
            const userId = 'user-123';
            const absenceId = 'absence-456';
            const originalFileName = 'document.pdf';

            const filePath = storageService.generateFilePath(userId, absenceId, originalFileName);

            expect(filePath).toMatch(/^absences\/user-123\/absence-456\/test-uuid-1234-\d+\.pdf$/);
        });

        it('should handle different file extensions', () => {
            const userId = 'user-123';
            const absenceId = 'absence-456';
            const originalFileName = 'image.PNG';

            const filePath = storageService.generateFilePath(userId, absenceId, originalFileName);

            expect(filePath).toMatch(/\.png$/i);
        });
    });

    describe('isValidMimeType', () => {
        it('should return true for valid MIME types', () => {
            expect(storageService.isValidMimeType('application/pdf')).toBe(true);
            expect(storageService.isValidMimeType('image/jpeg')).toBe(true);
            expect(storageService.isValidMimeType('image/png')).toBe(true);
        });

        it('should return false for invalid MIME types', () => {
            expect(storageService.isValidMimeType('text/plain')).toBe(false);
            expect(storageService.isValidMimeType('application/json')).toBe(false);
            expect(storageService.isValidMimeType('image/gif')).toBe(false);
        });
    });

    describe('isValidFileSize', () => {
        it('should return true for valid file sizes', () => {
            expect(storageService.isValidFileSize(1024)).toBe(true);
            expect(storageService.isValidFileSize(10 * 1024 * 1024)).toBe(true); // 10MB
            expect(storageService.isValidFileSize(5 * 1024 * 1024)).toBe(true); // 5MB
        });

        it('should return false for files exceeding max size', () => {
            expect(storageService.isValidFileSize(10 * 1024 * 1024 + 1)).toBe(false); // 10MB + 1 byte
            expect(storageService.isValidFileSize(20 * 1024 * 1024)).toBe(false); // 20MB
        });
    });

    describe('uploadFile', () => {
        it('should upload file successfully and return file URL', async () => {
            const fileBuffer = Buffer.from('test file content');
            const filePath = 'absences/user-123/absence-456/file.pdf';
            const mimeType = 'application/pdf';

            mockSend.mockResolvedValue({});

            const fileUrl = await storageService.uploadFile(fileBuffer, filePath, mimeType);

            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(PutObjectCommand).toHaveBeenCalledWith({
                Bucket: 'test-bucket',
                Key: filePath,
                Body: fileBuffer,
                ContentType: mimeType,
            });
            expect(fileUrl).toBe(`https://storage.example.com/test-bucket/${filePath}`);
        });

        it('should throw error when upload fails', async () => {
            const fileBuffer = Buffer.from('test file content');
            const filePath = 'absences/user-123/absence-456/file.pdf';
            const mimeType = 'application/pdf';

            const error = new Error('S3 upload failed');
            mockSend.mockRejectedValue(error);

            await expect(storageService.uploadFile(fileBuffer, filePath, mimeType)).rejects.toThrow(
                'Failed to upload file to storage'
            );
        });

        it('should handle different file types correctly', async () => {
            const fileBuffer = Buffer.from('test image content');
            const filePath = 'absences/user-123/absence-456/image.jpg';
            const mimeType = 'image/jpeg';

            mockSend.mockResolvedValue({});

            await storageService.uploadFile(fileBuffer, filePath, mimeType);

            expect(PutObjectCommand).toHaveBeenCalledWith({
                Bucket: 'test-bucket',
                Key: filePath,
                Body: fileBuffer,
                ContentType: mimeType,
            });
        });
    });

    describe('deleteFile', () => {
        it('should delete file successfully', async () => {
            const fileUrl = 'https://storage.example.com/test-bucket/absences/user-123/absence-456/file.pdf';

            mockSend.mockResolvedValue({});

            await storageService.deleteFile(fileUrl);

            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(DeleteObjectCommand).toHaveBeenCalledWith({
                Bucket: 'test-bucket',
                Key: 'absences/user-123/absence-456/file.pdf',
            });
        });

        it('should handle invalid file URL format gracefully', async () => {
            const fileUrl = 'invalid-url-format';

            await storageService.deleteFile(fileUrl);

            // Should not throw, but should not call S3 either
            expect(mockSend).not.toHaveBeenCalled();
        });

        it('should throw error when deletion fails', async () => {
            const fileUrl = 'https://storage.example.com/test-bucket/absences/user-123/absence-456/file.pdf';

            const error = new Error('S3 delete failed');
            mockSend.mockRejectedValue(error);

            await expect(storageService.deleteFile(fileUrl)).rejects.toThrow('Failed to delete file from storage');
        });

        it('should extract file path correctly from URL', async () => {
            const fileUrl = 'https://storage.example.com/test-bucket/absences/user-123/absence-456/subfolder/file.pdf';

            mockSend.mockResolvedValue({});

            await storageService.deleteFile(fileUrl);

            expect(DeleteObjectCommand).toHaveBeenCalledWith({
                Bucket: 'test-bucket',
                Key: 'absences/user-123/absence-456/subfolder/file.pdf',
            });
        });
    });

    describe('getSignedDownloadUrl', () => {
        it('should generate signed URL successfully', async () => {
            const fileUrl = 'https://storage.example.com/test-bucket/absences/user-123/absence-456/file.pdf';
            const expiresIn = 3600;
            const expectedSignedUrl = 'https://storage.example.com/signed-url?signature=abc123';

            vi.mocked(getSignedUrl).mockResolvedValue(expectedSignedUrl);
            mockSend.mockResolvedValue({});

            const signedUrl = await storageService.getSignedDownloadUrl(fileUrl, expiresIn);

            expect(GetObjectCommand).toHaveBeenCalledWith({
                Bucket: 'test-bucket',
                Key: 'absences/user-123/absence-456/file.pdf',
            });
            expect(getSignedUrl).toHaveBeenCalledWith(
                mockS3Client,
                expect.any(GetObjectCommand),
                { expiresIn }
            );
            expect(signedUrl).toBe(expectedSignedUrl);
        });

        it('should use default expiration time when not provided', async () => {
            const fileUrl = 'https://storage.example.com/test-bucket/absences/user-123/absence-456/file.pdf';
            const expectedSignedUrl = 'https://storage.example.com/signed-url?signature=abc123';

            vi.mocked(getSignedUrl).mockResolvedValue(expectedSignedUrl);

            await storageService.getSignedDownloadUrl(fileUrl);

            expect(getSignedUrl).toHaveBeenCalledWith(
                mockS3Client,
                expect.any(GetObjectCommand),
                { expiresIn: 3600 } // Default 1 hour
            );
        });

        it('should throw error for invalid file URL format', async () => {
            const fileUrl = 'invalid-url-format';

            await expect(storageService.getSignedDownloadUrl(fileUrl)).rejects.toThrow('Invalid file URL format');
        });

        it('should throw error when signed URL generation fails', async () => {
            const fileUrl = 'https://storage.example.com/test-bucket/absences/user-123/absence-456/file.pdf';

            const error = new Error('Failed to generate signed URL');
            vi.mocked(getSignedUrl).mockRejectedValue(error);

            await expect(storageService.getSignedDownloadUrl(fileUrl)).rejects.toThrow('Failed to generate download URL');
        });

        it('should handle custom expiration times', async () => {
            const fileUrl = 'https://storage.example.com/test-bucket/absences/user-123/absence-456/file.pdf';
            const expiresIn = 7200; // 2 hours
            const expectedSignedUrl = 'https://storage.example.com/signed-url?signature=abc123';

            vi.mocked(getSignedUrl).mockResolvedValue(expectedSignedUrl);

            await storageService.getSignedDownloadUrl(fileUrl, expiresIn);

            expect(getSignedUrl).toHaveBeenCalledWith(
                mockS3Client,
                expect.any(GetObjectCommand),
                { expiresIn: 7200 }
            );
        });
    });

    describe('isStorageConfigured', () => {
        it('should return true when storage is configured', () => {
            expect(storageService.isStorageConfigured()).toBe(true);
        });
    });
});
