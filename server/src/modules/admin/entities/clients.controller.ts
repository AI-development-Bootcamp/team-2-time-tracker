/**
 * @fileoverview Clients controller for admin client management
 * @module admin/entities/clients.controller
 */

import { Request, Response, NextFunction } from 'express';
import * as clientsService from './clients.service';

/**
 * List all clients
 */
export async function listClients(_req: Request, res: Response, next: NextFunction) {
    try {
        const clients = await clientsService.listClients();

        res.json({
            success: true,
            data: clients,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get a single client by ID
 */
export async function getClient(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const client = await clientsService.getClientById(id);

        res.json({
            success: true,
            data: client,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Create a new client
 */
export async function createClient(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, description } = req.body;
        const client = await clientsService.createClient({ name, description });

        res.status(201).json({
            success: true,
            data: client,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update a client
 */
export async function updateClient(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const { name, description } = req.body;
        const client = await clientsService.updateClient(id, { name, description });

        res.json({
            success: true,
            data: client,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update client status
 */
export async function updateClientStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const { status } = req.body;
        const client = await clientsService.updateClientStatus(id, status);

        res.json({
            success: true,
            data: client,
        });
    } catch (error) {
        next(error);
    }
}
