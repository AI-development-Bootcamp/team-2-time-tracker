/**
 * @fileoverview Unit tests for cartesian product utility
 */

import { describe, it, expect } from 'vitest';
import { calculateCartesianProduct } from '../../../shared/types/src/utils/cartesian';

describe('calculateCartesianProduct', () => {
    it('should generate correct cartesian product for 2x2 arrays', () => {
        const userIds = ['user1', 'user2'];
        const taskIds = ['taskA', 'taskB'];

        const result = calculateCartesianProduct(userIds, taskIds);

        expect(result).toHaveLength(4);
        expect(result).toEqual([
            { userId: 'user1', taskId: 'taskA' },
            { userId: 'user1', taskId: 'taskB' },
            { userId: 'user2', taskId: 'taskA' },
            { userId: 'user2', taskId: 'taskB' },
        ]);
    });

    it('should generate correct cartesian product for 3x2 arrays', () => {
        const userIds = ['user1', 'user2', 'user3'];
        const taskIds = ['taskA', 'taskB'];

        const result = calculateCartesianProduct(userIds, taskIds);

        expect(result).toHaveLength(6);
        expect(result).toContainEqual({ userId: 'user1', taskId: 'taskA' });
        expect(result).toContainEqual({ userId: 'user3', taskId: 'taskB' });
    });

    it('should generate correct cartesian product for 2x3 arrays', () => {
        const userIds = ['user1', 'user2'];
        const taskIds = ['taskA', 'taskB', 'taskC'];

        const result = calculateCartesianProduct(userIds, taskIds);

        expect(result).toHaveLength(6);
    });

    it('should return empty array when userIds is empty', () => {
        const userIds: string[] = [];
        const taskIds = ['taskA', 'taskB'];

        const result = calculateCartesianProduct(userIds, taskIds);

        expect(result).toEqual([]);
    });

    it('should return empty array when taskIds is empty', () => {
        const userIds = ['user1', 'user2'];
        const taskIds: string[] = [];

        const result = calculateCartesianProduct(userIds, taskIds);

        expect(result).toEqual([]);
    });

    it('should return empty array when both arrays are empty', () => {
        const userIds: string[] = [];
        const taskIds: string[] = [];

        const result = calculateCartesianProduct(userIds, taskIds);

        expect(result).toEqual([]);
    });

    it('should handle single element arrays', () => {
        const userIds = ['user1'];
        const taskIds = ['taskA'];

        const result = calculateCartesianProduct(userIds, taskIds);

        expect(result).toHaveLength(1);
        expect(result).toEqual([{ userId: 'user1', taskId: 'taskA' }]);
    });

    it('should handle large arrays efficiently', () => {
        const userIds = Array.from({ length: 100 }, (_, i) => `user${i}`);
        const taskIds = Array.from({ length: 50 }, (_, i) => `task${i}`);

        const result = calculateCartesianProduct(userIds, taskIds);

        expect(result).toHaveLength(5000); // 100 * 50
        expect(result[0]).toEqual({ userId: 'user0', taskId: 'task0' });
        expect(result[4999]).toEqual({ userId: 'user99', taskId: 'task49' });
    });
});
