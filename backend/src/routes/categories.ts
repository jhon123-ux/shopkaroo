import { Router } from 'express'
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  toggleCategory 
} from '../controllers/categories.controller'
import { adminAuth } from '../middleware/auth.middleware'
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

router.post('/', adminAuth, validate(categorySchema), createCategory)

router.patch('/:id', adminAuth, validate(categorySchema.partial()), updateCategory)

router.delete('/:id', adminAuth, deleteCategory)

router.patch('/:id/toggle', adminAuth, toggleCategory)

export default router
