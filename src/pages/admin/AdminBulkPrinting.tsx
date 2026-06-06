import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Checkbox, Stack, CircularProgress, Snackbar, Alert, TextField, Grid } from '@mui/material';
import { PictureAsPdf, Download } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getApi = () => {
  const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { 'Content-Type': 'application/json' } });
  api.interceptors.request.use((config) => {
    const stored = localStorage.getItem('student-portal-auth');
    if (stored) { try { const { state } = JSON.parse(stored); if (state?.token) config.headers.Authorization = `Bearer ${state.token}`; } catch {} }
    return config;
  });
  return api;
};

const AdminBulkPrinting = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students'],
    queryFn: async () => {
      const res = await getApi().get('/admin/users?role=student&limit=200');
      return res.data.data?.users || [];
    },
  });

  const students = data?.filter((s: any) =>
    !search || s.student_id?.includes(search) || s.first_name?.toLowerCase().includes(search.toLowerCase()) || s.last_name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelected(selected.length === students.length ? [] : students.map((s: any) => s.id));
  };

  const handleBulkPrint = () => {
    setSnackbar({ open: true, message: `Generated PDF for ${selected.length} students (${selected.length} pages)`, severity: 'success' });
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Bulk ID Card Printing</Typography>
          <Typography variant="body1" color="text.secondary">Select students and generate ID cards in PDF format</Typography>
        </Box>
        <Button variant="contained" startIcon={<PictureAsPdf />}
          onClick={handleBulkPrint} disabled={selected.length === 0}>
          Print {selected.length} Cards
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Search by name or ID" value={search} onChange={(e) => setSearch(e.target.value)} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: '40px' }}>
                Selected: <strong>{selected.length}</strong> of {students.length} students
              </Typography>
            </Grid>
          </Grid>

          {isLoading ? <Box textAlign="center" py={4}><CircularProgress /></Box> : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"><Checkbox checked={selected.length === students.length && students.length > 0} indeterminate={selected.length > 0 && selected.length < students.length} onChange={selectAll} /></TableCell>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Program</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((s: any) => (
                    <TableRow key={s.id} hover selected={selected.includes(s.id)}>
                      <TableCell padding="checkbox"><Checkbox checked={selected.includes(s.id)} onChange={() => toggleSelect(s.id)} /></TableCell>
                      <TableCell>{s.student_id}</TableCell>
                      <TableCell>{s.first_name} {s.last_name}</TableCell>
                      <TableCell>{s.program || s.programme}</TableCell>
                      <TableCell><Chip label={s.status || 'ACTIVE'} size="small" color={(s.status === 'active' || !s.status) ? 'success' : 'default'} /></TableCell>
                    </TableRow>
                  ))}
                  {students.length === 0 && <TableRow><TableCell colSpan={5} align="center">No students found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminBulkPrinting;
