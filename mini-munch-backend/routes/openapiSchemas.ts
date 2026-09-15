/**
 * @openapi
 * components:
 *   schemas:
 *
 *     Table:
 *       type: object
 *       required:
 *         - _id
 *         - tableNumber
 *         - available
 *       properties:
 *         _id:
 *           type: string
 *         tableNumber:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *         available:
 *           type: boolean
 *
 *     OrderTable:
 *       type: object
 *       required:
 *         - _id
 *         - tableNumber
 *       properties:
 *         _id:
 *           type: string
 *         tableNumber:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *
 *     MenuItem:
 *       type: object
 *       required:
 *         - _id
 *         - name
 *         - description
 *         - price
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         description:
 *           type: string
 *           minLength: 5
 *           maxLength: 150
 *         price:
 *           type: number
 *           minimum: 0
 *
 *     OrderItem:
 *       type: object
 *       required:
 *         - menuItem
 *         - name
 *         - price
 *         - quantity
 *       properties:
 *         menuItem:
 *           type: string
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         price:
 *           type: number
 *           minimum: 0
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *
 *     Order:
 *       type: object
 *       required:
 *         - _id
 *         - table
 *         - items
 *         - total
 *         - status
 *         - createdAt
 *       properties:
 *         _id:
 *           type: string
 *         table:
 *           $ref: '#/components/schemas/OrderTable'
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         total:
 *           type: number
 *           minimum: 0
 *         status:
 *           type: string
 *           enum:
 *             - DRAFT
 *             - SUBMITTED
 *             - PREPARING
 *             - READY
 *         createdAt:
 *           type: string
 *           format: date-time
 */
