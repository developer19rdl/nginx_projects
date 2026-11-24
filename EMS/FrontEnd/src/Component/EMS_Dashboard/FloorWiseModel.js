import React, { useState, useEffect } from "react";
import {
  Modal, Box, Typography, IconButton, Select, MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  ResponsiveContainer, CartesianGrid, Tooltip, Legend,
  XAxis, YAxis, Bar, Line, Cell, ComposedChart,
} from "recharts";
import {
  SubCategoryHoursWiseData,
  SubCategoryMonthWiseData,
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

const FloorWiseModel = ({ chartNo, open, handleClose, selectedFloor, subDayId }) => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay,   setSelectedDay]   = useState(null);
  const [dayWiseData,   setDayWiseData]   = useState([]);
  const [hoursWiseData, setHoursWiseData] = useState([]);

  useEffect(() => {
    if (open) {
      setSelectedMonth(MONTHS_FULL[new Date().getMonth()]);
      setSelectedDay(null);
    } else {
      setSelectedDay(null);
      setDayWiseData([]);
      setHoursWiseData([]);
    }
  }, [open]);

  useEffect(() => {
    if (open && subDayId && selectedMonth) {
      const year        = new Date().getFullYear();
      const monthNumber = MONTH_MAP[selectedMonth];
      SubCategoryMonthWiseData(
        { chartNo, subCategoryId: subDayId, month: `${year}-${monthNumber}` },
        (dataObject) => { setDayWiseData(dataObject?.data || []); setSelectedDay(null); setHoursWiseData([]); },
        ()           => { setDayWiseData([]); setSelectedDay(null); setHoursWiseData([]); }
      );
    }
  }, [open, subDayId, selectedMonth, chartNo]);

  const handleBarClick = (data) => {
    if (!data?.fullDate) return;
    setSelectedDay(data.name);
    SubCategoryHoursWiseData(
      { subCategoryId: subDayId, date: data.fullDate },
      (dataObject) => setHoursWiseData(dataObject?.data || []),
      ()           => setHoursWiseData([])
    );
  };

  const barFill = (entry) => entry.kWh > entry.avgConsum ? "#EF4444" : "#22C55E";

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={MODAL_STYLE}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{`Day Wise Consumption - ${selectedFloor}`}</Typography>
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
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: "#5D5D5D" }} labelStyle={{ color: "#fff", fontWeight: "bold" }} />
            <Legend />
            <Bar dataKey="kWh" barSize={12} onClick={handleBarClick}>
              {dayWiseData.map((entry, i) => <Cell key={`cell-${i}`} fill={barFill(entry)} cursor="pointer" />)}
            </Bar>
            <Line type="monotone" dataKey="avgConsum" stroke="#FF7300" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Hour wise chart */}
        {selectedDay && hoursWiseData.length > 0 && (
          <>
            <Box mt={4} mb={1}>
              <Typography variant="h6">{`Hour Wise Consumption - Day ${selectedDay}`}</Typography>
            </Box>
            <ResponsiveContainer width="100%" height={230}>
              <ComposedChart data={hoursWiseData} margin={{ bottom: -20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "#5D5D5D" }} labelStyle={{ color: "#fff", fontWeight: "bold" }} />
                <Legend />
                <Bar dataKey="kWh" barSize={12}>
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

export default FloorWiseModel;
