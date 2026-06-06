import React from 'react';
import AssignmentSubmissionForm from '../components/AssignmentSubmissionForm';
import AssignmentSubmissionHistory from '../components/AssignmentSubmissionHistory';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { apiClient } from '../services/api';

const AssignmentDetail: React.FC = () => {
  const { id } = useParams();
  const { data: assignment, isLoading, error } = useQuery({
    queryKey: ['assignment', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/student/assignments/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  if (isLoading) return <Box p={3}><CircularProgress /></Box>;
  if (error) return <Box p={3}><Alert severity="error">Error loading assignment</Alert></Box>;
  if (!assignment) return <Box p={3}><Alert severity="info">Assignment not found</Alert></Box>;

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom fontWeight={600}>{assignment.title}</Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {assignment.course?.courseName || '-'} ({assignment.course?.courseCode || '-'})
          </Typography>
          <Box display="flex" gap={1} mb={2}>
            <Chip label={assignment.type} size="small" variant="outlined" />
            <Chip
              label={assignment.status}
              size="small"
              color={assignment.status === 'overdue' ? 'error' : assignment.status === 'completed' ? 'success' : 'primary'}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleString() : '-'} | Max Points: {assignment.maxPoints || '-'}
          </Typography>
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>Instructions</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{assignment.instructions || 'No instructions provided.'}</Typography>
          </Box>
          {assignment.file_attachments && assignment.file_attachments.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2">Materials:</Typography>
              {assignment.file_attachments.map((file: string, idx: number) => (
                <Button key={idx} variant="text" href={file} target="_blank" sx={{ mr: 1 }}>
                  Download File {idx + 1}
                </Button>
              ))}
            </Box>
          )}
          {assignment.rubric && (
            <Box mt={2}>
              <Typography variant="h6">Rubric</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{assignment.rubric}</Typography>
            </Box>
          )}
          {assignment.grade !== undefined && assignment.grade !== null && (
            <Box mt={2}>
              <Typography variant="h6">Grade: {assignment.grade}/{assignment.maxPoints || 100}</Typography>
              {assignment.feedback && <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>Feedback: {assignment.feedback}</Typography>}
            </Box>
          )}
        </CardContent>
      </Card>
      {assignment.status !== 'completed' && <AssignmentSubmissionForm assignmentId={id!} />}
      <AssignmentSubmissionHistory assignmentId={id!} />
    </Box>
  );
};

export default AssignmentDetail;
