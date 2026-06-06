import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Grid, Alert, Tooltip, Tab, Tabs,
} from '@mui/material';
import { Add, Edit, Delete, Person, Email, Phone, Business, School } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import apiClient from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface StaffMember {
  _id: string; employeeId: string; firstName: string; lastName: string;
  title: string; department: string; faculty: string; email: string;
  phone: string; biography: string; officeBuilding: string; officeRoom: string;
  specializations: string[]; status: string; hireDate: string;
}

const defaultForm = {
  firstName: '', lastName: '', title: 'Lecturer', department: '', faculty: '',
  email: '', phone: '', biography: '', officeBuilding: '', officeRoom: '', specializations: '',
};

const StaffManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [facFilter, setFacFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [faculties, setFaculties] = useState<string[]>([]);

  useEffect(() => {
    apiClient.get('/admin/staff-meta/departments').then(r => setDepartments(r.data.data.departments)).catch(() => {});
    apiClient.get('/admin/staff-meta/faculties').then(r => setFaculties(r.data.data.faculties)).catch(() => {});
  }, []);

  const queryStr = `?search=${search}${deptFilter ? `&department=${deptFilter}` : ''}${facFilter ? `&faculty=${facFilter}` : ''}`;
  const { data, isLoading } = useQuery({
    queryKey: ['admin-staff', search, deptFilter, facFilter],
    queryFn: () => apiClient.get(`/admin/staff${queryStr}`).then(r => r.data.data.staff as StaffMember[]),
  });

  const saveMutation = useMutation({
    mutationFn: (body: any) => editingId
      ? apiClient.put(`/admin/staff/${editingId}`, body)
      : apiClient.post('/admin/staff', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-staff'] }); setDialogOpen(false); toast.success(editingId ? 'Staff updated' : 'Staff added'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Operation failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/staff/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-staff'] }); setDeleteId(null); toast.success('Staff removed'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const handleOpenAdd = () => { setForm(defaultForm); setEditingId(null); setDialogOpen(true); };
  const handleOpenEdit = (s: StaffMember) => {
    setForm({ firstName: s.firstName, lastName: s.lastName, title: s.title, department: s.department, faculty: s.faculty, email: s.email, phone: s.phone, biography: s.biography, officeBuilding: s.officeBuilding, officeRoom: s.officeRoom, specializations: (s.specializations || []).join(', ') });
    setEditingId(s._id); setDialogOpen(true);
  };
  const handleSave = () => {
    if (!form.firstName || !form.lastName || !form.email) { toast.error('Name and email are required'); return; }
    saveMutation.mutate({ ...form, specializations: form.specializations.split(',').map(s => s.trim()).filter(Boolean) });
  };

  const staff = data || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Staff / Lecturer Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>Add Lecturer</Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, department, title..." />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select value={deptFilter} label="Department" onChange={e => setDeptFilter(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {departments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Faculty</InputLabel>
                <Select value={facFilter} label="Faculty" onChange={e => setFacFilter(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {faculties.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button fullWidth variant="outlined" onClick={() => { setSearch(''); setDeptFilter(''); setFacFilter(''); }}>Clear</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {isLoading ? <LoadingSpinner message="Loading staff..." /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Faculty</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map(s => (
                <TableRow key={s._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{s.firstName} {s.lastName}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.employeeId}</Typography>
                  </TableCell>
                  <TableCell>{s.title}</TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell>{s.faculty}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">{s.email}</Typography>
                    </Box>
                    {s.phone && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Phone fontSize="small" color="action" />
                        <Typography variant="caption">{s.phone}</Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={s.status} size="small" color={s.status === 'active' ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenEdit(s)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Remove"><IconButton size="small" color="error" onClick={() => setDeleteId(s._id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {staff.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center"><Typography color="text.secondary" py={4}>No staff found</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Lecturer' : 'Add New Lecturer'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><TextField fullWidth label="First Name" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Last Name" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required disabled={!!editingId} /></Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Title</InputLabel>
                <Select value={form.title} label="Title" onChange={e => setForm({...form, title: e.target.value})}>
                  {['Professor', 'Associate Professor', 'Senior Lecturer', 'Lecturer', 'Assistant Lecturer', 'Tutor', 'Instructor'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}><TextField fullWidth label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select value={form.department} label="Department" onChange={e => setForm({...form, department: e.target.value})}>
                  {departments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  <MenuItem value=""><em>Custom</em></MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Faculty</InputLabel>
                <Select value={form.faculty} label="Faculty" onChange={e => setForm({...form, faculty: e.target.value})}>
                  {faculties.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                  <MenuItem value=""><em>Custom</em></MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField fullWidth label="Office Building" value={form.officeBuilding} onChange={e => setForm({...form, officeBuilding: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Office Room" value={form.officeRoom} onChange={e => setForm({...form, officeRoom: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Specializations (comma-separated)" value={form.specializations} onChange={e => setForm({...form, specializations: e.target.value})} placeholder="e.g. Software Engineering, Machine Learning" /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Biography" multiline rows={3} value={form.biography} onChange={e => setForm({...form, biography: e.target.value})} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Remove Lecturer</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove this lecturer? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagementPage;