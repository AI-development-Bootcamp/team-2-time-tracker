/**
 * @fileoverview Unit tests for clients.service.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    resetPrismaMocks,
    createMockClient,
} from '../helpers/mockPrisma';

// Mock jwt config to avoid env.ts validation during import
vi.mock('../../src/config/jwt', () => ({
    jwtConfig: {
        secret: 'test-secret',
        expiresIn: '2h',
        expiresInSeconds: 7200,
    },
}));

// Import after mocks
import * as clientsService from '../../src/modules/admin/entities/clients.service';
import * as clientsRepo from '../../src/modules/admin/entities/clients.repo';
import { NotFoundError } from '../../src/shared/errors';
import { EntityStatus } from '@shared/types';

// Mock the clients repository
vi.mock('../../src/modules/admin/entities/clients.repo');

describe('clients.service', () => {
    beforeEach(() => {
        resetPrismaMocks();
        vi.clearAllMocks();
    });

    describe('listClients', () => {
        it('should return all clients', async () => {
            const mockClients = [
                createMockClient({ id: '1', name: 'Client 1' }),
                createMockClient({ id: '2', name: 'Client 2' }),
            ];

            vi.mocked(clientsRepo.findAllClients).mockResolvedValue(mockClients);

            const result = await clientsService.listClients();

            expect(result).toHaveLength(2);
            expect(result).toEqual(mockClients);
            expect(clientsRepo.findAllClients).toHaveBeenCalledOnce();
        });

        it('should return empty array when no clients exist', async () => {
            vi.mocked(clientsRepo.findAllClients).mockResolvedValue([]);

            const result = await clientsService.listClients();

            expect(result).toHaveLength(0);
            expect(result).toEqual([]);
        });
    });

    describe('getClientById', () => {
        it('should return client when found', async () => {
            const mockClient = createMockClient();
            vi.mocked(clientsRepo.findClientById).mockResolvedValue(mockClient);

            const result = await clientsService.getClientById('test-id');

            expect(result).toEqual(mockClient);
            expect(clientsRepo.findClientById).toHaveBeenCalledWith('test-id');
        });

        it('should throw NotFoundError when client does not exist', async () => {
            vi.mocked(clientsRepo.findClientById).mockResolvedValue(null);

            await expect(clientsService.getClientById('non-existent-id')).rejects.toThrow(
                NotFoundError
            );
            await expect(clientsService.getClientById('non-existent-id')).rejects.toThrow(
                'Client not found'
            );
        });
    });

    describe('createClient', () => {
        it('should create client with name and description', async () => {
            const mockClient = createMockClient({
                name: 'New Client',
                description: 'New client description',
            });

            vi.mocked(clientsRepo.createClient).mockResolvedValue(mockClient);

            const result = await clientsService.createClient({
                name: 'New Client',
                description: 'New client description',
            });

            expect(result).toEqual(mockClient);
            expect(clientsRepo.createClient).toHaveBeenCalledWith({
                name: 'New Client',
                description: 'New client description',
            });
        });

        it('should create client with name only', async () => {
            const mockClient = createMockClient({
                name: 'New Client',
                description: null,
            });

            vi.mocked(clientsRepo.createClient).mockResolvedValue(mockClient);

            const result = await clientsService.createClient({
                name: 'New Client',
            });

            expect(result).toEqual(mockClient);
            expect(clientsRepo.createClient).toHaveBeenCalledWith({
                name: 'New Client',
            });
        });

        it('should create client with ACTIVE status by default', async () => {
            const mockClient = createMockClient({ status: EntityStatus.ACTIVE });

            vi.mocked(clientsRepo.createClient).mockResolvedValue(mockClient);

            const result = await clientsService.createClient({
                name: 'New Client',
            });

            expect(result.status).toBe(EntityStatus.ACTIVE);
        });
    });

    describe('updateClient', () => {
        it('should update client successfully', async () => {
            const existingClient = createMockClient({ name: 'Old Name' });
            const updatedClient = createMockClient({
                name: 'Updated Name',
                description: 'Updated description',
            });

            vi.mocked(clientsRepo.findClientById).mockResolvedValue(existingClient);
            vi.mocked(clientsRepo.updateClient).mockResolvedValue(updatedClient);

            const result = await clientsService.updateClient('test-id', {
                name: 'Updated Name',
                description: 'Updated description',
            });

            expect(result).toEqual(updatedClient);
            expect(clientsRepo.updateClient).toHaveBeenCalledWith('test-id', {
                name: 'Updated Name',
                description: 'Updated description',
            });
        });

        it('should throw NotFoundError when client does not exist', async () => {
            vi.mocked(clientsRepo.findClientById).mockResolvedValue(null);

            await expect(
                clientsService.updateClient('non-existent-id', { name: 'Updated Name' })
            ).rejects.toThrow(NotFoundError);
            await expect(
                clientsService.updateClient('non-existent-id', { name: 'Updated Name' })
            ).rejects.toThrow('Client not found');
        });

        it('should allow updating only name', async () => {
            const existingClient = createMockClient();
            const updatedClient = createMockClient({ name: 'New Name' });

            vi.mocked(clientsRepo.findClientById).mockResolvedValue(existingClient);
            vi.mocked(clientsRepo.updateClient).mockResolvedValue(updatedClient);

            const result = await clientsService.updateClient('test-id', {
                name: 'New Name',
            });

            expect(result.name).toBe('New Name');
        });

        it('should allow updating only description', async () => {
            const existingClient = createMockClient();
            const updatedClient = createMockClient({
                description: 'New description',
            });

            vi.mocked(clientsRepo.findClientById).mockResolvedValue(existingClient);
            vi.mocked(clientsRepo.updateClient).mockResolvedValue(updatedClient);

            const result = await clientsService.updateClient('test-id', {
                description: 'New description',
            });

            expect(result.description).toBe('New description');
        });

        it('should allow setting description to null', async () => {
            const existingClient = createMockClient({
                description: 'Some description',
            });
            const updatedClient = createMockClient({ description: null });

            vi.mocked(clientsRepo.findClientById).mockResolvedValue(existingClient);
            vi.mocked(clientsRepo.updateClient).mockResolvedValue(updatedClient);

            const result = await clientsService.updateClient('test-id', {
                description: null,
            });

            expect(result.description).toBeNull();
        });
    });

    describe('updateClientStatus', () => {
        it('should update client status to INACTIVE', async () => {
            const mockClient = createMockClient({ status: EntityStatus.ACTIVE });
            const updatedClient = createMockClient({ status: EntityStatus.INACTIVE });

            vi.mocked(clientsRepo.findClientById).mockResolvedValue(mockClient);
            vi.mocked(clientsRepo.updateClientStatus).mockResolvedValue(updatedClient);

            const result = await clientsService.updateClientStatus('test-id', EntityStatus.INACTIVE);

            expect(result).toEqual(updatedClient);
            expect(result.status).toBe(EntityStatus.INACTIVE);
            expect(clientsRepo.updateClientStatus).toHaveBeenCalledWith('test-id', EntityStatus.INACTIVE);
        });

        it('should update client status to ACTIVE', async () => {
            const mockClient = createMockClient({ status: EntityStatus.INACTIVE });
            const updatedClient = createMockClient({ status: EntityStatus.ACTIVE });

            vi.mocked(clientsRepo.findClientById).mockResolvedValue(mockClient);
            vi.mocked(clientsRepo.updateClientStatus).mockResolvedValue(updatedClient);

            const result = await clientsService.updateClientStatus('test-id', EntityStatus.ACTIVE);

            expect(result.status).toBe(EntityStatus.ACTIVE);
        });

        it('should throw NotFoundError when client does not exist', async () => {
            vi.mocked(clientsRepo.findClientById).mockResolvedValue(null);

            await expect(
                clientsService.updateClientStatus('non-existent-id', EntityStatus.INACTIVE)
            ).rejects.toThrow(NotFoundError);
            await expect(
                clientsService.updateClientStatus('non-existent-id', EntityStatus.INACTIVE)
            ).rejects.toThrow('Client not found');
        });
    });
});
