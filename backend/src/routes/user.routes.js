import express from 'express';
import { getUserProfile, toggleFollow, getAllUsers, getFollowers, getFollowing } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserProfile);
router.post('/:id/follow', protect, toggleFollow);
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);

export default router;
