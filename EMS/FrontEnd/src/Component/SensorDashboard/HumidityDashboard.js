import React from 'react';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SensorDashboard from './SensorDashboard';

const HumidityDashboard = () => (
    <SensorDashboard
        sensorType="Humidity"
        label="Humidity Dashboard"
        unit="%RH"
        gaugeRange={[0, 100]}
        color="#0277bd"
        icon={<WaterDropIcon sx={{ color: '#0277bd', fontSize: 28 }} />}
    />
);

export default HumidityDashboard;
