import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance as AccountIcon,
  Receipt as TransactionIcon,
  ShowChart as ChartIcon,
} from '@mui/icons-material';
import {
  WalletOutlined,
  DashboardOutlined,
  AccountBookOutlined,
  TransactionOutlined,
  StockOutlined,
} from '@ant-design/icons';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardOutlined style={{ fontSize: 20 }} />, path: '/' },
  { text: 'Accounts', icon: <AccountBookOutlined style={{ fontSize: 20 }} />, path: '/accounts' },
  { text: 'Transactions', icon: <TransactionOutlined style={{ fontSize: 20 }} />, path: '/transactions' },
  { text: 'Stock Holdings', icon: <StockOutlined style={{ fontSize: 20 }} />, path: '/holdings' },
];

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <div
      style={{
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WalletOutlined style={{ fontSize: 28, color: 'white' }} />
          <Typography variant="h6" noWrap component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
            Wealth Wallet
          </Typography>
        </Box>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.35)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'white' : 'rgba(255, 255, 255, 0.85)' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiTypography-root': {
                    color: location.pathname === item.path ? 'white' : 'rgba(255, 255, 255, 0.85)',
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px)` },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 500 }}>
            {menuItems.find((item) => item.path === location.pathname)?.text || 'Wealth Wallet'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
