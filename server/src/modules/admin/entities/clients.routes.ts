/**
 * @fileoverview Clients routes for admin client management
 * @module admin/entities/clients.routes
 */

import { Router } from 'express';
import * as clientsController from './clients.controller';
import { authenticate, requireAdmin } from '../../../middlewares/auth.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import {
    createClientSchema,
    updateClientSchema,
    updateClientStatusSchema,
} from './clients.schemas';

const router: Router = Router();

/**
 * @swagger
 * /admin/clients:
 *   get:
 *     summary: List all clients
 *     tags: [Admin - Clients]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, requireAdmin, clientsController.listClients);

/**
 * @swagger
 * /admin/clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Admin - Clients]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/',
    authenticate,
    requireAdmin,
    validate(createClientSchema),
    clientsController.createClient
);

/**
 * @swagger
 * /admin/clients/{id}:
 *   get:
 *     summary: Get a client by ID
 *     tags: [Admin - Clients]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, requireAdmin, clientsController.getClient);

/**
 * @swagger
 * /admin/clients/{id}:
 *   put:
 *     summary: Update a client
 *     tags: [Admin - Clients]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/:id',
    authenticate,
    requireAdmin,
    validate(updateClientSchema),
    clientsController.updateClient
);

/**
 * @swagger
 * /admin/clients/{id}/status:
 *   put:
 *     summary: Update client status
 *     tags: [Admin - Clients]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/:id/status',
    authenticate,
    requireAdmin,
    validate(updateClientStatusSchema),
    clientsController.updateClientStatus
);

export { router as clientsRouter };
