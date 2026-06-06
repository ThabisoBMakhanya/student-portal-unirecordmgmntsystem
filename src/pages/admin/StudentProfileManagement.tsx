import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, Button, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText,
  CircularProgress, Alert, IconButton, Divider,
} from '@mui/material';
import { Edit, Search, CameraAlt } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../services/api';

interface Student {
  _id: string; studentId: string; firstName: string; lastName: string;
  email: string; department: string; faculty: string; level: string; program: string;
  profilePicture?: string; status?: string;
}

interface StudentProfile {
  _id: string; email: string; role: string; status: string;
  personalInfo: { firstName: string; lastName: string; middleName: string; dateOfBirth: string; gender: string; nationality: string; profilePicture: string };
  contactInfo: { phone: string; alternatePhone: string; address: { street: string; city: string; state: string; country: string; postalCode: string }; emergencyContact: { name: string; relationship: string; phone: string } };
  academicInfo: { studentId: string; program: string; department: string; faculty: string; level: string; admissionDate: string; expectedGraduationDate: string; currentSemester: string; academicYear: string; gpa: number; totalCredits: number; completedCredits: number };
}

const StudentProfileManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: studentsData, isLoading, isError, error } = useQuery({
    queryKey: ['admin-students', search],
    queryFn: async () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const { data } = await apiClient.get(`/admin/students${params}`);
      if (!data?.data?.students) throw new Error('Invalid response format');
      return data.data.students as Student[];
    },
    staleTime: 30_000,
    retry: 1,
  });

  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery({
    queryKey: ['admin-student-profile', selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      const { data } = await apiClient.get(`/admin/students/${selectedId}/profile`);
      if (!data?.data) throw new Error('Invalid profile response');
      return data.data as StudentProfile;
    },
    enabled: !!selectedId,
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.put(`/admin/students/${selectedId}/profile`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-student-profile', selectedId] });
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      toast.success('Profile updated');
      setEditDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const { data } = await apiClient.post(`/admin/students/${selectedId}/profile/picture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-student-profile', selectedId] });
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      toast.success('Picture updated');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Upload failed'),
  });

  const handleEdit = () => {
    if (!profile) return;
    setEditData({
      personalInfo: { ...profile.personalInfo },
      contactInfo: { ...profile.contactInfo },
    });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!editData) return;
    updateMutation.mutate(editData);
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={600} gutterBottom>Student Profiles</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <TextField
                fullWidth size="small" label="Search students"
                value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{ endAdornment: <Search color="action" /> }}
                sx={{ mb: 2 }}
              />
              {isLoading ? (
                <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
              ) : isError ? (
                <Alert severity="error" sx={{ mt: 1 }}>
                  Failed to load students: {(error as any)?.message || 'Check that the backend is running'}
                </Alert>
              ) : !studentsData || studentsData.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  No students found
                </Typography>
              ) : (
                <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                  {studentsData.map(s => (
                    <ListItem
                      key={s._id} button selected={selectedId === s._id}
                      onClick={() => setSelectedId(s._id)}
                      sx={{ borderRadius: 1, mb: 0.5, flexDirection: 'column', alignItems: 'flex-start' }}
                    >
                      <ListItemText
                        primary={`${s.firstName} ${s.lastName}`}
                        secondary={`${s.studentId} | ${s.department || s.program || ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          {profileLoading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : profileError ? (
            <Card><CardContent><Alert severity="error">Failed to load student profile</Alert></CardContent></Card>
          ) : !profile ? (
            <Card><CardContent><Typography color="text.secondary">Select a student to view profile</Typography></CardContent></Card>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box position="relative" display="inline-block" mb={2}>
                      <Avatar sx={{ width: 100, height: 100, mx: 'auto', fontSize: '2rem' }}
                        src={profile.personalInfo.profilePicture}>
                        {profile.personalInfo.firstName?.[0]}{profile.personalInfo.lastName?.[0]}
                      </Avatar>
                      <input type="file" accept="image/*" id="pic-upload" style={{ display: 'none' }}
                        onChange={handlePictureChange} />
                      <label htmlFor="pic-upload">
                        <IconButton component="span" size="small"
                          sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
                          <CameraAlt fontSize="small" />
                        </IconButton>
                      </label>
                    </Box>
                    <Typography variant="h5" fontWeight={600}>{profile.personalInfo.firstName} {profile.personalInfo.lastName}</Typography>
                    <Typography variant="body2" color="text.secondary">{profile.academicInfo.studentId}</Typography>
                    <Chip label={profile.status} color={profile.status === 'active' ? 'success' : 'default'} size="small" sx={{ mt: 1 }} />
                    <Box mt={2}>
                      <Button variant="contained" startIcon={<Edit />} onClick={handleEdit}>Edit Profile</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Personal Info</Typography>
                    <List dense>
                      <ListItem><ListItemText primary="Full Name" secondary={`${profile.personalInfo.firstName} ${profile.personalInfo.middleName} ${profile.personalInfo.lastName}`} /></ListItem>
                      <ListItem><ListItemText primary="Email" secondary={profile.email} /></ListItem>
                      <ListItem><ListItemText primary="Phone" secondary={profile.contactInfo.phone} /></ListItem>
                      <ListItem><ListItemText primary="Alt Phone" secondary={profile.contactInfo.alternatePhone || '-'} /></ListItem>
                      <ListItem><ListItemText primary="Date of Birth" secondary={profile.personalInfo.dateOfBirth || '-'} /></ListItem>
                      <ListItem><ListItemText primary="Gender" secondary={profile.personalInfo.gender} /></ListItem>
                      <ListItem><ListItemText primary="Nationality" secondary={profile.personalInfo.nationality} /></ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Address & Emergency</Typography>
                    <List dense>
                      <ListItem><ListItemText primary="Street" secondary={profile.contactInfo.address.street || '-'} /></ListItem>
                      <ListItem><ListItemText primary="City/State" secondary={`${profile.contactInfo.address.city}, ${profile.contactInfo.address.state}`} /></ListItem>
                      <ListItem><ListItemText primary="Country" secondary={profile.contactInfo.address.country} /></ListItem>
                      <ListItem><ListItemText primary="Postal Code" secondary={profile.contactInfo.address.postalCode || '-'} /></ListItem>
                      <Divider />
                      <ListItem><ListItemText primary="Emergency Contact" secondary={profile.contactInfo.emergencyContact.name || '-'} /></ListItem>
                      <ListItem><ListItemText primary="Relationship" secondary={profile.contactInfo.emergencyContact.relationship || '-'} /></ListItem>
                      <ListItem><ListItemText primary="Emergency Phone" secondary={profile.contactInfo.emergencyContact.phone || '-'} /></ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Academic Info</Typography>
                    <Grid container spacing={2}>
                      {[
                        ['Program', profile.academicInfo.program],
                        ['Department', profile.academicInfo.department],
                        ['Faculty', profile.academicInfo.faculty],
                        ['Level', profile.academicInfo.level],
                        ['GPA', profile.academicInfo.gpa?.toFixed(2)],
                        ['Credits', `${profile.academicInfo.completedCredits}/${profile.academicInfo.totalCredits}`],
                        ['Semester', profile.academicInfo.currentSemester],
                        ['Academic Year', profile.academicInfo.academicYear],
                      ].map(([label, value]) => (
                        <Grid item xs={6} sm={3} key={label as string}>
                          <Typography variant="caption" color="text.secondary">{label as string}</Typography>
                          <Typography variant="body2">{value as string || '-'}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Student Profile</DialogTitle>
        <DialogContent>
          {editData && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}><TextField fullWidth label="First Name" value={editData.personalInfo.firstName} onChange={e => setEditData({ ...editData, personalInfo: { ...editData.personalInfo, firstName: e.target.value } })} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Last Name" value={editData.personalInfo.lastName} onChange={e => setEditData({ ...editData, personalInfo: { ...editData.personalInfo, lastName: e.target.value } })} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Middle Name" value={editData.personalInfo.middleName} onChange={e => setEditData({ ...editData, personalInfo: { ...editData.personalInfo, middleName: e.target.value } })} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Date of Birth" type="date" value={editData.personalInfo.dateOfBirth} onChange={e => setEditData({ ...editData, personalInfo: { ...editData.personalInfo, dateOfBirth: e.target.value } })} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={4}><TextField fullWidth label="Gender" select value={editData.personalInfo.gender} onChange={e => setEditData({ ...editData, personalInfo: { ...editData.personalInfo, gender: e.target.value } })} SelectProps={{ native: true }}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></TextField></Grid>
              <Grid item xs={4}><TextField fullWidth label="Nationality" value={editData.personalInfo.nationality} onChange={e => setEditData({ ...editData, personalInfo: { ...editData.personalInfo, nationality: e.target.value } })} /></Grid>
              <Grid item xs={4}><TextField fullWidth label="Phone" value={editData.contactInfo.phone} onChange={e => setEditData({ ...editData, contactInfo: { ...editData.contactInfo, phone: e.target.value } })} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Street" value={editData.contactInfo.address.street} onChange={e => setEditData({ ...editData, contactInfo: { ...editData.contactInfo, address: { ...editData.contactInfo.address, street: e.target.value } } })} /></Grid>
              <Grid item xs={4}><TextField fullWidth label="City" value={editData.contactInfo.address.city} onChange={e => setEditData({ ...editData, contactInfo: { ...editData.contactInfo, address: { ...editData.contactInfo.address, city: e.target.value } } })} /></Grid>
              <Grid item xs={4}><TextField fullWidth label="State" value={editData.contactInfo.address.state} onChange={e => setEditData({ ...editData, contactInfo: { ...editData.contactInfo, address: { ...editData.contactInfo.address, state: e.target.value } } })} /></Grid>
              <Grid item xs={4}><TextField fullWidth label="Country" value={editData.contactInfo.address.country} onChange={e => setEditData({ ...editData, contactInfo: { ...editData.contactInfo, address: { ...editData.contactInfo.address, country: e.target.value } } })} /></Grid>
              <Grid item xs={12}><Divider /><Typography variant="subtitle2" sx={{ mt: 2 }}>Emergency Contact</Typography></Grid>
              <Grid item xs={4}><TextField fullWidth label="Name" value={editData.contactInfo.emergencyContact.name} onChange={e => setEditData({ ...editData, contactInfo: { ...editData.contactInfo, emergencyContact: { ...editData.contactInfo.emergencyContact, name: e.target.value } } })} /></Grid>
              <Grid item xs={4}><TextField fullWidth label="Relationship" value={editData.contactInfo.emergencyContact.relationship} onChange={e => setEditData({ ...editData, contactInfo: { ...editData.contactInfo, emergencyContact: { ...editData.contactInfo.emergencyContact, relationship: e.target.value } } })} /></Grid>
              <Grid item xs={4}><TextField fullWidth label="Phone" value={editData.contactInfo.emergencyContact.phone} onChange={e => setEditData({ ...editData, contactInfo: { ...editData.contactInfo, emergencyContact: { ...editData.contactInfo.emergencyContact, phone: e.target.value } } })} /></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentProfileManagement;
