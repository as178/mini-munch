import { Router } from "express";

const router = Router();

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Create a DRAFT status order
 *     description: Creates an empty DRAFT status order for an occupied table.
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
 *             properties:
 *               tableNumber:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *     responses:
 *       201:
 *         description: Draft order was created successfully.
 *       400:
 *         description: Invalid table number.
 *       404:
 *         description: Table does not exist.
 *       409:
 *         description: Table is not occupied.
 *       500:
 *         description: Unexpected server error.
 */

/**
 * @openapi
 * /api/orders/{id}/items:
 *   post:
 *     summary: Add an item to a DRAFT status order
 *     description: Adds an existing menu item to the order and stores its current name and price as a snapshot. Deleted menu items cannot be added to new orders.
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
 *               - menuItemId
 *               - quantity
 *             properties:
 *               menuItemId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *     responses:
 *       200:
 *         description: Order item was added successfully.
 *       400:
 *         description: Invalid order data, including an invalid order ID, menu item ID, or quantity exceeding 10.
 *       404:
 *         description: Order or menu item does not exist.
 *       409:
 *         description: Order is not in DRAFT status.
 *       500:
 *         description: Unexpected server error.
 */

/**
 * @openapi
 * /api/orders/{id}/items/{menuItemId}:
 *   delete:
 *     summary: Remove an item from a DRAFT status order
 *     description: Removes an order item by menu item ID. This works from the stored snapshot even if the menu item was deleted.
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
 *         description: Item was removed successfully.
 *       400:
 *         description: Invalid order ID or menu item ID.
 *       404:
 *         description: Order or order item does not exist.
 *       409:
 *         description: Order is not in DRAFT status.
 *       500:
 *         description: Unexpected server error.
 */

/**
 * @openapi
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update an order status
 *     description: Updates an order through the valid workflow transitions DRAFT to SUBMITTED, SUBMITTED to PREPARING, and PREPARING to READY.
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
 *         description: Invalid order data, including an invalid order ID, status, or an order with no items.
 *       404:
 *         description: Order does not exist.
 *       409:
 *         description: Invalid status transition.
 *       500:
 *         description: Unexpected server error.
 */

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Get all orders for the staff dashboard
 *     description: Returns SUBMITTED, PREPARING, and READY orders for the staff dashboard.
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
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     description: Deletes a READY status order.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Order was deleted successfully.
 *       400:
 *         description: Invalid order ID.
 *       404:
 *         description: Order does not exist.
 *       409:
 *         description: Order status is not READY.
 *       500:
 *         description: Unexpected server error.
 */

export default router;
