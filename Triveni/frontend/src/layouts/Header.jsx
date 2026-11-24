import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import FactoryIcon from '@mui/icons-material/Factory';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeModeContext';
import { currentNavLabel } from '../config/navigation';

function initialsOf(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

/** HH:mm:ss, ticking every second - purely client-side, no backend clock/timezone dependency. */
function useLiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString('en-IN', { hour12: false });
}

export default function Header({ onToggleMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, setMode } = useThemeMode();
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const clock = useLiveClock();
  const pageLabel = currentNavLabel(location.pathname);

  return (
    <AppBar
      position="fixed"
      color="inherit"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 1.5 }}>
        <IconButton onClick={onToggleMobile} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            flexShrink: 0,
          }}
        >
          <FactoryIcon fontSize="small" />
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap sx={{ lineHeight: 1.2 }}>
            Triveni Steel{pageLabel ? ` | ${pageLabel}` : ''}
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main', flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
              System Online
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, fontVariantNumeric: 'tabular-nums' }}>
            {clock}
          </Typography>

          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
              {user?.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.roleName}
            </Typography>
          </Box>
          <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontSize: 14, fontWeight: 700 }}>
              {initialsOf(user?.fullName)}
            </Avatar>
          </IconButton>
        </Stack>

        <Menu
          anchorEl={userMenuAnchor}
          open={!!userMenuAnchor}
          onClose={() => setUserMenuAnchor(null)}
          slotProps={{ paper: { sx: { minWidth: 240 } } }}
        >
          <MenuItem disabled sx={{ opacity: '1 !important' }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.roleName}
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1, gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Theme
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={mode}
              exclusive
              onChange={(e, val) => val && setMode(val)}
              sx={{
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.06) : 'grey.100'),
                borderRadius: '10px',
                p: 0.4,
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '8px !important',
                  px: 1,
                  py: 0.4,
                  color: 'text.secondary',
                  '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } },
                },
              }}
            >
              <ToggleButton value="light" aria-label="Light theme">
                <LightModeIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="dark" aria-label="Dark theme">
                <DarkModeIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <Divider />
          <MenuItem
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
