import { Router } from 'express'
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  toggleCategory 
} from '../controllers/categories.controller'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: CMS-Controlled Classifications
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Retrieve active or all categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *         description: Include inactive categories (Administrative view)
 */
router.get('/', getCategories)

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category exhibit
 *     tags: [Categories]
 */
router.post('/', createCategory)

/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     summary: Update an existing classification manifest
 *     tags: [Categories]
 */
router.patch('/:id', updateCategory)

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Expunge classification from registry
 *     tags: [Categories]
 */
router.delete('/:id', deleteCategory)

/**
 * @swagger
 * /api/categories/{id}/toggle:
 *   patch:
 *     summary: Toggle visibility status of classification
 *     tags: [Categories]
 */
router.patch('/:id/toggle', toggleCategory)

export default router
