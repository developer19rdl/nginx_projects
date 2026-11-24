import { createTheme, alpha } from '@mui/material/styles';

// Triveni Steel design system - an industrial/enterprise palette (Siemens/SAP/ABB-style: calm,
// structured, navy+steel+blue, no gradients/glows) rather than a generic colorful SaaS look.
// Every hex here traces back to the client's brief; light/dark variants for the status colors
// step one shade up/down the same family (the brief's own hexes already line up almost exactly
// with Tailwind's default palette - #172554/#0F172A/#475569/#64748B/#E2E8F0/#F8FAFC/#2563EB/
// #16A34A/#F59E0B/#DC2626/#0284C7 are Tailwind blue-950/slate-900/slate-600/slate-500/slate-200/
// slate-50/blue-600/green-600/amber-500/red-600/sky-600 respectively - so light/dark steps are
// derived from that same family rather than invented).
const brandShared = {
  secondary: { main: '#475569', light: '#64748B', dark: '#334155', contrastText: '#FFFFFF' },
  success: { main: '#16A34A', light: '#22C55E', dark: '#15803D', contrastText: '#FFFFFF' },
  // Amber-500 is bright enough that white text on a solid fill fails AA contrast - dark text instead.
  warning: { main: '#F59E0B', light: '#FBBF24', dark: '#B45309', contrastText: '#1E293B' },
  error: { main: '#DC2626', light: '#EF4444', dark: '#B91C1C', contrastText: '#FFFFFF' },
  info: { main: '#0284C7', light: '#38BDF8', dark: '#075985', contrastText: '#FFFFFF' },
};

// Primary blue steps one shade lighter in dark mode - #2563EB on the Dark Navy background
// (#0F172A) is only ~3.4:1 contrast, borderline for anything rendered as text/icon color rather
// than a filled button (white-on-blue is high contrast either way, so this only really matters
// for e.g. the sidebar's active-item icon color).
function getPrimary(mode) {
  return mode === 'dark'
    ? { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB', contrastText: '#FFFFFF' }
    : { main: '#2563EB', light: '#3B82F6', dark: '#1D4ED8', contrastText: '#FFFFFF' };
}

// Light: Dark Navy text on a cool slate-white background - calm, "control room" feel appropriate
// to a production-planning ERP, not a stark white/grey generic dashboard.
const lightNeutral = {
  bg: '#F8FAFC',
  paper: '#FFFFFF',
  tableHead: '#F1F5F9',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  shadowRgb: '15,23,42',
};

// Dark: Dark Navy background with neutral slate/charcoal surfaces - not the brief's own "Navy"
// swatch (#172554, Tailwind blue-950), which is genuinely blue-saturated and, since almost every
// visible surface (cards, dialogs, table headers, the AppBar, the sidebar) renders on
// background.paper, made the whole dark theme read as distinctly blue rather than the calm
// charcoal/slate the brief actually asks for ("avoid pure black... Dark Navy, Charcoal, Slate,
// Steel gray"). Only the background canvas keeps the navy undertone; every raised surface is a
// neutral slate step instead.
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
      // Cards follow the exact same "bordered, not shadowed" convention as Paper - no gradients,
      // no oversized padding, so every KPI/machine/summary card in the app reads as one system.
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
      MuiTextField: {
        defaultProps: { size: 'small' },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { boxShadow: `0 1px 3px 0 rgba(${neutral.shadowRgb},0.10)` },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { borderRight: `1px solid ${neutral.border}`, backgroundColor: neutral.paper },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            marginLeft: 8,
            marginRight: 8,
            marginBottom: 2,
            '&.Mui-selected': {
              backgroundColor: alpha(primary.main, mode === 'dark' ? 0.18 : 0.1),
              color: mode === 'dark' ? primary.light : primary.dark,
              '& .MuiListItemIcon-root': { color: primary.main },
              '&:hover': { backgroundColor: alpha(primary.main, mode === 'dark' ? 0.24 : 0.14) },
            },
          },
        },
      },
      // Dialogs read as a calm container, not a heavy modal - one radius step up from
      // buttons/inputs (so it visually reads as "holds controls" rather than "is a control"),
      // modest backdrop so the app behind doesn't go fully dark.
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
      // Underlined, not pill/filled - matches the brief's "avoid consumer-style UI" direction.
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
      // Dropdown items reuse the exact same selected-state tint as the sidebar, so a selected
      // menu item and a selected nav item read as the same visual language.
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
      // Small and solid, not a translucent bubble - a plain utility tooltip.
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
      // Flat dot, no pulse/glow keyframes - deliberately the opposite of the "pulsing LiveDot"
      // pattern this refresh is removing from MachineCard.
      MuiBadge: {
        styleOverrides: {
          badge: { fontWeight: 700, fontSize: 10 },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { height: 6, borderRadius: 3, backgroundColor: alpha(neutral.textSecondary, 0.15) },
          bar: { borderRadius: 3 },
        },
      },
      // Soft-tinted background + accent, the same "soft pill" idiom StatusBadge already uses -
      // not a solid loud banner fill.
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
