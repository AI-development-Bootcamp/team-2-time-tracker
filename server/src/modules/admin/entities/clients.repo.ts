/**
 * @fileoverview Clients repository for admin client management
 * @module admin/entities/clients.repo
 */

import { prisma } from '../../../db';
import { EntityStatus } from '@prisma/client';

/**
 * Find all clients
 * @returns Clients list
 */
export async function findAllClients() {
    return prisma.client.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    projects: true,
                },
            },
        },
    });
}

/**
 * Find a client by ID
 * @param id - Client ID
 * @returns Client or null
 */
export async function findClientById(id: string) {
    return prisma.client.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    projects: true,
                },
            },
        },
    });
}

/**
 * Create a new client
 * @param data - Client creation data
 * @returns Created client
 */
export async function createClient(data: {
    name: string;
    description?: string;
}) {
    return prisma.client.create({
        data: {
            name: data.name,
            description: data.description,
            status: EntityStatus.ACTIVE,
        },
        select: {
            id: true,
            name: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

/**
 * Update a client
 * @param id - Client ID
 * @param data - Update data
 * @returns Updated client
 */
export async function updateClient(
    id: string,
    data: { name?: string; description?: string | null }
) {
    return prisma.client.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

/**
 * Update client status
 * @param id - Client ID
 * @param status - New status
 * @returns Updated client
 */
export async function updateClientStatus(id: string, status: EntityStatus) {
    return prisma.client.update({
        where: { id },
        data: { status },
        select: {
            id: true,
            name: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}
