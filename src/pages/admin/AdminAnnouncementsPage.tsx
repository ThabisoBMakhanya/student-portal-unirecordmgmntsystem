import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, CircularProgress, Snackbar, Alert, IconButton, Tooltip } from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService } from '@/services/announcementService';

const AdminAnnouncementsPage = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', priority: 'normal', isPinned: false, expiresAt: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => { const res = await announcementService.getAll(1, 100); return res.data.data; },
  });

  const createMutation = useMutation({
    mutationFn: () => announcementService.create(form),
    onSuccess: () => { setSnackbar({ open: true, message: 'Announcement created!', severity: 'success' }); setDialogOpen(false); resetForm(); queryClient.invalidateQueries({ queryKey: ['admin-announcements'] }); },
    onError: () => setSnackbar({ open: true, message: 'Failed to create', severity: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: () => announcementService.update(editing.id, form),
    onSuccess: () => { setSnackbar({ open: true, message: 'Announcement updated!', severity: 'success' }); setDialogOpen(false); setEditing(null); resetForm(); queryClient.invalidateQueries({ queryKey: ['admin-announcements'] }); },
    onError: () => setSnackbar({ open: true, message: 'Failed to update', severity: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => announcementService.delete(deleteId!),
    onSuccess: () => { setSnackbar({ open: true, message: 'Announcement deleted', severity: 'success' }); setDeleteId(null); queryClient.invalidateQueries({ queryKey: ['admin-announcements'] }); },
    onError: () => setSnackbar({ open: true, message: 'Failed to delete', severity: 'error' }),
  });

  const resetForm = () => setForm({ title: '', content: '', category: 'general', priority: 'normal', isPinned: false, expiresAt: '' });

  const openCreate = () => { resetForm(); setEditing(null); setDialogOpen(true); };
  const openEdit = (a: any) => { setForm({ title: a.title, content: a.content, category: a.category, priority: a.priority, isPinned: !!a.is_pinned, expiresAt: a.expires_at || '' }); setEditing(a); setDialogOpen(true); };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Announcements</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>New Announcement</Button>
      </Stack>

      {isLoading ? <Box textAlign="center" py={4}><CircularProgress /></Box> : (
        <Card><CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.announcements?.length === 0 && <TableRow><TableCell colSpan={7} align="center">No announcements yet.</TableCell></TableRow>}
                {data?.announcements?.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {a.is_pinned ? <Chip label="PINNED" size="small" color="warning" variant="outlined" /> : null}
                        <Typography>{a.title}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell><Chip label={a.category} size="small" /></TableCell>
                    <TableCell><Chip label={a.priority} size="small" color={a.priority === 'urgent' ? 'error' : a.priority === 'high' ? 'warning' : 'default'} /></TableCell>
                    <TableCell>{a.author_name}</TableCell>
                    <TableCell>{a.published_at?.slice(0, 10)}</TableCell>
                    <TableCell><Chip label={a.is_published ? 'Published' : 'Draft'} size="small" color={a.is_published ? 'success' : 'default'} /></TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(a)}><Edit fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteId(a.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent></Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField label="Title" fullWidth value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            <TextField label="Content" fullWidth multiline rows={6} value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} />
            <Stack direction="row" spacing={2}>
              <TextField select label="Category" fullWidth value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}>
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="administrative">Administrative</MenuItem>
                <MenuItem value="events">Events</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
              </TextField>
              <TextField select label="Priority" fullWidth value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField select label="Pinned" value={form.isPinned ? 'yes' : 'no'} onChange={(e) => setForm(f => ({ ...f, isPinned: e.target.value === 'yes' }))} sx={{ width: 150 }}>
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
              </TextField>
              <TextField label="Expires At" type="date" value={form.expiresAt} onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))} InputLabelProps={{ shrink: true }} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()} disabled={!form.title || !form.content}>
            {editing ? 'Update' : 'Publish'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Announcement?</DialogTitle>
        <DialogContent><Typography>This action cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => deleteMutation.mutate()}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminAnnouncementsPage;
