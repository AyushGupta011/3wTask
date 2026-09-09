import { useState } from 'react';
import { Button } from '@mui/material';
import { toggleFollowAPI } from '../api/users';
import { useAuth } from '../context/AuthContext';

export default function FollowButton({ targetUserId, initialIsFollowing }) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  if (!user || user._id === targetUserId) return null;

  const handleToggle = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await toggleFollowAPI(targetUserId);
      setIsFollowing(res.data.data.isFollowing);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant={isFollowing ? "contained" : "outlined"}
      size="small"
      onClick={handleToggle}
      disabled={loading}
      sx={{ 
        borderRadius: 20, 
        textTransform: 'none', 
        px: 2,
        py: 0.3,
        fontSize: '0.75rem',
        borderColor: isFollowing ? 'transparent' : 'rgba(255,255,255,0.2)', 
        color: isFollowing ? '#0a0e17' : '#fff',
        bgcolor: isFollowing ? '#fff' : 'transparent',
        '&:hover': {
          bgcolor: isFollowing ? '#e2e8f0' : 'rgba(255,255,255,0.05)',
          borderColor: 'rgba(255,255,255,0.3)'
        }
      }}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}
