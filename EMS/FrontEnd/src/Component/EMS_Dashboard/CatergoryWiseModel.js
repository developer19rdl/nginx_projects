import React, { useState, useEffect } from "react";
import {
  Modal, Box, Typography, IconButton, Select, MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Cell, Line,
} from "recharts";
import {
  CategoryHoursWiseData,
  CategoryMonthWiseSelectData,
} from "../../Services/NodeJsApiServices";
import { MONTH_MAP, MONTHS_FULL } from "./constants";

const MODAL_STYLE = {
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

const CatergoryWiseModel = ({ chartNo, open, handleClose, selectedFloor, dayId }) => {
  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS_FULL[currentMonthIndex]);
  const [selectedDay,   setSelectedDay]   = useState(null);
  const [dayWiseData,   setDayWiseData]   = useState([]);
  const [hoursWiseData, setHoursWiseData] = useState([]);

  useEffect(() => {
    if (open && dayId) {
      const year        = new Date().getFullYear();
      const monthNumber = MONTH_MAP[selectedMonth];
      CategoryMonthWiseSelectData(
        { chartNo, categoryId: dayId, month: `${year}-${monthNumber}` },
        (dataObject) => setDayWiseData(dataObject?.data || []),
        ()           => setDayWiseData([])
      );
    }
    if (!open) {
      setSelectedDay(null);
      setHoursWiseData([]);
    }
  }, [open, dayId, selectedMonth, chartNo]);

  const handleBarClick = (data) => {
    if (!data?.fullDate) return;
    setSelectedDay(data.name);
    CategoryHoursWiseData(
      { categoryId: dayId, date: data.fullDate },
      (dataObject) => setHoursWiseData(dataObject?.data || []),
      ()           => setHoursWiseData([])
    );
  };

  const barFill = (entry) => entry.kWh > entry.avgConsum ? "#EF4444" : "#8884d8";

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={MODAL_STYLE}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">{`Day Wise Consumption in ${selectedFloor}`}</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body1">Month:</Typography>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
            >
              {MONTHS_FULL.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </Select>
            <IconButton onClick={handleClose}><CloseIcon /></IconButton>
          </Box>
        </Box>

        {/* Day wise chart */}
        <ResponsiveContainer width="100%" height={230}>
          <ComposedChart data={dayWiseData} margin={{ bottom: -20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} domain={[0, (max) => Math.ceil(max * 1.2)]} />
            <Tooltip contentStyle={{ backgroundColor: "#5D5D5D" }} labelStyle={{ color: "#fff", fontWeight: "bold" }} />
            <Legend />
            <Bar dataKey="kWh" barSize={10} onClick={handleBarClick}>
              {dayWiseData.map((entry, i) => <Cell key={`cell-${i}`} fill={barFill(entry)} />)}
            </Bar>
            <Line type="monotone" dataKey="avgConsum" stroke="#FF7300" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Hour wise chart */}
        {selectedDay && hoursWiseData.length > 0 && (
          <>
            <Box mt={4} mb={1}>
              <Typography variant="h6">{`Hour Wise Consumption for Day ${selectedDay}`}</Typography>
            </Box>
            <ResponsiveContainer width="100%" height={230}>
              <ComposedChart data={hoursWiseData} margin={{ bottom: -20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "#5D5D5D" }} labelStyle={{ color: "#fff", fontWeight: "bold" }} />
                <Legend />
                <Bar dataKey="kWh" barSize={10}>
                  {hoursWiseData.map((entry, i) => <Cell key={`cell-hour-${i}`} fill={barFill(entry)} />)}
                </Bar>
                <Line type="monotone" dataKey="avgConsum" stroke="#FF7300" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default CatergoryWiseModel;
