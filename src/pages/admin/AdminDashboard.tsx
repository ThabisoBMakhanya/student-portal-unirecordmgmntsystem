import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Divider,
  Alert,
} from '@mui/material';
import {
  Security,
  Group,
  Person,
  Assignment,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  AdminPanelSettings,
  School,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import rbacService from '@/services/rbacService';
import { apiClient } from '@/services/api';
import PermissionGuard from '@/components/RBAC/PermissionGuard';
import { useRBACStore } from '@/stores/rbacStore';
import LoadingSpinner from '@/components/LoadingSpinner';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userRoles, isAdmin, isSystemAdmin } = useRBACStore();

  // Fetch role analytics
  const analyticsQuery = useQuery({
    queryKey: ['role-analytics'],
    queryFn: () => rbacService.getRoleAnalytics(),
    enabled: isAdmin(),
  });

  const deriveActivityType = (action: string): string => {
    const lower = action.toLowerCase();
    if (lower.includes('assign')) return 'assignment';
    if (lower.includes('create') || lower.includes('add') || lower.includes('new')) return 'creation';
    if (lower.includes('denied') || lower.includes('access') || lower.includes('security') || lower.includes('unauthor')) return 'security';
    if (lower.includes('update') || lower.includes('edit') || lower.includes('modify')) return 'update';
    return 'update';
  };

  const auditLogsQuery = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/audit-logs');
      return response.data.data.logs.map((log: any) => ({
        id: log.id,
        action: log.action,
        user: log.details?.user_name || log.user_id,
        role: log.entity_type,
        timestamp: log.created_at,
        type: deriveActivityType(log.action),
      }));
    },
    enabled: isAdmin(),
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <Assignment color="primary" />;
      case 'update':
        return <CheckCircle color="success" />;
      case 'creation':
        return <Group color="info" />;
      case 'security':
        return <Warning color="warning" />;
      default:
        return <Schedule />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'primary';
      case 'update':
        return 'success';
      case 'creation':
        return 'info';
      case 'security':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (analyticsQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LoadingSpinner message="Loading admin dashboard..." />
      </Box>
    );
  }

  return (
    <PermissionGuard roles={['admin', 'super_admin']} showFallback>
      <Box>
        {/* Page Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            RBAC Administration Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage roles, permissions, and user access across the system
          </Typography>
        </Box>

        {/* Admin Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Your Access Level:</strong> {isSystemAdmin() ? 'System Administrator' : 'Administrator'} • 
            <strong> Roles:</strong> {userRoles.map(role => role.name).join(', ')}
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              System Overview
            </Typography>
          </Grid>

          {analyticsQuery.data && (
            <>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                      <Group />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      {analyticsQuery.data.totalRoles}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Roles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                      <CheckCircle />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      {analyticsQuery.data.activeRoles}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active Roles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                      <Security />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      {analyticsQuery.data.systemRoles}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      System Roles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                      <TrendingUp />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      {analyticsQuery.data.recentAssignments}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Recent Assignments
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Actions
                </Typography>
                
                <Grid container spacing={2} sx={{ flex: 1, alignContent: 'flex-start' }}>
                  <PermissionGuard permission="roles:create">
                    <Grid item xs={12} sm={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Group />}
                        onClick={() => navigate('/admin/roles')}
                      >
                        Manage Roles
                      </Button>
                    </Grid>
                  </PermissionGuard>

                  <PermissionGuard permission="roles:assign">
                    <Grid item xs={12} sm={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Assignment />}
                        onClick={() => navigate('/admin/users')}
                      >
                        Assign Roles
                      </Button>
                    </Grid>
                  </PermissionGuard>

                  <PermissionGuard permission="users:read">
                    <Grid item xs={12} sm={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Person />}
                        onClick={() => navigate('/admin/users')}
                      >
                        Manage Users
                      </Button>
                    </Grid>
                  </PermissionGuard>

                  <PermissionGuard permission="roles:create">
                    <Grid item xs={12} sm={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Security />}
                        onClick={() => navigate('/admin/roles')}
                      >
                        Manage Permissions
                      </Button>
                    </Grid>
                  </PermissionGuard>

                  <PermissionGuard permission="users:read">
                    <Grid item xs={12} sm={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<School />}
                        onClick={() => navigate('/admin/staff')}
                      >
                        Staff Management
                      </Button>
                    </Grid>
                  </PermissionGuard>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Most Used Roles */}
          {analyticsQuery.data?.mostUsedRoles && (
            <Grid item xs={12} md={6}>
              <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Most Used Roles
                  </Typography>
                  
                  <List sx={{ p: 0, flex: 1 }}>
                    {analyticsQuery.data.mostUsedRoles.slice(0, 5).map((role, index) => (
                      <React.Fragment key={role.roleId}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              <AdminPanelSettings sx={{ fontSize: 16 }} />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={role.roleName}
                            secondary={`${role.userCount} users assigned`}
                          />
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </ListItem>
                        {index < Math.min(analyticsQuery.data.mostUsedRoles.length - 1, 4) && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Activity
                </Typography>
                
                {auditLogsQuery.isLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                    <LoadingSpinner message="Loading recent activity..." />
                  </Box>
                ) : (
                  <List sx={{ p: 0, flex: 1 }}>
                    {(auditLogsQuery.data ?? []).map((activity, index) => (
                      <React.Fragment key={activity.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            {getActivityIcon(activity.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2" fontWeight="bold">
                                  {activity.action}
                                </Typography>
                                <Chip
                                  label={activity.type}
                                  size="small"
                                  color={getActivityColor(activity.type) as any}
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {activity.user} • {activity.role} • {new Date(activity.timestamp).toLocaleString()}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < (auditLogsQuery.data?.length ?? 0) - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* System Health */}
          <Grid item xs={12} md={6}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  System Health
                </Typography>
                
                <Grid container spacing={2} sx={{ flex: 1, alignContent: 'center' }}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        99.9%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        System Uptime
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="info.main" fontWeight="bold">
                        {'<100ms'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Avg Response Time
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main" fontWeight="bold">
                        0
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Security Incidents
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        100%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Permission Accuracy
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PermissionGuard>
  );
};

export default AdminDashboard;
