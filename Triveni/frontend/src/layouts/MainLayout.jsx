import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { alpha } from '@mui/material/styles';
import Header from './Header';
import Sidebar, { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from './Sidebar';
import Footer from './Footer';

const SIDEBAR_COLLAPSED_KEY = 'tiveni.sidebarCollapsed';

/** Thin composition shell - owns only the state both Header (hamburger) and Sidebar (collapsed
 * rail, mobile drawer) need to share; all the actual header/nav/footer markup lives in their own
 * files (Header.jsx/Sidebar.jsx/Footer.jsx). */
export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Persisted so a user's collapsed/expanded choice survives a reload instead of resetting every
  // time the app is opened. Only meaningful on desktop/tablet - mobile always uses a full-width
  // overlay drawer regardless of this.
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        // localStorage unavailable (private browsing, etc.) - the toggle still works for this session
      }
      return next;
    });
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const desktopWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex' }}>
      <Header onToggleMobile={() => setMobileOpen((o) => !o)} />

      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        activePath={location.pathname}
        onNavigate={handleNavigate}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 1.5, sm: 2.5, md: 3 },
          width: { xs: '100%', sm: `calc(100% - ${desktopWidth}px)` },
          minHeight: '100vh',
          bgcolor: (theme) => alpha(theme.palette.primary.light, 0.03),
          transition: (theme) => theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}
