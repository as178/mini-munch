import { Router } from "express";

const router = Router();

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Creates a draft order for a table with menu item snapshots.
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tableNumber
 *               - items
 *               - total
 *             properties:
 *               tableNumber:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - menuItem
 *                     - name
 *                     - price
 *                     - quantity
 *                   properties:
 *                     menuItem:
 *                       type: string
 *                     name:
 *                       type: string
 *                       minLength: 2
 *                       maxLength: 50
 *                     price:
 *                       type: number
 *                       minimum: 0
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 10
 *               total:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Draft order was created successfully.
 *       400:
 *         description: Invalid order data.
 *       404:
 *         description: Table or menu item does not exist.
 *       500:
 *         description: Unexpected server error.
 */

/**
 * @openapi
 * /api/orders/table/{tableNumber}:
 *   get:
 *     summary: Get all orders for a table
 *     description: Returns all the orders for a specific table.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: tableNumber
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *     responses:
 *       200:
 *         description: Orders were retrieved successfully.
 *       400:
 *         description: Invalid table number.
 *       404:
 *         description: No orders exist for this table.
 *       500:
 *         description: Unexpected server error.
 */

/**
 * @openapi
 * /api/orders/{id}/items:
 *   post:
 *     summary: Add an order item to an order
 *     description: Adds an existing menu item to a draft order and stores its current name and price as a snapshot.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuItem
 *               - quantity
 *             properties:
 *               menuItem:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *     responses:
 *       201:
 *         description: Item was added to the order successfully.
 *       400:
 *         description: Invalid menu item or quantity.
 *       404:
 *         description: Order or menu item does not exist.
 *       409:
 *         description: Order cannot be modified because it is not in DRAFT status.
 *       500:
 *         description: Unexpected server error.
 */

/**
 * @openapi
 * /api/orders/{id}/items/{menuItemId}:
 *   patch:
 *     summary: Change an order item's quantity
 *     description: Changes the quantity of an existing order item in a DRAFT order. The item can remain in the order even if it has been removed from the menu.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: menuItemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *     responses:
 *       200:
 *         description: Item quantity was updated successfully.
 *       400:
 *         description: Invalid item ID or quantity.
 *       404:
 *         description: Order or ordered item does not exist.
 *       409:
 *         description: Order cannot be modified because it is not in DRAFT status.
 *       500:
 *         description: Unexpected server error.
 */

/**
 * @openapi
 * /api/orders/{id}/items/{menuItemId}:
 *   delete:
 *     summary: Remove an order item from an order
 *     description: Removes an order item from a DRAFT order. The item may already have been removed from the menu.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: menuItemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Item was removed from the order successfully.
 *       400:
 *         description: Invalid item ID.
 *       404:
 *         description: Order or ordered item does not exist.
 *       409:
 *         description: Order cannot be modified because it is not in DRAFT status.
 *       500:
 *         description: Unexpected server error.
 */

/**
 * @openapi
 * /api/orders/{id}/submit:
 *   patch:
 *     summary: Submit an order
 *     description: Changes an order status from DRAFT to SUBMITTED.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order was submitted successfully.
 *       400:
 *         description: Order cannot be submitted.
 *       404:
 *         description: Order does not exist.
 *       409:
 *         description: Order does not have DRAFT status.
 *       500:
 *         description: Unexpected server error.
 */

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     description: Returns orders from all tables.
 *     tags:
 *       - Orders
 *     responses:
 *       200:
 *         description: Orders were retrieved successfully.
 *       500:
 *         description: Unexpected server error.
 */

/**
 * @openapi
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update an order's status
 *     description: Changes an order status from SUBMITTED to PREPARING to READY.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [SUBMITTED, PREPARING, READY]
 *     responses:
 *       200:
 *         description: Order status was updated successfully.
 *       400:
 *         description: Invalid order status.
 *       404:
 *         description: Order does not exist.
 *       409:
 *         description: Invalid order status transition.
 *       500:
 *         description: Unexpected server error.
 */

/**
 * @openapi
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     description: Deletes an order.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order was deleted successfully.
 *       400:
 *         description: Order cannot be deleted in its current state.
 *       404:
 *         description: Order does not exist.
 *       500:
 *         description: Unexpected server error.
 */

export default router;
