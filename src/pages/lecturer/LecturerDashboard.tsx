import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, Avatar, Stack, CircularProgress } from '@mui/material';
import { School, People, Grade, Notifications } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { lecturerService } from '@/services/lecturerService';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon, label, value, color }: any) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: color + '20', color }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">{value ?? '—'}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['lecturer-dashboard'],
    queryFn: async () => {
      const res = await lecturerService.getDashboard();
      return res.data.data;
    },
  });

  if (isLoading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Lecturer Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Welcome, {data?.staff?.first_name} {data?.staff?.last_name}</Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Box onClick={() => navigate('/lecturer/courses')} sx={{ cursor: 'pointer' }}>
            <StatCard icon={<School />} label="My Courses" value={data?.totalCourses} color="#1976d2" />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<People />} label="Total Students" value={data?.totalStudents} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box onClick={() => navigate('/lecturer/courses')} sx={{ cursor: 'pointer' }}>
            <StatCard icon={<Grade />} label="Pending Grades" value={data?.pendingGrades} color="#ed6c02" />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<Notifications />} label="Unread" value={data?.unreadNotifications} color="#9c27b0" />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Quick Actions</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip label="View My Courses" color="primary" onClick={() => navigate('/lecturer/courses')} clickable />
            <Chip label="Upload Materials" color="secondary" onClick={() => navigate('/lecturer/materials')} clickable />
            <Chip label="Consultation Hours" variant="outlined" onClick={() => navigate('/lecturer/consultation')} clickable />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LecturerDashboard;
