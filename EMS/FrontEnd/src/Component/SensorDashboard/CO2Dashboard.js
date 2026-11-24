import React from 'react';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import SensorDashboard from './SensorDashboard';

const CO2Dashboard = () => (
    <SensorDashboard
        sensorType="CO2"
        label="CO2 Dashboard"
        unit="ppm"
        gaugeRange={[0, 3000]}
        color="#6a1b9a"
        icon={<CloudQueueIcon sx={{ color: '#6a1b9a', fontSize: 28 }} />}
    />
);

export default CO2Dashboard;
