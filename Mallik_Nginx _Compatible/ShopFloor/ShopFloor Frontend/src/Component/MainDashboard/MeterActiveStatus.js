import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import RefreshIcon from "@mui/icons-material/Refresh";
import { MeterDataOnOffStatus } from "../../Services/NodeJsApiServices";

const MeterActiveStatus = () => {
  const [meterList, setMeterList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCount, setActiveCount] = useState(0);
  const [inActiveCount, setInActiveCount] = useState(0);
  const [filter, setFilter] = useState("all");

  const fetchMeterStatus = () => {
    setLoading(true);
    MeterDataOnOffStatus(
      (response) => {
        if (response && response.data) {
          setMeterList(response.data);
          setActiveCount(response.activeMetersCount || 0);
          setInActiveCount(response.inactiveMetersCount || 0);
        } else {
          setMeterList([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching meter status:", error);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchMeterStatus();
  }, []);

  const getStatusLabel = (meter) => {
    if (meter.onOffStatus === 1 || meter.DeviceStatus === 1) return "Active";
    return "Inactive";
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  // Apply filter
  const filteredMeters = meterList.filter((meter) => {
    const status = getStatusLabel(meter);
    if (filter === "active") return status === "Active";
    if (filter === "inactive") return status === "Inactive";
    return true; // all
  });

  const totalMeters = activeCount + inActiveCount;

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "#f9fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header Section */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          ⚡ Meter Active Status
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchMeterStatus}
          sx={{ textTransform: "none", fontWeight: "bold" }}
        >
          Refresh
        </Button>
      </Box>

      {/* Count Summary Section */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-around"
        sx={{
          mb: 2,
          backgroundColor: "#fff",
          borderRadius: 2,
          p: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="h6" color="green">
          Active: {activeCount}
        </Typography>
        <Typography variant="h6" color="red">
          Inactive: {inActiveCount}
        </Typography>
        <Typography variant="h6" color="primary">
          Total: {totalMeters}
        </Typography>
      </Box>

      {/* Filter Section */}
      <Box display="flex" justifyContent="center" mb={2}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          color="primary"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="active">Active</ToggleButton>
          <ToggleButton value="inactive">Inactive</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Table Section */}
      {loading ? (
        <LinearProgress sx={{ mt: 2 }} />
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            flexGrow: 1,
            borderRadius: 3,
            boxShadow: 3,
            overflow: "hidden",
          }}
        >
          <Table sx={{ width: "100%" }}>
            <TableHead sx={{ backgroundColor: "#e0e0e0" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Meter Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Asset Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Slave ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Device ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Last Updated</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMeters.map((meter, index) => {
                const status = getStatusLabel(meter);
                const color = status === "Active" ? "green" : "red";

                return (
                  <TableRow
                    key={meter.id || index}
                    hover
                    sx={{
                      "&:hover": { backgroundColor: "#f5f5f5" },
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{meter.meterName}</TableCell>
                    <TableCell>{meter.AssetName}</TableCell>
                    <TableCell>{meter.slaveId}</TableCell>
                    <TableCell>{meter.deviceId}</TableCell>
                    <TableCell>
                      {new Date(meter.updated_at).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CircleIcon sx={{ color, fontSize: 14 }} />
                        <Typography
                          variant="body2"
                          sx={{ color, fontWeight: "bold" }}
                        >
                          {status}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default MeterActiveStatus;
