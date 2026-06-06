import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { emailService } from '../../services/emailService';

const EmailLogsPage: React.FC = () => {
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['email-logs', filterType, filterStatus],
    queryFn: () => emailService.getLogs({ type: filterType || undefined, status: filterStatus || undefined, limit: 200 }),
  });

  const resendMutation = useMutation({
    mutationFn: emailService.resendEmail,
    onSuccess: (data) => {
      if (data.success) toast.success('Email resent successfully');
      else toast.error(data.error || 'Resend failed');
    },
  });

  const statusColor = (s: string) => s === 'SENT' ? 'success' : s === 'FAILED' ? 'error' : 'default';

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={600} gutterBottom>Email Logs</Typography>
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField size="small" label="Type" value={filterType} onChange={e => setFilterType(e.target.value)} />
        <TextField size="small" label="Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} />
      </Box>
      {isLoading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell><TableCell>To</TableCell><TableCell>Subject</TableCell>
                <TableCell>Status</TableCell><TableCell>Sent</TableCell><TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(logs || []).map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell><Chip label={log.email_type} size="small" /></TableCell>
                  <TableCell>{log.recipient_email}</TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.subject}</TableCell>
                  <TableCell><Chip label={log.status} size="small" color={statusColor(log.status) as any} /></TableCell>
                  <TableCell>{log.sent_at}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => setSelectedLog(log)}>View</Button>
                    <Button size="small" onClick={() => resendMutation.mutate(log.id)} disabled={resendMutation.isPending}>Resend</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={!!selectedLog} onClose={() => setSelectedLog(null)} maxWidth="md" fullWidth>
        <DialogTitle>Email Detail</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box>
              <Typography variant="subtitle2">To: {selectedLog.recipient_email}</Typography>
              <Typography variant="subtitle2">Subject: {selectedLog.subject}</Typography>
              <Typography variant="subtitle2">Status: {selectedLog.status}</Typography>
              <Typography variant="subtitle2">Type: {selectedLog.email_type}</Typography>
              <Typography variant="subtitle2">Sent: {selectedLog.sent_at}</Typography>
              {selectedLog.preview_url && (
                <Button href={selectedLog.preview_url} target="_blank" sx={{ mt: 1 }}>View in Ethereal</Button>
              )}
              {selectedLog.error_message && <Alert severity="error" sx={{ mt: 1 }}>{selectedLog.error_message}</Alert>}
              <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1} sx={{ whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto' }}>{selectedLog.body}</Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedLog(null)}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailLogsPage;
