import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ConstructionIcon from '@mui/icons-material/Construction';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';

/** Placeholder for a menu section that isn't built yet - keeps the Home menu's layout/navigation
 * real and clickable without pretending these screens have functionality behind them. */
export default function StubPage({ title, icon }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar title={title} />
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', maxWidth: 420 }}>
          <Box sx={{ color: 'text.secondary', mb: 2 }}>{icon || <ConstructionIcon sx={{ fontSize: 48 }} />}</Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This section isn&apos;t built yet - coming soon.
          </Typography>
        </Paper>
      </Box>
      <BottomBar />
    </Box>
  );
}
