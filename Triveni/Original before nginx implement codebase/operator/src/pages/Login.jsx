import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggleButton from '../components/ThemeToggleButton';

// Same transparent-background logo cut as the main app's login (frontend/public) - copied over
// rather than shared, matching this app's existing "kept in sync manually" convention for
// anything that can't be a real shared package (see theme.js's own comment).
const LOGO_SRC = '/triveni-steel-logo-transparent.png';

// Free-to-use (Unsplash License, no attribution required) - a macro shot of heavy industrial
// machinery bolts at a smelting works in Odda, Norway. Chosen for having no readable brand names/
// logos/text anywhere in frame (checked visually, not just by description) and already being a
// genuine monochrome photograph rather than a colour shot forced into grayscale.
const LOGIN_BG_SRC = '/login-bg.jpg';

const fadeInUpSx = {
  animation: 'fadeInUp 0.5s ease-out both',
  '@keyframes fadeInUp': { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
};

const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '10px' } };

/**
 * A shop-floor tablet login: one focused, touch-friendly card rather than a marketing hero panel
 * (this device gets signed in and out repeatedly through a shift, not a first-impression brand
 * moment) - but built to the same design-system tokens/quality bar as the main app's login.
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fixed dark industrial backdrop - deliberately independent of the light/dark toggle, same
    // reasoning as the main app's login hero panel: this is a brand/mood surface, not a themed
    // one. The toggle still works and still persists a real preference for the rest of the app
    // once signed in - it just doesn't relight this particular background.
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', bgcolor: '#0B1220' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${LOGIN_BG_SRC})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // grayscale() is a belt-and-suspenders guarantee of "monochromatic," not a fix for a
          // colour photo - the source image is already a genuine black-and-white shot.
          filter: 'grayscale(1)',
          opacity: 0.16,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          // Soft radial vignette rather than a flat tint - darkest at the edges, so the image
          // blends out with no visible hard edge, and lightest (relatively) right behind the
          // card, which still sits on its own fully opaque Paper regardless.
          background: 'radial-gradient(ellipse at 50% 45%, rgba(11,18,32,0.55) 0%, rgba(11,18,32,0.85) 55%, rgba(11,18,32,0.96) 100%)',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <ThemeToggleButton sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }} />
        </Box>

        <Paper
          variant="outlined"
          sx={{ width: 440, maxWidth: '100%', p: { xs: 3, sm: 5 }, borderRadius: '16px', boxShadow: '0 24px 64px 0 rgba(0,0,0,0.4)', ...fadeInUpSx }}
        >
          <Stack alignItems="center" spacing={2} sx={{ mb: 4, textAlign: 'center' }}>
            <Box component="img" src={LOGO_SRC} alt="Triveni Steel" sx={{ height: 44, display: 'block' }} />
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.3 }}>
                Operator Console
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to access Shift Plan &amp; Production Entry
              </Typography>
            </Box>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              size="medium"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoFocus
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
            <TextField
              fullWidth
              size="medium"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" aria-label="toggle password visibility">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ mt: 3.5, height: 52, borderRadius: '10px', fontSize: '1rem' }}
            >
              {loading ? (
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <CircularProgress size={18} thickness={5} sx={{ color: 'inherit' }} />
                  <span>Signing in...</span>
                </Stack>
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>
        </Paper>

        <Typography variant="caption" sx={{ position: 'absolute', bottom: 16, color: 'rgba(255,255,255,0.6)' }}>
          Copyright © 2026 RDL Technologies Pvt Ltd - All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
}
