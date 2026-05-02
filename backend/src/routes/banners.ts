import { Router, RequestHandler } from 'express'
import { 
  getAllBanners, 
  getBannerById, 
  createBanner, 
  updateBanner, 
  deleteBanner, 
  toggleBanner, 
  reorderBanners 
} from '../controllers/banners.controller'
import { adminAuth, requirePermission } from '../middleware/auth.middleware'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Banners
 *   description: Hero slider banner management
 */

/**
 * @swagger
 * /api/banners:
 *   get:
 *     summary: Get all active banners
 *     tags: [Banners]
 *     parameters:
 *       - in: query
 *         name: all
 *         schema: { type: boolean }
 *         description: Include inactive banners (admin only)
 *     responses:
 *       200:
 *         description: List of banners
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Banner' }
 */
router.get('/', getAllBanners as RequestHandler)

/**
 * @swagger
 * /api/banners:
 *   post:
 *     summary: Create a banner
 *     tags: [Banners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Banner'
 *     responses:
 *       201:
 *         description: Created banner
 */
router.post('/', adminAuth, requirePermission('banners_manage'), createBanner as RequestHandler)

/**
 * @swagger
 * /api/banners/reorder:
 *   patch:
 *     summary: Update sort_order for multiple banners
 *     tags: [Banners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               banners:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     sort_order: { type: integer }
 *     responses:
 *       200:
 *         description: Banners reordered
 */
router.patch('/reorder', adminAuth, requirePermission('banners_manage'), reorderBanners as RequestHandler)

/**
 * @swagger
 * /api/banners/{id}:
 *   get:
 *     summary: Get a banner by ID
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Banner data
 */
router.get('/:id', getBannerById as RequestHandler)

/**
 * @swagger
 * /api/banners/{id}:
 *   patch:
 *     summary: Update a banner
 *     tags: [Banners]
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
 *             $ref: '#/components/schemas/Banner'
 *     responses:
 *       200:
 *         description: Updated banner
 */
router.patch('/:id', adminAuth, requirePermission('banners_manage'), updateBanner as RequestHandler)

/**
 * @swagger
 * /api/banners/{id}:
 *   delete:
 *     summary: Delete a banner
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Banner deleted
 */
router.delete('/:id', adminAuth, requirePermission('banners_manage'), deleteBanner as RequestHandler)

/**
 * @swagger
 * /api/banners/{id}/toggle:
 *   patch:
 *     summary: Toggles is_active boolean
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Updated banner
 */
router.patch('/:id/toggle', adminAuth, requirePermission('banners_manage'), toggleBanner as RequestHandler)


export default router
