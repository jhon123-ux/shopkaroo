import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { adminAuth } from '../middleware/auth.middleware'

const router = Router()

router.post('/login', authController.adminLogin)
router.post('/logout', authController.adminLogout)
router.get('/me', adminAuth, authController.getAdminMe)
router.post('/forgot-password', authController.forgotPassword)

export default router
