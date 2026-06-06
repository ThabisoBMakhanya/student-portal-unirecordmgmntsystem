import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Snackbar, Alert, Tabs, Tab, IconButton, Tooltip } from '@mui/material';
import { CheckCircle, Cancel, Visibility } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '@/services/staffOpsService';

const StaffReceiptsPage = () => {
  const [tab, setTab] = useState(0);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [viewReceipt, setViewReceipt] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const queryClient = useQueryClient();

  const statusFilter = ['', 'PENDING', 'VERIFIED', 'REJECTED'][tab];

  const { data, isLoading } = useQuery({
    queryKey: ['staff-receipts', statusFilter],
    queryFn: async () => { const res = await staffService.getReceipts(statusFilter || undefined); return res.data.data.receipts; },
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => staffService.verifyReceipt(id),
    onSuccess: () => { setSnackbar({ open: true, message: 'Receipt verified!', severity: 'success' }); queryClient.invalidateQueries({ queryKey: ['staff-receipts'] }); },
    onError: () => setSnackbar({ open: true, message: 'Verification failed', severity: 'error' }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => staffService.rejectReceipt(rejectDialog.id, rejectReason),
    onSuccess: () => { setSnackbar({ open: true, message: 'Receipt rejected', severity: 'success' }); setRejectDialog({ open: false, id: '' }); setRejectReason(''); queryClient.invalidateQueries({ queryKey: ['staff-receipts'] }); },
    onError: () => setSnackbar({ open: true, message: 'Failed to reject', severity: 'error' }),
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Payment Receipts</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="All" />
        <Tab label="Pending" />
        <Tab label="Verified" />
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
                  <TableCell>Amount</TableCell>
                  <TableCell>Bank</TableCell>
                  <TableCell>Transaction Ref</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.length === 0 && <TableRow><TableCell colSpan={8} align="center">No receipts found.</TableCell></TableRow>}
                {data?.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.first_name} {r.last_name}</TableCell>
                    <TableCell>{r.student_id}</TableCell>
                    <TableCell>R{r.amount}</TableCell>
                    <TableCell>{r.bank_name}</TableCell>
                    <TableCell>{r.transaction_ref}</TableCell>
                    <TableCell>{r.payment_date ? new Date(r.payment_date).toLocaleDateString() : r.created_at?.slice(0,10)}</TableCell>
                    <TableCell>
                      <Chip label={r.status} size="small"
                        color={r.status === 'VERIFIED' ? 'success' : r.status === 'REJECTED' ? 'error' : 'warning'} />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="View Receipt"><IconButton size="small" onClick={() => setViewReceipt(r)}><Visibility fontSize="small" /></IconButton></Tooltip>
                        {r.status === 'PENDING' && <>
                          <Tooltip title="Verify"><IconButton size="small" color="success" onClick={() => verifyMutation.mutate(r.id)}><CheckCircle fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Reject"><IconButton size="small" color="error" onClick={() => setRejectDialog({ open: true, id: r.id })}><Cancel fontSize="small" /></IconButton></Tooltip>
                        </>}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent></Card>
      )}

      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, id: '' })}>
        <DialogTitle>Reject Receipt</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth multiline rows={3} label="Reason for rejection" value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, id: '' })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => rejectMutation.mutate()}>Reject</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!viewReceipt} onClose={() => setViewReceipt(null)} maxWidth="md" fullWidth>
        <DialogTitle>Receipt Details</DialogTitle>
        <DialogContent>
          {viewReceipt && (
            <Box>
              <Typography>Student: {viewReceipt.first_name} {viewReceipt.last_name} ({viewReceipt.student_id})</Typography>
              <Typography>Amount: R{viewReceipt.amount}</Typography>
              <Typography>Bank: {viewReceipt.bank_name}</Typography>
              <Typography>Transaction Ref: {viewReceipt.transaction_ref}</Typography>
              <Typography>Payment Date: {viewReceipt.payment_date}</Typography>
              <Typography>Status: {viewReceipt.status}</Typography>
              {viewReceipt.receipt_file_path && (
                <Box mt={2}>
                  <Typography variant="subtitle2">Receipt Image:</Typography>
                  <Box component="img" src={`http://localhost:5000/${viewReceipt.receipt_file_path}`}
                    sx={{ maxWidth: '100%', mt: 1, border: 1, borderColor: 'divider', borderRadius: 1 }} />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewReceipt(null)}>Close</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default StaffReceiptsPage;
