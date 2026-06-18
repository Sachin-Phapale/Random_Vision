import React, { useContext } from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, useTheme, useMediaQuery } from '@mui/material';
import { Dashboard, Favorite, AccountCircle, AdminPanelSettings } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const drawerWidth = 240;

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { mode } = useContext(ThemeContext);
  const { isAdmin, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));

  if (!isAuthenticated) return null;

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Saved Quotes', icon: <Favorite />, path: '/saved' },
    { text: 'My Profile', icon: <AccountCircle />, path: '/profile' },
  ];

  if (isAdmin) {
    menuItems.push({ text: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin' });
  }

  const handleNavigation = (path) => {
    navigate(path);
    if (!isSmUp) {
      onMobileClose();
    }
  };

  const drawerContent = (
    <Box sx={{ overflow: 'auto', py: 2 }}>
      <List>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              selected={isSelected}
              sx={{
                mx: 1.5,
                my: 0.5,
                borderRadius: 2,
                color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
                backgroundColor: isSelected 
                  ? (mode === 'dark' ? 'rgba(179, 136, 255, 0.08)' : 'rgba(98, 0, 238, 0.04)') 
                  : 'transparent',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                },
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500 }} 
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: theme.palette.background.paper,
            borderRight: mode === 'dark' ? '1px solid #252836' : '1px solid #eaeaea',
          },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: theme.palette.background.paper,
            borderRight: mode === 'dark' ? '1px solid #252836' : '1px solid #eaeaea',
          },
        }}
        open
      >
        <Toolbar />
        {drawerContent}
      </Drawer>
    </Box>
  );
}
