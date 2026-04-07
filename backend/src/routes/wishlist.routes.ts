import { Router } from 'express';
import { toggleLike, getWishlist } from '../controllers/wishlist.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (user must be logged in via jwt auth middleware)
router.get('/', requireAuth, getWishlist);
router.post('/toggle', requireAuth, toggleLike);

export default router;
