import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';

const statusTabs = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'inprogress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Overdue', value: 'overdue' },
];

const AssignmentsDashboard: React.FC = () => {
  const [status, setStatus] = useState('todo');
  const [course, setCourse] = useState('');
  const [search, setSearch] = useState('');

  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ['student-assignments', status, course, search],
    queryFn: async () => {
      const params = new URLSearchParams({ status, course, search });
      const { data } = await apiClient.get(`/student/assignments?${params}`);
      return data.data || [];
    },
  });

  const statusColor = (s: string) => {
    switch (s) {
      case 'overdue': return 'error';
      case 'inprogress': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight={600}>My Assignments</Typography>
      <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
        <Tabs value={status} onChange={(_, v) => setStatus(v)}>
          {statusTabs.map(tab => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Course</InputLabel>
          <Select value={course} label="Course" onChange={e => setCourse(e.target.value)}>
            <MenuItem value="">All Courses</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
      </Box>
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">Failed to load assignments</Alert>
      ) : (
        <Grid container spacing={2}>
          {assignments.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary" textAlign="center" py={4}>No assignments found</Typography>
            </Grid>
          ) : assignments.map((a: any) => (
            <Grid item xs={12} sm={6} md={4} key={a._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>{a.title}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {a.course?.courseName || a.course?.courseCode || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : '-'}
                  </Typography>
                  <Box mt={1}><Chip label={a.type} size="small" variant="outlined" /></Box>
                </CardContent>
                <Box p={2} pt={0} display="flex" gap={1} flexWrap="wrap">
                  <Button variant="contained" size="small" component={Link} to={`/assignments/${a._id}`}>
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AssignmentsDashboard;
