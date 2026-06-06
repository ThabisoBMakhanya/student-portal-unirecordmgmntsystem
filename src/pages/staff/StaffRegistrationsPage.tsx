import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Stack, CircularProgress, Tabs, Tab } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { staffService } from '@/services/staffOpsService';

const statusColors: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
  SUBMITTED: 'warning', DOCUMENTS_VERIFIED: 'info', FEE_VERIFIED: 'info', APPROVED: 'success', REJECTED: 'error',
};

const StaffRegistrationsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const statusFilter = ['', 'SUBMITTED', 'APPROVED', 'REJECTED'][tab];

  const { data, isLoading } = useQuery({
    queryKey: ['staff-registrations', statusFilter],
    queryFn: async () => { const res = await staffService.getRegistrations(statusFilter || undefined); return res.data.data.registrations; },
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Semester Registrations</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="All" />
        <Tab label="Pending" />
        <Tab label="Approved" />
        <Tab label="Rejected" />
      </Tabs>

      {isLoading ? <Box textAlign="center" py={4}><CircularProgress /></Box> : (
        <Card><CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.length === 0 && <TableRow><TableCell colSpan={7} align="center">No registrations found.</TableCell></TableRow>}
                {data?.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.first_name} {r.last_name}</TableCell>
                    <TableCell>{r.student_id}</TableCell>
                    <TableCell>{r.academic_year}</TableCell>
                    <TableCell>Semester {r.semester}</TableCell>
                    <TableCell>{r.created_at?.slice(0, 10)}</TableCell>
                    <TableCell><Chip label={r.status} size="small" color={statusColors[r.status] || 'default'} /></TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined" startIcon={<Visibility />}
                        onClick={() => navigate(`/staff/registrations/${r.id}`)}>
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent></Card>
      )}
    </Box>
  );
};

export default StaffRegistrationsPage;
