import React, { memo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Cell,
  Line,
} from "recharts";

const ChartCard = memo(({
  title,
  data,
  height = 180,
  onSettingsClick,
  onBarClick,
  chartType = 'bar',
  showSettings = true,
  dataKey = "kWh",
  xAxisKey = "name",
  avgKey = "avgConsum",
  secondaryKey,
  secondaryName,
  barColor = "#8884d8"
}) => {
  return (
    <Card sx={{ height, overflowX: "auto" }}>
      <CardContent sx={{ paddingBottom: "16px !important" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" fontWeight={600} align="center" sx={{ marginBottom: 1 }}>
            {title}
          </Typography>
          {showSettings && (
            <IconButton
              aria-label="settings"
              size="small"
              onClick={onSettingsClick}
            >
              <SettingsIcon />
            </IconButton>
          )}
        </Box>

        <ResponsiveContainer width="100%" height={height - 50}>
          <ComposedChart data={data} margin={{ bottom: -20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: "#5D5D5D" }}
              labelStyle={{ color: "#FFFFFF", fontWeight: "bold" }}
            />
            <Legend />
            {chartType === 'bar' ? (
              <Bar dataKey={dataKey} barSize={10} onClick={onBarClick}>
                {data.map((entry, index) => {
                  const val = entry[dataKey];
                  const avg = entry[avgKey];
                  // Only show Red if avg exists and value exceeds it
                  const isExceeded = avg !== undefined && val > avg;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isExceeded ? "#EF4444" : barColor}
                    />
                  );
                })}
              </Bar>
            ) : (
              <Line type="monotone" dataKey={dataKey} stroke="#2cd142ff" strokeWidth={2} dot={{ r: 3 }} />
            )}

            {/* Average Line */}
            {data && data.length > 0 && data[0][avgKey] !== undefined && (
              <Line
                type="monotone"
                dataKey={avgKey}
                stroke="#FF7300"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Average"
              />
            )}

            {/* Secondary Line (e.g., EB Cost) */}
            {secondaryKey && (
              <Line
                type="monotone"
                dataKey={secondaryKey}
                stroke="#ffc658"
                strokeWidth={2}
                dot={{ r: 3 }}
                name={secondaryName || secondaryKey}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

export default ChartCard;
