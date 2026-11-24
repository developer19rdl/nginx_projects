import { useState } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { alpha, useTheme } from '@mui/material/styles';
import { resetPassword } from '../../api/auth.api';

// Same scoped palette as Login.jsx (kept as its own small copy rather than a shared import -
// these hex values are this auth flow's brand constants, not something either page should have
// to reach into the other's file for).
const NAVY = '#0F172A';
const ACCENT = '#2563EB';
const ACCENT_DARK = '#1D4ED8';
const WARM_WHITE = '#FAF9F6';

const LOGO_SRC = '/triveni-steel-logo-transparent.png';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const panelBg = isDark ? theme.palette.background.paper : WARM_WHITE;
  const headingColor = isDark ? theme.palette.text.primary : NAVY;
  const subtleText = theme.palette.text.secondary;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const nextPasswordError = !password
      ? 'Password is required'
      : password.length < 8
        ? 'Password must be at least 8 characters'
        : '';
    const nextConfirmError = confirmPassword !== password ? 'Passwords do not match' : '';
    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);
    if (nextPasswordError || nextConfirmError) return;

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please request a new reset link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: panelBg, p: 3 }}>
      <Paper
        variant="outlined"
        sx={{ width: '100%', maxWidth: 440, p: { xs: 3, sm: 5 }, borderRadius: '14px', bgcolor: panelBg }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box component="img" src={LOGO_SRC} alt="Triveni Steel" sx={{ height: 40, mx: 'auto', mb: 4, display: 'block' }} />
          <Typography variant="h4" fontWeight={800} sx={{ color: headingColor, letterSpacing: -0.5, mb: 1 }}>
            {done ? 'Password Reset' : 'Set a New Password'}
          </Typography>
          <Typography variant="body2" sx={{ color: subtleText }}>
            {done ? 'Your password has been changed successfully.' : 'Choose a new password for your ERP account.'}
          </Typography>
        </Box>

        {!token && !done && (
          <Alert severity="error" sx={{ mb: 3 }}>
            This link is missing its reset token. Please request a new password reset link from the login page.
          </Alert>
        )}

        {done ? (
          <Stack spacing={3} alignItems="center">
            <CheckCircleIcon sx={{ fontSize: 56, color: 'success.main' }} />
            <Button fullWidth variant="contained" onClick={() => navigate('/login')} sx={{ height: 52, borderRadius: '10px', bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK } }}>
              Continue to Sign In
            </Button>
          </Stack>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="New Password"
              placeholder="Enter your new password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              margin="normal"
              disabled={!token || submitting}
              error={!!passwordError}
              helperText={passwordError}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" sx={{ color: subtleText }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end" aria-label="toggle password visibility">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              placeholder="Re-enter your new password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmError) setConfirmError('');
              }}
              margin="normal"
              disabled={!token || submitting}
              error={!!confirmError}
              helperText={confirmError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" sx={{ color: subtleText }} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={!token || submitting}
              sx={{
                mt: 3,
                height: 52,
                borderRadius: '10px',
                bgcolor: ACCENT,
                boxShadow: `0 4px 12px 0 ${alpha(ACCENT, 0.25)}`,
                '&:hover': { bgcolor: ACCENT_DARK },
              }}
            >
              {submitting ? (
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <CircularProgress size={18} thickness={5} sx={{ color: '#fff' }} />
                  <span>Resetting...</span>
                </Stack>
              ) : (
                'Reset Password'
              )}
            </Button>

            <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: subtleText }}>
              <Link component={RouterLink} to="/login" underline="hover" sx={{ color: ACCENT, fontWeight: 600 }}>
                Back to Sign In
              </Link>
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
