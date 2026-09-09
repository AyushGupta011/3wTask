import { useState, useEffect } from 'react';
import { Container, Stack, CircularProgress, Fab, Typography, Box, Button, Grid, Card, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import FollowButton from '../components/FollowButton';
import { getPostsAPI } from '../api/posts';
import { getAllUsersAPI } from '../api/users';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Feed() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchPosts = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await getPostsAPI(pageNum, 10);
      const { posts: fetchedPosts, page: currentPage, totalPages: pages } = response.data.data;
      if (pageNum === 1) {
        setPosts(fetchedPosts);
      } else {
        setPosts((prev) => [...prev, ...fetchedPosts]);
      }
      setTotalPages(pages);
      setPage(currentPage);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const res = await getAllUsersAPI();
      setSuggestedUsers(res.data.data);
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  useEffect(() => {
    fetchPosts(1);
    fetchSuggestedUsers();
  }, []);

  const handlePostUpdate = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <Box minHeight="100vh" bgcolor="#0a0e17">
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Feed Column */}
          <Grid item xs={12} md={8}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {posts.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="text.secondary">
                      No posts yet. Be the first to post!
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {posts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        onPostUpdate={handlePostUpdate}
                      />
                    ))}
                  </Stack>
                )}

                {page < totalPages && (
                  <Box display="flex" justifyContent="center" mt={4}>
                    <Button
                      variant="outlined"
                      onClick={() => fetchPosts(page + 1)}
                      disabled={loadingMore}
                      color="primary"
                    >
                      {loadingMore ? <CircularProgress size={24} /> : 'Load More'}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Grid>

          {/* Suggested Users Sidebar */}
          <Grid item xs={12} md={4} display={{ xs: 'none', md: 'block' }}>
            <Box position="sticky" top={88}>
              <Typography variant="h6" fontWeight="bold" color="text.primary" mb={2} px={1}>
                Suggested for you
              </Typography>
              <Card sx={{ bgcolor: '#0d121f', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'none' }}>
                <List sx={{ p: 0 }}>
                  {suggestedUsers.length === 0 && (
                    <Box p={3} textAlign="center"><Typography color="text.secondary">No users found.</Typography></Box>
                  )}
                  {suggestedUsers.map(u => (
                    <ListItem key={u._id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }} secondaryAction={
                      <FollowButton targetUserId={u._id} initialIsFollowing={u.followers?.includes(currentUser?._id)} />
                    }>
                      <ListItemAvatar>
                        <Avatar src={u.avatar} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${u._id}`)} />
                      </ListItemAvatar>
                      <ListItemText 
                        primary={u.username}
                        secondary={`@${u.username.toLowerCase().replace(/\s+/g, '')}`}
                        primaryTypographyProps={{ fontWeight: 'bold', cursor: 'pointer', color: '#e2e8f0', fontSize: '0.9rem' }}
                        secondaryTypographyProps={{ color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
                        onClick={() => navigate(`/profile/${u._id}`)}
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setCreateModalOpen(true)}
      >
        <AddIcon />
      </Fab>

      <CreatePostModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </Box>
  );
}
