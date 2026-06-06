import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, FormControl, InputLabel,
  Select, MenuItem, Button, Alert, Snackbar, Chip,
} from '@mui/material';
import {
  Download, CalendarMonth, Print, Notifications, Search,
  Google, Apple,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/services/api';
import CourseSchedule from '@/components/Courses/CourseSchedule';
import LoadingSpinner from '@/components/LoadingSpinner';

const SchedulePage: React.FC = () => {
  const [faculty, setFaculty] = useState('');
  const [programme, setProgramme] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('Semester 2, 2025');
  const [generated, setGenerated] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  const { data: enrolledCourses = [], isLoading } = useQuery({
    queryKey: ['upcoming-classes'],
    queryFn: async () => {
      const response = await apiClient.get('/student/dashboard/upcoming-classes');
      const classes = response.data.data.classes as Array<{
        course_code: string;
        course_name: string;
        day: string;
        start_time: string;
        end_time: string;
        building: string;
        room: string;
        instructor_name: string;
      }>;
      const grouped = new Map<string, any>();
      classes.forEach((item) => {
        if (!grouped.has(item.course_code)) {
          grouped.set(item.course_code, {
            _id: item.course_code,
            courseCode: item.course_code,
            courseName: item.course_name,
            department: item.course_code,
            instructor: { name: item.instructor_name },
            schedule: [],
          });
        }
        grouped.get(item.course_code).schedule.push({
          day: item.day,
          startTime: item.start_time,
          endTime: item.end_time,
          type: 'lecture' as const,
          location: {
            building: item.building,
            room: item.room,
            campus: 'Main Campus',
          },
        });
      });
      return Array.from(grouped.values());
    },
  });

  const handleGenerate = () => {
    if (!faculty || !programme || !year || !semester) {
      setSnackbar('Please select all fields to generate timetable');
      return;
    }
    setGenerated(true);
  };

  const handleDownloadPDF = () => {
    setSnackbar('Downloading timetable as PDF...');
    window.print();
  };

  const handleAddToGoogleCalendar = () => {
    const events = enrolledCourses.flatMap(c =>
      c.schedule.map(s => ({
        title: `${c.courseCode}: ${c.courseName}`,
        days: s.day.substring(0, 2),
        start: s.startTime,
        end: s.endTime,
        location: `${s.location.building} ${s.location.room}`,
      }))
    );
    const googleUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Timetable&dates=';
    window.open(googleUrl, '_blank');
    setSnackbar('Opening Google Calendar...');
  };

  const handleAddToAppleCalendar = () => {
    const icsContent = enrolledCourses.map(c => {
      return c.schedule.map(s => {
        const [startH, startM] = s.startTime.split(':');
        const [endH, endM] = s.endTime.split(':');
        return `BEGIN:VEVENT\nDTSTART:T${startH}${startM}00\nDTEND:T${endH}${endM}00\nSUMMARY:${c.courseCode} - ${c.courseName}\nLOCATION:${s.location.building} ${s.location.room}\nEND:VEVENT`;
      }).join('\n');
    }).join('\n');
    const blob = new Blob([`BEGIN:VCALENDAR\nVERSION:2.0\n${icsContent}\nEND:VCALENDAR`], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timetable.ics';
    a.click();
    URL.revokeObjectURL(url);
    setSnackbar('Calendar file downloaded. Open it with your calendar app.');
  };

  const handleNotifyMe = () => {
    setSnackbar('You will be notified when the timetable is published.');
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>My Timetable</Typography>
        <Typography variant="body1" color="text.secondary">View and manage your weekly class schedule</Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Select Your Programme</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Faculty</InputLabel>
                <Select value={faculty} label="Faculty" onChange={(e) => setFaculty(e.target.value)}>
                  <MenuItem value="fst">Faculty of Science & Technology</MenuItem>
                  <MenuItem value="fca">Faculty of Creative Arts</MenuItem>
                  <MenuItem value="fb">Faculty of Business</MenuItem>
                  <MenuItem value="fss">Faculty of Social Sciences</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select value={programme} label="Programme" onChange={(e) => setProgramme(e.target.value)}>
                  <MenuItem value="cs">BSc Computer Science</MenuItem>
                  <MenuItem value="gd">BA Graphic Design</MenuItem>
                  <MenuItem value="ba">BCom Business Administration</MenuItem>
                  <MenuItem value="hm">Diploma Hospitality Management</MenuItem>
                  <MenuItem value="it">BSc Information Technology</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Year</InputLabel>
                <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
                  <MenuItem value="1">Year 1</MenuItem>
                  <MenuItem value="2">Year 2</MenuItem>
                  <MenuItem value="3">Year 3</MenuItem>
                  {programme === 'cs' && <MenuItem value="4">Year 4</MenuItem>}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Semester</InputLabel>
                <Select value={semester} label="Semester" onChange={(e) => setSemester(e.target.value)}>
                  <MenuItem value="Semester 1, 2025">Semester 1, 2025</MenuItem>
                  <MenuItem value="Semester 2, 2025">Semester 2, 2025</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button fullWidth variant="contained" startIcon={<Search />} onClick={handleGenerate} size="large">
                Generate Timetable
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {generated && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Search color="primary" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Timetable for {programme}, Year {year}
                  </Typography>
                  <Chip label={semester} size="small" color="primary" />
                </Box>
                <Box display="flex" gap={1}>
                  <Button variant="contained" startIcon={<Download />} onClick={handleDownloadPDF}>
                    PDF
                  </Button>
                  <Button variant="outlined" startIcon={<Google />} onClick={handleAddToGoogleCalendar}>
                    Google Calendar
                  </Button>
                  <Button variant="outlined" startIcon={<Apple />} onClick={handleAddToAppleCalendar}>
                    Apple Calendar
                  </Button>
                  <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>
                    Print
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <CourseSchedule courses={enrolledCourses} />
          )}
        </>
      )}

      {generated && enrolledCourses.length === 0 && !isLoading && (
        <Alert severity="info" action={
          <Button color="inherit" size="small" startIcon={<Notifications />} onClick={handleNotifyMe}>
            Notify Me
          </Button>
        }>
          Timetable for this programme will be published on <strong>15 July 2025</strong>.
        </Alert>
      )}

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
};

export default SchedulePage;