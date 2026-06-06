import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Card, CardContent, CardActions, Button, Stepper, Step, StepLabel,
  TextField, CircularProgress, Alert, Checkbox, FormControlLabel, Chip, Grid, Divider,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../services/api';

interface Course { id: string; course_code: string; course_name: string; credits: number; }
interface Registration { id: string; academic_year: string; semester: number; status: string; submitted_at: string; }
interface Document { id: string; document_type: string; file_path: string; }

const steps = ['Select Courses', 'Upload Documents', 'Upload Fee Receipt', 'Submit'];

const StudentRegistrationPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [regId, setRegId] = useState<string | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [feeUploaded, setFeeUploaded] = useState(false);
  const queryClient = useQueryClient();

  const { data: coursesData } = useQuery({
    queryKey: ['available-courses'],
    queryFn: async () => {
      const { data } = await apiClient.get('/student/courses/available');
      return data.data.courses as Course[];
    },
  });

  const { data: myRegs } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/student/registrations/my');
      return data.data.registrations as Registration[];
    },
  });

  const activeReg = myRegs?.find((r: Registration) => !['REGISTERED', 'REJECTED'].includes(r.status));

  const submitRegMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/student/registrations/new', {
        academic_year: '2025', semester: 2, course_ids: selectedCourses,
      });
      return data.data as { id: string };
    },
    onSuccess: (result) => {
      setRegId(result.id);
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      toast.success('Registration submitted!');
      setActiveStep(3);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Submission failed'),
  });

  const docUploadMutation = useMutation({
    mutationFn: async ({ regId, fd }: { regId: string; fd: FormData }) => {
      const { data } = await apiClient.post(`/student/registrations/${regId}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      setUploadedDocs(prev => [...prev, 'uploaded']);
      toast.success('Document uploaded');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Upload failed'),
  });

  const feeUploadMutation = useMutation({
    mutationFn: async ({ regId, fd }: { regId: string; fd: FormData }) => {
      const { data } = await apiClient.post(`/student/registrations/${regId}/fee-receipt`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      setFeeUploaded(true);
      toast.success('Fee receipt uploaded');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Upload failed'),
  });

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId) ? prev.filter(c => c !== courseId) : [...prev, courseId]
    );
  };

  const handleDocUpload = (e: React.FormEvent<HTMLFormElement>, regIdVal: string) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    docUploadMutation.mutate({ regId: regIdVal, fd });
  };

  const handleFeeUpload = (e: React.FormEvent<HTMLFormElement>, regIdVal: string) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    feeUploadMutation.mutate({ regId: regIdVal, fd });
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'REGISTERED': return 'success';
      case 'REJECTED': return 'error';
      case 'SUBMITTED': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={600} mb={3}>Semester Registration</Typography>

      {/* Existing Registration Status */}
      {myRegs && myRegs.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>My Registrations</Typography>
            {myRegs.map((r: Registration) => (
              <Box key={r.id} display="flex" alignItems="center" gap={2} mb={1}>
                <Typography variant="body2">Year {r.academic_year} Sem {r.semester}</Typography>
                <Chip label={r.status} color={statusColor(r.status)} size="small" />
                <Typography variant="caption">{new Date(r.submitted_at).toLocaleDateString()}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {activeReg ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have a pending registration ({activeReg.status}). Documents and fee receipt can be uploaded below.
        </Alert>
      ) : (
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}</Stepper>
      )}

      {/* Step 0: Course Selection */}
      {(activeStep === 0 || activeReg) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Select Courses</Typography>
            {coursesData?.length === 0 ? (
              <Typography color="text.secondary">No available courses</Typography>
            ) : (
              <Grid container spacing={1}>
                {coursesData?.map((c: Course) => (
                  <Grid item xs={12} sm={6} md={4} key={c.id}>
                    <Card variant="outlined" sx={{ cursor: 'pointer', opacity: selectedCourses.includes(c.id) ? 1 : 0.6, border: selectedCourses.includes(c.id) ? '2px solid' : undefined }}>
                      <CardContent sx={{ py: 1.5, px: 2 }}>
                        <FormControlLabel
                          control={<Checkbox checked={selectedCourses.includes(c.id)} onChange={() => handleCourseToggle(c.id)} />}
                          label={<><strong>{c.course_code}</strong> - {c.course_name} ({c.credits} cr)</>}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            {!activeReg && (
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button variant="contained" disabled={selectedCourses.length === 0} onClick={() => setActiveStep(1)}>
                  Next: Upload Documents
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 1: Documents Upload */}
      {activeReg && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Upload Documents</Typography>
            {activeReg && (
              <Box component="form" onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleDocUpload(e, activeReg.id)} display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <TextField name="document_type" label="Document Type" defaultValue="REGISTRATION_FORM" size="small" />
                <Button variant="outlined" component="label">
                  Choose File
                  <input type="file" name="documentFile" hidden required accept=".pdf,.png,.jpg,.jpeg" />
                </Button>
                <Button type="submit" variant="contained" disabled={docUploadMutation.isPending}>
                  {docUploadMutation.isPending ? 'Uploading...' : 'Upload'}
                </Button>
              </Box>
            )}
            <Typography variant="caption" color="text.secondary" mt={1}>Uploaded: {uploadedDocs.length} file(s)</Typography>
          </CardContent>
        </Card>
      )}

      {!activeReg && activeStep === 1 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Upload Documents</Typography>
            <Typography color="text.secondary">Submit the registration first, then upload documents.</Typography>
            <Box mt={2} display="flex" justifyContent="space-between">
              <Button onClick={() => setActiveStep(0)}>Back</Button>
              <Button variant="contained" onClick={() => { submitRegMutation.mutate(); }}>
                {submitRegMutation.isPending ? <CircularProgress size={20} /> : 'Submit Registration'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Fee Receipt Upload */}
      {activeReg && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Upload Registration Fee Receipt</Typography>
            {feeUploaded ? (
              <Alert severity="success">Fee receipt uploaded successfully</Alert>
            ) : (
              <Box component="form" onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleFeeUpload(e, activeReg.id)} display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <TextField name="amount" label="Amount (R)" type="number" size="small" required />
                <TextField name="payment_date" label="Payment Date" type="date" size="small" InputLabelProps={{ shrink: true }} />
                <TextField name="payment_method" label="Payment Method" size="small" defaultValue="BANK_TRANSFER" />
                <TextField name="receipt_number" label="Receipt Number" size="small" />
                <Button variant="outlined" component="label">
                  Choose File
                  <input type="file" name="receiptFile" hidden required accept=".pdf,.png,.jpg,.jpeg" />
                </Button>
                <Button type="submit" variant="contained" disabled={feeUploadMutation.isPending}>
                  {feeUploadMutation.isPending ? 'Uploading...' : 'Upload Receipt'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Submit Confirmation */}
      {!activeReg && activeStep === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Upload Registration Fee Receipt</Typography>
            <Typography color="text.secondary">Submit the registration first, then upload fee receipt.</Typography>
            <Box mt={2} display="flex" justifyContent="space-between">
              <Button onClick={() => setActiveStep(1)}>Back</Button>
              <Button variant="contained" onClick={() => { submitRegMutation.mutate(); }}>
                {submitRegMutation.isPending ? <CircularProgress size={20} /> : 'Submit Registration'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Dialog open={activeStep === 3 && !activeReg} onClose={() => {}} maxWidth="sm" fullWidth>
        <DialogTitle>Registration Submitted</DialogTitle>
        <DialogContent>
          <Alert severity="success">Your semester registration has been submitted successfully!</Alert>
          <Typography mt={2}>Registration ID: {regId}</Typography>
          <Typography>Status: <Chip label="SUBMITTED" color="info" size="small" /></Typography>
          <Typography variant="body2" mt={1}>Upload documents and fee receipt using the sections above. An admin will review your registration.</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
            setActiveStep(0);
            setSelectedCourses([]);
          }}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentRegistrationPage;
