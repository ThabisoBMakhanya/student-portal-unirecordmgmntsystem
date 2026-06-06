import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  School,
  CalendarToday,
  Person,
} from '@mui/icons-material';

import { useAuthStore } from '@/stores/authStore';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Profile
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="body1">
              Loading profile...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information and account settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box position="relative" display="inline-block" mb={2}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    fontSize: '2rem',
                  }}
                  src={user.personalInfo?.profilePicture}
                >
                  {user.personalInfo?.firstName?.[0]}{user.personalInfo?.lastName?.[0]}
                </Avatar>
              </Box>

              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user.personalInfo?.firstName} {user.personalInfo?.lastName}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.academicInfo?.studentId}
              </Typography>

              <Chip
                label={user.status}
                color={user.status === 'active' ? 'success' : 'default'}
                size="small"
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Personal Details */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Personal Information
                  </Typography>
                  <List>
                    <ListItem>
                      <Person sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Full Name"
                      secondary={`${user.personalInfo?.firstName || ''} ${user.personalInfo?.middleName || ''} ${user.personalInfo?.lastName || ''}`.trim()}
                    />
                    </ListItem>
                    <ListItem>
                      <Email sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Email"
                      secondary={user.email || ''}
                    />
                    </ListItem>
                    <ListItem>
                      <Phone sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Phone"
                      secondary={user.contactInfo?.phone || ''}
                    />
                    </ListItem>
                    <ListItem>
                      <CalendarToday sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Date of Birth"
                      secondary={user.personalInfo?.dateOfBirth ? new Date(user.personalInfo.dateOfBirth).toLocaleDateString() : ''}
                    />
                    </ListItem>
                    <ListItem>
                      <LocationOn sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Address"
                      secondary={`${user.contactInfo?.address?.street || ''}, ${user.contactInfo?.address?.city || ''}, ${user.contactInfo?.address?.state || ''}, ${user.contactInfo?.address?.country || ''}`}
                    />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Academic Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Academic Information
                  </Typography>
                  <List>
                    <ListItem>
                      <School sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Program"
                      secondary={user.academicInfo?.program || ''}
                    />
                    </ListItem>
                    <ListItem>
                    <ListItemText
                      primary="Department"
                      secondary={user.academicInfo?.department || ''}
                    />
                    </ListItem>
                    <ListItem>
                    <ListItemText
                      primary="Faculty"
                      secondary={user.academicInfo?.faculty || ''}
                    />
                    </ListItem>
                    <ListItem>
                    <ListItemText
                      primary="Level"
                      secondary={user.academicInfo?.level || ''}
                    />
                    </ListItem>
                    <ListItem>
                    <ListItemText
                      primary="GPA"
                      secondary={user.academicInfo?.gpa ? user.academicInfo.gpa.toFixed(2) : ''}
                    />
                    </ListItem>
                    <ListItem>
                    <ListItemText
                      primary="Credits"
                      secondary={`${user.academicInfo?.completedCredits || 0} / ${user.academicInfo?.totalCredits || 0}`}
                    />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

    </Box>
  );
};

export default ProfilePage;
