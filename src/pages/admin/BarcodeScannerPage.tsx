import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Box, Typography, Card, CardContent, TextField, Button, Alert, Grid,
  CircularProgress, Chip, Divider, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Search, CheckCircle, CameraAlt } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../services/api';
import StudentBarcode from '../../components/StudentIdCard/StudentBarcode';
import StudentQRCode from '../../components/StudentIdCard/StudentQRCode';

const BarcodeScannerPage: React.FC = () => {
  const [scanInput, setScanInput] = useState('');
  const [studentData, setStudentData] = useState<any>(null);
  const [scanLocation, setScanLocation] = useState('LIBRARY');
  const [lookupError, setLookupError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const lookupMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const { data } = await apiClient.get(`/barcode/lookup/${studentId}`);
      return data.data;
    },
    onSuccess: (data) => {
      setStudentData(data);
      setLookupError('');
      logScanMutation.mutate({ studentId: data.studentId, scanLocation });
    },
    onError: () => {
      setStudentData(null);
      setLookupError('Student not found. Check the ID and try again.');
    },
  });

  const logScanMutation = useMutation({
    mutationFn: async (payload: any) => {
      await apiClient.post('/barcode/scan-log', payload);
    },
  });

  const examAttendanceMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post('/barcode/exam-attendance', payload);
      return data;
    },
    onSuccess: () => {
      toast.success('Exam attendance recorded');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Attendance failed'),
  });

  const handleScan = () => {
    const value = scanInput.trim();
    if (!value) return;
    if (value.length === 9 && value.startsWith('9020')) {
      lookupMutation.mutate(value);
    } else {
      setLookupError('Invalid ID format. Must be 9 digits starting with 9020.');
      setStudentData(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleScan();
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={600} gutterBottom>Barcode Scanner</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Scan student ID barcode or manually enter a 9-digit student ID (9020XXXXX format).
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CameraAlt sx={{ verticalAlign: 'middle', mr: 1 }} />
                Scan / Enter ID
              </Typography>
              <Box display="flex" gap={2} alignItems="flex-end">
                <TextField
                  inputRef={inputRef}
                  label="Student ID (9020XXXXX)"
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  size="medium"
                  sx={{ flexGrow: 1, fontFamily: 'monospace' }}
                  placeholder="e.g. 902000001"
                  autoFocus
                />
                <Button variant="contained" startIcon={<Search />} onClick={handleScan} disabled={lookupMutation.isPending}>
                  {lookupMutation.isPending ? <CircularProgress size={20} /> : 'Lookup'}
                </Button>
              </Box>

              {lookupError && <Alert severity="error" sx={{ mt: 2 }}>{lookupError}</Alert>}

              <Divider sx={{ my: 2 }} />

              <FormControl fullWidth size="small">
                <InputLabel>Scan Location</InputLabel>
                <Select value={scanLocation} label="Scan Location" onChange={e => setScanLocation(e.target.value)}>
                  <MenuItem value="LIBRARY">Library</MenuItem>
                  <MenuItem value="EXAM_HALL">Exam Hall</MenuItem>
                  <MenuItem value="CAFETERIA">Cafeteria</MenuItem>
                  <MenuItem value="GATE">Campus Gate</MenuItem>
                  <MenuItem value="EVENT">Event</MenuItem>
                  <MenuItem value="PORTAL">Portal</MenuItem>
                </Select>
              </FormControl>

              {studentData && (
                <Box mt={2}>
                  <Alert severity="success">
                    <strong>Student Verified ✓</strong>
                  </Alert>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => {
                      if (studentData) {
                        examAttendanceMutation.mutate({ studentId: studentData.studentId, examCode: 'EXAM-' + Date.now() });
                      }
                    }}
                  >
                    Record Exam Attendance
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          {studentData ? (
            <Card sx={{ border: '2px solid', borderColor: 'success.main' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CheckCircle color="success" />
                  <Typography variant="h6">Student Found</Typography>
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Name</Typography></Grid>
                  <Grid item xs={6}><Typography fontWeight={500}>{studentData.firstName} {studentData.lastName}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Student ID</Typography></Grid>
                  <Grid item xs={6}><Chip label={studentData.studentId} color="primary" size="small" sx={{ fontFamily: 'monospace' }} /></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Program</Typography></Grid>
                  <Grid item xs={6}><Typography>{studentData.program}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Level</Typography></Grid>
                  <Grid item xs={6}><Typography>{studentData.level}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Faculty</Typography></Grid>
                  <Grid item xs={6}><Typography>{studentData.faculty}</Typography></Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <StudentBarcode studentId={studentData.studentId} width={260} height={40} />
                <Box display="flex" justifyContent="center" mt={0.5}>
                  <StudentQRCode studentId={studentData.studentId} size={80} />
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography color="text.secondary" textAlign="center" py={4}>
                  Scan or enter a student ID to display card details here.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default BarcodeScannerPage;
