import React, { memo } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const SummaryCard = ({ icon, title, value, unit, subValue, subUnit, percentage, subtitle, hasSubValue, color = "#5D5D5D" }) => {
  const cardHeight = (subtitle || hasSubValue) ? 125 : 100;
  return (
    <Card sx={{ backgroundColor: color, color: "#fff", height: cardHeight }}>
      <CardContent sx={{ position: "relative", p: 1 }}>
        {/* Top-left Icon */}
        <Box
          component="img"
          src={icon}
          alt={`${title} Icon`}
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            width: 40,
            height: 40,
          }}
        />

        {/* Centered Title */}
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: "20px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {title}
        </Typography>

        {/* Arrow and Percentage */}
        {percentage !== undefined && (
          <>
            <ArrowUpwardIcon
              sx={{
                position: "absolute",
                top: 18,
                right: 18,
                color: "lime",
                fontSize: 35,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                position: "absolute",
                top: 55,
                right: 18,
                color: "lime",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              {percentage}%
            </Typography>
          </>
        )}

        {/* Center Value */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            mt: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontSize: "32px",
              fontWeight: "bold",
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
          {unit && (
            <Typography
              variant="body2"
              sx={{
                fontSize: "17px",
                fontWeight: "normal",
                ml: 0.5,
                mb: "2px",
              }}
            >
              {unit}
            </Typography>
          )}
        </Box>

        {/* Sub Value (e.g. kW) */}
        {subValue !== undefined && (
          <Typography
            variant="body2"
            sx={{
              display: "block",
              textAlign: "center",
              color: "#ccc",
              fontSize: "13px",
              fontWeight: "normal",
              mt: 0.5,
            }}
          >
            {subValue} {subUnit}
          </Typography>
        )}

        {/* Plant name subtitle — shown during animated cycling */}
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              color: "#ccc",
              fontSize: "11px",
              mt: 0.4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default memo(SummaryCard);
