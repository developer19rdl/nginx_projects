import { useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import * as authApi from '../api/auth.api';

/** Gates a sensitive screen (Settings) behind an admin login - the shop-floor device stays signed
 * in as the operator all shift, so this is what stops an operator (or anyone walking up to it)
 * from changing machine configuration themselves. Requires the credentials of an account whose
 * role is actually Administrator, checked against the real login endpoint, without touching the
 * operator's own stored session - only a fresh success/failure is used here, the token pair
 * already in localStorage for the signed-in operator is left alone. */
export default function PasswordPromptDialog({ open, onClose, onVerified }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setEmail('');
    setPassword('');
    setError('');
    setShowPassword(false);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setChecking(true);
    setError('');
    try {
      const result = await authApi.login({ email, password });
      if (result.user?.roleCode !== 'ADMIN') {
        setError('This screen can only be unlocked with an administrator account.');
        return;
      }
      onVerified();
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect email or password');
    } finally {
      setChecking(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Admin Login Required</DialogTitle>
      <Box component="form" onSubmit={submit}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Settings can only be changed by an administrator. Enter an admin account to continue.
          </Typography>
          <Stack spacing={2}>
            <TextField
              autoFocus
              fullWidth
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!email || !password || checking}>
            {checking ? 'Checking...' : 'Unlock'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
