import { Router } from 'express'
import { getOrders, getOrderById, createOrder, updateOrderStatus } from '../controllers/orders.controller'
import { adminAuth } from '../middleware/auth.middleware'

const router = Router()

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Order' }
 *                 count: { type: integer }
 */
router.get('/', adminAuth, getOrders)

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create an order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_name: { type: string }
 *               phone: { type: string }
 *               city: { type: string }
 *               address: { type: string }
 *               items: { type: array, items: { type: object } }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Created order
 */
router.post('/', createOrder)

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/:id', adminAuth, getOrderById)

/**
 * @swagger
 * /api/orders/{id}:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, confirmed, shipped, delivered, cancelled] }
 *     responses:
 *       200:
 *         description: Updated order
 */
router.patch('/:id', adminAuth, updateOrderStatus)

export default router
