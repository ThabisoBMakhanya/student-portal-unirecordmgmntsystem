import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Card, CardContent, Button, Table, TableHead, TableBody, TableRow, TableCell,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert,
  Chip, TableContainer, Paper, Select, MenuItem, FormControl, InputLabel, IconButton,
} from '@mui/material';
import { CheckCircle, Cancel, Visibility } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../services/api';

interface Receipt {
  id: string; student_id: string; first_name: string; last_name: string;
  amount: number; bank_name: string; transaction_ref: string;
  status: string; rejection_reason?: string; file_path: string;
  created_at: string; verified_at?: string;
}

const AdminReceiptsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const queryClient = useQueryClient();

  const { data: receipts, isLoading } = useQuery({
    queryKey: ['admin-receipts', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const { data } = await apiClient.get(`/admin/receipts/payment${params}`);
      return data.data.receipts as Receipt[];
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.put(`/admin/receipts/payment/${id}/verify`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-receipts'] });
      toast.success('Receipt verified');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Verification failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await apiClient.put(`/admin/receipts/payment/${id}/reject`, { rejection_reason: reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-receipts'] });
      toast.success('Receipt rejected');
      setRejectId(null);
      setRejectReason('');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Rejection failed'),
  });

  const statusColor = (s: string) => {
    switch (s) {
      case 'VERIFIED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'warning';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={600} mb={3}>Payment Receipts Management</Typography>
      <FormControl sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel>Status Filter</InputLabel>
        <Select value={statusFilter} label="Status Filter" onChange={(e) => setStatusFilter(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="VERIFIED">Verified</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
        </Select>
      </FormControl>
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receipts?.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">No receipts found</TableCell></TableRow>
              ) : receipts?.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{r.first_name} {r.last_name}</TableCell>
                  <TableCell>R{r.amount.toLocaleString()}</TableCell>
                  <TableCell>{r.bank_name}</TableCell>
                  <TableCell>{r.transaction_ref}</TableCell>
                  <TableCell><Chip label={r.status} color={statusColor(r.status)} size="small" /></TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <IconButton size="small" onClick={() => setDetailId(r.id)}><Visibility /></IconButton>
                      {r.status === 'PENDING' && (
                        <>
                          <IconButton size="small" color="success" onClick={() => verifyMutation.mutate(r.id)}>
                            <CheckCircle />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => { setRejectId(r.id); setRejectReason(''); }}>
                            <Cancel />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!detailId} onClose={() => setDetailId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Receipt Details</DialogTitle>
        <DialogContent>
          {receipts?.filter(r => r.id === detailId).map(r => (
            <Box key={r.id}>
              <Typography><strong>Student:</strong> {r.first_name} {r.last_name}</Typography>
              <Typography><strong>Amount:</strong> R{r.amount.toLocaleString()}</Typography>
              <Typography><strong>Bank:</strong> {r.bank_name}</Typography>
              <Typography><strong>Reference:</strong> {r.transaction_ref}</Typography>
              <Typography><strong>Status:</strong> {r.status}</Typography>
              <Typography><strong>Uploaded:</strong> {new Date(r.created_at).toLocaleString()}</Typography>
              {r.verified_at && <Typography><strong>Verified:</strong> {new Date(r.verified_at).toLocaleString()}</Typography>}
              {r.rejection_reason && <Alert severity="error"><strong>Reason:</strong> {r.rejection_reason}</Alert>}
              <Button variant="outlined" href={`http://localhost:5000${r.file_path}`} target="_blank" sx={{ mt: 1 }}>
                View File
              </Button>
            </Box>
          ))}
        </DialogContent>
        <DialogActions><Button onClick={() => setDetailId(null)}>Close</Button></DialogActions>
      </Dialog>

      <Dialog open={!!rejectId} onClose={() => setRejectId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Receipt</DialogTitle>
        <DialogContent>
          <TextField
            label="Rejection Reason" multiline rows={3} fullWidth sx={{ mt: 1 }}
            value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => rejectId && rejectMutation.mutate({ id: rejectId, reason: rejectReason })}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminReceiptsPage;
