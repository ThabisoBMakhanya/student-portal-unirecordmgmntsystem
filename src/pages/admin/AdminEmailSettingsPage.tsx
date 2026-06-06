import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Tabs, Tab, Card, CardContent, TextField, Button, Switch,
  FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Divider, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Edit, Send, Save } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../services/api';
import { emailService } from '../../services/emailService';

interface Template {
  id: string; template_name: string; subject_template: string;
  body_template: string; variables: string; is_active: number; updated_at: string;
}

const AdminEmailSettingsPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [testTo, setTestTo] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const queryClient = useQueryClient();

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => emailService.getTemplates(),
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['email-logs-settings'],
    queryFn: () => emailService.getLogs({ limit: 50 }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiClient.put(`/email/templates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template updated');
      setEditTemplate(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const testMutation = useMutation({
    mutationFn: () => emailService.sendTest(testTo),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Test email sent!');
        if (data.previewUrl) toast.success(`Preview: ${data.previewUrl}`, { duration: 8000 });
      } else toast.error(data.error || 'Test failed');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Test failed'),
  });

  const customMutation = useMutation({
    mutationFn: () => emailService.sendCustom({ to: customTo, subject: customSubject, body: customBody }),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Email sent');
        setCustomTo(''); setCustomSubject(''); setCustomBody('');
      } else toast.error(data.error || 'Send failed');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleEdit = (t: Template) => {
    setEditTemplate(t);
    setEditSubject(t.subject_template);
    setEditBody(t.body_template);
    setEditActive(!!t.is_active);
  };

  const handleSaveEdit = () => {
    if (!editTemplate) return;
    updateMutation.mutate({
      id: editTemplate.id,
      data: { subject_template: editSubject, body_template: editBody, is_active: editActive },
    });
  };

  const statusColor = (s: string) => s === 'SENT' ? 'success' : s === 'FAILED' ? 'error' : 'default';

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={600} mb={3}>Email Settings</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Templates" />
        <Tab label="Send Test" />
        <Tab label="Recent Logs" />
      </Tabs>

      {tab === 0 && (
        <Box>
          {templatesLoading ? <CircularProgress /> : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Template</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates?.map((t: Template) => (
                    <TableRow key={t.id}>
                      <TableCell><Chip label={t.template_name} size="small" color="primary" variant="outlined" /></TableCell>
                      <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.subject_template}
                      </TableCell>
                      <TableCell>
                        <Chip label={t.is_active ? 'Active' : 'Disabled'} color={t.is_active ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell>{t.updated_at ? new Date(t.updated_at).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<Edit />} onClick={() => handleEdit(t)}>Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box display="flex" flexDirection="column" gap={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Send Test Email</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Send a test email to verify the email system is working. Uses Ethereal.email in dev mode.
              </Typography>
              <Box display="flex" gap={2} alignItems="flex-end">
                <TextField label="Recipient Email" value={testTo} onChange={e => setTestTo(e.target.value)} sx={{ minWidth: 300 }} />
                <Button variant="contained" startIcon={<Send />} onClick={() => testMutation.mutate()} disabled={!testTo || testMutation.isPending}>
                  {testMutation.isPending ? 'Sending...' : 'Send Test'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Send Custom Email</Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField label="To" value={customTo} onChange={e => setCustomTo(e.target.value)} fullWidth />
                <TextField label="Subject" value={customSubject} onChange={e => setCustomSubject(e.target.value)} fullWidth />
                <TextField label="Body (HTML)" value={customBody} onChange={e => setCustomBody(e.target.value)} multiline rows={5} fullWidth />
                <Button variant="contained" startIcon={<Send />} onClick={() => customMutation.mutate()} disabled={!customTo || !customSubject || !customBody || customMutation.isPending} sx={{ alignSelf: 'flex-start' }}>
                  {customMutation.isPending ? 'Sending...' : 'Send'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Email Configuration</Typography>
              <Typography variant="body2" color="text.secondary">
                Current mode: <strong>Ethereal (Development)</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To use production SMTP, set environment variables: <code>ETHEREAL_EMAIL=false</code>, <code>EMAIL_HOST</code>, <code>EMAIL_PORT</code>, <code>EMAIL_USER</code>, <code>EMAIL_PASS</code>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sent emails can be previewed at <a href="https://ethereal.email/login" target="_blank" rel="noreferrer">ethereal.email</a>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {tab === 2 && (
        <Box>
          {logsLoading ? <CircularProgress /> : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell><TableCell>To</TableCell><TableCell>Subject</TableCell>
                    <TableCell>Status</TableCell><TableCell>Sent</TableCell><TableCell>Preview</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs?.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center">No logs yet</TableCell></TableRow>
                  ) : logs?.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell><Chip label={log.email_type} size="small" variant="outlined" /></TableCell>
                      <TableCell>{log.recipient_email}</TableCell>
                      <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.subject}</TableCell>
                      <TableCell><Chip label={log.status} size="small" color={statusColor(log.status) as any} /></TableCell>
                      <TableCell>{log.sent_at}</TableCell>
                      <TableCell>
                        {log.preview_url ? (
                          <Button size="small" href={log.preview_url} target="_blank">View</Button>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Template Editor Dialog */}
      <Dialog open={!!editTemplate} onClose={() => setEditTemplate(null)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Template: {editTemplate?.template_name}</DialogTitle>
        <DialogContent>
          {editTemplate && (
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField label="Subject Template" value={editSubject} onChange={e => setEditSubject(e.target.value)} fullWidth />
              <TextField label="Body Template (HTML)" value={editBody} onChange={e => setEditBody(e.target.value)} multiline rows={12} fullWidth />
              <FormControlLabel control={<Switch checked={editActive} onChange={e => setEditActive(e.target.checked)} />} label="Active" />
              {editTemplate.variables && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Available variables:</Typography>
                  <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                    {JSON.parse(editTemplate.variables).map((v: string) => (
                      <Chip key={v} label={`{${v}}`} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTemplate(null)}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSaveEdit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEmailSettingsPage;
