import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography, Paper } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import BuildIcon from '@mui/icons-material/Build';
import EnergyWasteDetectionList from './EnergyWasteDetection/EnergyWasteDetectionList';
import CorrectiveActionRecList from './CorrectiveActionRec/CorrectiveActionRecList';

function TabPanel({ children, value, index }) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
}

const EnergySavingPage = () => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1565c0', mb: 2 }}>
                <BoltIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 32 }} />
                Energy Saving Module
            </Typography>

            <Paper elevation={2}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab
                        icon={<BoltIcon />}
                        iconPosition="start"
                        label="Energy Waste Detection"
                        id="tab-0"
                    />
                    <Tab
                        icon={<BuildIcon />}
                        iconPosition="start"
                        label="Corrective Action Recommendations"
                        id="tab-1"
                    />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                    <EnergyWasteDetectionList />
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    <CorrectiveActionRecList />
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default EnergySavingPage;
