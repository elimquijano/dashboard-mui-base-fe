import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  InputBase,
  Badge,
  Collapse,
  useTheme,
  alpha,
  Button,
  Paper,
  Chip,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ExpandLess,
  ExpandMore,
  Person as PersonIcon,
  Logout as LogoutIcon,
  BarChart as BarChartIcon,
  GetApp as ExportIcon,
  Storage as StorageIcon,
  Backup as BackupIcon,
  History as HistoryIcon,
  Fullscreen as FullscreenIcon,
  Language as LanguageIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  Chat as ChatIcon,
  CalendarToday as CalendarIcon,
  Mail as MailIcon,
  ViewKanban as KanbanIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

const drawerWidth = 260;

// Definición de módulos exactamente como en las imágenes
const menuModules = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    items: [
      {
        text: 'Default',
        icon: <DashboardIcon />,
        path: '/dashboard',
        permission: 'dashboard.view',
      },
      {
        text: 'Analytics',
        icon: <BarChartIcon />,
        path: '/dashboard/analytics-dashboard',
        permission: 'dashboard.analytics',
      },
    ],
  },
  {
    id: 'widget',
    title: 'Widget',
    items: [
      {
        text: 'Statistics',
        icon: <TrendingUpIcon />,
        path: '/dashboard/statistics',
        permission: 'widget.statistics',
      },
      {
        text: 'Data',
        icon: <StorageIcon />,
        path: '/dashboard/data',
        permission: 'widget.data',
      },
      {
        text: 'Chart',
        icon: <PieChartIcon />,
        path: '/dashboard/chart',
        permission: 'widget.chart',
      },
    ],
  },
  {
    id: 'application',
    title: 'Application',
    items: [
      {
        text: 'Users',
        icon: <PeopleIcon />,
        path: '/dashboard/users',
        permission: 'users.view',
        expandable: true,
        children: [
          {
            text: 'User List',
            path: '/dashboard/users',
            permission: 'users.view',
          },
          {
            text: 'User Roles',
            path: '/dashboard/users/roles',
            permission: 'users.roles',
          },
          {
            text: 'Permissions',
            path: '/dashboard/users/permissions',
            permission: 'users.permissions',
          },
        ],
      },
      {
        text: 'Customer',
        icon: <GroupIcon />,
        path: '/dashboard/customers',
        permission: 'customers.view',
        expandable: true,
        children: [
          {
            text: 'Customer List',
            path: '/dashboard/customers',
            permission: 'customers.view',
          },
          {
            text: 'Customer Details',
            path: '/dashboard/customers/details',
            permission: 'customers.details',
          },
        ],
      },
      {
        text: 'Chat',
        icon: <ChatIcon />,
        path: '/dashboard/chat',
        permission: 'chat.view',
      },
      {
        text: 'Kanban',
        icon: <KanbanIcon />,
        path: '/dashboard/kanban',
        permission: 'kanban.view',
      },
      {
        text: 'Mail',
        icon: <MailIcon />,
        path: '/dashboard/mail',
        permission: 'mail.view',
      },
      {
        text: 'Calendar',
        icon: <CalendarIcon />,
        path: '/dashboard/calendar',
        permission: 'calendar.view',
      },
    ],
  },
];

// Mock notifications exactamente como en la imagen
const mockNotifications = [
  {
    id: 1,
    user: 'John Doe',
    avatar: 'JD',
    message: 'It is a long established fact that a reader will be distracted',
    time: '2 min ago',
    type: 'message',
    unread: true,
  },
  {
    id: 2,
    title: 'Store Verification Done',
    message: 'We have successfully received your request.',
    time: '2 min ago',
    type: 'success',
    unread: true,
  },
  {
    id: 3,
    title: 'Check Your Mail.',
    message: 'All done! Now check your inbox as you\'re in for a sweet treat!',
    time: '2 min ago',
    type: 'info',
    unread: false,
    hasButton: true,
    buttonText: 'Mail',
  },
  {
    id: 4,
    user: 'John Doe',
    avatar: 'JD',
    message: 'Uploaded two file on 21 Jan 2020',
    time: '2 min ago',
    type: 'file',
    fileName: 'demo.jpg',
    unread: false,
  },
];

export const DashboardLayout = () => {
  const theme = useTheme();
  const { isDarkMode, toggleDarkMode } = useCustomTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [expandedItems, setExpandedItems] = useState([]);
  const [notifications, setNotifications] = useState(mockNotifications);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  const handleExpandClick = (text) => {
    setExpandedItems(prev => 
      prev.includes(text) 
        ? prev.filter(item => item !== text)
        : [...prev, text]
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const renderMenuItem = (item, depth = 0) => {
    if (item.permission && !hasPermission(item.permission)) {
      return null;
    }

    const isExpanded = expandedItems.includes(item.text);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.path === location.pathname;

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{
              minHeight: 40,
              justifyContent: 'initial',
              px: 2,
              py: 0.5,
              pl: depth * 2 + 2,
              backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
            onClick={() => {
              if (hasChildren) {
                handleExpandClick(item.text);
              } else if (item.path) {
                navigate(item.path);
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 1.5,
                justifyContent: 'center',
                color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                fontSize: '1.2rem',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                '& .MuiListItemText-primary': {
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.875rem',
                }
              }}
            />
            {hasChildren && (
              <IconButton size="small" sx={{ color: theme.palette.text.secondary, p: 0 }}>
                {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </IconButton>
            )}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map(child => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const renderModule = (module) => {
    const visibleItems = module.items?.filter(item => 
      !item.permission || hasPermission(item.permission)
    );
    
    if (!visibleItems || visibleItems.length === 0) return null;

    return (
      <Box key={module.id} sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            display: 'block',
            color: theme.palette.text.secondary,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontSize: '0.75rem',
          }}
        >
          {module.title}
        </Typography>
        <List dense>
          {visibleItems.map(item => renderMenuItem(item))}
        </List>
      </Box>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 700 }}>
            🍇
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          BERRY
        </Typography>
      </Box>

      {/* Menu Items */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {menuModules.map(module => renderModule(module))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Search */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.common.black, 0.04),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.black, 0.06),
              },
              marginLeft: 0,
              width: '100%',
              maxWidth: 300,
            }}
          >
            <Box
              sx={{
                padding: theme.spacing(0, 2),
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SearchIcon fontSize="small" />
            </Box>
            <InputBase
              placeholder="Search"
              sx={{
                color: 'inherit',
                width: '100%',
                '& .MuiInputBase-input': {
                  padding: theme.spacing(1, 1, 1, 0),
                  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Header Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Toggle Dark Mode">
              <IconButton color="inherit" onClick={toggleDarkMode}>
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Language">
              <IconButton color="inherit">
                <LanguageIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Fullscreen">
              <IconButton color="inherit">
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton color="inherit" onClick={handleNotificationClick}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Profile">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '0.875rem',
                  }}
                >
                  {user?.avatar || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            
            {/* Notifications Menu - Exacto como en la imagen */}
            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={handleNotificationClose}
              PaperProps={{
                sx: {
                  width: 330,
                  maxHeight: 500,
                  mt: 1,
                  border: `1px solid ${theme.palette.divider}`,
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {/* Header de notificaciones */}
              <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    All Notification
                    <Chip 
                      label={unreadCount.toString().padStart(2, '0')} 
                      color="warning" 
                      size="small" 
                      sx={{ fontSize: '0.75rem', height: 20 }}
                    />
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={markAllAsRead}
                  sx={{ color: theme.palette.primary.main, textTransform: 'none', p: 0 }}
                >
                  Mark as all read
                </Button>
              </Box>
              
              {/* Dropdown de filtro */}
              <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                >
                  <Typography variant="body2">All Notification</Typography>
                  <ExpandMore fontSize="small" />
                </Box>
              </Box>
              
              {/* Lista de notificaciones */}
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {notifications.map((notification) => (
                  <Box key={notification.id} sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {notification.user ? (
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32, fontSize: '0.75rem' }}>
                          {notification.avatar}
                        </Avatar>
                      ) : (
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: notification.type === 'success' ? 'success.light' : 'info.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {notification.type === 'success' ? '✓' : notification.type === 'info' ? '📧' : '📎'}
                        </Box>
                      )}
                      <Box sx={{ flex: 1 }}>
                        {notification.user && (
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {notification.user}
                          </Typography>
                        )}
                        {notification.title && (
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {notification.title}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                          {notification.message}
                        </Typography>
                        {notification.fileName && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Box sx={{ width: 16, height: 16, mr: 1 }}>📎</Box>
                            <Typography variant="caption">{notification.fileName}</Typography>
                          </Box>
                        )}
                        {notification.hasButton && (
                          <Button
                            size="small"
                            variant="contained"
                            sx={{ mt: 1, textTransform: 'none', fontSize: '0.75rem' }}
                          >
                            {notification.buttonText}
                          </Button>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {notification.time}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {notification.unread && (
                              <Chip label="Unread" color="error" size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
                            )}
                            {!notification.unread && notification.type !== 'file' && (
                              <Chip label="New" color="warning" size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
              
              {/* Footer */}
              <Box sx={{ p: 2, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button color="primary" sx={{ textTransform: 'none' }}>
                  View All
                </Button>
              </Box>
            </Menu>
            
            {/* User Menu */}
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  width: 290,
                  mt: 1,
                },
              }}
            >
              <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Good Morning, {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.role}
                </Typography>
              </Box>
              
              <Box sx={{ p: 2 }}>
                <Paper sx={{ p: 2, bgcolor: '#fff3cd', border: '1px solid #ffeaa7', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Upgrade your plan
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    70% discount for 1 years subscriptions
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: '#f39c12',
                      '&:hover': { bgcolor: '#e67e22' },
                      textTransform: 'none',
                    }}
                  >
                    Go Premium
                  </Button>
                </Paper>
                
                <FormControlLabel
                  control={<Switch defaultChecked color="primary" />}
                  label="Start DND Mode"
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch color="primary" />}
                  label="Allow Notifications"
                />
              </Box>
              
              <Divider />
              
              <MenuItem onClick={() => navigate('/dashboard/settings')}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Account settings
              </MenuItem>
              <MenuItem onClick={() => navigate('/dashboard/profile')}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <Box>
                  <Typography variant="body2">Social Profile</Typography>
                  <Chip label="02" color="warning" size="small" sx={{ ml: 1 }} />
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          backgroundColor: theme.palette.background.default,
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};