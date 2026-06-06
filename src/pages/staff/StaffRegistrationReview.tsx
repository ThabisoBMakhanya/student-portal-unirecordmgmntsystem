import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Grid, Chip, Button, Stack, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Snackbar, Alert, Tooltip } from '@mui/material';
import { ArrowBack, CheckCircle, Cancel, Description } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '@/services/staffOpsService';

const StaffRegistrationReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const { data, isLoading } = useQuery({
    queryKey: ['staff-registration', id],
    queryFn: async () => { const res = await staffService.getRegistration(id!); return res.data.data; },
    enabled: !!id,
  });

  const verifyDocsMutation = useMutation({
    mutationFn: () => staffService.verifyDocuments(id!),
    onSuccess: () => { setSnackbar({ open: true, message: 'Documents verified!', severity: 'success' }); queryClient.invalidateQueries({ queryKey: ['staff-registration', id] }); },
    onError: () => setSnackbar({ open: true, message: 'Failed', severity: 'error' }),
  });

  const approveMutation = useMutation({
    mutationFn: () => staffService.approveRegistration(id!),
    onSuccess: () => { setSnackbar({ open: true, message: 'Registration approved!', severity: 'success' }); queryClient.invalidateQueries({ queryKey: ['staff-registration', id] }); },
    onError: () => setSnackbar({ open: true, message: 'Failed to approve', severity: 'error' }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => staffService.rejectRegistration(id!, rejectReason),
    onSuccess: () => { setSnackbar({ open: true, message: 'Registration rejected', severity: 'success' }); setRejectDialog(false); setRejectReason(''); queryClient.invalidateQueries({ queryKey: ['staff-registration', id] }); },
    onError: () => setSnackbar({ open: true, message: 'Failed to reject', severity: 'error' }),
  });

  if (isLoading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;
  const reg = data?.registration;

  const canVerifyDocs = reg?.status === 'SUBMITTED';
  const canApprove = reg?.status === 'DOCUMENTS_VERIFIED' || reg?.status === 'FEE_VERIFIED';
  const isFinalized = reg?.status === 'APPROVED' || reg?.status === 'REGISTERED' || reg?.status === 'REJECTED';

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/staff/registrations')}>Back</Button>
        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold">Registration Review</Typography>
          <Typography variant="body2" color="text.secondary">{reg?.first_name} {reg?.last_name} ({reg?.student_id})</Typography>
        </Box>
        <Chip label={reg?.status} color={reg?.status === 'APPROVED' || reg?.status === 'REGISTERED' ? 'success' : reg?.status === 'REJECTED' ? 'error' : 'warning'} />
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Student Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}><Typography variant="body2" color="text.secondary">Name</Typography><Typography>{reg?.first_name} {reg?.last_name}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" color="text.secondary">Student ID</Typography><Typography>{reg?.student_id}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" color="text.secondary">Program</Typography><Typography>{reg?.program}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" color="text.secondary">Faculty</Typography><Typography>{reg?.faculty}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" color="text.secondary">Level</Typography><Typography>{reg?.level}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" color="text.secondary">Email</Typography><Typography>{reg?.email}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" color="text.secondary">Academic Year</Typography><Typography>{reg?.academic_year}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" color="text.secondary">Semester</Typography><Typography>Semester {reg?.semester}</Typography></Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Selected Courses</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead><TableRow><TableCell>Code</TableCell><TableCell>Course Name</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                  <TableBody>
                    {data?.enrolledCourses?.map((c: any) => (
                      <TableRow key={c.id}><TableCell>{c.course_code}</TableCell><TableCell>{c.course_name}</TableCell><TableCell><Chip label={c.status} size="small" /></TableCell></TableRow>
                    ))}
                    {(!data?.enrolledCourses || data.enrolledCourses.length === 0) && (
                      <TableRow><TableCell colSpan={3} align="center">No courses selected</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Uploaded Documents</Typography>
              {data?.documents?.map((d: any) => (
                <Stack key={d.id} direction="row" alignItems="center" spacing={2} mb={1}>
                  <Description color="primary" />
                  <Typography flex={1}>{d.document_type}</Typography>
                  <Button size="small" variant="outlined" href={`http://localhost:5000/${d.file_path}`} target="_blank">View</Button>
                </Stack>
              ))}
              {(!data?.documents || data.documents.length === 0) && <Typography color="text.secondary">No documents uploaded</Typography>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Actions</Typography>
              {isFinalized ? (
                <Alert severity="info">This registration has been {reg?.status?.toLowerCase()}.</Alert>
              ) : (
                <Stack spacing={2}>
                  {canVerifyDocs && (
                    <Button fullWidth variant="contained" color="info" startIcon={<Description />}
                      onClick={() => verifyDocsMutation.mutate()} disabled={verifyDocsMutation.isPending}>
                      Verify Documents
                    </Button>
                  )}
                  {canApprove && (
                    <Button fullWidth variant="contained" color="success" startIcon={<CheckCircle />}
                      onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
                      Approve Registration
                    </Button>
                  )}
                  <Button fullWidth variant="outlined" color="error" startIcon={<Cancel />}
                    onClick={() => setRejectDialog(true)}>
                    Reject Registration
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>

          {data?.feeReceipt && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Registration Fee Receipt</Typography>
                <Typography variant="body2">Amount: R{data.feeReceipt.amount}</Typography>
                <Typography variant="body2">Status: <Chip label={data.feeReceipt.status} size="small" color={data.feeReceipt.status === 'VERIFIED' ? 'success' : 'warning'} /></Typography>
                {data.feeReceipt.receipt_file_path && (
                  <Button size="small" variant="outlined" href={`http://localhost:5000/${data.feeReceipt.receipt_file_path}`} target="_blank" sx={{ mt: 1 }}>
                    View Receipt
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)}>
        <DialogTitle>Reject Registration</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth multiline rows={3} label="Reason for rejection" value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => rejectMutation.mutate()}>Reject</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default StaffRegistrationReview;
