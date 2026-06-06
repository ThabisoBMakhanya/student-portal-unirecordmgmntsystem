import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Link, Alert, InputAdornment,
  IconButton, Stepper, Step, StepLabel, Grid, Avatar, CircularProgress, Chip,
} from '@mui/material';
import {
  Visibility, VisibilityOff, Email, Lock, Person, Phone,
  ArrowBack, ArrowForward, HowToReg,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../services/api';

const personalSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Valid email required').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
});

const accountSchema = yup.object({
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password'),
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [nextId, setNextId] = useState('9020xxxxx');
  const [loadingId, setLoadingId] = useState(true);

  useEffect(() => {
    apiClient.get('/auth/next-student-id')
      .then(res => setNextId(res.data.data.nextStudentId))
      .catch(() => setNextId('9020xxxxx'))
      .finally(() => setLoadingId(false));
  }, []);

  const personalForm = useForm({ resolver: yupResolver(personalSchema), defaultValues: { firstName: '', lastName: '', email: '', phone: '' } });
  const accountForm = useForm({ resolver: yupResolver(accountSchema), defaultValues: { password: '', confirmPassword: '' } });

  const handleNext = async () => {
    const valid = await personalForm.trigger();
    if (valid) setActiveStep(1);
  };

  const handleSubmit = async () => {
    const valid = await accountForm.trigger();
    if (!valid) return;
    setSubmitting(true);
    try {
      const personal = personalForm.getValues();
      await apiClient.post('/auth/register', {
        firstName: personal.firstName,
        lastName: personal.lastName,
        email: personal.email,
        phone: personal.phone,
        password: accountForm.getValues('password'),
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box textAlign="center" mb={3}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
          <HowToReg />
        </Avatar>
        <Typography variant="h5" fontWeight="bold">Create Account</Typography>
        <Typography variant="body2" color="text.secondary">Join the Limkokwing student portal</Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        <Step><StepLabel>Personal Info</StepLabel></Step>
        <Step><StepLabel>Account Setup</StepLabel></Step>
      </Stepper>

      {activeStep === 0 && (
        <Box component="form">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Controller name="firstName" control={personalForm.control} render={({ field }) => (
                <TextField {...field} fullWidth label="First Name" error={!!personalForm.formState.errors.firstName} helperText={personalForm.formState.errors.firstName?.message} InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }} />
              )} />
            </Grid>
            <Grid item xs={6}>
              <Controller name="lastName" control={personalForm.control} render={({ field }) => (
                <TextField {...field} fullWidth label="Last Name" error={!!personalForm.formState.errors.lastName} helperText={personalForm.formState.errors.lastName?.message} InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }} />
              )} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="email" control={personalForm.control} render={({ field }) => (
                <TextField {...field} fullWidth label="Email Address" error={!!personalForm.formState.errors.email} helperText={personalForm.formState.errors.email?.message} InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }} />
              )} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="phone" control={personalForm.control} render={({ field }) => (
                <TextField {...field} fullWidth label="Phone Number" error={!!personalForm.formState.errors.phone} helperText={personalForm.formState.errors.phone?.message} InputProps={{ startAdornment: <InputAdornment position="start"><Phone /></InputAdornment> }} />
              )} />
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button variant="contained" endIcon={<ArrowForward />} onClick={handleNext}>Next</Button>
          </Box>
        </Box>
      )}

      {activeStep === 1 && (
        <Box component="form">
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">Your Student ID will be:</Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip label={loadingId ? 'Generating...' : nextId} color="primary" sx={{ fontSize: '1rem', fontWeight: 'bold', fontFamily: 'monospace' }} />
              <Typography variant="caption" color="text.secondary">Auto-generated · 9 digits · 9020XXXXX format</Typography>
            </Box>
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller name="password" control={accountForm.control} render={({ field }) => (
                <TextField {...field} fullWidth label="Password" type={showPassword ? 'text' : 'password'} error={!!accountForm.formState.errors.password} helperText={accountForm.formState.errors.password?.message} InputProps={{ startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
              )} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="confirmPassword" control={accountForm.control} render={({ field }) => (
                <TextField {...field} fullWidth label="Confirm Password" type="password" error={!!accountForm.formState.errors.confirmPassword} helperText={accountForm.formState.errors.confirmPassword?.message} InputProps={{ startAdornment: <InputAdornment position="start"><Lock /></InputAdornment> }} />
              )} />
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            By creating an account, you agree to the terms and conditions of Limkokwing University.
          </Alert>
          <Box display="flex" justifyContent="space-between" mt={3}>
            <Button startIcon={<ArrowBack />} onClick={() => setActiveStep(0)}>Back</Button>
            <Button variant="contained" startIcon={<HowToReg />} onClick={handleSubmit} disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : 'Register'}
            </Button>
          </Box>
        </Box>
      )}

      <Box textAlign="center" mt={3}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" variant="body2" fontWeight="bold" underline="hover">
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;
