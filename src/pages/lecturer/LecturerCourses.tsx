import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress } from '@mui/material';
import { School, AccessTime, People, Grade } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { lecturerService } from '@/services/lecturerService';

const LecturerCourses = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['lecturer-courses'],
    queryFn: async () => { const res = await lecturerService.getCourses(); return res.data.data.courses; },
  });

  if (isLoading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>My Courses</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Courses assigned to you for the current semester</Typography>

      {data?.length === 0 && (
        <Card><CardContent><Typography color="text.secondary">No courses assigned.</Typography></CardContent></Card>
      )}

      <Grid container spacing={3}>
        {data?.map((course: any) => (
          <Grid item xs={12} md={6} key={course._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold">{course.code} - {course.name}</Typography>
                <Chip label={course.level} size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label={`${course.credits} Credits`} size="small" variant="outlined" sx={{ mb: 1 }} />
                <Box my={1}>
                  <Typography variant="body2" color="text.secondary">
                    <People fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    {course.enrolled}/{course.capacity} students enrolled
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <AccessTime fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    {course.schedules?.map((s: any) => `${s.day} ${s.startTime}-${s.endTime}`).join(', ') || 'No schedule'}
                  </Typography>
                </Box>

                {course.schedules?.length > 0 && (
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Day</TableCell>
                          <TableCell>Time</TableCell>
                          <TableCell>Room</TableCell>
                          <TableCell>Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {course.schedules.map((s: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>{s.day}</TableCell>
                            <TableCell>{s.startTime} - {s.endTime}</TableCell>
                            <TableCell>{s.building} {s.room}</TableCell>
                            <TableCell><Chip label={s.type} size="small" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Box display="flex" gap={1} flexWrap="wrap">
                  <Button size="small" variant="contained" startIcon={<People />}
                    onClick={() => navigate(`/lecturer/courses/${course._id}/students`)}>
                    Class List
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<Grade />}
                    onClick={() => navigate(`/lecturer/courses/${course._id}/grades`)}>
                    Grades
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<School />}
                    onClick={() => navigate(`/lecturer/materials?courseId=${course._id}`)}>
                    Materials
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LecturerCourses;
