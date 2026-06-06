import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  School,
  Grade,
  Payment,
  Schedule,
  Person,
  Notifications,
  Settings,
  Help,
  People,
  Map,
  AdminPanelSettings,
  Security,
  SupervisorAccount,
  Assignment,
  Email,
  MailOutline,
  Badge,
  AppRegistration,
  QrCodeScanner,
} from '@mui/icons-material';

import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '@/services/notificationsService';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  isMobile: boolean;
}

const navigationItems = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    color: '#1976d2',
    roles: ['student', 'admin', 'staff'],
  },
  {
    text: 'My Courses',
    icon: <School />,
    path: '/courses',
    color: '#2e7d32',
    roles: ['student'],
  },
  {
    text: 'My Grades',
    icon: <Grade />,
    path: '/grades',
    color: '#ed6c02',
    roles: ['student'],
  },
  {
    text: 'Payments & Fees',
    icon: <Payment />,
    path: '/payments',
    color: '#9c27b0',
    roles: ['student'],
  },
  {
    text: 'My Schedule',
    icon: <Schedule />,
    path: '/schedule',
    color: '#d32f2f',
    roles: ['student'],
  },
  {
    text: 'Assignments',
    icon: <Assignment />,
    path: '/assignments',
    color: '#e91e63',
    roles: ['student'],
  },
  {
    text: 'Payment Receipts',
    icon: <Payment />,
    path: '/receipts',
    color: '#ff6f00',
    roles: ['student'],
  },
  {
    text: 'Registration',
    icon: <AppRegistration />,
    path: '/registration',
    color: '#00838f',
    roles: ['student'],
  },
  {
    text: 'Student ID Card',
    icon: <Badge />,
    path: '/id-card',
    color: '#e65100',
    roles: ['student'],
  },
  {
    text: 'Notifications',
    icon: <Notifications />,
    path: '/notifications',
    color: '#0288d1',
    roles: ['student', 'admin', 'staff'],
  },
  {
    text: 'Staff Directory',
    icon: <People />,
    path: '/staff',
    color: '#4a148c',
    roles: ['student'],
  },
  {
    text: 'Campus Map',
    icon: <Map />,
    path: '/campus-map',
    color: '#00695c',
    roles: ['student', 'admin', 'staff'],
  },
];

const staffItems = [
  {
    text: 'Staff Dashboard',
    icon: <Dashboard />,
    path: '/staff',
    color: '#1565c0',
  },
  {
    text: 'Payment Receipts',
    icon: <Payment />,
    path: '/staff/receipts',
    color: '#ed6c02',
  },
  {
    text: 'Registrations',
    icon: <AppRegistration />,
    path: '/staff/registrations',
    color: '#2e7d32',
  },
  {
    text: 'Scanner',
    icon: <QrCodeScanner />,
    path: '/staff/scanner',
    color: '#9c27b0',
  },
];

const lecturerItems = [
  {
    text: 'Lecturer Dashboard',
    icon: <Dashboard />,
    path: '/lecturer',
    color: '#1565c0',
  },
  {
    text: 'My Courses',
    icon: <School />,
    path: '/lecturer/courses',
    color: '#2e7d32',
  },
  {
    text: 'Materials',
    icon: <Grade />,
    path: '/lecturer/materials',
    color: '#ed6c02',
  },
  {
    text: 'Consultation Hours',
    icon: <Schedule />,
    path: '/lecturer/consultation',
    color: '#9c27b0',
  },
];

const adminItems = [
  {
    text: 'Admin Dashboard',
    icon: <AdminPanelSettings />,
    path: '/admin',
    color: '#e91e63',
  },
  {
    text: 'Role Management',
    icon: <Security />,
    path: '/admin/roles',
    color: '#ff5722',
  },
  {
    text: 'User Management',
    icon: <SupervisorAccount />,
    path: '/admin/users',
    color: '#795548',
  },
  {
    text: 'Staff Management',
    icon: <School />,
    path: '/admin/staff',
    color: '#1565c0',
  },
  {
    text: 'Student Profiles',
    icon: <Person />,
    path: '/admin/students',
    color: '#00796b',
  },
  {
    text: 'Email Logs',
    icon: <Email />,
    path: '/admin/email-logs',
    color: '#6a1b9a',
  },
  {
    text: 'Email Settings',
    icon: <MailOutline />,
    path: '/admin/email-settings',
    color: '#4a148c',
  },
  {
    text: 'Receipts Mgmt',
    icon: <Payment />,
    path: '/admin/receipts',
    color: '#ff6f00',
  },
  {
    text: 'Registrations',
    icon: <School />,
    path: '/admin/registrations',
    color: '#00838f',
  },
  {
    text: 'Barcode Scanner',
    icon: <QrCodeScanner />,
    path: '/admin/barcode-scanner',
    color: '#2e7d32',
  },
  {
    text: 'Announcements',
    icon: <Notifications />,
    path: '/admin/announcements',
    color: '#e91e63',
  },
  {
    text: 'Bulk ID Printing',
    icon: <Badge />,
    path: '/admin/bulk-printing',
    color: '#1565c0',
  },
  {
    text: 'System Settings',
    icon: <Settings />,
    path: '/admin/system-settings',
    color: '#546e7a',
  },
];

const bottomItems = [
  {
    text: 'My Profile',
    icon: <Person />,
    path: '/profile',
  },
  {
    text: 'Settings',
    icon: <Settings />,
    path: '/settings',
  },
  {
    text: 'Help & Support',
    icon: <Help />,
    path: '/help',
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  drawerWidth,
  mobileOpen,
  onDrawerToggle,
  isMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuthStore();

  const { data: notifCount = 0 } = useQuery({
    queryKey: ['notif-count'],
    queryFn: notificationsService.getNotificationCount,
    refetchInterval: 30000,
  });

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onDrawerToggle();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', bgcolor: '#1a1a2e', borderRadius: 2, p: 1.5 }}>
          <Box
            component="img"
            src="/logo-dark.webp"
            alt="Limkokwing Logo"
            sx={{ maxWidth: '90%', height: 'auto', objectFit: 'contain' }}
          />
        </Box>
        {user && (
          <Box>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                bgcolor: user?.role === 'admin' ? 'transparent' : 'primary.main',
                fontSize: '1.5rem',
              }}
              src={user?.role === 'admin' ? '/admin-logo.png' : user?.personalInfo?.profilePicture}
            >
              {user?.personalInfo?.firstName?.[0] ?? ''}
              {user?.personalInfo?.lastName?.[0] ?? ''}
            </Avatar>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {user?.personalInfo?.firstName ?? ''} {user?.personalInfo?.lastName ?? ''}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user?.academicInfo?.studentId ?? ''}
            </Typography>
            <Chip
              label={user?.role === 'admin' ? 'Administrator' : (user?.academicInfo?.program ?? '')}
              size="small"
              color={user?.role === 'admin' ? 'error' : 'primary'}
              variant="outlined"
            />
          </Box>
        )}
      </Box>

      <Divider />

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, py: 2 }}>
        <List>
          {navigationItems
            .filter(item => !item.roles || item.roles.includes(user?.role ?? 'student'))
            .map((item) => (
            <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: `${item.color}15`,
                    '&:hover': {
                      bgcolor: `${item.color}25`,
                    },
                    '& .MuiListItemIcon-root': {
                      color: item.color,
                    },
                    '& .MuiListItemText-primary': {
                      color: item.color,
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? item.color : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
                {(item.text === 'Notifications' && notifCount > 0) && (
                  <Chip
                    label={notifCount}
                    size="small"
                    color="error"
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Staff Operations Section */}
        {(user?.role === 'staff') && (
          <>
            <Typography variant="caption" sx={{ px: 3, mb: 1, display: 'block', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Staff Operations
            </Typography>
            <List>
              {staffItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    selected={isActive(item.path)}
                    sx={{
                      borderRadius: 2,
                      '&.Mui-selected': {
                        bgcolor: `${item.color}15`,
                        '&:hover': { bgcolor: `${item.color}25` },
                        '& .MuiListItemIcon-root': { color: item.color },
                        '& .MuiListItemText-primary': { color: item.color, fontWeight: 600 },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive(item.path) ? item.color : 'text.secondary', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive(item.path) ? 600 : 400 }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Typography variant="caption" sx={{ px: 3, mb: 1, display: 'block', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Lecturer
            </Typography>
            <List>
              {lecturerItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    selected={isActive(item.path)}
                    sx={{
                      borderRadius: 2,
                      '&.Mui-selected': {
                        bgcolor: `${item.color}15`,
                        '&:hover': { bgcolor: `${item.color}25` },
                        '& .MuiListItemIcon-root': { color: item.color },
                        '& .MuiListItemText-primary': { color: item.color, fontWeight: 600 },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive(item.path) ? item.color : 'text.secondary', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive(item.path) ? 600 : 400 }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Admin Section */}
        {(user?.role === 'admin') && (
          <>
            <Typography variant="caption" sx={{ px: 3, mb: 1, display: 'block', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Administration
            </Typography>
            <List>
              {adminItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    selected={isActive(item.path)}
                    sx={{
                      borderRadius: 2,
                      '&.Mui-selected': {
                        bgcolor: `${item.color}15`,
                        '&:hover': { bgcolor: `${item.color}25` },
                        '& .MuiListItemIcon-root': { color: item.color },
                        '& .MuiListItemText-primary': { color: item.color, fontWeight: 600 },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive(item.path) ? item.color : 'text.secondary', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive(item.path) ? 600 : 400 }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>

      <Divider />

      {/* Bottom Navigation */}
      <Box sx={{ py: 2 }}>
        <List>
          {bottomItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />

      {/* Academic Info (students only) */}
      {user?.role === 'student' && user?.academicInfo && (
        <Box sx={{ p: 2, bgcolor: 'background.paper', m: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Academic Progress
          </Typography>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">GPA</Typography>
            <Typography variant="body2" fontWeight="bold" color="primary">
              {user.academicInfo.gpa ? user.academicInfo.gpa.toFixed(2) : ''}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">Credits</Typography>
            <Typography variant="body2" fontWeight="bold">
              {user.academicInfo.completedCredits ?? ''}/{user.academicInfo.totalCredits ?? ''}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">Level</Typography>
            <Typography variant="body2" fontWeight="bold">
              {user.academicInfo.level ?? ''}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: 'background.paper',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: 'background.paper',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;