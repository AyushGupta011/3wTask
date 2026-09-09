import express from 'express';
import { getPosts, getPost, createPost, toggleLike, addComment } from '../controllers/post.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', protect, getPosts);
router.get('/:id', protect, getPost);
router.post('/', protect, upload.single('image'), createPost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);

export default router;
