import { useState } from 'react';
import { Card, CardMedia, Avatar, Typography, Box, IconButton, Collapse, Button, Divider } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_URL = API_BASE_URL.replace('/api', '');

export default function PostCard({ post, onPostUpdate }) {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const handleLikeToggle = (likesData) => {
    const updated = { ...localPost, likes: likesData.likes, likesCount: likesData.likesCount };
    setLocalPost(updated);
    onPostUpdate(updated);
  };

  const handleCommentAdded = (newComment) => {
    const updatedComments = [...(localPost.comments || []), newComment];
    const updated = { ...localPost, comments: updatedComments, commentsCount: updatedComments.length };
    setLocalPost(updated);
    onPostUpdate(updated);
  };

  const username = localPost.author?.username || 'User';
  const handle = `@${username.toLowerCase().replace(/\s+/g, '')}`;

  return (
    <Card sx={{ 
      mb: 0, 
      bgcolor: '#0d121f', 
      borderRadius: 4, 
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow: 'none'
    }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" p={2.5} pb={1.5}>
        <Box display="flex" gap={2}>
          <Avatar 
            src={localPost.author?.avatar} 
            sx={{ width: 48, height: 48, cursor: 'pointer', '&:hover': { opacity: 0.8 } }} 
            onClick={() => navigate(`/profile/${localPost.author?._id}`)}
          />
          <Box display="flex" flexDirection="column" justifyContent="center">
            <Typography 
              fontWeight="700" 
              fontSize="1rem" 
              color="text.primary" 
              sx={{ lineHeight: 1.2, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => navigate(`/profile/${localPost.author?._id}`)}
            >
              {username}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, fontSize: '0.85rem' }}>
              {handle}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, fontSize: '0.75rem' }}>
              {localPost.createdAt ? `${formatDistanceToNow(new Date(localPost.createdAt))} ago` : 'just now'}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" gap={1.5}>
          <Button 
            variant="outlined" 
            size="small" 
            sx={{ 
              borderRadius: 20, 
              textTransform: 'none', 
              fontSize: '0.8rem',
              fontWeight: 600,
              py: 0.2,
              px: 2,
              borderColor: 'rgba(59, 130, 246, 0.5)',
              '&:hover': {
                borderColor: '#3b82f6',
                bgcolor: 'rgba(59, 130, 246, 0.05)'
              }
            }}
          >
            Follow
          </Button>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <MoreHorizIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Text Content */}
      {localPost.text && (
        <Box px={2.5} pb={localPost.image ? 2 : 2.5}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#f1f5f9', fontSize: '0.95rem' }}>
            {localPost.text}
          </Typography>
        </Box>
      )}

      {/* Image Content */}
      {localPost.image && (
        <Box px={2} pb={2}>
          <CardMedia
            component="img"
            image={getImageUrl(localPost.image)}
            alt="Post media"
            sx={{
              maxHeight: 500,
              objectFit: 'cover',
              width: '100%',
              borderRadius: 3,
            }}
          />
        </Box>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Action Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" p={1} px={3}>
        <LikeButton
          likes={localPost.likes || []}
          postId={localPost._id}
          onLikeToggle={handleLikeToggle}
        />
        
        <Box 
          display="flex" 
          alignItems="center" 
          sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }} 
          onClick={() => setShowComments(!showComments)}
        >
          <IconButton size="small" disableRipple sx={{ color: 'text.secondary' }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 22 }} />
          </IconButton>
          <Typography variant="body2" color="text.secondary" ml={0.5} fontWeight={500}>
            {localPost.comments?.length || 0}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
          <IconButton size="small" disableRipple sx={{ color: 'text.secondary' }}>
            <ShareOutlinedIcon sx={{ fontSize: 22 }} />
          </IconButton>
          <Typography variant="body2" color="text.secondary" ml={0.5} fontWeight={500}>
            0
          </Typography>
        </Box>
      </Box>

      {/* Comments Section */}
      <Collapse in={showComments} timeout="auto" unmountOnExit>
        <Box p={2.5} pt={0} borderTop="1px solid rgba(255,255,255,0.06)">
          <CommentSection
            comments={localPost.comments || []}
            postId={localPost._id}
            onCommentAdded={handleCommentAdded}
          />
        </Box>
      </Collapse>
    </Card>
  );
}
