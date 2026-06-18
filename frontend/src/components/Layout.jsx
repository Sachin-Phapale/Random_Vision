import React, { useState, useContext } from 'react';
import { Box, Toolbar, Typography, Link, useTheme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';

const drawerWidth = 240;

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Navbar onMenuToggle={handleDrawerToggle} />

      <Box sx={{ display: 'flex', flex: 1 }}>
        {isAuthenticated && (
          <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerClose} />
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 4 },
            width: { sm: `calc(100% - ${isAuthenticated ? drawerWidth : 0}px)` },
            bgcolor: theme.palette.background.default,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Toolbar />
          <Box sx={{ flexGrow: 1 }}>
            {children}
          </Box>

          <Box component="footer" sx={{ py: 3, px: 2, mt: 4, textAlign: 'center', borderTop: theme.palette.mode === 'dark' ? '1px solid #252836' : '1px solid #eaeaea' }}>
            <Typography variant="body2" color="text.secondary">
              {'© '}
              {new Date().getFullYear()}
              {' '}
              <Link color="inherit" href="http://localhost" sx={{ fontWeight: 600, textDecoration: 'none' }}>
                Random Vision
              </Link>
              {'. Elevating minds, one day at a time.'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
