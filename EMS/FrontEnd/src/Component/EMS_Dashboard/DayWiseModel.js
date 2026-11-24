import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
  Line,
  ComposedChart,
} from "recharts";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 850,
  height: 650,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const DayWiseModel = ({ open, handleClose, data, selectedFloor }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("July");

  useEffect(() => {
    if (!open) {
      setSelectedDay(null);
      setSelectedMonth("July");
    }
  }, [open]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const databarfloor = [
    { name: "1", uv: 4000, pv: 240, avgConsum: 500 },
    { name: "2", uv: 3000, pv: 196, avgConsum: 500 },
    { name: "3", uv: 3480, pv: 335, avgConsum: 500 },
    { name: "4", uv: 2140, pv: 1000, avgConsum: 500 },
    { name: "6", uv: 1298, pv: 452, avgConsum: 500 },
    { name: "7", uv: 1250, pv: 234, avgConsum: 500 },
    { name: "8", uv: 1250, pv: 249, avgConsum: 500 },
    { name: "9", uv: 1250, pv: 349, avgConsum: 500 },
    { name: "10", uv: 1250, pv: 239, avgConsum: 500 },
    { name: "11", uv: 1250, pv: 239, avgConsum: 500 },
    { name: "12", uv: 1250, pv: 234, avgConsum: 500 },
    { name: "13", uv: 1250, pv: 249, avgConsum: 500 },
    { name: "14", uv: 1250, pv: 249, avgConsum: 500 },
    { name: "15", uv: 1250, pv: 349, avgConsum: 500 },
    { name: "16", uv: 1250, pv: 239, avgConsum: 500 },
    { name: "17", uv: 1250, pv: 239, avgConsum: 500 },
    { name: "18", uv: 1250, pv: 349, avgConsum: 500 },
    { name: "19", uv: 1250, pv: 234, avgConsum: 500 },
    { name: "20", uv: 1250, pv: 334, avgConsum: 500 },
    { name: "21", uv: 1250, pv: 39, avgConsum: 500 },
    { name: "22", uv: 1250, pv: 239, avgConsum: 500 },
    { name: "23", uv: 1250, pv: 239, avgConsum: 500 },
    { name: "24", uv: 1250, pv: 29, avgConsum: 500 },
    { name: "25", uv: 1250, pv: 239, avgConsum: 500 },
    { name: "26", uv: 1250, pv: 239, avgConsum: 500 },
    { name: "27", uv: 1250, pv: 439, avgConsum: 500 },
    { name: "28", uv: 1250, pv: 239, avgConsum: 500 },
    { name: "29", uv: 1250, pv: 239, avgConsum: 500 },
    { name: "30", uv: 1250, pv: 339, avgConsum: 500 },
    { name: "31", uv: 1250, pv: 239, avgConsum: 500 },
  ];

  const databarpeakhourDemand = [
    { name: "1hr", uv: 4000, pv: 240, avgConsum: 500 },
    { name: "2hr", uv: 3000, pv: 196, avgConsum: 500 },
    { name: "3hr", uv: 3480, pv: 1000, avgConsum: 500 },
    { name: "4hr", uv: 2140, pv: 400, avgConsum: 500 },
    { name: "5hr", uv: 1298, pv: 492, avgConsum: 500 },
    { name: "6hr", uv: 1250, pv: 249, avgConsum: 500 },
    { name: "7hr", uv: 1250, pv: 249, avgConsum: 500 },
    { name: "8hr", uv: 1250, pv: 349, avgConsum: 500 },
    { name: "9hr", uv: 1250, pv: 249, avgConsum: 500 },
    { name: "10hr", uv: 1250, pv: 249, avgConsum: 500 },
    { name: "11hr", uv: 1250, pv: 249, avgConsum: 500 },
    { name: "12hr", uv: 1250, pv: 449, avgConsum: 500 },
    { name: "13hr", uv: 1250, pv: 249, avgConsum: 500 },
    { name: "14hr", uv: 1250, pv: 249, avgConsum: 500 },
    { name: "15hr", uv: 1250, pv: 249, avgConsum: 500 },
    { name: "16hr", uv: 1250, pv: 149, avgConsum: 500 },
    { name: "17hr", uv: 1250, pv: 249, avgConsum: 500 },
    { name: "18hr", uv: 1250, pv: 1005, avgConsum: 500 },
    { name: "19hr", uv: 1250, pv: 255, avgConsum: 500 },
    { name: "20hr", uv: 1250, pv: 249, avgConsum: 500 },
    { name: "21hr", uv: 1250, pv: 167, avgConsum: 500 },
    { name: "22hr", uv: 1250, pv: 249, avgConsum: 500 },
    { name: "23hr", uv: 1250, pv: 199, avgConsum: 500 },
    { name: "24hr", uv: 1250, pv: 249, avgConsum: 500 },
  ];

  const handleBarClick = (data) => {
    setSelectedDay(data.name);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{`Day Wise Consumption in ${selectedFloor}`}</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body1">Month:</Typography>
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="January">January</MenuItem>
              <MenuItem value="February">February</MenuItem>
              <MenuItem value="March">March</MenuItem>
              <MenuItem value="April">April</MenuItem>
              <MenuItem value="May">May</MenuItem>
              <MenuItem value="June">June</MenuItem>
              <MenuItem value="July">July</MenuItem>
              <MenuItem value="August">August</MenuItem>
              <MenuItem value="September">September</MenuItem>
              <MenuItem value="October">October</MenuItem>
              <MenuItem value="November">November</MenuItem>
              <MenuItem value="December">December</MenuItem>
            </Select>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <ResponsiveContainer width="100%" height={230}>
          <ComposedChart data={databarfloor} margin={{ bottom: -20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: "#5D5D5D" }}
              labelStyle={{ color: "#FFFFFF", fontWeight: "bold" }}
            />
            <Legend />
            <Bar dataKey="pv" barSize={10} onClick={handleBarClick}>
              {databarfloor.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pv > entry.avgConsum ? "#EF4444" : "#8884d8"}
                />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="avgConsum"
              stroke="#FF7300"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {selectedDay && (
          <>
            <Box mt={4} mb={1}>
              <Typography variant="h6">{`Hour Wise Consumption for Day ${selectedDay}`}</Typography>
            </Box>
            <ResponsiveContainer width="100%" height={230}>
              <ComposedChart data={databarpeakhourDemand} margin={{ bottom: -20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: "#5D5D5D" }}
                  labelStyle={{ color: "#FFFFFF", fontWeight: "bold" }}
                />
                <Legend />
                <Bar dataKey="pv" barSize={10}>
                  {databarpeakhourDemand.map((entry, index) => (
                    <Cell
                      key={`cell-peak-${index}`}
                      fill={entry.pv > entry.avgConsum ? "#EF4444" : "#8884d8"}
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="avgConsum"
                  stroke="#FF7300"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default DayWiseModel;
