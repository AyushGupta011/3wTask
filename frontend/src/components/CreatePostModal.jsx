import { useState, useRef } from 'react';
import { 
  Dialog, DialogContent, Button, IconButton, Box, CircularProgress, 
  Avatar, InputBase, Typography, Divider, Popover 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import GifBoxOutlinedIcon from '@mui/icons-material/GifBoxOutlined';
import { createPostAPI } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import EmojiPicker from 'emoji-picker-react';

export default function CreatePostModal({ open, onClose, onPostCreated }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);

  const fileInputRef = useRef();
  const gifInputRef = useRef();
  const inputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (gifInputRef.current) gifInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!text.trim() && !image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text);
      if (image) formData.append('image', image);

      const response = await createPostAPI(formData);
      onPostCreated(response.data.data.post);
      handleClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setText('');
    removeImage();
    setEmojiAnchorEl(null);
    onClose();
  };

  const onEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  const handleAddTag = () => {
    setText((prev) => prev + (prev.endsWith(' ') || prev === '' ? '@' : ' @'));
    inputRef.current?.focus();
  };

  const handleAddLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          
          const locationName = data.address.city || data.address.town || data.address.village || data.address.state || 'Unknown location';
          setText((prev) => prev + (prev ? '\n' : '') + `📍 at ${locationName}`);
        } catch (error) {
          console.error("Failed to fetch location name", error);
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location.");
        setLocationLoading(false);
      }
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth 
      PaperProps={{ 
        sx: { 
          bgcolor: '#0d121f', 
          borderRadius: 4,
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        } 
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2} pb={1.5}>
        <Typography variant="h6" fontWeight="bold" fontSize="1.1rem" color="text.primary">
          Create Post
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      <DialogContent sx={{ p: 2.5, pt: 2, pb: 1.5 }}>
        {/* Input Area */}
        <Box display="flex" gap={2} mb={2}>
          <Avatar src={user?.avatar} sx={{ width: 44, height: 44 }} />
          <InputBase
            inputRef={inputRef}
            fullWidth
            multiline
            minRows={3}
            maxRows={8}
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            sx={{ 
              color: '#f1f5f9', 
              fontSize: '1rem',
              mt: 1,
              '& .MuiInputBase-input::placeholder': {
                color: '#64748b',
                opacity: 1
              }
            }}
          />
        </Box>

        {/* Image Preview Area */}
        {imagePreview && (
          <Box position="relative" mb={3} ml={7.5} borderRadius={3} overflow="hidden" border="1px solid rgba(255,255,255,0.1)">
            <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} />
            <IconButton
              onClick={removeImage}
              size="small"
              sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                bgcolor: 'rgba(0,0,0,0.6)', 
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } 
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* Hidden inputs for Image & GIF */}
        <input
          type="file"
          accept="image/*"
          hidden
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <input
          type="file"
          accept=".gif"
          hidden
          ref={gifInputRef}
          onChange={handleImageChange}
        />

        {/* Toolbar & Post Button */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
          <Box display="flex" gap={0.5} color="primary.main">
            {/* Image */}
            <IconButton 
              onClick={() => fileInputRef.current.click()} 
              disabled={loading}
              sx={{ color: 'inherit', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' } }}
              title="Add Image"
            >
              <ImageOutlinedIcon />
            </IconButton>
            
            {/* Emoji */}
            <IconButton 
              onClick={(e) => setEmojiAnchorEl(e.currentTarget)} 
              disabled={loading}
              sx={{ color: 'inherit', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' } }}
              title="Add Emoji"
            >
              <EmojiEmotionsOutlinedIcon />
            </IconButton>

            {/* Tag/Mention */}
            <IconButton 
              onClick={handleAddTag} 
              disabled={loading}
              sx={{ color: 'inherit', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' } }}
              title="Mention Someone"
            >
              <AlternateEmailIcon />
            </IconButton>

            {/* GIF */}
            <IconButton 
              onClick={() => gifInputRef.current.click()} 
              disabled={loading}
              sx={{ color: 'inherit', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' } }}
              title="Add GIF"
            >
              <GifBoxOutlinedIcon />
            </IconButton>

            {/* Location */}
            <IconButton 
              onClick={handleAddLocation} 
              disabled={loading || locationLoading}
              sx={{ color: 'inherit', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' }, display: { xs: 'none', sm: 'inline-flex' } }}
              title="Add Location"
            >
              {locationLoading ? <CircularProgress size={24} color="inherit" /> : <LocationOnOutlinedIcon />}
            </IconButton>
          </Box>

          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading || (!text.trim() && !image)}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              borderRadius: 20,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' }
            }}
          >
            Post
          </Button>
        </Box>
      </DialogContent>

      {/* Emoji Picker Popover */}
      <Popover
        open={Boolean(emojiAnchorEl)}
        anchorEl={emojiAnchorEl}
        onClose={() => setEmojiAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: { mt: 1, bgcolor: 'transparent', boxShadow: 'none' }
        }}
      >
        <EmojiPicker theme="dark" onEmojiClick={onEmojiClick} />
      </Popover>
    </Dialog>
  );
}
