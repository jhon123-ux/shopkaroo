import { Router } from 'express'
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  toggleCategory 
} from '../controllers/categories.controller'
import { adminAuth, requirePermission } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate'
import { categorySchema } from '../schemas'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: CMS-Controlled Classifications
 */

router.get('/', getCategories)

router.post('/', adminAuth, requirePermission('categories_manage'), validate(categorySchema), createCategory)

router.patch('/:id', adminAuth, requirePermission('categories_manage'), validate(categorySchema.partial()), updateCategory)

router.delete('/:id', adminAuth, requirePermission('categories_manage'), deleteCategory)

router.patch('/:id/toggle', adminAuth, requirePermission('categories_manage'), toggleCategory)

export default router
