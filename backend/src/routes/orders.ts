import { Router } from 'express'
import { 
  getOrders, 
  getOrderById, 
  createOrder, 
  updateOrderStatus,
  adminCreateOrder,
  adminDuplicateOrder,
  adminSearchCustomer,
  exportOrdersExcel
} from '../controllers/orders.controller'
import { adminAuth, requirePermission } from '../middleware/auth.middleware'

const router = Router()

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 */
router.get('/', adminAuth, requirePermission('orders_view'), getOrders)

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
router.get('/:id', adminAuth, requirePermission('orders_view'), getOrderById)

/**
 * @swagger
 * /api/orders/{id}:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 */
router.patch('/:id', adminAuth, requirePermission('orders_status_update'), updateOrderStatus)

/**
 * 🏭 Administrative Routes
 */
router.get('/admin/orders/export/excel', adminAuth, requirePermission('orders_export'), exportOrdersExcel)
router.post('/admin/orders/create', adminAuth, requirePermission('orders_create'), adminCreateOrder)
router.post('/admin/orders/:id/duplicate', adminAuth, requirePermission('orders_create'), adminDuplicateOrder)
router.get('/admin/customers/search', adminAuth, requirePermission('orders_view'), adminSearchCustomer)

export default router
