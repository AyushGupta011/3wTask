import { useState } from 'react';
import { Box, Avatar, Typography, TextField, IconButton, Divider, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { formatDistanceToNow } from 'date-fns';
import { addCommentAPI } from '../api/posts';

export default function CommentSection({ comments, postId, onCommentAdded }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const response = await addCommentAPI(postId, text);
      // response.data = { success, data: { comment } }
      const newComment = response.data.data.comment;
      onCommentAdded(newComment);
      setText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Backend populates comments with "user" field (not "author")
  const getCommentUser = (comment) => comment.user || comment.author || {};

  return (
    <Box mt={2}>
      <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.06)' }} />
      <Box display="flex" flexDirection="column" gap={2} mb={2}>
        {comments.map((comment) => {
          const commentUser = getCommentUser(comment);
          return (
            <Box key={comment._id} display="flex" gap={1.5}>
              <Avatar src={commentUser.avatar} sx={{ width: 28, height: 28 }} />
              <Box bgcolor="background.default" p={1.5} borderRadius={2} flex={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="body2" fontWeight="bold">
                    {commentUser.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {comment.createdAt
                      ? `${formatDistanceToNow(new Date(comment.createdAt))} ago`
                      : 'just now'}
                  </Typography>
                </Box>
                <Typography variant="body2">{comment.text}</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box component="form" onSubmit={handleSubmit} display="flex" gap={1} alignItems="center">
        <TextField
          fullWidth
          size="small"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 20 } }}
        />
        <IconButton type="submit" disabled={!text.trim() || loading} color="primary">
          {loading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}
