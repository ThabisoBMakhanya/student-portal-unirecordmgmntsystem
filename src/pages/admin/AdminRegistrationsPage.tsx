import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Card, CardContent, Button, Table, TableHead, TableBody, TableRow, TableCell,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert,
  Chip, TableContainer, Paper, Grid, Divider, Stepper, Step, StepLabel,
} from '@mui/material';
import { CheckCircle, Cancel, Visibility, Verified } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../services/api';

interface RegItem {
  id: string; student_id: string; first_name: string; last_name: string;
  academic_year: string; semester: number; status: string; submitted_at: string;
}

interface RegDetail {
  registration: RegItem & { program: string; faculty: string; level: string; email: string };
  documents: any[]; enrolledCourses: any[]; feeReceipt: any;
}

const AdminRegistrationsPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const queryClient = useQueryClient();

  const { data: pending, isLoading } = useQuery({
    queryKey: ['admin-pending-registrations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/registrations/pending');
      return data.data.registrations as RegItem[];
    },
  });

  const { data: allRegs } = useQuery({
    queryKey: ['admin-all-registrations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/registrations/all');
      return data.data.registrations as RegItem[];
    },
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-registration-detail', selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      const { data } = await apiClient.get(`/admin/registrations/${selectedId}`);
      return data.data as RegDetail;
    },
    enabled: !!selectedId,
  });

  const verifyDocsMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.put(`/admin/registrations/${id}/verify-documents`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-registration-detail'] });
      toast.success('Documents verified');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Verification failed'),
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.put(`/admin/registrations/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-registrations'] });
      toast.success('Registration approved');
      setSelectedId(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Approval failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await apiClient.put(`/admin/registrations/${id}/reject`, { rejection_reason: reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-registrations'] });
      toast.success('Registration rejected');
      setRejectId(null);
      setRejectReason('');
      setSelectedId(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Rejection failed'),
  });

  const statusColor = (s: string) => {
    switch (s) {
      case 'REGISTERED': case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'DOCUMENTS_VERIFIED': return 'info';
      case 'SUBMITTED': return 'warning';
      default: return 'default';
    }
  };

  const statusStep = (s: string) => {
    const map: Record<string, number> = { DRAFT: 0, SUBMITTED: 1, DOCUMENTS_VERIFIED: 2, APPROVED: 3, REGISTERED: 4 };
    return map[s] ?? 0;
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={600} mb={3}>Semester Registration Management</Typography>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pending Registrations</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Year/Sem</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pending?.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">No pending registrations</TableCell></TableRow>
              ) : pending?.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.first_name} {r.last_name}</TableCell>
                  <TableCell>{r.academic_year} Sem {r.semester}</TableCell>
                  <TableCell><Chip label={r.status} color={statusColor(r.status)} size="small" /></TableCell>
                  <TableCell>{new Date(r.submitted_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Visibility />} onClick={() => setSelectedId(r.id)}>
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h5" gutterBottom>All Registrations</Typography>
      {allRegs && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Year/Sem</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allRegs?.map((r) => (
                <TableRow key={r.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelectedId(r.id)}>
                  <TableCell>{r.id.substring(0, 16)}...</TableCell>
                  <TableCell>{r.first_name} {r.last_name}</TableCell>
                  <TableCell>{r.academic_year} Sem {r.semester}</TableCell>
                  <TableCell><Chip label={r.status} color={statusColor(r.status)} size="small" /></TableCell>
                  <TableCell>{new Date(r.submitted_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedId} onClose={() => setSelectedId(null)} maxWidth="md" fullWidth>
        <DialogTitle>Registration Details</DialogTitle>
        <DialogContent>
          {detailLoading ? <CircularProgress /> : detail ? (
            <Box>
              <Stepper activeStep={statusStep(detail.registration.status)} alternativeLabel sx={{ mb: 3, mt: 1 }}>
                {['Draft', 'Submitted', 'Docs Verified', 'Approved', 'Registered'].map(l => <Step key={l}><StepLabel>{l}</StepLabel></Step>)}
              </Stepper>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Student</Typography>
                  <Typography>{detail.registration.first_name} {detail.registration.last_name}</Typography>
                  <Typography variant="subtitle2" mt={1}>Student ID</Typography>
                  <Typography>{detail.registration.student_id}</Typography>
                  <Typography variant="subtitle2" mt={1}>Email</Typography>
                  <Typography>{detail.registration.email}</Typography>
                  <Typography variant="subtitle2" mt={1}>Program/Faculty</Typography>
                  <Typography>{detail.registration.program} - {detail.registration.faculty}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Academic Year</Typography>
                  <Typography>{detail.registration.academic_year}</Typography>
                  <Typography variant="subtitle2" mt={1}>Semester</Typography>
                  <Typography>{detail.registration.semester}</Typography>
                  <Typography variant="subtitle2" mt={1}>Status</Typography>
                  <Chip label={detail.registration.status} color={statusColor(detail.registration.status)} size="small" />
                  <Typography variant="subtitle2" mt={1}>Submitted</Typography>
                  <Typography>{new Date(detail.registration.submitted_at).toLocaleString()}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Enrolled Courses</Typography>
              {detail.enrolledCourses.length === 0 ? (
                <Typography color="text.secondary">No courses</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead><TableRow><TableCell>Code</TableCell><TableCell>Name</TableCell></TableRow></TableHead>
                    <TableBody>{detail.enrolledCourses.map((c: any) => (
                      <TableRow key={c.id}><TableCell>{c.course_code}</TableCell><TableCell>{c.course_name}</TableCell></TableRow>
                    ))}</TableBody>
                  </Table>
                </TableContainer>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Documents</Typography>
              {detail.documents.length === 0 ? (
                <Typography color="text.secondary">No documents uploaded</Typography>
              ) : (
                detail.documents.map((d: any) => (
                  <Box key={d.id} display="flex" gap={1} alignItems="center">
                    <Chip label={d.document_type} size="small" />
                    <Button size="small" href={`http://localhost:5000${d.file_path}`} target="_blank">View</Button>
                  </Box>
                ))
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Fee Receipt</Typography>
              {detail.feeReceipt ? (
                <Box>
                  <Typography>Amount: R{detail.feeReceipt.amount}</Typography>
                  <Typography>Method: {detail.feeReceipt.payment_method}</Typography>
                  <Typography>Receipt: {detail.feeReceipt.receipt_number}</Typography>
                  <Typography>Status: <Chip label={detail.feeReceipt.status} size="small" /></Typography>
                  <Button size="small" href={`http://localhost:5000${detail.feeReceipt.receipt_file_path}`} target="_blank">View Receipt File</Button>
                </Box>
              ) : (
                <Typography color="text.secondary">No fee receipt uploaded</Typography>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Box>
            {detail && detail.registration.status === 'SUBMITTED' && (
              <Button variant="outlined" startIcon={<Verified />} color="info" onClick={() => verifyDocsMutation.mutate(selectedId!)}>
                Verify Documents
              </Button>
            )}
          </Box>
          <Box display="flex" gap={1}>
            {detail && (detail.registration.status === 'SUBMITTED' || detail.registration.status === 'DOCUMENTS_VERIFIED') && (
              <>
                <Button variant="contained" startIcon={<CheckCircle />} color="success" onClick={() => approveMutation.mutate(selectedId!)}>
                  Approve
                </Button>
                <Button variant="contained" startIcon={<Cancel />} color="error" onClick={() => { setRejectId(selectedId); setRejectReason(''); }}>
                  Reject
                </Button>
              </>
            )}
            <Button onClick={() => setSelectedId(null)}>Close</Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog open={!!rejectId} onClose={() => setRejectId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Registration</DialogTitle>
        <DialogContent>
          <TextField label="Rejection Reason" multiline rows={3} fullWidth sx={{ mt: 1 }} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => rejectId && rejectMutation.mutate({ id: rejectId, reason: rejectReason })}>Reject</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminRegistrationsPage;
