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
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import moment from "moment";
import {
  MeterDataOnOffStatus,
  GetMeterOfflineThreshold,
  UpdateMeterOfflineThreshold,
  UtilityMeterView,
  GetUtilitySensorStats,
} from "../../Services/NodeJsApiServices";

const DEFAULT_OFFLINE_THRESHOLD_MINUTES = 30;

const MeterActiveStatus = () => {
  const [meterSource, setMeterSource] = useState("energy"); // "energy" | "utility"
  const [meterList, setMeterList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [offlineCount, setOfflineCount] = useState(0);
  const [noDataAlertsCount, setNoDataAlertsCount] = useState(0);
  const [filter, setFilter] = useState("all");

  // Global offline-threshold setting (meter_offline_settings, shared by every dashboard)
  const [offlineThresholdMinutes, setOfflineThresholdMinutes] = useState(DEFAULT_OFFLINE_THRESHOLD_MINUTES);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(String(DEFAULT_OFFLINE_THRESHOLD_MINUTES));
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const fetchEnergyMeterStatus = () => {
    setLoading(true);
    MeterDataOnOffStatus(
      (response) => {
        if (response && response.data) {
          setMeterList(response.data);
          setOnlineCount(response.onlineMetersCount || 0);
          setOfflineCount(response.offlineMetersCount || 0);
          setNoDataAlertsCount(response.noDataAlertsCount || 0);
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

  // Utility meters (Water/Gas/Fuel/environmental) have no dedicated on/off-status
  // endpoint like meterDataOnOffStatus. Instead we derive it here from the same
  // global offline threshold, using the "lastUpdated" that sensorStats already
  // computes per meter (live_data table, or live_tag_snapshot for env sensors).
  const fetchUtilityMeterStatus = () => {
    setLoading(true);
    UtilityMeterView(
      (listResponse) => {
        // Only meters with "Display on Dashboard" = Yes show up here — same flag
        // the Sensor Dashboards filter on (dashboardController.getUtilityGroupedMeters).
        const meters = ((listResponse && listResponse.data) || []).filter(
          (m) => m.displayMeter === undefined || m.displayMeter === null || Number(m.displayMeter) === 1
        );
        GetUtilitySensorStats(
          (statsResponse) => {
            const statsMap = (statsResponse && statsResponse.data) || {};
            const now = moment();

            const merged = meters.map((m) => {
              const stat = statsMap[m.id] || {};
              const lastUpdated = stat.lastUpdated || null;
              const updatedMoment = lastUpdated ? moment(lastUpdated) : null;
              const minutesSinceUpdate = updatedMoment
                ? now.diff(updatedMoment, "minutes")
                : Infinity;
              const isOffline = minutesSinceUpdate > offlineThresholdMinutes;

              return {
                id: m.id,
                meterName: m.meterName,
                AssetName: m.edgeDeviceName || m.buildingName || "-",
                meterType: m.liveMeterType || m.meterType,
                slaveId: m.slaveId,
                deviceId: m.deviceId,
                updated_at: updatedMoment
                  ? updatedMoment.format("DD-MM-YYYY hh:mm A")
                  : "Not available",
                onOffStatus: isOffline ? 0 : 1,
                noDataAlertTriggered: 0,
              };
            });

            const online = merged.filter((m) => m.onOffStatus === 1).length;
            setMeterList(merged);
            setOnlineCount(online);
            setOfflineCount(merged.length - online);
            setNoDataAlertsCount(0);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching utility meter sensor stats:", error);
            // Fall back to the plain meter list, status unknown (treated as offline).
            const merged = meters.map((m) => ({
              id: m.id,
              meterName: m.meterName,
              AssetName: m.edgeDeviceName || m.buildingName || "-",
              meterType: m.liveMeterType || m.meterType,
              slaveId: m.slaveId,
              deviceId: m.deviceId,
              updated_at: "Not available",
              onOffStatus: 0,
              noDataAlertTriggered: 0,
            }));
            setMeterList(merged);
            setOnlineCount(0);
            setOfflineCount(merged.length);
            setNoDataAlertsCount(0);
            setLoading(false);
          }
        );
      },
      (error) => {
        console.error("Error fetching utility meter list:", error);
        setMeterList([]);
        setOnlineCount(0);
        setOfflineCount(0);
        setNoDataAlertsCount(0);
        setLoading(false);
      }
    );
  };

  const fetchMeterStatus = () => {
    if (meterSource === "utility") {
      fetchUtilityMeterStatus();
    } else {
      fetchEnergyMeterStatus();
    }
  };

  const fetchOfflineThreshold = () => {
    GetMeterOfflineThreshold(
      (response) => {
        const minutes = response?.offlineThresholdMinutes;
        if (Number.isFinite(minutes)) {
          setOfflineThresholdMinutes(minutes);
          setThresholdInput(String(minutes));
        }
      },
      (error) => console.error("Error fetching offline threshold:", error)
    );
  };

  useEffect(() => {
    fetchOfflineThreshold();
  }, []);

  useEffect(() => {
    fetchMeterStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meterSource]);

  const handleSourceChange = (event, newSource) => {
    if (newSource !== null) {
      setMeterSource(newSource);
      setFilter("all");
    }
  };

  const handleOpenSettings = () => {
    setThresholdInput(String(offlineThresholdMinutes));
    setSettingsOpen(true);
  };

  const handleSaveThreshold = () => {
    const minutes = parseInt(thresholdInput, 10);
    if (!Number.isInteger(minutes) || minutes <= 0) {
      setSnackbar({ open: true, message: "Enter a whole number of minutes greater than 0.", severity: "error" });
      return;
    }
    setSavingThreshold(true);
    UpdateMeterOfflineThreshold(
      { offlineThresholdMinutes: minutes },
      () => {
        setSavingThreshold(false);
        setSettingsOpen(false);
        setOfflineThresholdMinutes(minutes);
        setSnackbar({ open: true, message: "Offline threshold updated successfully.", severity: "success" });
        fetchMeterStatus();
      },
      (status, message) => {
        setSavingThreshold(false);
        setSnackbar({ open: true, message: message || "Failed to update offline threshold.", severity: "error" });
      }
    );
  };

  const getStatusLabel = (meter) => {
    if (meter.onOffStatus === 1 || meter.DeviceStatus === 1) return "Online";
    return "Offline";
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  // Apply filter
  const filteredMeters = meterList.filter((meter) => {
    const status = getStatusLabel(meter);
    if (filter === "online") return status === "Online";
    if (filter === "offline") return status === "Offline";
    return true; // all
  });

  const totalMeters = onlineCount + offlineCount;

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
          ⚡ Meter Online/Offline Status
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="Offline threshold settings">
            <IconButton onClick={handleOpenSettings}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchMeterStatus}
            sx={{ textTransform: "none", fontWeight: "bold" }}
          >
            Refresh
          </Button>
        </Box>
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
          Online: {onlineCount}
        </Typography>
        <Typography variant="h6" color="red">
          Offline: {offlineCount}
        </Typography>
        <Typography variant="h6" color="primary">
          Total: {totalMeters}
        </Typography>
        <Typography variant="h6" sx={{ color: "#ed6c02" }}>
          Alerts Triggered: {noDataAlertsCount}
        </Typography>
      </Box>

      {/* Meter Source Tabs */}
      <Box display="flex" justifyContent="center" mb={2}>
        <ToggleButtonGroup
          value={meterSource}
          exclusive
          onChange={handleSourceChange}
          color="primary"
        >
          <ToggleButton value="energy">Energy Meters</ToggleButton>
          <ToggleButton value="utility">Utility Meters</ToggleButton>
        </ToggleButtonGroup>
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
          <ToggleButton value="online">Online</ToggleButton>
          <ToggleButton value="offline">Offline</ToggleButton>
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
                <TableCell sx={{ fontWeight: "bold" }}>
                  {meterSource === "utility" ? "Device Name" : "Asset Name"}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Meter Type</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Slave ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Device ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Last Updated</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Alert</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMeters.map((meter, index) => {
                const status = getStatusLabel(meter);
                const color = status === "Online" ? "green" : "red";

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
                    <TableCell>{meter.meterType || "-"}</TableCell>
                    <TableCell>{meter.slaveId}</TableCell>
                    <TableCell>{meter.deviceId}</TableCell>
                    <TableCell>{meter.updated_at}</TableCell>
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
                    <TableCell>
                      {meter.noDataAlertTriggered ? (
                        <Tooltip
                          title={
                            meter.noDataAlertMessage ||
                            `No data received for over ${offlineThresholdMinutes} minutes`
                          }
                        >
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <ReportProblemIcon
                              sx={{ color: "#ed6c02", fontSize: 18 }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: "#ed6c02", fontWeight: "bold" }}
                            >
                              Since {meter.noDataAlertSince}
                            </Typography>
                          </Box>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Offline Threshold Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Offline Threshold Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A meter is marked Offline when it hasn't sent new data for this many
            minutes. This single threshold applies globally to every meter, and
            is also used by the Energy dashboard, SCADA dashboard, and the
            no-data email alert.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            type="number"
            label="Offline threshold (minutes)"
            value={thresholdInput}
            onChange={(e) => setThresholdInput(e.target.value)}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)} disabled={savingThreshold}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveThreshold}
            disabled={savingThreshold}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MeterActiveStatus;
