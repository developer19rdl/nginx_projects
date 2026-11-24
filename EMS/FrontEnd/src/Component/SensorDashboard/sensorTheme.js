// Lightweight light/dark palette for the Temperature/Humidity/CO2 sensor
// dashboards — a plain token object rather than a full MUI ThemeProvider so
// every existing hardcoded-color component (GaugeCard, AggregatedTrendCard,
// SensorTreeSidebar, IoTTreeNode) stays simple to reason about: pass `palette`
// down and swap the handful of surface/text colors that actually need to
// change. Semantic status colors (gauge arc red/amber/green, KPI min/max/avg
// reds/greens) are left as-is in both modes — they carry meaning independent
// of theme and already read fine on a dark card.
export const getSensorPalette = (dark) => (dark ? {
    dark: true,
    pageBg:    '#12161c',
    headerBg:  '#1a1f27',
    paperBg:   '#1e242c',
    border:    '#2c333d',
    text:      '#e8eaed',
    subtext:   '#9aa5b1',
    hoverBg:   '#242b34',
    inputBg:   '#242b34',
    inputBorder: '#39424e',
} : {
    dark: false,
    pageBg:    '#f5f6f8',
    headerBg:  '#ffffff',
    paperBg:   '#ffffff',
    border:    '#e5e7eb',
    text:      '#263238',
    subtext:   '#78909c',
    hoverBg:   '#f5f5f5',
    inputBg:   '#f9fafb',
    inputBorder: '#e5e7eb',
});
