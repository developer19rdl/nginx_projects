import React from 'react';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import SensorDashboard from './SensorDashboard';

const TemperatureDashboard = () => (
    <SensorDashboard
        sensorType="Temperature"
        label="Temperature Dashboard"
        unit="°C"
        gaugeRange={[0, 50]}
        color="#e65100"
        icon={<DeviceThermostatIcon sx={{ color: '#e65100', fontSize: 28 }} />}
    />
);

export default TemperatureDashboard;
