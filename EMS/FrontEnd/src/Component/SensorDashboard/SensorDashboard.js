import React, { useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SensorTreeSidebar from './SensorTreeSidebar';
import SensorNodeDetail from './SensorNodeDetail';
import AlertBell from './AlertBell';
import { nodeKey } from '../IoTDashboard/IoTTreeNode';
import { getSensorPalette } from './sensorTheme';

// Shared page shell for the Temperature / Humidity / CO2 sidebar dashboards —
// category/sub-category tree on the left (same pattern as the Energy
// Dashboard's tree, scoped to Utility-Meter categories with a matching
// meterType), gauge + trend detail panel on the right for whatever node is
// selected. See TemperatureDashboard.js / HumidityDashboard.js / CO2Dashboard.js
// for the three thin instantiations of this shell.
//
// Single compact header row carries the title, the sidebar collapse toggle
// and the dark-mode toggle together — no separate banner/divider row eating
// vertical space, so more of the viewport is left for the tree + gauges.
const SensorDashboard = ({ sensorType, label, unit, gaugeRange, color, icon }) => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const palette = getSensorPalette(darkMode);

    return (
        <Box sx={{
            display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh',
            backgroundColor: palette.pageBg, transition: 'background-color 0.2s ease',
        }}>
            <Box sx={{
                px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0,
                backgroundColor: palette.headerBg, borderBottom: `1px solid ${palette.border}`,
            }}>
                <Tooltip title={sidebarCollapsed ? 'Show tree' : 'Hide tree'}>
                    <IconButton size="small" onClick={() => setSidebarCollapsed((v) => !v)}
                        sx={{ color: palette.subtext }}>
                        {sidebarCollapsed ? <MenuIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>

                {icon}
                <Typography variant="h6" sx={{ fontWeight: 700, color, fontFamily: 'Roboto Slab', flexGrow: 1 }}>
                    {label}
                </Typography>

                <AlertBell sensorType={sensorType} palette={palette} />

                <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                    <IconButton size="small" onClick={() => setDarkMode((v) => !v)} sx={{ color: palette.subtext }}>
                        {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
                <SensorTreeSidebar
                    title={`${sensorType} Sensors`}
                    sensorTypes={[sensorType]}
                    selected={selectedNode ? nodeKey(selectedNode) : null}
                    onSelect={setSelectedNode}
                    collapsed={sidebarCollapsed}
                    palette={palette}
                />
                <SensorNodeDetail
                    node={selectedNode}
                    sensorType={sensorType}
                    unit={unit}
                    gaugeRange={gaugeRange}
                    color={color}
                    palette={palette}
                />
            </Box>
        </Box>
    );
};

export default SensorDashboard;
