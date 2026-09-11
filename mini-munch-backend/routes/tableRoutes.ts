import { Router } from "express";
import {
  getTableController,
  occupyTableController,
  releaseTableController,
} from "../controllers/tableController";

const router = Router();

/**
 * @openapi
 * /api/tables/{tableNumber}:
 *   get:
 *     summary: Get a table
 *     description: Checks whether a table exists and returns its availability.
 *     tags:
 *       - Tables
 *     parameters:
 *       - in: path
 *         name: tableNumber
 *         required: true
 *         description: The number of the table to check.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *     responses:
 *       200:
 *         description: Table found successfully.
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
 *     summary: Occupy a table
 *     description: Marks an available table as occupied.
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
 *     summary: Release a table
 *     description: Marks an occupied table as available.
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
