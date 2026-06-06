import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, TextField, Button, Stack, Snackbar, Alert, Divider } from '@mui/material';
import { Save } from '@mui/icons-material';
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

const AdminSystemSettings = () => {
  const [settings, setSettings] = useState({
    registrationFee: '500',
    lateRegistrationFee: '750',
    registrationDeadline: '2026-07-31',
    currentAcademicYear: '2026',
    currentSemester: '1',
    maxCoursesPerSemester: '8',
    minCoursesPerSemester: '3',
    gradeSubmissionDeadline: '2026-08-15',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const handleSave = async () => {
    try {
      await getApi().post('/admin/system-settings', settings);
      setSnackbar({ open: true, message: 'Settings saved!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to save settings', severity: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>System Settings</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Configure registration deadlines, fee amounts, and semester settings</Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Registration Settings</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Registration Fee (R)" fullWidth value={settings.registrationFee}
                onChange={(e) => setSettings(s => ({ ...s, registrationFee: e.target.value }))} type="number" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Late Registration Fee (R)" fullWidth value={settings.lateRegistrationFee}
                onChange={(e) => setSettings(s => ({ ...s, lateRegistrationFee: e.target.value }))} type="number" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Registration Deadline" type="date" fullWidth value={settings.registrationDeadline}
                onChange={(e) => setSettings(s => ({ ...s, registrationDeadline: e.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Grade Submission Deadline" type="date" fullWidth value={settings.gradeSubmissionDeadline}
                onChange={(e) => setSettings(s => ({ ...s, gradeSubmissionDeadline: e.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>Academic Settings</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Current Academic Year" fullWidth value={settings.currentAcademicYear}
                onChange={(e) => setSettings(s => ({ ...s, currentAcademicYear: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Current Semester" fullWidth value={settings.currentSemester}
                onChange={(e) => setSettings(s => ({ ...s, currentSemester: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Max Courses/Semester" fullWidth value={settings.maxCoursesPerSemester}
                onChange={(e) => setSettings(s => ({ ...s, maxCoursesPerSemester: e.target.value }))} type="number" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Min Courses/Semester" fullWidth value={settings.minCoursesPerSemester}
                onChange={(e) => setSettings(s => ({ ...s, minCoursesPerSemester: e.target.value }))} type="number" />
            </Grid>
          </Grid>

          <Stack direction="row" justifyContent="flex-end" mt={3}>
            <Button variant="contained" startIcon={<Save />} onClick={handleSave}>Save Settings</Button>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminSystemSettings;
