import Post from '../models/Post.js';
import asyncHandler from '../utils/asyncHandler.js';

const getPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const userId = req.query.userId;

  const query = userId ? { author: userId } : {};

  const total = await Post.countDocuments(query);

  const posts = await Post.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('author', 'username avatar');

  res.status(200).json({
    success: true,
    data: {
      posts,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    },
  });
});

const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username avatar')
    .populate('comments.user', 'username avatar');

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  res.status(200).json({
    success: true,
    data: {
      post,
    },
  });
});

const createPost = asyncHandler(async (req, res) => {
  const { text } = req.body;
  let image = undefined;

  if (req.file) {
    image = `/uploads/${req.file.filename}`;
  }

  if (!text && !image) {
    res.status(400);
    throw new Error('Post must have either text or an image');
  }

  const post = await Post.create({
    author: req.user._id,
    text,
    image,
  });

  await post.populate('author', 'username avatar');

  res.status(201).json({
    success: true,
    data: {
      post,
    },
  });
});

const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const isLiked = post.likes.some((id) => id.toString() === req.user._id.toString());

  if (isLiked) {
    post.likes.pull(req.user._id);
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();

  res.status(200).json({
    success: true,
    data: {
      likes: post.likes,
      likesCount: post.likes.length,
    },
  });
});

const addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const { text } = req.body;

  if (!text) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  post.comments.push({
    user: req.user._id,
    text,
  });

  const savedPost = await post.save();
  const newComment = savedPost.comments[savedPost.comments.length - 1];
  await savedPost.populate('comments.user', 'username avatar');

  const populatedComment = savedPost.comments.id(newComment._id);

  res.status(201).json({
    success: true,
    data: {
      comment: populatedComment,
    },
  });
});

export { getPosts, getPost, createPost, toggleLike, addComment };
