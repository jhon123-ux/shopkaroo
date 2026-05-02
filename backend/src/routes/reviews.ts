import { Router } from 'express'
import { getReviews, createReview, getAllReviewsAdmin, updateReviewStatus, deleteReview, approveReview, rejectReview } from '../controllers/reviews.controller'
import { adminAuth, requirePermission } from '../middleware/auth.middleware'

const router = Router()

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: product_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Review' }
 */
router.get('/', getReviews)

router.post('/', createReview)

/**
 * @swagger
 * /api/reviews/admin:
 *   get:
 *     summary: Get all reviews for admin (includes pending)
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: List of all reviews
 */
router.get('/admin', adminAuth, requirePermission('reviews_manage'), getAllReviewsAdmin)

/**
 * @swagger
 * /api/reviews/{id}:
 *   patch:
 *     summary: Update review status (approve/reject)
 *     tags: [Reviews]
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
 *               is_approved: { type: boolean }
 *     responses:
 *       200:
 *         description: Updated review
 */
router.patch('/:id', adminAuth, requirePermission('reviews_manage'), updateReviewStatus)

/**
 * @swagger
 * /api/reviews/{id}/approve:
 *   patch:
 *     summary: Approve a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Approved review
 */
router.patch('/:id/approve', adminAuth, requirePermission('reviews_manage'), approveReview)

/**
 * @swagger
 * /api/reviews/{id}/reject:
 *   patch:
 *     summary: Reject a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Message and rejected review
 */
router.patch('/:id/reject', adminAuth, requirePermission('reviews_manage'), rejectReview)

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: No content
 */
router.delete('/:id', adminAuth, requirePermission('reviews_manage'), deleteReview)

export default router
