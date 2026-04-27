import { Router } from 'express'
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, toggleProduct } from '../controllers/products.controller'
import { adminAuth } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate'
import { productSchema } from '../schemas'

const router = Router()

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 */
router.get('/', getProducts)

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a product
 *     tags: [Products]
 */
router.post('/', adminAuth, validate(productSchema), createProduct)

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 */
router.get('/:id', getProductById)

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
 */
router.patch('/:id', adminAuth, validate(productSchema.partial()), updateProduct)

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 */
router.delete('/:id', adminAuth, deleteProduct)

/**
 * @swagger
 * /api/products/{id}/toggle:
 *   patch:
 *     summary: Toggle product active status
 *     tags: [Products]
 */
router.patch('/:id/toggle', adminAuth, toggleProduct)

export default router
