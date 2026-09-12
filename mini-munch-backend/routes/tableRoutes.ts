import { Router } from "express";
import {
  getTableController,
  occupyTableController,
  releaseTableController,
} from "../controllers/tableController";

// Express route handler; registers the table-related routes and maps them to their respective controllers
const router = Router();

/**
 * @openapi
 * /api/tables/{tableNumber}:
 *   get:
 *     summary: Retrieve a table by its number
 *     description: Retrieves the table document which includes the table ID, table number, and availability status, if successful.
 *     tags:
 *       - Tables
 *     parameters:
 *       - in: path
 *         name: tableNumber
 *         required: true
 *         description: The number of the table to retrieve.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *     responses:
 *       200:
 *         description: Table was retrieved successfully.
 *       400:
 *         description: Invalid table number.
 *       404:
 *         description: Table does not exist.
 *       500:
 *         description: Unexpected server error.
 */
router.get("/:tableNumber", getTableController);

/**
 * @openapi
 * /api/tables/{tableNumber}/occupy:
 *   patch:
 *     summary: Occupy a table by its number
 *     description: Checks table availability and occupies the table if it is available. If successful, returns the updated table document.
 *     tags:
 *       - Tables
 *     parameters:
 *       - in: path
 *         name: tableNumber
 *         required: true
 *         description: The number of the table to occupy.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *     responses:
 *       200:
 *         description: Table was occupied successfully.
 *       400:
 *         description: Invalid table number.
 *       404:
 *         description: Table does not exist.
 *       409:
 *         description: Table is already occupied.
 *       500:
 *         description: Unexpected server error.
 */
router.patch("/:tableNumber/occupy", occupyTableController);

/**
 * @openapi
 * /api/tables/{tableNumber}/release:
 *   patch:
 *     summary: Release a table from being occupied by its number
 *     description: Checks table availability and releases the table if it is occupied. If successful, returns the updated table document.
 *     tags:
 *       - Tables
 *     parameters:
 *       - in: path
 *         name: tableNumber
 *         required: true
 *         description: The number of the table to release.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *     responses:
 *       200:
 *         description: Table was released successfully.
 *       400:
 *         description: Invalid table number.
 *       404:
 *         description: Table does not exist.
 *       409:
 *         description: Table is already available.
 *       500:
 *         description: Unexpected server error.
 */
router.patch("/:tableNumber/release", releaseTableController);

export default router;
