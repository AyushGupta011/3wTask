import { AppBar, Toolbar, Typography, Avatar, IconButton, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <Toolbar>
        <Typography sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }} onClick={() => navigate('/feed')} variant="h6" fontWeight="bold" color="primary" style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          🌐 3W Social
        </Typography>
        {user && (
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              onClick={() => navigate(`/profile/${user._id}`)}
              sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            >
              <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
              <Typography variant="body2" fontWeight="bold" display={{ xs: 'none', sm: 'block' }}>
                {user.username}
              </Typography>
            </Box>
            <IconButton onClick={handleLogout} color="inherit" size="small" title="Logout">
              <LogoutIcon />
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
