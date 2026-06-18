import React, { useState } from 'react';
import { Box, Container, Paper, Typography, TextField, Button, Alert, Link, CircularProgress } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      if (!token) {
        throw new Error("Reset token is missing in URL!");
      }
      await api.post('/auth/reset-password', { token, newPassword });
      setSuccess("Your password has been reset successfully!");
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Failed to reset password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(45deg, #b388ff 30%, #03dac6 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Reset Password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter a new secure password below
        </Typography>

        {success && <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>{success}. Redirecting to sign in...</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            type="password"
            variant="outlined"
            fullWidth
            required
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Minimum 6 characters"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading || !token}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Reset Password"}
          </Button>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Back to{' '}
            <Link href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} sx={{ fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
