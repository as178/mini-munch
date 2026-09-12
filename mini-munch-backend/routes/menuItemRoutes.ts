import { Router } from "express";

const router = Router();

/**
 * @openapi
 * /api/menu:
 *   get:
 *     summary: Retrieve all menu items
 *     tags:
 *       - Menu Items
 *     responses:
 *       200:
 *         description: Menu items was retrieved successfully.
 *       500:
 *         description: Unexpected server error.
 */

/**
 * @openapi
 * /api/menu/{id}:
 *   get:
 *     summary: Retrieve a menu item by its ID
 *     tags:
 *       - Menu Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu item was retrieved successfully.
 *       400:
 *         description: Invalid menu item ID.
 *       404:
 *         description: Menu item does not exist.
 *       500:
 *         description: Unexpected server error.
 */

/**
 * @openapi
 * /api/menu:
 *   post:
 *     summary: Create a new menu item
 *     tags:
 *       - Menu Items
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               description:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 150
 *               price:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Menu item was created successfully.
 *       400:
 *         description: Invalid menu item data.
 *       409:
 *         description: Menu item already exists.
 *       500:
 *         description: Unexpected server error.
 */

/**
 * @openapi
 * /api/menu/{id}:
 *   delete:
 *     summary: Delete an existing menu item
 *     tags:
 *       - Menu Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Menu item was deleted successfully.
 *       400:
 *         description: Invalid menu item ID.
 *       404:
 *         description: Menu item does not exist.
 *       500:
 *         description: Unexpected server error.
 */

export default router;
