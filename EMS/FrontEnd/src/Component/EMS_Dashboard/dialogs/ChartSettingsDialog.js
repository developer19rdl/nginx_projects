import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, TextField, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import { MONTHS_SHORT, CHART_KEYS } from "../constants";

const ChartSettingsDialog = ({
  open,
  onClose,
  onApply,
  activeChart,
  title,          onTitleChange,
  chartType,      onChartTypeChange,
  chartCategory,  onChartCategoryChange,
  selectedCategory, onSelectedCategoryChange,
  selectedBuilding, onSelectedBuildingChange,
  selectedMonth,  onSelectedMonthChange,
  selectedDay,    onSelectedDayChange,
  mainSubList,
  buildingList,
}) => {
  const isConfigChart = activeChart !== CHART_KEYS.DAY && activeChart !== CHART_KEYS.PEAK;
  const isDayOrPeak   = activeChart === CHART_KEYS.DAY || activeChart === CHART_KEYS.PEAK;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Customize Chart</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>

          {isConfigChart && (
            <TextField
              label="Chart Title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              fullWidth
              size="small"
            />
          )}

          {isConfigChart && (
            <FormControl fullWidth size="small">
              <InputLabel>Chart Type</InputLabel>
              <Select value={chartType} onChange={(e) => onChartTypeChange(e.target.value)} label="Chart Type">
                <MenuItem value="bar">Bar</MenuItem>
                <MenuItem value="line">Line</MenuItem>
              </Select>
            </FormControl>
          )}

          {isConfigChart && (
            <FormControl fullWidth size="small">
              <InputLabel>Category Type</InputLabel>
              <Select
                value={chartCategory}
                onChange={(e) => onChartCategoryChange(e.target.value)}
                label="Category Type"
              >
                <MenuItem value="Main Category">Main Category</MenuItem>
                {activeChart === CHART_KEYS.FLOOR && (
                  <MenuItem value="Sub Category">Sub Category</MenuItem>
                )}
              </Select>
            </FormControl>
          )}

          {isConfigChart && (
            <FormControl fullWidth size="small">
              <InputLabel>{chartCategory === "Sub Category" ? "Sub Category" : "Main Category"}</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => onSelectedCategoryChange(e.target.value)}
                label={chartCategory === "Sub Category" ? "Sub Category" : "Main Category"}
              >
                {mainSubList.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {isDayOrPeak && (
            <>
              <FormControl fullWidth size="small">
                <InputLabel>Building</InputLabel>
                <Select value={selectedBuilding} onChange={(e) => onSelectedBuildingChange(e.target.value)} label="Building">
                  {buildingList.map((item) => (
                    <MenuItem key={item.id} value={item.id}>{item.buildingName}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Month</InputLabel>
                <Select value={selectedMonth} onChange={(e) => onSelectedMonthChange(e.target.value)} label="Month">
                  {MONTHS_SHORT.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
              </FormControl>

              {activeChart === CHART_KEYS.PEAK && (
                <FormControl fullWidth size="small">
                  <InputLabel>Day</InputLabel>
                  <Select value={selectedDay} onChange={(e) => onSelectedDayChange(e.target.value)} label="Day">
                    {Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`).map((d) => (
                      <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </>
          )}

        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={onApply} variant="contained">Apply</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChartSettingsDialog;
