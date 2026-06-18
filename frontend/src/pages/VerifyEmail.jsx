import React, { useEffect, useState, useRef } from 'react';
import { Container, Paper, Typography, CircularProgress, Alert, Button, Box } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const verificationSent = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing in the URL!');
      return;
    }
    if (verificationSent.current) return;
    verificationSent.current = true;

    const doVerification = async () => {
      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message || "Email verified successfully!");
      } catch (err) {
        console.error(err);
        setStatus('error');
        setMessage(err.response?.data?.message || "Verification failed. The token may be invalid or expired.");
      }
    };
    doVerification();
  }, [token]);

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, background: 'linear-gradient(45deg, #b388ff 30%, #03dac6 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Email Verification
        </Typography>

        {status === 'verifying' && (
          <Box sx={{ py: 4 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Verifying your email token, please wait...
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box>
            <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
              {message}
            </Alert>
            <Button variant="contained" color="primary" fullWidth size="large" onClick={() => navigate('/login')}>
              Sign In Now
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box>
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              {message}
            </Alert>
            <Button variant="outlined" color="primary" fullWidth size="large" onClick={() => navigate('/register')}>
              Back to Registration
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
