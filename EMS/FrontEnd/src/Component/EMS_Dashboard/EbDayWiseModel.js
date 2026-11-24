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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
  Line,
  Bar,
  ComposedChart,
} from "recharts";
import { GetEBHourlyEnergy, GetSolarHourlyEnergy } from "../../Services/NodeJsApiServices";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 900,
  height: 650,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const EbDayWiseModel = ({ open, handleClose, data, selectedMonthName, type = 'eb' }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(selectedMonthName || "January");
  const [hourlyData, setHourlyData] = useState([]);

  const isSolar = type === 'solar';
  const dataKey = isSolar ? 'solarEnergy' : 'ebEnergy';
  const costKey = isSolar ? 'solarCost' : 'ebCost';
  const nameLabel = isSolar ? 'Solar Energy' : 'EB Energy';
  const costLabel = isSolar ? 'Solar Cost' : 'EB Cost';
  const hourlyService = isSolar ? GetSolarHourlyEnergy : GetEBHourlyEnergy;

  useEffect(() => {
    if (open) {
      if (selectedMonthName) {
        setCurrentMonth(selectedMonthName);
      }
      setSelectedDay(null);
      setHourlyData([]);
    }
  }, [open, selectedMonthName]);

  const handleBarClick = (data) => {
    setSelectedDay(data.name);
    hourlyService({ month: currentMonth, day: data.name }, (response) => {
      setHourlyData(response || []);
    }, (error) => {
      console.error(`${nameLabel} Hourly Energy Error:`, error);
    });
  };



  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {`${nameLabel} Consumption Details - ${currentMonth}`}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="subtitle2" gutterBottom>Daily Consumption Trend</Typography>
        <ResponsiveContainer width="100%" height={230}>
          <ComposedChart data={data} margin={{ bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: "#5D5D5D" }}
              labelStyle={{ color: "#FFFFFF", fontWeight: "bold" }}
            />
            <Legend />
            <Bar dataKey={dataKey} name={nameLabel} fill={isSolar ? "#10B981" : "#8884d8"} barSize={15} onClick={handleBarClick} />
            {data && data.length > 0 && data[0][costKey] !== undefined && (
              <Line type="monotone" dataKey={costKey} name={costLabel} stroke="#ffc658" strokeWidth={2} dot={{ r: 3 }} />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {selectedDay && (
          <Box mt={4}>
            <Typography variant="subtitle2" gutterBottom>
              {`Hourly Breakdown for ${currentMonth} ${selectedDay}`}
            </Typography>
            <ResponsiveContainer width="100%" height={230}>
              <ComposedChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: "#5D5D5D" }}
                  labelStyle={{ color: "#FFFFFF", fontWeight: "bold" }}
                />
                <Legend />
                <Bar dataKey={dataKey} name={`Hourly ${nameLabel}`} fill={isSolar ? "#10B981" : "#8884d8"} barSize={15} />
                {hourlyData && hourlyData.length > 0 && hourlyData[0][costKey] !== undefined && (
                  <Line type="monotone" dataKey={costKey} name={`Hourly ${costLabel}`} stroke="#ffc658" strokeWidth={2} dot={{ r: 3 }} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default EbDayWiseModel;
