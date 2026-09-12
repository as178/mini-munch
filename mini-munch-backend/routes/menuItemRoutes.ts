import { Router } from "express";
import {
  createMenuItemController,
  deleteMenuItemController,
  getAllMenuItemsController,
  getMenuItemController,
} from "../controllers/menuItemController";

// Express route handler; registers the table-related routes and maps them to their respective controllers
const router = Router();

/**
 * @openapi
 * /api/menu:
 *   get:
 *     summary: Retrieve all menu items
 *     description: Retrieves all menu item documents (or an empty array if no menu items exist).
 *     tags:
 *       - Menu Items
 *     responses:
 *       200:
 *         description: Menu items were retrieved successfully.
 *       500:
 *         description: Unexpected server error.
 */
router.get("/", getAllMenuItemsController);

/**
 * @openapi
 * /api/menu/{id}:
 *   get:
 *     summary: Retrieve a menu item by its ID
 *     description: Retrieves the menu item document which includes the menu item ID, name, description, and price, if successful.
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
router.get("/:id", getMenuItemController);

/**
 * @openapi
 * /api/menu:
 *   post:
 *     summary: Create a new menu item
 *     description: Creates a new menu item document with the provided name, description, and price. If successful, returns the created menu item document.
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
router.post("/", createMenuItemController);

/**
 * @openapi
 * /api/menu/{id}:
 *   delete:
 *     summary: Delete an existing menu item
 *     description: Deletes an existing menu item document by its ID. If successful, returns a success response with no content.
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
router.delete("/:id", deleteMenuItemController);

export default router;
