import { createTheme, alpha } from '@mui/material/styles';

// Triveni Steel design system - same brand as the main app's theme.js, kept in sync manually
// since this is a separate app (no shared package between them). See the main app's theme.js for
// the full rationale comment on where these hexes come from (the client's brief, Tailwind-aligned
// light/dark steps).
const brandShared = {
  secondary: { main: '#475569', light: '#64748B', dark: '#334155', contrastText: '#FFFFFF' },
  success: { main: '#16A34A', light: '#22C55E', dark: '#15803D', contrastText: '#FFFFFF' },
  warning: { main: '#F59E0B', light: '#FBBF24', dark: '#B45309', contrastText: '#1E293B' },
  error: { main: '#DC2626', light: '#EF4444', dark: '#B91C1C', contrastText: '#FFFFFF' },
  info: { main: '#0284C7', light: '#38BDF8', dark: '#075985', contrastText: '#FFFFFF' },
};

function getPrimary(mode) {
  return mode === 'dark'
    ? { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB', contrastText: '#FFFFFF' }
    : { main: '#2563EB', light: '#3B82F6', dark: '#1D4ED8', contrastText: '#FFFFFF' };
}

const lightNeutral = {
  bg: '#F8FAFC',
  paper: '#FFFFFF',
  tableHead: '#F1F5F9',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  shadowRgb: '15,23,42',
};

// Dark: same Dark Navy/Navy pairing as the main app - matters here more than most apps since this
// runs on a shop-floor tablet, often under bright or uneven overhead lighting.
const darkNeutral = {
  bg: '#0F172A',
  paper: '#1E293B',
  tableHead: '#334155',
  border: '#334155',
  textPrimary: '#E2E8F0',
  textSecondary: '#94A3B8',
  shadowRgb: '0,0,0',
};

export function getTheme(mode = 'light') {
  const neutral = mode === 'dark' ? darkNeutral : lightNeutral;
  const primary = getPrimary(mode);

  return createTheme({
    palette: {
      mode,
      primary,
      ...brandShared,
      background: { default: neutral.bg, paper: neutral.paper },
      divider: neutral.border,
      text: { primary: neutral.textPrimary, secondary: neutral.textSecondary },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: ['Inter', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
      h4: { fontWeight: 700, letterSpacing: -0.5 },
      h5: { fontWeight: 700, letterSpacing: -0.3 },
      h6: { fontWeight: 700, letterSpacing: -0.2 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 600 },
    },
    shadows: [
      'none',
      `0 1px 2px 0 rgba(${neutral.shadowRgb},0.06)`,
      `0 1px 3px 0 rgba(${neutral.shadowRgb},0.08)`,
      `0 2px 6px 0 rgba(${neutral.shadowRgb},0.08)`,
      `0 4px 10px 0 rgba(${neutral.shadowRgb},0.10)`,
      ...Array(20).fill(`0 8px 20px 0 rgba(${neutral.shadowRgb},0.12)`),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: neutral.bg },
          '*::-webkit-scrollbar': { width: 8, height: 8 },
          '*::-webkit-scrollbar-thumb': { backgroundColor: alpha(neutral.textSecondary, 0.3), borderRadius: 8 },
          '*::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { border: `1px solid ${neutral.border}`, backgroundImage: 'none' },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { border: `1px solid ${neutral.border}`, backgroundImage: 'none', borderRadius: 10 },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 8, boxShadow: 'none' },
          contained: {
            boxShadow: `0 1px 2px 0 rgba(${neutral.shadowRgb},0.08)`,
            '&:hover': { boxShadow: `0 2px 6px 0 rgba(${neutral.shadowRgb},0.12)` },
          },
          sizeLarge: { paddingTop: 10, paddingBottom: 10 },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600 }, label: { paddingLeft: 10, paddingRight: 10 } },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { boxShadow: `0 1px 3px 0 rgba(${neutral.shadowRgb},0.10)` },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            color: neutral.textSecondary,
            background: neutral.tableHead,
            borderBottom: `1px solid ${neutral.border}`,
          },
          body: { borderBottom: `1px solid ${neutral.border}` },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-of-type td': { borderBottom: 'none' },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 12, backgroundImage: 'none' },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: { backgroundColor: alpha('#0F172A', mode === 'dark' ? 0.6 : 0.4) },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { height: 2.5, borderRadius: 2 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, minHeight: 44 },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            '&.Mui-selected': {
              backgroundColor: alpha(primary.main, mode === 'dark' ? 0.18 : 0.1),
              '&:hover': { backgroundColor: alpha(primary.main, mode === 'dark' ? 0.24 : 0.14) },
            },
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: { border: `1px solid ${neutral.border}`, backgroundImage: 'none' },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'dark' ? neutral.tableHead : '#0F172A',
            color: '#FFFFFF',
            fontSize: 12,
            padding: '6px 10px',
            borderRadius: 6,
          },
          arrow: { color: mode === 'dark' ? neutral.tableHead : '#0F172A' },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { height: 6, borderRadius: 3, backgroundColor: alpha(neutral.textSecondary, 0.15) },
          bar: { borderRadius: 3 },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 8, border: '1px solid transparent' },
          standardSuccess: { backgroundColor: alpha(brandShared.success.main, mode === 'dark' ? 0.16 : 0.08), borderColor: alpha(brandShared.success.main, 0.3) },
          standardWarning: { backgroundColor: alpha(brandShared.warning.main, mode === 'dark' ? 0.16 : 0.08), borderColor: alpha(brandShared.warning.main, 0.3) },
          standardError: { backgroundColor: alpha(brandShared.error.main, mode === 'dark' ? 0.16 : 0.08), borderColor: alpha(brandShared.error.main, 0.3) },
          standardInfo: { backgroundColor: alpha(brandShared.info.main, mode === 'dark' ? 0.16 : 0.08), borderColor: alpha(brandShared.info.main, 0.3) },
        },
      },
    },
  });
}

export default getTheme('light');
