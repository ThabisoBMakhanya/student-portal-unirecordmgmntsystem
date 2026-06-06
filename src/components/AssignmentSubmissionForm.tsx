import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { apiClient } from '../services/api';

interface AssignmentSubmissionFormProps {
  assignmentId: string;
}

const AssignmentSubmissionForm: React.FC<AssignmentSubmissionFormProps> = ({ assignmentId }) => {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/student/assignments/${assignmentId}/submit`, { submission_content: text });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
      setText('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>Submit Assignment</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Your submission"
          multiline
          rows={4}
          value={text}
          onChange={e => setText(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary" disabled={mutation.status === 'pending' || !text.trim()}>
          {mutation.status === 'pending' ? <CircularProgress size={20} /> : 'Submit'}
        </Button>
        {mutation.isError && <Alert severity="error" sx={{ mt: 2 }}>{(mutation.error as any)?.message || 'Submission failed.'}</Alert>}
        {mutation.isSuccess && <Alert severity="success" sx={{ mt: 2 }}>Submission successful!</Alert>}
      </form>
    </Box>
  );
};

export default AssignmentSubmissionForm;
