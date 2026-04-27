import { Router } from 'express'
import { 
  getOrders, 
  getOrderById, 
  createOrder, 
  updateOrderStatus,
  adminCreateOrder,
  adminDuplicateOrder
} from '../controllers/orders.controller'
import { adminAuth } from '../middleware/auth.middleware'

const router = Router()

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 */
router.get('/', adminAuth, getOrders)

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create an order
 *     tags: [Orders]
 */
router.post('/', createOrder)

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 */
router.get('/:id', adminAuth, getOrderById)

/**
 * @swagger
 * /api/orders/{id}:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 */
router.patch('/:id', adminAuth, updateOrderStatus)

/**
 * 🏭 Administrative Routes
 */
router.post('/admin/orders/create', adminAuth, adminCreateOrder)
router.post('/admin/orders/:id/duplicate', adminAuth, adminDuplicateOrder)

export default router
