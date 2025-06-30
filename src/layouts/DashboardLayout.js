import React, { useState, useEffect } from "react";
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
  Chip,
  Switch,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
  BarChart as BarChartIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  Chat as ChatIcon,
  CalendarToday as CalendarIcon,
  Mail as MailIcon,
  ViewKanban as KanbanIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Article as ArticleIcon,
  FullscreenExit,
} from "@mui/icons-material";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme as useCustomTheme } from "../contexts/ThemeContext";
import { notificationsAPI } from "../utils/api";

const drawerWidth = 260;
const collapsedDrawerWidth = 64;

const enterFullscreen = (element = document.documentElement) => {
  if (element.requestFullscreen) element.requestFullscreen();
  else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
  else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
  else if (element.msRequestFullscreen) element.msRequestFullscreen();
};

const exitFullscreen = () => {
  if (document.exitFullscreen) document.exitFullscreen();
  else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
  else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  else if (document.msExitFullscreen) document.msExitFullscreen();
};

// Definición de módulos exactamente como en las imágenes
const menuModules = [
  {
    id: "dashboard",
    title: "Dashboard",
    items: [
      {
        text: "Default",
        icon: <DashboardIcon />,
        path: "/dashboard",
        permission: "dashboard.view",
      },
      {
        text: "Analytics",
        icon: <BarChartIcon />,
        path: "/dashboard/analytics-dashboard",
        permission: "dashboard.analytics",
      },
    ],
  },
  {
    id: "widget",
    title: "Widget",
    items: [
      {
        text: "Statistics",
        icon: <TrendingUpIcon />,
        path: "/dashboard/statistics",
        permission: "widget.statistics",
      },
      {
        text: "Data",
        icon: <StorageIcon />,
        path: "/dashboard/data",
        permission: "widget.data",
      },
      {
        text: "Chart",
        icon: <PieChartIcon />,
        path: "/dashboard/chart",
        permission: "widget.chart",
      },
    ],
  },
  {
    id: "application",
    title: "Application",
    items: [
      {
        text: "Users",
        icon: <PeopleIcon />,
        path: "/dashboard/users",
        permission: "users.view",
        expandable: true,
        children: [
          {
            text: "User List",
            path: "/dashboard/users",
            permission: "users.view",
          },
          {
            text: "User Roles",
            path: "/dashboard/users/roles",
            permission: "users.roles",
          },
          {
            text: "Permissions",
            path: "/dashboard/users/permissions",
            permission: "users.permissions",
          },
        ],
      },
      {
        text: "Customer",
        icon: <GroupIcon />,
        path: "/dashboard/customers",
        permission: "customers.view",
        expandable: true,
        children: [
          {
            text: "Customer List",
            path: "/dashboard/customers",
            permission: "customers.view",
          },
          {
            text: "Customer Details",
            path: "/dashboard/customers/details",
            permission: "customers.details",
          },
        ],
      },
      {
        text: "Chat",
        icon: <ChatIcon />,
        path: "/dashboard/chat",
        permission: "chat.view",
      },
      {
        text: "Kanban",
        icon: <KanbanIcon />,
        path: "/dashboard/kanban",
        permission: "kanban.view",
      },
      {
        text: "Mail",
        icon: <MailIcon />,
        path: "/dashboard/mail",
        permission: "mail.view",
      },
      {
        text: "Calendar",
        icon: <CalendarIcon />,
        path: "/dashboard/calendar",
        permission: "calendar.view",
      },
    ],
  },
  {
    id: "system",
    title: "System",
    items: [
      {
        text: "Modules",
        icon: <ArticleIcon />,
        path: "/dashboard/modules",
        permission: "system.settings",
      },
      {
        text: "Settings",
        icon: <SettingsIcon />,
        path: "/dashboard/settings",
        permission: "system.settings",
      },
    ],
  },
];

export const DashboardLayout = () => {
  const theme = useTheme();
  const { isDarkMode, toggleDarkMode } = useCustomTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [expandedItems, setExpandedItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const currentDrawerWidth = sidebarCollapsed
    ? collapsedDrawerWidth
    : drawerWidth;

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      // document.fullscreenElement devuelve el elemento en pantalla completa o null
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Añadimos un listener para el evento de cambio de pantalla completa
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Es importante limpiar el listener cuando el componente se desmonte
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll({ unread: true });
      setNotifications(response.data.data || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error("Error loading notifications:", error);
      // Fallback a datos mock
      const mockNotifications = [
        {
          id: 1,
          type: "info",
          title: "Welcome",
          message: "Welcome to Berry Dashboard",
          read_at: null,
          created_at: new Date().toISOString(),
        },
      ];
      setNotifications(mockNotifications);
      setUnreadCount(1);
    }
  };

  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
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
    navigate("/");
    handleClose();
  };

  const handleExpandClick = (text) => {
    if (sidebarCollapsed) return; // Don't expand when collapsed
    setExpandedItems((prev) =>
      prev.includes(text)
        ? prev.filter((item) => item !== text)
        : [...prev, text]
    );
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    }
  };

  const renderMenuItem = (item, depth = 0) => {
    if (item.permission && !hasPermission(item.permission)) {
      return null;
    }

    const isExpanded = expandedItems.includes(item.text);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.path === location.pathname;

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton
            sx={{
              minHeight: 40,
              justifyContent: sidebarCollapsed ? "center" : "initial",
              px: sidebarCollapsed ? 1 : 2,
              py: 0.5,
              pl: sidebarCollapsed ? 1 : depth * 2 + 2,
              backgroundColor: isActive
                ? alpha(theme.palette.primary.main, 0.08)
                : "transparent",
              borderRadius: 1,
              mx: sidebarCollapsed ? 0.5 : 1,
              mb: 0.5,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
            onClick={() => {
              if (hasChildren && !sidebarCollapsed) {
                handleExpandClick(item.text);
              } else if (item.path) {
                navigate(item.path);
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: sidebarCollapsed ? 0 : 1.5,
                justifyContent: "center",
                color: isActive
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
                fontSize: "1.2rem",
              }}
            >
              {item.icon}
            </ListItemIcon>
            {!sidebarCollapsed && (
              <>
                <ListItemText
                  primary={item.text}
                  sx={{
                    color: isActive
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                    "& .MuiListItemText-primary": {
                      fontWeight: isActive ? 600 : 400,
                      fontSize: "0.875rem",
                    },
                  }}
                />
                {hasChildren && (
                  <IconButton
                    size="small"
                    sx={{ color: theme.palette.text.secondary, p: 0 }}
                  >
                    {isExpanded ? (
                      <ExpandLess fontSize="small" />
                    ) : (
                      <ExpandMore fontSize="small" />
                    )}
                  </IconButton>
                )}
              </>
            )}
          </ListItemButton>
        </ListItem>
        {hasChildren && !sidebarCollapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const renderModule = (module) => {
    const visibleItems = module.items?.filter(
      (item) => !item.permission || hasPermission(item.permission)
    );

    if (!visibleItems || visibleItems.length === 0) return null;

    return (
      <Box key={module.id} sx={{ mb: 2 }}>
        {!sidebarCollapsed && (
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              display: "block",
              color: theme.palette.text.secondary,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontSize: "0.75rem",
            }}
          >
            {module.title}
          </Typography>
        )}
        <List dense>{visibleItems.map((item) => renderMenuItem(item))}</List>
      </Box>
    );
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: sidebarCollapsed ? 1 : 2,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          justifyContent: sidebarCollapsed ? "center" : "flex-start",
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: sidebarCollapsed ? 0 : 1,
          }}
        >
          <Typography variant="body2" sx={{ color: "white", fontWeight: 700 }}>
            🍇
          </Typography>
        </Box>
        {!sidebarCollapsed && (
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: theme.palette.primary.main }}
          >
            BERRY
          </Typography>
        )}
      </Box>

      {/* Menu Items */}
      <Box sx={{ flex: 1, overflow: "auto", py: 1 }}>
        {menuModules.map((module) => renderModule(module))}
      </Box>

      {/* Collapse Button */}
      <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
        <IconButton
          onClick={handleSidebarToggle}
          sx={{
            width: "100%",
            justifyContent: "center",
            color: theme.palette.text.secondary,
          }}
        >
          {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { sm: `${currentDrawerWidth}px` },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: "none",
          borderBottom: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: "64px !important" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Search */}
          <Box
            sx={{
              position: "relative",
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.common.black, 0.04),
              "&:hover": {
                backgroundColor: alpha(theme.palette.common.black, 0.06),
              },
              marginLeft: 0,
              width: "100%",
              maxWidth: 300,
            }}
          >
            <Box
              sx={{
                padding: theme.spacing(0, 2),
                height: "100%",
                position: "absolute",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SearchIcon fontSize="small" />
            </Box>
            <InputBase
              placeholder="Search"
              sx={{
                color: "inherit",
                width: "100%",
                "& .MuiInputBase-input": {
                  padding: theme.spacing(1, 1, 1, 0),
                  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                  fontSize: "0.875rem",
                },
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Header Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title="Toggle Dark Mode">
              <IconButton color="inherit" onClick={toggleDarkMode}>
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Fullscreen">
              <IconButton color="inherit" onClick={handleToggleFullscreen}>
                {isFullscreen ? <FullscreenExit /> : <FullscreenIcon />}
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
                    fontSize: "0.875rem",
                  }}
                >
                  {user?.first_name?.charAt(0)}
                  {user?.last_name?.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>

            {/* Notifications Menu */}
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
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              {/* Header de notificaciones */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    All Notification
                    <Chip
                      label={unreadCount.toString().padStart(2, "0")}
                      color="warning"
                      size="small"
                      sx={{ fontSize: "0.75rem", height: 20 }}
                    />
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={markAllAsRead}
                  sx={{
                    color: theme.palette.primary.main,
                    textTransform: "none",
                    p: 0,
                  }}
                >
                  Mark as all read
                </Button>
              </Box>

              {/* Lista de notificaciones */}
              <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <Box
                      key={notification.id}
                      sx={{
                        p: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                      >
                        {notification.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.75rem", mt: 0.5 }}
                      >
                        {notification.message}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.created_at).toLocaleString()}
                        </Typography>
                        {!notification.read_at && (
                          <Chip
                            label="Unread"
                            color="error"
                            size="small"
                            sx={{ fontSize: "0.6rem", height: 18 }}
                          />
                        )}
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      No notifications
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Button color="primary" sx={{ textTransform: "none" }}>
                  View All
                </Button>
              </Box>
            </Menu>

            {/* User Menu */}
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
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
              <Box
                sx={{
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Hola, {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.roles?.[0]?.name || "User"}
                </Typography>
              </Box>

              <Box sx={{ p: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isDarkMode}
                      onChange={toggleDarkMode}
                      color="primary"
                    />
                  }
                  label="Modo Oscuro"
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch color="primary" />}
                  label="Permitir Notificaciones"
                />
              </Box>

              <Divider />

              <MenuItem onClick={() => navigate("/dashboard/settings")}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Configuración de Cuenta
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { sm: currentDrawerWidth },
          flexShrink: { sm: 0 },
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
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
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: currentDrawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
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
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          mt: "64px",
          backgroundColor: theme.palette.background.default,
          minHeight: "calc(100vh - 64px)",
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
