import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { alpha } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';

function initialsOf(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

/** Live clock - re-renders once a second. Kept local to this component so nothing else on the
 * page re-renders every second just because the clock ticks. */
function useClock() {
  const [now, setNow] = useState(() => dayjs());
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export default function TopBar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const now = useClock();

  return (
    <AppBar position="sticky" color="inherit" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 1.5 }}>
        {location.pathname !== '/' && (
          <IconButton onClick={() => navigate('/')} title="Home" edge="start">
            <HomeIcon />
          </IconButton>
        )}

        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          <PrecisionManufacturingIcon fontSize="small" />
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ lineHeight: 1.2 }}>
            {title || 'Triveni Operator'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            Triveni Operator
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', display: { xs: 'none', sm: 'block' }, px: 2 }}>
          <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
            {now.format('hh:mm:ss A')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {now.format('DD-MM-YYYY')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <ThemeToggleButton />
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 13, fontWeight: 700 }}>
            {initialsOf(user?.fullName)}
          </Avatar>
          <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }} noWrap>
            {user?.fullName}
          </Typography>
          <IconButton onClick={logout} title="Logout" size="small">
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
