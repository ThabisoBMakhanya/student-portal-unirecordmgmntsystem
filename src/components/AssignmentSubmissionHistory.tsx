import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { apiClient } from '../services/api';

interface AssignmentSubmissionHistoryProps {
  assignmentId: string;
}

const AssignmentSubmissionHistory: React.FC<AssignmentSubmissionHistoryProps> = ({ assignmentId }) => {
  const { data: submissions, isLoading, error } = useQuery({
    queryKey: ['assignment-submissions', assignmentId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/student/assignments/${assignmentId}/submissions`);
      return data.data || [];
    },
  });

  if (isLoading) return <Box mt={2}><CircularProgress /></Box>;
  if (error) return <Box mt={2}><Alert severity="error">Error loading submissions</Alert></Box>;

  return (
    <Box mt={2}>
      <Typography variant="h6" gutterBottom>Your Submissions</Typography>
      {!submissions || submissions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No submissions yet.</Typography>
      ) : (
        <List>
          {submissions.map((sub: any) => (
            <ListItem key={sub._id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <ListItemText
                primary={`Attempt ${sub.attempt_number}: ${sub.status}`}
                secondary={`Submitted: ${sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : '-'}${sub.grade != null ? ` | Grade: ${sub.grade}` : ''}${sub.feedback ? ` | Feedback: ${sub.feedback}` : ''}`}
              />
              <Chip label={sub.status} size="small" color={sub.status === 'late' ? 'error' : 'primary'} sx={{ mt: 1 }} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AssignmentSubmissionHistory;
