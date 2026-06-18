import React, { useState, useContext, useRef } from 'react';
import { Container, Grid, Paper, Typography, Box, Avatar, TextField, Button, Alert, CircularProgress, IconButton } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { PhotoCamera } from '@mui/icons-material';

export default function Profile() {
  const { user, updateUserProfile, updateProfileImage } = useContext(AuthContext);
  
  const [username, setUsername] = useState(user?.username || '');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [avatarError, setAvatarError] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setUsernameSuccess('');
    setUsernameError('');
    setUsernameLoading(true);
    try {
      const response = await api.put('/profile/update', { username });
      updateUserProfile(response.data.username);
      setUsernameSuccess("Username updated successfully!");
    } catch (err) {
      console.error(err);
      setUsernameError(err.response?.data?.message || "Failed to update username.");
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');
    setPasswordLoading(true);
    try {
      await api.post('/profile/change-password', { oldPassword, newPassword });
      setPasswordSuccess("Password changed successfully!");
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      setPasswordError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarError('');
    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/profile/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      updateProfileImage(response.data.message);
    } catch (err) {
      console.error(err);
      setAvatarError(err.response?.data?.message || "Failed to upload avatar image.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const getProfileImageSrc = () => {
    if (user && user.profileImagePath) {
      return `/api/profile/image/${user.profileImagePath}`;
    }
    return null;
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 4 }}>
        Account Profile
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
          <Paper sx={{ p: 4, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative', mb: 3 }}>
              <Avatar
                src={getProfileImageSrc()}
                alt={user?.username}
                sx={{ width: 140, height: 140, fontSize: '3rem', bgcolor: 'primary.main', border: '4px solid #b388ff' }}
              >
                {user?.username.charAt(0).toUpperCase()}
              </Avatar>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              <IconButton
                color="primary"
                onClick={() => fileInputRef.current.click()}
                disabled={avatarLoading}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  '&:hover': { bgcolor: 'background.paper' },
                }}
              >
                {avatarLoading ? <CircularProgress size={20} /> : <PhotoCamera />}
              </IconButton>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {user?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {user?.email}
            </Typography>

            {avatarError && <Alert severity="error" sx={{ width: '100%' }}>{avatarError}</Alert>}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Update Profile Info
              </Typography>
              
              {usernameSuccess && <Alert severity="success" sx={{ mb: 3 }}>{usernameSuccess}</Alert>}
              {usernameError && <Alert severity="error" sx={{ mb: 3 }}>{usernameError}</Alert>}

              <Box component="form" onSubmit={handleUpdateUsername}>
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={usernameLoading}
                >
                  {usernameLoading ? <CircularProgress size={24} /> : "Save Profile Details"}
                </Button>
              </Box>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Change Password
              </Typography>
              
              {passwordSuccess && <Alert severity="success" sx={{ mb: 3 }}>{passwordSuccess}</Alert>}
              {passwordError && <Alert severity="error" sx={{ mb: 3 }}>{passwordError}</Alert>}

              <Box component="form" onSubmit={handleChangePassword}>
                <TextField
                  label="Current Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="New Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  helperText="Minimum 6 characters"
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? <CircularProgress size={24} /> : "Update Password"}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
