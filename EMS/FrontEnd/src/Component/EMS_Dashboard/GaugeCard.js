import React, { memo } from 'react';
import { Box, Card, CardContent, Typography, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SemiGauge from './SemiGauge';

const GaugeCard = ({ title, value, unit, min, max, onSettingsClick, height = 180 }) => {
  return (
    <Card sx={{ height }}>
      <CardContent
        sx={{
          width: "100%",
          padding: 1,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        {/* Header with Title and Settings Icon */}
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" mb={1}>
          <Box flexGrow={1} />
          <Typography variant="subtitle1" fontWeight={600} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '80%' }}>
            {title}
          </Typography>
          <IconButton
            size="small"
            onClick={onSettingsClick}
            sx={{ ml: 'auto' }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>

        <SemiGauge
          min={min}
          max={max}
          value={value}
          unit={unit}
          thickness={12}
          size={220}
        />
      </CardContent>
    </Card>
  );
};

export default memo(GaugeCard);
