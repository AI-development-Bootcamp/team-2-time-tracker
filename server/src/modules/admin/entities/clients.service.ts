/**
 * @fileoverview Clients service for admin client management
 * @module admin/entities/clients.service
 */

import { NotFoundError } from '../../../shared/errors';
import * as clientsRepo from './clients.repo';
import { EntityStatus } from '@prisma/client';

/**
 * @description Retrieves all clients with project count.
 * @returns {Promise<Array>} Clients list
 * @example
 * const clients = await listClients();
 */
export async function listClients() {
    return clientsRepo.findAllClients();
}

/**
 * @description Retrieves a single client by their ID.
 * @param {string} id - Client's UUID
 * @returns {Promise<Object>} Client data
 * @throws {NotFoundError} When client with given ID doesn't exist
 * @example
 * const client = await getClientById('123e4567-e89b-12d3-a456-426614174000');
 */
export async function getClientById(id: string) {
    const client = await clientsRepo.findClientById(id);
    if (!client) {
        throw new NotFoundError('Client not found');
    }
    return client;
}

/**
 * @description Creates a new client with ACTIVE status.
 * @param {Object} data - Client creation data
 * @param {string} data.name - Client name (1-100 chars)
 * @param {string} [data.description] - Optional description (max 500 chars)
 * @returns {Promise<Object>} Created client
 * @example
 * const client = await createClient({
 *   name: 'Acme Corporation',
 *   description: 'Main client for project X'
 * });
 */
export async function createClient(data: {
    name: string;
    description?: string;
}) {
    return clientsRepo.createClient(data);
}

/**
 * @description Updates a client's name and/or description.
 * @param {string} id - Client's UUID
 * @param {Object} data - Fields to update (all optional)
 * @param {string} [data.name] - New name
 * @param {string} [data.description] - New description
 * @returns {Promise<Object>} Updated client
 * @throws {NotFoundError} When client doesn't exist
 * @example
 * const client = await updateClient('client-uuid', { name: 'Updated Name' });
 */
export async function updateClient(
    id: string,
    data: { name?: string; description?: string | null }
) {
    // Check client exists
    const client = await clientsRepo.findClientById(id);
    if (!client) {
        throw new NotFoundError('Client not found');
    }

    return clientsRepo.updateClient(id, data);
}

/**
 * @description Updates a client's status (ACTIVE/INACTIVE).
 * @param {string} id - Client's UUID
 * @param {EntityStatus} status - New status
 * @returns {Promise<Object>} Updated client
 * @throws {NotFoundError} When client doesn't exist
 * @example
 * await updateClientStatus('client-uuid', 'INACTIVE');
 */
export async function updateClientStatus(id: string, status: EntityStatus) {
    const client = await clientsRepo.findClientById(id);
    if (!client) {
        throw new NotFoundError('Client not found');
    }

    return clientsRepo.updateClientStatus(id, status);
}
