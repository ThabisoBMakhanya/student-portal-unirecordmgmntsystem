import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Card, CardContent, Button, Table, TableHead, TableBody, TableRow, TableCell,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert,
  Chip, TableContainer, Paper, IconButton,
} from '@mui/material';
import { Upload, Visibility } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../services/api';

interface Receipt {
  id: string; amount: number; bank_name: string; transaction_ref: string;
  status: string; rejection_reason?: string; file_path: string;
  created_at: string; verified_at?: string; verified_by?: string;
}

const StudentReceiptsPage: React.FC = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: receipts, isLoading } = useQuery({
    queryKey: ['my-receipts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/student/receipts/payment/my');
      return data.data.receipts as Receipt[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const { data } = await apiClient.post('/student/receipts/payment/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-receipts'] });
      toast.success('Receipt uploaded');
      setUploadOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Upload failed'),
  });

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    uploadMutation.mutate(fd);
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'VERIFIED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'warning';
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>Payment Receipts</Typography>
        <Button variant="contained" startIcon={<Upload />} onClick={() => setUploadOpen(true)}>
          Upload Receipt
        </Button>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receipts?.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">No receipts uploaded yet</TableCell></TableRow>
              ) : receipts?.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>R{r.amount.toLocaleString()}</TableCell>
                  <TableCell>{r.bank_name}</TableCell>
                  <TableCell>{r.transaction_ref}</TableCell>
                  <TableCell><Chip label={r.status} color={statusColor(r.status)} size="small" /></TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => setDetailId(r.id)}><Visibility /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleUpload}>
          <DialogTitle>Upload Payment Receipt</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField name="amount" label="Amount (R)" type="number" required />
              <TextField name="bank_name" label="Bank Name" required />
              <TextField name="transaction_ref" label="Transaction Reference" />
              <Button variant="outlined" component="label">
                Receipt File (PDF/Image)
                <input type="file" name="receiptFile" hidden accept=".pdf,.png,.jpg,.jpeg" required />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onClose={() => setDetailId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Receipt Details</DialogTitle>
        <DialogContent>
          {receipts?.filter(r => r.id === detailId).map(r => (
            <Box key={r.id} display="flex" flexDirection="column" gap={1}>
              <Typography><strong>Amount:</strong> R{r.amount.toLocaleString()}</Typography>
              <Typography><strong>Bank:</strong> {r.bank_name}</Typography>
              <Typography><strong>Reference:</strong> {r.transaction_ref}</Typography>
              <Typography><strong>Status:</strong> {r.status}</Typography>
              <Typography><strong>Uploaded:</strong> {new Date(r.created_at).toLocaleString()}</Typography>
              {r.verified_at && <Typography><strong>Verified:</strong> {new Date(r.verified_at).toLocaleString()}</Typography>}
              {r.rejection_reason && <Alert severity="error"><strong>Rejection:</strong> {r.rejection_reason}</Alert>}
              <Button variant="outlined" href={`http://localhost:5000${r.file_path}`} target="_blank" sx={{ mt: 1 }}>
                View File
              </Button>
            </Box>
          ))}
        </DialogContent>
        <DialogActions><Button onClick={() => setDetailId(null)}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentReceiptsPage;
