import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardCapslockIcon from '@mui/icons-material/KeyboardCapslock';
import { alpha, useTheme } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import { forgotPassword } from '../../api/auth.api';

// Steel-inspired palette for this page only (scoped here, not merged into theme.js) - the hero
// panel is a fixed brand surface that stays dark navy regardless of the app's light/dark toggle.
// Deliberately restrained to navy/white/gray/blue, with the brand red used sparingly as an accent
// only - sampled directly from the logo's own oval fill (see frontend/public/*logo*.png), not
// invented, so it's an actual extension of the existing brand rather than a new color.
const NAVY = '#0F172A';
const NAVY_2 = '#172554';
const ACCENT = '#2563EB';
const ACCENT_DARK = '#1D4ED8';
const BRAND_RED = '#933129';

// A warm, slightly creamy off-white for the login panel - "premium," not the stark flat #fff a
// generic SaaS template would use.
const WARM_WHITE = '#FAF9F6';

// Mirrors package.json's version - hardcoded rather than imported so the login bundle doesn't
// pull in the whole package.json at build time.
const APP_VERSION = 'v1.0.0';

// Transparent-background cut of the real Triveni Steel logo (see triveni-steel-logo.png in the
// same folder for the original as supplied) - generated once via ImageMagick
// (`magick triveni-steel-logo.png -fuzz 6% -transparent white ...`) so the logo can sit directly
// on the dark hero panel without a white box behind it, while every actual logo pixel (the oval,
// the wordmark, the "ESTD 1970" line) is untouched.
const LOGO_SRC = '/triveni-steel-logo-transparent.png';

const TRUST_INDICATORS = ['Established 1970', 'ISO Certified', 'Trusted Steel Solutions'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Regular hexagon polygon points, centered on (0,0), flat-top orientation - used for the hero
 * panel's faint decorative outlines (no external image assets, pure SVG). */
function hexPoints(r) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i);
    return `${(r * Math.cos(angle)).toFixed(1)},${(r * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');
}

function HexOutline({ size, top, left, right, bottom, opacity = 0.05, rotate = 0 }) {
  return (
    <Box
      component="svg"
      viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`}
      sx={{ position: 'absolute', top, left, right, bottom, width: size * 2, height: size * 2, transform: `rotate(${rotate}deg)`, pointerEvents: 'none' }}
    >
      <polygon points={hexPoints(size)} fill="none" stroke={alpha('#FFFFFF', opacity)} strokeWidth={1} />
    </Box>
  );
}

const fadeInUpSx = {
  animation: 'fadeInUp 0.7s ease-out both',
  '@keyframes fadeInUp': { from: { opacity: 0, transform: 'translateY(18px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    transition: 'box-shadow 0.15s ease',
    '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(ACCENT, 0.12)}` },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT, borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  // The hero panel is a fixed brand surface (always dark navy, see its comment above) - only the
  // right-hand auth panel needs to actually follow the app's light/dark toggle.
  const panelBg = isDark ? theme.palette.background.paper : WARM_WHITE;
  const headingColor = isDark ? theme.palette.text.primary : NAVY;
  const subtleText = theme.palette.text.secondary;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotResult, setForgotResult] = useState(null);

  const handlePasswordKey = (e) => {
    if (typeof e.getModifierState === 'function') setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const openForgotDialog = () => {
    setForgotEmail(email);
    setForgotError('');
    setForgotResult(null);
    setForgotOpen(true);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const trimmed = forgotEmail.trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setForgotError('Please enter a valid email address');
      return;
    }
    setForgotError('');
    setForgotSubmitting(true);
    try {
      const result = await forgotPassword(trimmed);
      setForgotResult(result);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  const goToResetLink = () => {
    const url = new URL(forgotResult.resetLink);
    setForgotOpen(false);
    navigate(`${url.pathname}${url.search}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const nextEmailError = !trimmedEmail ? 'Email is required' : !EMAIL_RE.test(trimmedEmail) ? 'Please enter a valid email address' : '';
    const nextPasswordError = !password ? 'Password is required' : '';
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) return;

    setLoading(true);
    try {
      await login(trimmedEmail, password, rememberMe);
      navigate('/');
    } catch (err) {
      // The backend already replies "Invalid email or password" for bad credentials (see
      // auth.service.js) - surfaced as-is rather than re-worded, since it already matches.
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      {/* ---------------------------------------------------------------- HERO PANEL (desktop) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexBasis: '60%',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
          background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_2} 100%)`,
          px: { md: 7, lg: 10 },
          py: 6,
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Brushed-steel grain - very fine diagonal hairlines, alternating light/dark at very low
            opacity, so the panel reads as a machined metal surface rather than a flat fill */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `repeating-linear-gradient(115deg, ${alpha('#fff', 0.025)} 0px, ${alpha('#fff', 0.025)} 1px, transparent 1px, transparent 3px)`,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
          }}
        />

        {/* Blueprint grid texture - 6% opacity, within the brief's 5-8% band */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${alpha('#93C5FD', 0.06)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(
              '#93C5FD',
              0.06
            )} 1px, transparent 1px)`,
            backgroundSize: '44px 44px',
            pointerEvents: 'none',
          }}
        />

        {/* A couple of thin diagonal technical/blueprint lines, tucked in the top-left corner */}
        <Box component="svg" viewBox="0 0 240 240" sx={{ position: 'absolute', top: 0, left: 0, width: 240, height: 240, opacity: 0.07, pointerEvents: 'none' }}>
          <line x1="0" y1="70" x2="240" y2="-50" stroke="#fff" strokeWidth="1" />
          <line x1="0" y1="130" x2="240" y2="10" stroke="#fff" strokeWidth="1" />
        </Box>

        {/* Faint hexagonal engineering outlines */}
        <HexOutline size={100} top={30} right={70} opacity={0.045} rotate={8} />
        <HexOutline size={64} top={290} left={36} opacity={0.045} rotate={20} />
        <HexOutline size={140} bottom={-50} right={-30} opacity={0.03} rotate={-10} />

        {/* Refined engineering motif in the lower-right corner: a technical dimension line with
            arrowheads plus a short partial arc (a rolled-coil suggestion, not a literal photo) -
            a single fine stroke, much smaller and quieter than a large ring cluster */}
        <Box component="svg" viewBox="0 0 200 160" sx={{ position: 'absolute', right: 40, bottom: 44, width: 200, height: 160, opacity: 0.1, pointerEvents: 'none' }}>
          <path d="M20 130 A 90 90 0 0 1 180 90" fill="none" stroke="#fff" strokeWidth="1" />
          <path d="M40 150 A 70 70 0 0 1 170 118" fill="none" stroke="#fff" strokeWidth="1" />
          <line x1="0" y1="10" x2="120" y2="10" stroke="#fff" strokeWidth="1" />
          <path d="M0 10 L7 6 M0 10 L7 14" stroke="#fff" strokeWidth="1" fill="none" />
          <path d="M120 10 L113 6 M120 10 L113 14" stroke="#fff" strokeWidth="1" fill="none" />
        </Box>

        {/* Soft radial glow, centered behind the headline block rather than a corner */}
        <Box
          sx={{
            position: 'absolute',
            top: '28%',
            left: '5%',
            width: 560,
            height: 560,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(ACCENT, 0.18)} 0%, transparent 70%)`,
            filter: 'blur(20px)',
            pointerEvents: 'none',
          }}
        />

        {/* Logo - small, elegant, no white container; the logo's own maroon/gray reads cleanly
            straight on navy once the file's white background is knocked out (see LOGO_SRC) */}
        <Box sx={{ position: 'relative', zIndex: 1, ...fadeInUpSx }}>
          <Box component="img" src={LOGO_SRC} alt="Triveni Steel" sx={{ height: 34, display: 'block' }} />
        </Box>

        {/* Slogan + supporting copy + trust indicators */}
        <Box sx={{ position: 'relative', zIndex: 1, ...fadeInUpSx, animationDelay: '0.1s' }}>
          <Box sx={{ width: 40, height: 3, borderRadius: '2px', bgcolor: ACCENT, mb: 3 }} />
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{ mb: 2.5, letterSpacing: -0.5, lineHeight: 1.18, fontSize: { md: '2.15rem', lg: '2.65rem' } }}
          >
            Engineering Strength.
            <br />
            <Box component="span" sx={{ fontWeight: 700, color: alpha('#fff', 0.92) }}>
              Delivering Quality.
            </Box>
          </Typography>
          <Typography variant="body1" sx={{ color: alpha('#fff', 0.68), maxWidth: 420, mb: 4, lineHeight: 1.7 }}>
            Delivering premium steel solutions through innovation, quality, and operational excellence.
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            divider={<Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: BRAND_RED, opacity: 0.85 }} />}
          >
            {TRUST_INDICATORS.map((label) => (
              <Typography key={label} variant="caption" fontWeight={600} sx={{ color: alpha('#fff', 0.62), letterSpacing: 0.2 }}>
                {label}
              </Typography>
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ position: 'relative', zIndex: 1, color: alpha('#fff', 0.4) }}>
          © {new Date().getFullYear()} Triveni Steel. Internal manufacturing ERP.
        </Typography>
      </Box>

      {/* ------------------------------------------------------------- COMPACT HEADER (mobile) */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          flexDirection: 'column',
          gap: 1.25,
          color: '#fff',
          background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_2} 100%)`,
          px: 3,
          py: 4,
        }}
      >
        <Box component="img" src={LOGO_SRC} alt="Triveni Steel" sx={{ height: 30, display: 'block', alignSelf: 'flex-start' }} />
        <Typography variant="body2" fontWeight={700}>
          Engineering Strength. Delivering Quality.
        </Typography>
      </Box>

      {/* ---------------------------------------------------------------------- LOGIN PANEL */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, sm: 5 }, position: 'relative', bgcolor: panelBg }}>
        <Box sx={{ width: '100%', maxWidth: 440, ...fadeInUpSx, animationDelay: '0.15s' }}>
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Box
              component="img"
              src={LOGO_SRC}
              alt="Triveni Steel"
              sx={{ height: 42, display: { xs: 'none', md: 'block' }, mx: 'auto', mb: 4.5 }}
            />
            <Typography variant="h4" fontWeight={800} sx={{ color: headingColor, letterSpacing: -0.5, mb: 1.25 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: subtleText }}>
              Sign in to continue to your ERP workspace.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              margin="normal"
              disabled={loading}
              error={!!emailError}
              helperText={emailError}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon fontSize="small" sx={{ color: subtleText }} />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
            <TextField
              fullWidth
              label="Password"
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              onKeyDown={handlePasswordKey}
              onKeyUp={handlePasswordKey}
              margin="normal"
              disabled={loading}
              error={!!passwordError}
              helperText={passwordError}
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
              sx={inputSx}
            />
            {capsLockOn && !passwordError && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: -0.5, mb: 1, ml: 0.5 }}>
                <KeyboardCapslockIcon sx={{ fontSize: 14, color: subtleText }} />
                <Typography variant="caption" sx={{ color: subtleText }}>
                  Caps Lock is on
                </Typography>
              </Stack>
            )}

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    sx={{ color: alpha(subtleText, 0.7), '&.Mui-checked': { color: ACCENT } }}
                  />
                }
                label={<Typography variant="body2">Remember Me</Typography>}
              />
              <Link
                component="button"
                type="button"
                variant="body2"
                underline="hover"
                onClick={openForgotDialog}
                sx={{ fontWeight: 600, color: ACCENT }}
              >
                Forgot Password?
              </Link>
            </Stack>

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{
                mt: 3,
                height: 52,
                borderRadius: '10px',
                fontSize: '1rem',
                bgcolor: ACCENT,
                boxShadow: `0 4px 12px 0 ${alpha(ACCENT, 0.25)}`,
                transition: 'box-shadow 0.2s ease, background-color 0.2s ease',
                '&:hover': { bgcolor: ACCENT_DARK, boxShadow: `0 6px 16px 0 ${alpha(ACCENT, 0.32)}`, '& .signin-arrow': { transform: 'translateX(3px)' } },
              }}
            >
              {loading ? (
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <CircularProgress size={18} thickness={5} sx={{ color: '#fff' }} />
                  <span>Signing in...</span>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                  <span>Sign In</span>
                  <ArrowForwardIcon className="signin-arrow" sx={{ fontSize: 20, transition: 'transform 0.2s ease' }} />
                </Stack>
              )}
            </Button>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', px: 2 }}>
          <Typography variant="caption" sx={{ color: subtleText, display: 'block' }}>
            © {new Date().getFullYear()} Triveni Steel • All Rights Reserved
          </Typography>
          <Typography variant="caption" sx={{ color: alpha(subtleText, 0.85), display: 'block' }}>
            Powered by RDL Technologies
          </Typography>
          <Typography variant="caption" sx={{ color: alpha(subtleText, 0.65) }}>
            ERP Portal • {APP_VERSION}
          </Typography>
        </Box>
      </Box>

      {/* Forgot Password dialog - a real reset-token flow (see auth.service.js#forgotPassword).
          The backend always replies with the same generic message whether or not the email
          matched an account, so this can't be used to check which emails have accounts. */}
      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Forgot Password?</DialogTitle>
        {forgotResult ? (
          <>
            <DialogContent>
              <DialogContentText sx={{ mb: forgotResult.resetLink ? 2 : 0 }}>{forgotResult.message}</DialogContentText>
              {/* Only present when SMTP isn't configured (dev/local) - see mailer.service.js -
                  since there's no real inbox to check in that case. */}
              {forgotResult.resetLink && (
                <Alert severity="info" sx={{ wordBreak: 'break-all' }}>
                  No email server is configured in this environment, so here's the link directly:
                  <br />
                  <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {forgotResult.resetLink}
                  </Box>
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              {forgotResult.resetLink && (
                <Button onClick={goToResetLink} variant="contained">
                  Open Reset Link
                </Button>
              )}
              <Button onClick={() => setForgotOpen(false)} variant={forgotResult.resetLink ? 'text' : 'contained'}>
                Close
              </Button>
            </DialogActions>
          </>
        ) : (
          <Box component="form" onSubmit={handleForgotSubmit}>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                Enter the email address on your account and we'll send you a link to reset your password.
              </DialogContentText>
              <TextField
                fullWidth
                autoFocus
                type="email"
                label="Email"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  if (forgotError) setForgotError('');
                }}
                error={!!forgotError}
                helperText={forgotError}
                disabled={forgotSubmitting}
                sx={inputSx}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setForgotOpen(false)} disabled={forgotSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={forgotSubmitting}>
                {forgotSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
