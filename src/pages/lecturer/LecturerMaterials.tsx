import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Grid, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Stack, CircularProgress, Alert, Snackbar, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Add, ArrowBack, Delete, CloudUpload, Link as LinkIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lecturerService } from '@/services/lecturerService';

const LecturerMaterials = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId') || '';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', fileUrl: '', type: 'document' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const { data: coursesData } = useQuery({
    queryKey: ['lecturer-courses'],
    queryFn: async () => { const res = await lecturerService.getCourses(); return res.data.data.courses; },
  });

  const { data: materialsData, isLoading } = useQuery({
    queryKey: ['course-materials', courseId],
    queryFn: async () => { const res = await lecturerService.getMaterials(courseId); return res.data.data.materials; },
    enabled: !!courseId,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => lecturerService.uploadMaterial({ ...form, courseId }),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Material uploaded!', severity: 'success' });
      setDialogOpen(false);
      setForm({ title: '', description: '', fileUrl: '', type: 'document' });
      queryClient.invalidateQueries({ queryKey: ['course-materials', courseId] });
    },
    onError: () => setSnackbar({ open: true, message: 'Upload failed', severity: 'error' }),
  });

  const selectedCourse = coursesData?.find((c: any) => c._id === courseId);

  if (!courseId) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>Course Materials</Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>Select a course to manage materials:</Typography>
        <Grid container spacing={2}>
          {coursesData?.map((c: any) => (
            <Grid item xs={12} sm={6} md={4} key={c._id}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/lecturer/materials?courseId=${c._id}`)}>
                <CardContent>
                  <Typography variant="h6">{c.code}</Typography>
                  <Typography variant="body2" color="text.secondary">{c.name}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/lecturer/materials')}>Back</Button>
        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold">{selectedCourse?.code} - Materials</Typography>
          <Typography variant="body2" color="text.secondary">{materialsData?.length || 0} materials</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>Add Material</Button>
      </Stack>

      {isLoading ? <Box textAlign="center" py={4}><CircularProgress /></Box> : (
        <Card>
          <CardContent>
            {materialsData?.length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={4}>No materials uploaded yet.</Typography>
            )}
            <List>
              {materialsData?.map((m: any) => (
                <ListItem key={m.id} divider secondaryAction={
                  <IconButton edge="end"><LinkIcon /></IconButton>
                }>
                  <ListItemText
                    primary={m.title}
                    secondary={`${m.type}${m.description ? ' — ' + m.description : ''}${m.uploaded_at ? ' • ' + new Date(m.uploaded_at).toLocaleDateString() : ''}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Course Material</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField label="Title" fullWidth value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            <TextField label="Description" fullWidth multiline rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            <TextField label="File URL" fullWidth value={form.fileUrl} onChange={(e) => setForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://example.com/file.pdf" />
            <TextField select label="Type" fullWidth value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} SelectProps={{ native: true }}>
              <option value="document">Document</option>
              <option value="slides">Slides</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
              <option value="assignment">Assignment</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<CloudUpload />} onClick={() => uploadMutation.mutate()}
            disabled={!form.title || uploadMutation.isPending}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LecturerMaterials;
