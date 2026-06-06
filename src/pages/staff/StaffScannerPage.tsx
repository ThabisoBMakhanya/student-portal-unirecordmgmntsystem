import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Stack, Chip, Avatar, Alert, CircularProgress, Snackbar, Grid } from '@mui/material';
import { QrCodeScanner, CheckCircle, Cancel } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
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

const StaffScannerPage = () => {
  const [studentId, setStudentId] = useState('');
  const [result, setResult] = useState<any>(null);

  const scanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await getApi().post('/wallet/scan', { studentId: id, scannerId: 'staff_scanner', scanLocation: 'Main Campus Gate' });
      return res.data.data;
    },
    onSuccess: (data) => setResult(data),
    onError: () => setResult({ accessGranted: false, message: 'Scan failed', result: 'ERROR' }),
  });

  const handleScan = () => {
    if (studentId.trim()) {
      scanMutation.mutate(studentId.trim());
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>ID Card Scanner</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Enter student ID or scan barcode to verify access</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="Student ID (9020XXXXX)"
                  fullWidth
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  placeholder="e.g., 902000001"
                  autoFocus
                />
                <Button variant="contained" size="large" startIcon={<QrCodeScanner />}
                  onClick={handleScan} disabled={!studentId.trim() || scanMutation.isPending}>
                  {scanMutation.isPending ? 'Scanning...' : 'Scan ID'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          {result && (
            <Card sx={{ border: 2, borderColor: result.accessGranted ? 'success.main' : 'error.main' }}>
              <CardContent>
                <Stack spacing={2} alignItems="center" textAlign="center">
                  {result.accessGranted ? (
                    <CheckCircle sx={{ fontSize: 64, color: 'success.main' }} />
                  ) : (
                    <Cancel sx={{ fontSize: 64, color: 'error.main' }} />
                  )}
                  <Typography variant="h5" fontWeight="bold" color={result.accessGranted ? 'success.main' : 'error.main'}>
                    {result.message}
                  </Typography>
                  {result.student && (
                    <>
                      <Avatar src={result.student.photo} sx={{ width: 80, height: 80, fontSize: 32 }}>
                        {result.student.name?.split(' ').map((n: string) => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{result.student.name}</Typography>
                        <Typography color="text.secondary">{result.student.studentId}</Typography>
                        <Typography color="text.secondary">{result.student.programme} — {result.student.level}</Typography>
                      </Box>
                      <Chip label={`Result: ${result.result}`} color={result.accessGranted ? 'success' : 'error'} />
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffScannerPage;
