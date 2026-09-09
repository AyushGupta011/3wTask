import User from '../models/User.js';
import Post from '../models/Post.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const userId = user._id;

  // Calculate real stats for this user
  const postsCount = await Post.countDocuments({ author: userId });
  const likedCount = await Post.countDocuments({ likes: userId });
  
  // Count total comments made by this user across all posts
  const postsWithUserComments = await Post.find({ 'comments.user': userId });
  let commentedCount = 0;
  postsWithUserComments.forEach(post => {
    commentedCount += post.comments.filter(c => c.user.toString() === userId.toString()).length;
  });

  res.status(200).json({
    success: true,
    data: {
      user,
      stats: {
        posts: postsCount,
        liked: likedCount,
        commented: commentedCount
      }
    },
  });
});

export const toggleFollow = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;

  if (targetUserId.toString() === currentUserId.toString()) {
    res.status(400);
    throw new Error('You cannot follow yourself');
  }

  const targetUser = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!targetUser || !currentUser) {
    res.status(404);
    throw new Error('User not found');
  }

  const isFollowing = currentUser.following.includes(targetUserId);

  if (isFollowing) {
    // Unfollow
    currentUser.following.pull(targetUserId);
    targetUser.followers.pull(currentUserId);
  } else {
    // Follow
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);
  }

  await currentUser.save();
  await targetUser.save();

  res.status(200).json({
    success: true,
    data: {
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: targetUser.following.length,
    }
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } })
    .select('username avatar followers')
    .limit(5);
  res.status(200).json({ success: true, data: users });
});

export const getFollowers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('followers', 'username avatar followers');
  res.status(200).json({ success: true, data: user.followers });
});

export const getFollowing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('following', 'username avatar followers');
  res.status(200).json({ success: true, data: user.following });
});
