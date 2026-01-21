/**
 * @fileoverview Cartesian product utility for generating all combinations
 * @module utils/cartesian
 */

/**
 * Calculates the cartesian product of two arrays
 * @param {string[]} userIds - Array of user IDs
 * @param {string[]} taskIds - Array of task IDs
 * @returns {Array<{userId: string, taskId: string}>} Array of all possible (userId, taskId) combinations
 * @example
 * calculateCartesianProduct(['u1', 'u2'], ['t1', 't2'])
 * // Returns: [
 * //   { userId: 'u1', taskId: 't1' },
 * //   { userId: 'u1', taskId: 't2' },
 * //   { userId: 'u2', taskId: 't1' },
 * //   { userId: 'u2', taskId: 't2' }
 * // ]
 */
export function calculateCartesianProduct(
    userIds: string[],
    taskIds: string[]
): Array<{ userId: string; taskId: string }> {
    const result: Array<{ userId: string; taskId: string }> = [];

    for (const userId of userIds) {
        for (const taskId of taskIds) {
            result.push({ userId, taskId });
        }
    }

    return result;
}
