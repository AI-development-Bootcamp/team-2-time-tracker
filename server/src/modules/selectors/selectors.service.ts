import { SelectorsRepo, selectorsRepo } from './selectors.repo';
import {
    ClientSelectorDto,
    ProjectSelectorDto,
    TaskSelectorDto,
    UserAssignmentDto,
    MonthlyStatisticsDto
} from '@shared/types';

export class SelectorsService {
    private repo: SelectorsRepo;

    constructor(repo: SelectorsRepo) {
        this.repo = repo;
    }

    async getClients(
        userId: string,
        sort: string = 'alpha'
    ): Promise<ClientSelectorDto[]> {
        const sortMode = this.parseSortMode(sort);
        return this.repo.getClients(userId, sortMode);
    }

    async getProjects(
        userId: string,
        clientId?: string,
        sort: string = 'alpha'
    ): Promise<ProjectSelectorDto[]> {
        const sortMode = this.parseSortMode(sort);
        return this.repo.getProjects(userId, clientId, sortMode);
    }

    async getTasks(
        userId: string,
        projectId?: string,
        sort: string = 'alpha'
    ): Promise<TaskSelectorDto[]> {
        const sortMode = this.parseSortMode(sort);
        return this.repo.getTasks(userId, projectId, sortMode);
    }

    async getUserAssignments(userId: string): Promise<UserAssignmentDto[]> {
        return this.repo.getUserAssignments(userId);
    }

    async getMonthlyStatistics(userId: string, monthStr: string): Promise<MonthlyStatisticsDto['data']> {
        // Parse month string YYYY-MM or YYYY-MM-DD
        const date = new Date(monthStr);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
        }
        return this.repo.getMonthlyStatistics(userId, date);
    }

    private parseSortMode(sortString: string): 'alpha' | 'frequency' {
        return sortString === 'frequency' ? 'frequency' : 'alpha';
    }
}

export const selectorsService = new SelectorsService(selectorsRepo);
