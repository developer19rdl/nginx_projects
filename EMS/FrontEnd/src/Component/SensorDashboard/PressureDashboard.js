import React from 'react';
import SpeedIcon from '@mui/icons-material/Speed';
import SensorDashboard from './SensorDashboard';

// sensorType must match the exact meterType value stored on utility_meters
// (the "Pressure" option in the Meter Allocation "Meter Type" dropdown) —
// "Air Pressure" is just the display label.
const PressureDashboard = () => (
    <SensorDashboard
        sensorType="Pressure"
        label="Air Pressure Dashboard"
        unit="bar"
        gaugeRange={[0, 10]}
        color="#00695c"
        icon={<SpeedIcon sx={{ color: '#00695c', fontSize: 28 }} />}
    />
);

export default PressureDashboard;
