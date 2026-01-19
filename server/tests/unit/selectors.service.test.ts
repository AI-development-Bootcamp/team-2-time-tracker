/**
 * @fileoverview Unit tests for selectors.service.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SelectorsService } from '../../src/modules/selectors/selectors.service';
import { SelectorsRepo } from '../../src/modules/selectors/selectors.repo';

// Mock the repo
const mockRepo = {
    getClients: vi.fn(),
    getProjects: vi.fn(),
    getTasks: vi.fn(),
    getUserAssignments: vi.fn(),
    getMonthlyStatistics: vi.fn(),
} as unknown as SelectorsRepo;

describe('SelectorsService', () => {
    let service: SelectorsService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new SelectorsService(mockRepo);
    });

    describe('getClients', () => {
        it('should call repo with "alpha" sort by default', async () => {
            await service.getClients('user-id');
            expect(mockRepo.getClients).toHaveBeenCalledWith('user-id', 'alpha');
        });

        it('should call repo with "frequency" sort when requested', async () => {
            await service.getClients('user-id', 'frequency');
            expect(mockRepo.getClients).toHaveBeenCalledWith('user-id', 'frequency');
        });

        it('should fallback to "alpha" for invalid sort mode', async () => {
            await service.getClients('user-id', 'invalid');
            expect(mockRepo.getClients).toHaveBeenCalledWith('user-id', 'alpha');
        });
    });

    describe('getProjects', () => {
        it('should call repo with correct args', async () => {
            await service.getProjects('user-id', 'client-id', 'frequency');
            expect(mockRepo.getProjects).toHaveBeenCalledWith('user-id', 'client-id', 'frequency');
        });

        it('should handle missing client id', async () => {
            await service.getProjects('user-id', undefined, 'alpha');
            expect(mockRepo.getProjects).toHaveBeenCalledWith('user-id', undefined, 'alpha');
        });
    });

    describe('getTasks', () => {
        it('should call repo with correct args', async () => {
            await service.getTasks('user-id', 'project-id', 'frequency');
            expect(mockRepo.getTasks).toHaveBeenCalledWith('user-id', 'project-id', 'frequency');
        });
    });

    describe('getUserAssignments', () => {
        it('should delegate to repo', async () => {
            await service.getUserAssignments('user-id');
            expect(mockRepo.getUserAssignments).toHaveBeenCalledWith('user-id');
        });
    });

    describe('getMonthlyStatistics', () => {
        it('should parse date string and delegate to repo', async () => {
            const dateStr = '2026-01';
            await service.getMonthlyStatistics('user-id', dateStr);

            // Verify date matching
            const calledDate = (mockRepo.getMonthlyStatistics as any).mock.calls[0][1];
            expect(calledDate instanceof Date).toBe(true);
            expect(calledDate.getFullYear()).toBe(2026);
            expect(calledDate.getMonth()).toBe(0); // 0-indexed jan
        });

        it('should throw error for invalid date', async () => {
            await expect(service.getMonthlyStatistics('user-id', 'invalid-date'))
                .rejects.toThrow('Invalid date format');
        });
    });
});
