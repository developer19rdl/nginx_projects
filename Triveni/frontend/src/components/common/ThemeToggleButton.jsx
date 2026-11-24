import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../../contexts/ThemeModeContext';

export default function ThemeToggleButton(props) {
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton onClick={toggleMode} size="small" {...props}>
        {isDark ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
