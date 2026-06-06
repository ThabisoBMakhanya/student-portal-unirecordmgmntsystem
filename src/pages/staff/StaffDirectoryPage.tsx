import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, TextField, InputAdornment,
  Avatar, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, FormControl, InputLabel, Select, MenuItem, Divider,
  List, ListItem, ListItemText, Alert, Snackbar, CircularProgress,
} from '@mui/material';
import {
  Search, Person, Email, Phone, LocationOn, Schedule,
  Close, CalendarToday, BookmarkBorder, AccessTime,
  VideoCall, Chat, School,
} from '@mui/icons-material';
import { apiClient } from '@/services/api';

interface StaffProfile {
  id: string;
  name: string;
  title: string;
  department: string;
  faculty: string;
  email: string;
  phone: string;
  office: { building: string; room: string };
  photo?: string;
  specializations: string[];
  consultationHours: { day: string; startTime: string; endTime: string; type: string }[];
  bio?: string;
}

const StaffDirectoryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [facultyFilter, setFacultyFilter] = useState('All');
  const [selected, setSelected] = useState<StaffProfile | null>(null);
  const [snackbar, setSnackbar] = useState('');
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/api/student/staff/search');
        setStaff(res.data.data.staff);
      } catch {
        setError('Failed to load staff directory. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const departments = useMemo(() => ['All', ...new Set(staff.map(s => s.department))], [staff]);
  const faculties = useMemo(() => ['All', ...new Set(staff.map(s => s.faculty))], [staff]);

  const filtered = useMemo(() => {
    return staff.filter(s => {
      const matchesSearch = !search || 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase()) ||
        s.specializations.some(sp => sp.toLowerCase().includes(search.toLowerCase())) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;
      const matchesFaculty = facultyFilter === 'All' || s.faculty === facultyFilter;
      return matchesSearch && matchesDept && matchesFaculty;
    });
  }, [search, departmentFilter, facultyFilter, staff]);

  const handleBookAppointment = (staff: StaffProfile) => {
    setSnackbar(`Appointment request sent to ${staff.name}`);
  };

  const handleSendMessage = (staff: StaffProfile) => {
    setSnackbar(`Message sent to ${staff.name}`);
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setSnackbar('Email copied to clipboard');
  };

  const getInitials = (name: string) => {
    return name.split(' ').filter(w => w.length > 0 && w[0] === w[0].toUpperCase()).map(w => w[0]).slice(0, 2).join('');
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1', '#388e3c', '#f57c00', '#7b1fa2'];
    const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>Staff Directory</Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
          <Box mt={1}>
            <Button variant="outlined" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Staff Directory
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find lecturers, their office locations, and consultation hours
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Search by name, department, or specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select value={departmentFilter} label="Department" onChange={(e) => setDepartmentFilter(e.target.value)}>
                  {departments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Faculty</InputLabel>
                <Select value={facultyFilter} label="Faculty" onChange={(e) => setFacultyFilter(e.target.value)}>
                  {faculties.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {filtered.length} found
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Alert severity="info">
          No results found. Try checking the spelling or browsing by department.
          <Box mt={1}>
            <Button variant="outlined" size="small" onClick={() => { setSearch(''); setDepartmentFilter('All'); setFacultyFilter('All'); }}>
              Browse all staff
            </Button>
          </Box>
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((staff) => (
            <Grid item xs={12} sm={6} md={4} key={staff.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={() => setSelected(staff)}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar src={staff.photo} sx={{ width: 56, height: 56, bgcolor: getAvatarColor(staff.name), fontSize: '1.2rem' }}>
                      {getInitials(staff.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">{staff.name}</Typography>
                      <Typography variant="body2" color="primary">{staff.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{staff.department}</Typography>
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">{staff.office.building}, {staff.office.room}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">{staff.consultationHours.length} consultation slot(s)/week</Typography>
                    </Box>
                  </Box>

                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                    {staff.specializations.map((spec) => (
                      <Chip key={spec} label={spec} size="small" variant="outlined" />
                    ))}
                  </Box>

                  <Box display="flex" gap={1}>
                    <Button size="small" variant="contained" startIcon={<CalendarToday />} onClick={(e) => { e.stopPropagation(); handleBookAppointment(staff); }}>
                      Book
                    </Button>
                    <Button size="small" variant="outlined" startIcon={<Chat />} onClick={(e) => { e.stopPropagation(); handleSendMessage(staff); }}>
                      Message
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        {selected && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar src={selected.photo} sx={{ width: 64, height: 64, bgcolor: getAvatarColor(selected.name), fontSize: '1.5rem' }}>
                    {getInitials(selected.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{selected.name}</Typography>
                    <Typography variant="body2" color="primary">{selected.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{selected.department} &bull; {selected.faculty}</Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setSelected(null)}><Close /></IconButton>
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent>
              {selected.bio && (
                <Typography variant="body2" color="text.secondary" paragraph>{selected.bio}</Typography>
              )}

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" color="primary" /> Office Location
              </Typography>
              <Typography variant="body2" gutterBottom>{selected.office.building}, {selected.office.room}</Typography>

              <Box display="flex" gap={2} mt={2} mb={2}>
                <Button size="small" variant="outlined" startIcon={<Email />} onClick={() => handleCopyEmail(selected.email)}>
                  {selected.email}
                </Button>
                <Button size="small" variant="outlined" startIcon={<Phone />} onClick={() => setSnackbar(`Calling ${selected.phone}`)}>
                  {selected.phone}
                </Button>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                {selected.specializations.map((spec) => (
                  <Chip key={spec} label={spec} size="small" color="primary" variant="outlined" />
                ))}
              </Box>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule fontSize="small" color="primary" /> Consultation Hours
              </Typography>
              <List dense>
                {selected.consultationHours.map((slot, idx) => (
                  <ListItem key={idx} sx={{ bgcolor: 'action.hover', borderRadius: 1, mb: 0.5 }}>
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight="bold">{slot.day}</Typography>}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <AccessTime sx={{ fontSize: 14 }} />
                          {slot.startTime} - {slot.endTime}
                          <Chip label={slot.type.replace('_', ' ')} size="small" variant="outlined" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button variant="contained" startIcon={<CalendarToday />} onClick={() => handleBookAppointment(selected)}>
                Book Appointment
              </Button>
              <Button variant="outlined" startIcon={<Chat />} onClick={() => handleSendMessage(selected)}>
                Send Message
              </Button>
              <Button variant="outlined" startIcon={<School />} onClick={() => handleCopyEmail(selected.email)}>
                Add to Calendar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
};

export default StaffDirectoryPage;
