/**
 * @fileoverview Admin clients API client
 * @module api/clientsApi
 */

import { httpClient } from '@client/api-client';
import type {
    ClientResponseDto,
    ListClientsResponseDto,
    UpdateClientRequestDto,
    UpdateClientStatusRequestDto,
} from '@shared/types';

/**
 * Request DTO for creating a new client (with description field)
 * Note: This extends the shared type to include the description field
 * that the server expects but isn't in the shared types yet
 */
interface CreateClientRequestDto {
    name: string;
    description?: string;
}

/**
 * @description Admin clients API endpoints
 */
export const clientsApi = {
    /**
     * @description Creates a new client
     * @param {CreateClientRequestDto} data - Client creation data
     * @returns {Promise<ClientResponseDto['data']>} Created client data
     */
    createClient: async (data: CreateClientRequestDto): Promise<ClientResponseDto['data']> => {
        const response = await httpClient.post<ClientResponseDto>('/admin/clients', data);
        return response.data.data;
    },

    /**
     * @description Gets list of all clients
     * @returns {Promise<ListClientsResponseDto['data']>} Clients list
     */
    getClients: async (): Promise<ListClientsResponseDto['data']> => {
        const response = await httpClient.get<ListClientsResponseDto>('/admin/clients');
        return response.data.data;
    },

    /**
     * @description Gets a single client by ID
     * @param {string} clientId - Client ID
     * @returns {Promise<ClientResponseDto['data']>} Client data
     */
    getClientById: async (clientId: string): Promise<ClientResponseDto['data']> => {
        const response = await httpClient.get<ClientResponseDto>(`/admin/clients/${clientId}`);
        return response.data.data;
    },

    /**
     * @description Updates client details
     * @param {string} clientId - Client ID
     * @param {UpdateClientRequestDto} data - Updated client data
     * @returns {Promise<ClientResponseDto['data']>} Updated client data
     */
    updateClient: async (
        clientId: string,
        data: UpdateClientRequestDto
    ): Promise<ClientResponseDto['data']> => {
        const response = await httpClient.put<ClientResponseDto>(`/admin/clients/${clientId}`, data);
        return response.data.data;
    },

    /**
     * @description Updates client status (activate/deactivate)
     * @param {string} clientId - Client ID
     * @param {UpdateClientStatusRequestDto} data - Status update data
     * @returns {Promise<ClientResponseDto['data']>} Updated client data
     */
    updateClientStatus: async (
        clientId: string,
        data: UpdateClientStatusRequestDto
    ): Promise<ClientResponseDto['data']> => {
        const response = await httpClient.put<ClientResponseDto>(
            `/admin/clients/${clientId}/status`,
            data
        );
        return response.data.data;
    },
};
