import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, Avatar, Stack, CircularProgress } from '@mui/material';
import { Receipt, School, CheckCircle, Assignment } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { staffService } from '@/services/staffOpsService';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon, label, value, color, onClick }: any) => (
  <Card sx={{ cursor: onClick ? 'pointer' : 'default', '&:hover': onClick ? { boxShadow: 4 } : {} }} onClick={onClick}>
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: color + '20', color }}>{icon}</Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">{value ?? '—'}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['staff-dashboard'],
    queryFn: async () => { const res = await staffService.getDashboard(); return res.data.data; },
  });

  if (isLoading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Staff Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Welcome, {data?.staff?.first_name} {data?.staff?.last_name} — {data?.staff?.department}
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<Receipt />} label="Pending Receipts" value={data?.pendingReceipts} color="#ed6c02"
            onClick={() => navigate('/staff/receipts')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<CheckCircle />} label="Verified Receipts" value={data?.verifiedReceipts} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<Assignment />} label="Pending Registrations" value={data?.pendingRegistrations} color="#1976d2"
            onClick={() => navigate('/staff/registrations')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<School />} label="Approved Registrations" value={data?.approvedRegistrations} color="#9c27b0" />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Quick Actions</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip label="Pending Receipts" color="warning" onClick={() => navigate('/staff/receipts')} clickable />
            <Chip label="Pending Registrations" color="primary" onClick={() => navigate('/staff/registrations')} clickable />
            <Chip label="Scanner" variant="outlined" onClick={() => navigate('/staff/scanner')} clickable />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StaffDashboard;
