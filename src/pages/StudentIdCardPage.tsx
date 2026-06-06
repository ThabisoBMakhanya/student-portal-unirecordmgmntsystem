import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, CircularProgress, Alert,
  Button, Divider, Chip,
} from '@mui/material';
import { Print, Download } from '@mui/icons-material';
import { apiClient } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import StudentBarcode from '../components/StudentIdCard/StudentBarcode';
import StudentQRCode from '../components/StudentIdCard/StudentQRCode';

const StudentIdCardPage: React.FC = () => {
  const { user } = useAuthStore();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile-idcard'],
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/profile');
      return data.data.user;
    },
  });

  if (isLoading) return <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>;

  const p = profile || user;

  return (
    <Box p={3} display="flex" justifyContent="center">
      <Box maxWidth={500} width="100%">
        <Typography variant="h4" fontWeight={600} gutterBottom textAlign="center">
          Student ID Card
        </Typography>

        <Card sx={{ border: '2px solid', borderColor: 'primary.main', borderRadius: 3, overflow: 'visible' }}>
          <CardContent sx={{ p: 3 }}>
            {/* Header */}
            <Box textAlign="center" mb={2}>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                LIMKOKWING UNIVERSITY
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                ESWATINI · STUDENT ID CARD
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Photo + Info */}
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={4}>
                <Avatar
                  src={p?.personalInfo?.profilePicture}
                  sx={{ width: 90, height: 90, mx: 'auto', border: '2px solid', borderColor: 'primary.main' }}
                >
                  {p?.personalInfo?.firstName?.[0]}{p?.personalInfo?.lastName?.[0]}
                </Avatar>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="h6" fontWeight={600}>
                  {p?.personalInfo?.firstName} {p?.personalInfo?.lastName}
                </Typography>
                <Chip
                  label={p?.academicInfo?.studentId}
                  color="primary"
                  size="small"
                  sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.9rem', mt: 0.5 }}
                />
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {p?.academicInfo?.program}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Year {p?.academicInfo?.level} · {p?.academicInfo?.faculty}
                </Typography>
              </Grid>
            </Grid>

            {/* Barcode */}
            <Box mt={2} py={1.5} bgcolor="grey.50" borderRadius={2}>
              <StudentBarcode studentId={p?.academicInfo?.studentId || '902000001'} width={280} height={50} />
              <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                Scan barcode for library, exams &amp; campus access
              </Typography>
            </Box>

            {/* QR + Info row */}
            <Grid container spacing={2} mt={1}>
              <Grid item xs={4}>
                <StudentQRCode studentId={p?.academicInfo?.studentId || '902000001'} size={90} />
                <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                  Mobile scan
                </Typography>
              </Grid>
              <Grid item xs={8} display="flex" flexDirection="column" justifyContent="center">
                <Typography variant="caption" color="text.secondary">
                  <strong>Format:</strong> 9020 + 5-digit sequence (9 digits total)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Valid:</strong> {p?.academicInfo?.admissionDate || '2024'} – {p?.academicInfo?.expectedGraduationDate || '2027'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Email:</strong> {p?.email}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Actions */}
        <Box display="flex" gap={2} justifyContent="center" mt={3}>
          <Button variant="contained" startIcon={<Download />} onClick={() => window.print()}>
            Download / Print
          </Button>
        </Box>

        {/* Usage info */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Where to use your ID card:</strong> Campus gate access, library checkouts, 
            exam hall attendance, cafeteria payments, and event check-in.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default StudentIdCardPage;
