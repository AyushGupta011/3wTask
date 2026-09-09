import { useState, useEffect } from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAuth } from '../context/AuthContext';
import { toggleLikeAPI } from '../api/posts';

export default function LikeButton({ likes, postId, onLikeToggle }) {
  const { user } = useAuth();

  // Check if current user has liked — compare as strings since likes may contain ObjectId strings
  const checkIsLiked = (likesArr) =>
    likesArr.some((id) => (id?._id || id)?.toString() === user?._id?.toString());

  const [liked, setLiked] = useState(checkIsLiked(likes));
  const [likeCount, setLikeCount] = useState(likes.length);
  const [loading, setLoading] = useState(false);

  // Sync with parent props when they change
  useEffect(() => {
    setLiked(checkIsLiked(likes));
    setLikeCount(likes.length);
  }, [likes, user]);

  const handleLike = async () => {
    if (loading) return;
    const previousLiked = liked;
    const previousCount = likeCount;

    // Optimistic update
    setLiked(!liked);
    setLikeCount(!liked ? likeCount + 1 : likeCount - 1);
    setLoading(true);

    try {
      const response = await toggleLikeAPI(postId);
      // response.data = { success, data: { likes, likesCount } }
      const likesData = response.data.data;
      onLikeToggle(likesData);
      // Sync with server state
      setLiked(checkIsLiked(likesData.likes));
      setLikeCount(likesData.likesCount);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert on error
      setLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" alignItems="center" sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }} onClick={handleLike}>
      <IconButton disabled={loading} size="small" disableRipple sx={{ p: 1 }}>
        {liked ? (
          <FavoriteIcon sx={{ color: '#ef4444', fontSize: 22 }} />
        ) : (
          <FavoriteBorderIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
        )}
      </IconButton>
      <Typography variant="body2" color="text.secondary" ml={0.5} fontWeight={500}>
        {likeCount}
      </Typography>
    </Box>
  );
}
