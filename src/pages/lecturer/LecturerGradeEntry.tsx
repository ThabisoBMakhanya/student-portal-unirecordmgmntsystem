import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TextField, Button, CircularProgress, Stack, Select, MenuItem, Alert, Snackbar } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lecturerService } from '@/services/lecturerService';

const GRADE_OPTIONS = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

const LecturerGradeEntry = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [grades, setGrades] = useState<Record<string, { letterGrade: string; percentage: number }>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const { data, isLoading } = useQuery({
    queryKey: ['course-students', courseId],
    queryFn: async () => { const res = await lecturerService.getCourseStudents(courseId!); return res.data.data; },
    enabled: !!courseId,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const gradeArray = Object.entries(grades).map(([studentId, g]) => ({ studentId, ...g }));
      return lecturerService.updateGrades(courseId!, gradeArray);
    },
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Grades saved successfully!', severity: 'success' });
      queryClient.invalidateQueries({ queryKey: ['course-students', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-grades', courseId] });
    },
    onError: () => setSnackbar({ open: true, message: 'Failed to save grades', severity: 'error' }),
  });

  if (isLoading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  const handleGradeChange = (studentId: string, field: string, value: any) => {
    setGrades(prev => ({ ...prev, [studentId]: { ...prev[studentId] || { letterGrade: '', percentage: 0 }, [field]: value } }));
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/lecturer/courses')}>Back</Button>
        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold">{data?.course?.course_code} - Grade Entry</Typography>
          <Typography variant="body2" color="text.secondary">{data?.students?.length || 0} students</Typography>
        </Box>
        <Button variant="contained" startIcon={<Save />} onClick={() => saveMutation.mutate()}
          disabled={Object.keys(grades).length === 0 || saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving...' : `Save ${Object.keys(grades).length} Grades`}
        </Button>
      </Stack>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell align="center" width={100}>Grade</TableCell>
                  <TableCell align="center" width={100}>% Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.students?.length === 0 && (
                  <TableRow><TableCell colSpan={5} align="center">No students enrolled.</TableCell></TableRow>
                )}
                {data?.students?.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.student_id}</TableCell>
                    <TableCell>{s.first_name} {s.last_name}</TableCell>
                    <TableCell>{s.program}</TableCell>
                    <TableCell align="center">
                      <Select
                        size="small"
                        value={grades[s.id]?.letterGrade || ''}
                        onChange={(e) => handleGradeChange(s.id, 'letterGrade', e.target.value)}
                        displayEmpty
                        sx={{ minWidth: 70 }}
                      >
                        <MenuItem value=""><em>—</em></MenuItem>
                        {GRADE_OPTIONS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                      </Select>
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        size="small"
                        type="number"
                        value={grades[s.id]?.percentage || ''}
                        onChange={(e) => handleGradeChange(s.id, 'percentage', Number(e.target.value))}
                        inputProps={{ min: 0, max: 100 }}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LecturerGradeEntry;
