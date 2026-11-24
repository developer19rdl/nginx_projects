import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import ThemeToggleButton from '../components/common/ThemeToggleButton';

// Full-bleed shell for auth pages - Login.jsx (currently the only route this wraps) supplies its
// own complete hero/background, so this just provides the viewport frame and the persistent
// light/dark toggle, rather than the small-centered-card layout used elsewhere in the app.
export default function AuthLayout() {
  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <ThemeToggleButton
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,27,45,0.06)') },
          }}
        />
      </Box>
      <Outlet />
    </Box>
  );
}
