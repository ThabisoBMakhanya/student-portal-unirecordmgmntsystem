import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar, CircularProgress, Button, Stack } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { lecturerService } from '@/services/lecturerService';

const LecturerCourseStudents = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['course-students', courseId],
    queryFn: async () => { const res = await lecturerService.getCourseStudents(courseId!); return res.data.data; },
    enabled: !!courseId,
  });

  if (isLoading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/lecturer/courses')}>Back</Button>
        <Box>
          <Typography variant="h4" fontWeight="bold">{data?.course?.course_code} - {data?.course?.course_name}</Typography>
          <Typography variant="body2" color="text.secondary">Class List ({data?.students?.length || 0} students)</Typography>
        </Box>
      </Stack>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>GPA</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.students?.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center">No students enrolled.</TableCell></TableRow>
                )}
                {data?.students?.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.student_id}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar src={s.profile_picture} sx={{ width: 28, height: 28, fontSize: 12 }}>
                          {s.first_name?.[0]}{s.last_name?.[0]}
                        </Avatar>
                        <Typography variant="body2">{s.first_name} {s.last_name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{s.program}</TableCell>
                    <TableCell>{s.level}</TableCell>
                    <TableCell>{s.gpa || '—'}</TableCell>
                    <TableCell>
                      <Chip label={s.enrollment_status} size="small"
                        color={s.enrollment_status === 'enrolled' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="text"
                        onClick={() => navigate(`/lecturer/courses/${courseId}/grades`)}>
                        Enter Grade
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LecturerCourseStudents;
