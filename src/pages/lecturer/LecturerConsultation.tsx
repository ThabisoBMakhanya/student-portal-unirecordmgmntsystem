import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, TextField, Button, Select, MenuItem, Stack, Chip, Snackbar, Alert, CircularProgress, IconButton } from '@mui/material';
import { Add, Delete, Save } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lecturerService } from '@/services/lecturerService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const LecturerConsultation = () => {
  const queryClient = useQueryClient();
  const [hours, setHours] = useState<Array<{ day: string; startTime: string; endTime: string; type: string; building: string; room: string }>>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const { data, isLoading } = useQuery({
    queryKey: ['lecturer-consultation'],
    queryFn: async () => {
      const res = await lecturerService.getConsultation();
      const existing = res.data.data.consultationHours?.map((h: any) => ({
        day: h.day,
        startTime: h.startTime,
        endTime: h.endTime,
        type: h.type || 'in_person',
        building: h.building || '',
        room: h.room || '',
      })) || [];
      setHours(existing.length > 0 ? existing : [{ day: 'Monday', startTime: '09:00', endTime: '11:00', type: 'in_person', building: '', room: '' }]);
      return res.data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => lecturerService.updateConsultation(hours),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Consultation hours saved!', severity: 'success' });
      queryClient.invalidateQueries({ queryKey: ['lecturer-consultation'] });
    },
    onError: () => setSnackbar({ open: true, message: 'Failed to save', severity: 'error' }),
  });

  const updateHour = (index: number, field: string, value: string) => {
    setHours(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
  };

  const addHour = () => setHours(prev => [...prev, { day: 'Monday', startTime: '09:00', endTime: '10:00', type: 'in_person', building: '', room: '' }]);
  const removeHour = (index: number) => setHours(prev => prev.filter((_, i) => i !== index));

  if (isLoading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Consultation Hours</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Manage your office hours for student appointments</Typography>

      <Card>
        <CardContent>
          {hours.map((h, i) => (
            <Stack key={i} direction="row" spacing={2} alignItems="center" mb={2} flexWrap="wrap">
              <Select size="small" value={h.day} onChange={(e) => updateHour(i, 'day', e.target.value)} sx={{ minWidth: 130 }}>
                {DAYS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
              <TextField size="small" label="Start" type="time" value={h.startTime}
                onChange={(e) => updateHour(i, 'startTime', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 100 }} />
              <TextField size="small" label="End" type="time" value={h.endTime}
                onChange={(e) => updateHour(i, 'endTime', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 100 }} />
              <Select size="small" value={h.type} onChange={(e) => updateHour(i, 'type', e.target.value)} sx={{ minWidth: 110 }}>
                <MenuItem value="in_person">In Person</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="both">Both</MenuItem>
              </Select>
              <TextField size="small" label="Building" value={h.building}
                onChange={(e) => updateHour(i, 'building', e.target.value)} sx={{ width: 140 }} />
              <TextField size="small" label="Room" value={h.room}
                onChange={(e) => updateHour(i, 'room', e.target.value)} sx={{ width: 80 }} />
              <IconButton color="error" onClick={() => removeHour(i)} disabled={hours.length <= 1}><Delete /></IconButton>
            </Stack>
          ))}
          <Stack direction="row" spacing={2} mt={2}>
            <Button startIcon={<Add />} onClick={addHour}>Add Time Slot</Button>
            <Button variant="contained" startIcon={<Save />} onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save All'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LecturerConsultation;
