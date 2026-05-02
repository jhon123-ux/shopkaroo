import { Router, RequestHandler } from 'express'
import { getOfferBanner, updateOfferBanner } from '../controllers/offerBanner.controller'
import { adminAuth, requirePermission } from '../middleware/auth.middleware'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Offer Banner
 *   description: Single active countdown offer banner management
 */

/**
 * @swagger
 * /api/offer-banner:
 *   get:
 *     summary: Get the current active offer banner
 *     tags: [Offer Banner]
 *     responses:
 *       200:
 *         description: Active offer banner data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/OfferBanner'
 */
router.get('/', getOfferBanner as RequestHandler)

/**
 * @swagger
 * /api/offer-banner/{id}:
 *   patch:
 *     summary: Update the offer banner
 *     tags: [Offer Banner]
 *     security:
 *       - adminAuth: []
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
 *             $ref: '#/components/schemas/OfferBanner'
 *     responses:
 *       200:
 *         description: Updated offer banner
 */
router.patch('/:id', adminAuth, requirePermission('banners_manage'), updateOfferBanner as RequestHandler)

export default router
