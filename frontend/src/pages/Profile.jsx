import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Avatar, Tabs, Tab, CircularProgress, Container, Grid, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import DiamondIcon from '@mui/icons-material/Diamond';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import FollowButton from '../components/FollowButton';
import { getUserProfileAPI, toggleFollowAPI, getFollowersAPI, getFollowingAPI } from '../api/users';
import { getPostsAPI } from '../api/posts';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ posts: 0, liked: 0, commented: 0 });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const [followModal, setFollowModal] = useState({ open: false, type: 'followers', data: [] });
  const [modalLoading, setModalLoading] = useState(false);

  const openFollowModal = async (type) => {
    setFollowModal({ open: true, type, data: [] });
    setModalLoading(true);
    try {
      const res = type === 'followers' ? await getFollowersAPI(id) : await getFollowingAPI(id);
      setFollowModal({ open: true, type, data: res.data.data });
    } catch (e) {
      console.error(e);
    } finally {
      setModalLoading(false);
    }
  };

  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const userRes = await getUserProfileAPI(id);
        const fetchedUser = userRes.data.data.user;
        setUser(fetchedUser);
        setStats(userRes.data.data.stats);
        setIsFollowing(fetchedUser.followers?.includes(currentUser?._id));
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [id, currentUser]);

  useEffect(() => {
    const fetchTabPosts = async () => {
      if (tabValue === 1) return; // Promotions (not implemented yet)
      setTabLoading(true);
      try {
        let postsRes;
        if (tabValue === 0) {
          postsRes = await getPostsAPI(1, 10, id, null, null);
        } else if (tabValue === 2) {
          postsRes = await getPostsAPI(1, 10, null, id, null);
        } else if (tabValue === 3) {
          postsRes = await getPostsAPI(1, 10, null, null, id);
        }
        if (postsRes) {
          setPosts(postsRes.data.data.posts);
        }
      } catch (error) {
        console.error('Failed to load tab posts:', error);
      } finally {
        setTabLoading(false);
      }
    };
    
    // Only fetch if profile has finished loading and we aren't on promotions tab
    if (!loading && tabValue !== 1) {
      fetchTabPosts();
    }
  }, [tabValue, id, loading]);

  const handlePostUpdate = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  const handleFollowToggle = async () => {
    if (!currentUser || currentUser._id === id) return;
    
    setFollowLoading(true);
    try {
      const res = await toggleFollowAPI(id);
      const { isFollowing: newIsFollowing, followersCount } = res.data.data;
      setIsFollowing(newIsFollowing);
      
      // Optmistically update local followers count
      setUser(prev => {
        let updatedFollowers = [...(prev.followers || [])];
        if (newIsFollowing) {
          updatedFollowers.push(currentUser._id);
        } else {
          updatedFollowers = updatedFollowers.filter(fid => fid !== currentUser._id);
        }
        return { ...prev, followers: updatedFollowers };
      });
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <Box minHeight="100vh" bgcolor="#0a0e17">
        <Navbar />
        <Box display="flex" justifyContent="center" pt={10}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!user) return null;

  const handle = `@${user.username.toLowerCase().replace(/\s+/g, '')}`;
  const isOwnProfile = currentUser?._id === id;

  return (
    <Box minHeight="100vh" bgcolor="#0a0e17" pb={10}>
      <Navbar />

      {/* Cover Image Area */}
      <Box 
        position="relative" 
        height={{ xs: 150, sm: 200 }} 
        sx={{
          backgroundColor: '#1e293b',
          backgroundImage: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <IconButton 
          sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16,
            bgcolor: 'background.paper',
            color: 'primary.main',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <ShareIcon />
        </IconButton>
      </Box>

      <Container maxWidth="sm" sx={{ px: 0 }}>
        {/* Profile Header */}
        <Box px={2} position="relative">
          <Box display="flex" justifyContent="space-between" alignItems="flex-end" mt={-5}>
            <Avatar 
              src={user.avatar} 
              sx={{ 
                width: 100, 
                height: 100, 
                border: '4px solid #0a0e17',
                bgcolor: '#131a2b'
              }} 
            />
            <Box display="flex" gap={1.5} mb={1}>
              <Button 
                variant="outlined" 
                size="small"
                sx={{ borderRadius: 20, textTransform: 'none', px: 3, borderColor: 'rgba(255,255,255,0.1)', color: 'primary.main' }}
              >
                Chat
              </Button>
              {!isOwnProfile && (
                <Button 
                  variant={isFollowing ? "contained" : "outlined"}
                  size="small"
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  sx={{ 
                    borderRadius: 20, 
                    textTransform: 'none', 
                    px: 3, 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    color: isFollowing ? '#0a0e17' : '#fff',
                    bgcolor: isFollowing ? '#fff' : 'transparent',
                    '&:hover': {
                      bgcolor: isFollowing ? '#e2e8f0' : 'rgba(255,255,255,0.05)',
                      borderColor: 'rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </Box>
          </Box>
          
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {user.username}
                </Typography>
                <DiamondIcon sx={{ color: '#3b82f6', fontSize: 18 }} />
              </Box>
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Box bgcolor="rgba(245, 158, 11, 0.1)" color="#f59e0b" px={1} py={0.2} borderRadius={1} display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="caption" fontWeight="bold">7</Typography>
                  <Typography variant="caption">Legend</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {handle}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1} color="text.secondary">
                <Typography variant="body2">Male</Typography>
                <Typography variant="body2">•</Typography>
                <EventIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2">
                  Joined {format(new Date(user.createdAt || Date.now()), 'MMM yyyy')}
                </Typography>
              </Box>
              
              <Box display="flex" gap={3} mt={2}>
                <Box onClick={() => openFollowModal('following')} sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
                  <Typography variant="h6" fontWeight="bold" color="text.primary" lineHeight={1}>
                    {user.following?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Following</Typography>
                </Box>
                <Box borderLeft="1px solid rgba(255,255,255,0.1)" pl={3} onClick={() => openFollowModal('followers')} sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
                  <Typography variant="h6" fontWeight="bold" color="text.primary" lineHeight={1}>
                    {user.followers?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Followers</Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={6} textAlign="right">
              <Typography variant="caption" color="text.secondary">Earned Points</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                {(user.points || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Total Promotions
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {user.promotions || 0}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Tabs */}
        <Box mt={3} borderBottom="1px solid rgba(255,255,255,0.06)">
          <Tabs 
            value={tabValue} 
            onChange={(e, val) => setTabValue(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                minWidth: 'auto',
                px: 2,
                color: 'text.secondary'
              },
              '& .Mui-selected': {
                color: 'primary.main',
                fontWeight: 'bold'
              }
            }}
          >
            <Tab label={`Posts (${stats.posts})`} />
            <Tab label={`Promotions (${user.promotions || 0})`} />
            <Tab label={`Liked (${stats.liked})`} />
            <Tab label={`Commented (${stats.commented})`} />
          </Tabs>
        </Box>

        {/* Feed Content */}
        <Box pt={3}>
          {tabLoading ? (
            <Box textAlign="center" py={8}>
              <CircularProgress size={24} sx={{ mb: 2 }} />
              <Typography color="text.secondary">Loading posts...</Typography>
            </Box>
          ) : (
            <>
              {(tabValue === 0 || tabValue === 2 || tabValue === 3) && (
                posts.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography color="text.secondary">No posts found.</Typography>
                  </Box>
                ) : (
                  posts.map((post) => (
                    <Box key={post._id} mb={3}>
                      <PostCard post={post} onPostUpdate={handlePostUpdate} />
                    </Box>
                  ))
                )
              )}
              {tabValue === 1 && (
                <Box textAlign="center" py={8}>
                  <Typography color="text.secondary">Promotions feature coming soon.</Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Container>
      
      {/* FAB */}
      <IconButton 
        color="primary" 
        onClick={() => navigate('/feed')}
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          bgcolor: 'primary.main',
          color: '#fff',
          width: 56,
          height: 56,
          '&:hover': { bgcolor: 'primary.dark' }
        }}
      >
        <AddIcon />
      </IconButton>

      {/* Followers/Following Modal */}
      <Dialog open={followModal.open} onClose={() => setFollowModal({...followModal, open: false})} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: '#131a2b', borderRadius: 3, backgroundImage: 'none' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1rem', py: 2 }}>
          {followModal.type === 'followers' ? 'Followers' : 'Following'}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {modalLoading ? <Box p={4} textAlign="center"><CircularProgress/></Box> : (
            <List sx={{ pt: 0 }}>
              {followModal.data.map(u => (
                <ListItem key={u._id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }} secondaryAction={
                  currentUser?._id !== u._id && (
                    <FollowButton targetUserId={u._id} initialIsFollowing={u.followers?.includes(currentUser?._id)} />
                  )
                }>
                  <ListItemAvatar>
                    <Avatar src={u.avatar} sx={{ cursor: 'pointer' }} onClick={() => { setFollowModal({...followModal, open: false}); navigate(`/profile/${u._id}`); }} />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={u.username}
                    secondary={`@${u.username.toLowerCase().replace(/\s+/g, '')}`}
                    primaryTypographyProps={{ fontWeight: 'bold', cursor: 'pointer', color: '#e2e8f0' }}
                    secondaryTypographyProps={{ color: '#94a3b8', cursor: 'pointer' }}
                    onClick={() => { setFollowModal({...followModal, open: false}); navigate(`/profile/${u._id}`); }}
                  />
                </ListItem>
              ))}
              {followModal.data.length === 0 && (
                <Box p={4} textAlign="center"><Typography color="text.secondary">No users found.</Typography></Box>
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
