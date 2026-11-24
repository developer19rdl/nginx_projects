import React, { useState, useCallback } from "react";
import {
  Box, Card, CardContent, Grid, IconButton,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SettingsIcon from "@mui/icons-material/Settings";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

import buildingImg from "../../Assets/Images/LenovoBuilding.jpg";
import FloorImg from "../../Assets/Images/THIRD-FLOOR-PLAN-Mar-24.jpg";

import SummaryCardsSection from "./SummaryCardsSection";
import GaugeCard from "./GaugeCard";
import ChartCard from "./ChartCard";
import FloorWiseModel from "./FloorWiseModel";
import CatergoryWiseModel from "./CatergoryWiseModel";
import EbDayWiseModel from "./EbDayWiseModel";
import NotificationBar from "../../Utility/NotificationBar";

import ChartSettingsDialog from "./dialogs/ChartSettingsDialog";
import GaugeSettingsDialog from "./dialogs/GaugeSettingsDialog";
import CardSettingsDialog from "./dialogs/CardSettingsDialog";

import { useDashboardData } from "./hooks/useDashboardData";
import { DEFAULT_CARD_CONFIGS, CHART_KEYS } from "./constants";

import { GetEBDailyEnergy, GetSolarDailyEnergy } from "../../Services/NodeJsApiServices";


const EMS_Dashboard = () => {
  // ── data layer ──────────────────────────────────────────────────────────────
  const {
    liveData, summaryByPlant, selectedPlantId, setSelectedPlantId,
    ebData, solarData,
    categoryData, floorCategoryData,
    dayWiseData, peakHourData,
    buildingList, gaugeConfigs, chartConfigs,
    mainSubChart1, mainSubChart2,
    saveChartSettings, refreshDayWise, refreshPeakHour,
    refreshCategoryCharts, loadMainSubList,
    saveGaugeSettings, updateGaugeConfig, updateChartConfigs,
  } = useDashboardData();

  // ── UI state ────────────────────────────────────────────────────────────────
  const [showFloor, setShowFloor] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [cardConfigs, setCardConfigs] = useState(DEFAULT_CARD_CONFIGS);
  const [tempCardConfigs, setTempCardConfigs] = useState(DEFAULT_CARD_CONFIGS);

  // modal state
  const [ebModalOpen, setEbModalOpen] = useState(false);
  const [floorModalOpen, setFloorModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [ebModalData, setEbModalData] = useState([]);
  const [ebModalType, setEbModalType] = useState("eb");
  const [ebClickedMonth, setEbClickedMonth] = useState("");
  const [selectedFloorName, setSelectedFloorName] = useState("");
  const [subDayId, setSubDayId] = useState(null);
  const [categoryDayId, setCategoryDayId] = useState(null);

  // chart settings dialog
  const [chartDlgOpen, setChartDlgOpen] = useState(false);
  const [activeChart, setActiveChart] = useState("");
  const [dlgTitle, setDlgTitle] = useState("");
  const [dlgChartType, setDlgChartType] = useState("bar");
  const [dlgCategory, setDlgCategory] = useState("");
  const [dlgSubId, setDlgSubId] = useState("");
  const [dlgBuilding, setDlgBuilding] = useState("");
  const [dlgMonth, setDlgMonth] = useState("Jan");
  const [dlgDay, setDlgDay] = useState("Day 1");

  // gauge settings dialog
  const [gaugeDlgOpen, setGaugeDlgOpen] = useState(false);
  const [activeGauge, setActiveGauge] = useState("");
  const [dlgGaugeTitle, setDlgGaugeTitle] = useState("");
  const [dlgGaugeUnit, setDlgGaugeUnit] = useState("");

  // card settings dialog
  const [cardDlgOpen, setCardDlgOpen] = useState(false);

  // notification
  const [notification, setNotification] = useState({ status: false, type: "error", message: "" });
  const closeNotification = useCallback(() => setNotification({ status: false, type: "", message: "" }), []);
  const showSuccess = useCallback((msg) => {
    setNotification({ status: true, type: "success", message: msg });
    setTimeout(closeNotification, 2000);
  }, [closeNotification]);

  // ── chart bar click handlers ─────────────────────────────────────────────────
  const handleFloorBarClick = useCallback((data) => {
    setSubDayId(data.id);
    setSelectedFloorName(data.name);
    setFloorModalOpen(true);
  }, []);

  const handleCategoryBarClick = useCallback((data) => {
    setCategoryDayId(data.id);
    setSelectedFloorName(data.name);
    setCategoryModalOpen(true);
  }, []);

  const handleEbBarClick = useCallback((data) => {
    setEbModalType("eb");
    setEbClickedMonth(data.name);
    GetEBDailyEnergy(
      { month: data.name },
      (res) => { setEbModalData(res || []); setEbModalOpen(true); },
      (err) => console.error("EB daily error:", err)
    );
  }, [setEbClickedMonth]);

  const handleSolarBarClick = useCallback((data) => {
    setEbModalType("solar");
    setEbClickedMonth(data.name);
    GetSolarDailyEnergy(
      { month: data.name },
      (res) => { setEbModalData(res || []); setEbModalOpen(true); },
      (err) => console.error("Solar daily error:", err)
    );
  }, [setEbClickedMonth]);

  // ── chart type helper ─────────────────────────────────────────────────────────
  const getChartType = useCallback(
    (name) => (chartConfigs[name]?.type || "bar").toLowerCase(),
    [chartConfigs]
  );

  // ── open chart settings ───────────────────────────────────────────────────────
  const openChartSettings = useCallback((chartName) => {
    const cfg = chartConfigs[chartName] || {};
    setActiveChart(chartName);
    setDlgTitle(cfg.title || chartName);
    setDlgChartType((cfg.type || "bar").toLowerCase());
    setDlgCategory(cfg.category || "");
    setDlgSubId(cfg.mainSubId != null ? cfg.mainSubId : "");
    setDlgBuilding(cfg.buildingId || "");
    setDlgMonth(cfg.month || "Jan");
    setDlgDay(cfg.day || "Day 1");
    if (cfg.category) {
      loadMainSubList(cfg.category, chartName);
    }
    setChartDlgOpen(true);
  }, [chartConfigs, loadMainSubList]);

  // ── apply chart settings ──────────────────────────────────────────────────────
  const handleChartApply = useCallback(() => {
    const chartNo = activeChart === CHART_KEYS.FLOOR ? "chart1"
      : activeChart === CHART_KEYS.CATEGORY ? "chart2"
        : undefined;

    saveChartSettings(
      {
        chartName: dlgTitle,
        type: dlgChartType === "bar" ? "Bar" : "Line",
        category: dlgCategory || undefined,
        mainSubId: dlgSubId !== "" ? Number(dlgSubId) : undefined,
        chartNo,
      },
      () => {
        refreshCategoryCharts();
        showSuccess("Chart settings saved");
      },
      (err) => console.error("Save chart error:", err)
    );

    updateChartConfigs({
      [activeChart]: {
        title: dlgTitle,
        type: dlgChartType,
        category: dlgCategory,
        mainSubId: dlgSubId !== "" ? Number(dlgSubId) : "",
        buildingId: dlgBuilding,
        month: dlgMonth,
        day: dlgDay,
        chartNo,
      },
    });

    if (activeChart === CHART_KEYS.DAY) {
      refreshDayWise({ month: dlgMonth, buildingId: dlgBuilding });
    } else if (activeChart === CHART_KEYS.PEAK) {
      refreshPeakHour({ month: dlgMonth, buildingId: dlgBuilding, day: dlgDay });
    }

    setChartDlgOpen(false);
  }, [
    activeChart, dlgTitle, dlgChartType, dlgCategory, dlgSubId,
    dlgBuilding, dlgMonth, dlgDay,
    saveChartSettings, refreshCategoryCharts, refreshDayWise, refreshPeakHour,
    updateChartConfigs, showSuccess,
  ]);

  // ── apply gauge settings ──────────────────────────────────────────────────────
  const handleGaugeApply = useCallback(() => {
    saveGaugeSettings(
      { gaugeNo: activeGauge, title: dlgGaugeTitle, units: dlgGaugeUnit },
      () => {
        updateGaugeConfig(activeGauge, { title: dlgGaugeTitle, unit: dlgGaugeUnit });
        showSuccess("Gauge settings saved");
      },
      (err) => console.error("Save gauge error:", err)
    );
    setGaugeDlgOpen(false);
  }, [activeGauge, dlgGaugeTitle, dlgGaugeUnit, saveGaugeSettings, updateGaugeConfig, showSuccess]);

  // ── apply card settings ───────────────────────────────────────────────────────
  const handleCardApply = useCallback(() => {
    setCardConfigs(tempCardConfigs);
    setCardDlgOpen(false);
    showSuccess("Card settings updated");
  }, [tempCardConfigs, showSuccess]);

  const handleCardChange = useCallback((cardKey, field, value) => {
    setTempCardConfigs((prev) => ({
      ...prev,
      [cardKey]: { ...prev[cardKey], [field]: value },
    }));
  }, []);

  // ── gauge settings opener ─────────────────────────────────────────────────────
  const openGaugeSettings = useCallback((gaugeNo) => {
    const cfg = gaugeConfigs[gaugeNo];
    setActiveGauge(gaugeNo);
    setDlgGaugeTitle(cfg?.title || "");
    setDlgGaugeUnit(cfg?.unit || "");
    setGaugeDlgOpen(true);
  }, [gaugeConfigs]);

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <Box p={2}>
      {/* Global card settings button */}
      <IconButton
        size="small"
        onClick={() => { setTempCardConfigs(cardConfigs); setCardDlgOpen(true); }}
        sx={{
          position: "absolute", top: 20, right: 40, zIndex: 999,
          backgroundColor: "#5D5D5D", color: "#fff",
          "&:hover": { backgroundColor: "#4D4D4D" },
        }}
      >
        <SettingsIcon />
      </IconButton>

      {/* ── Top Summary Cards ─────────────────────────────────────────────── */}
      <SummaryCardsSection
        summaryByPlant={summaryByPlant}
        selectedPlantId={selectedPlantId}
        onPlantChange={setSelectedPlantId}
        cardConfigs={cardConfigs}
      />

      {/* ── Row 1: Gauges + Floor/Shop chart ──────────────────────────────── */}
      <Box mt={3}>
        <Grid container spacing={2} alignItems="stretch">
          {["gauge1", "gauge2", "gauge3"].map((gKey) => {
            const cfg = gaugeConfigs[gKey];
            const liveItem = liveData.find((d) => d.gaugeNo === gKey);
            return (
              <Grid key={gKey} item xs={12} sm={4} md={2.66}>
                <GaugeCard
                  height={200}
                  title={cfg?.title}
                  value={liveItem?.value ?? 0}
                  unit={cfg?.unit}
                  min={cfg?.min ?? 0}
                  max={cfg?.max ?? 100}
                  onSettingsClick={() => openGaugeSettings(gKey)}
                />
              </Grid>
            );
          })}

          <Grid item xs={12} md={4}>
            <ChartCard
              height={200}
              title={chartConfigs[CHART_KEYS.FLOOR]?.title || CHART_KEYS.FLOOR}
              data={floorCategoryData}
              chartType={getChartType(CHART_KEYS.FLOOR)}
              onSettingsClick={() => openChartSettings(CHART_KEYS.FLOOR)}
              onBarClick={handleFloorBarClick}
            />
          </Grid>
        </Grid>
      </Box>

      {/* ── Row 2: Building image + Category + Day charts ─────────────────── */}
      <Box mt={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: 356, position: "relative" }}>
              <CardContent sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", p: 0 }}>
                <IconButton onClick={() => { setShowFloor(false); setImageZoom(1); }} sx={{ zIndex: 2 }}>
                  <ArrowBackIosNewIcon fontSize="large" />
                </IconButton>
                <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", overflow: "auto", height: "100%" }}>
                  <img
                    src={showFloor ? FloorImg : buildingImg}
                    alt={showFloor ? "Floor" : "Building"}
                    style={{
                      objectFit: showFloor ? "contain" : "cover",
                      height: "100%",
                      width: "100%",
                      transform: `scale(${imageZoom})`,
                      transformOrigin: "center",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </Box>
                <IconButton onClick={() => { setShowFloor(true); setImageZoom(1); }} sx={{ zIndex: 2 }}>
                  <ArrowForwardIosIcon fontSize="large" />
                </IconButton>
                <Box sx={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 0.5, zIndex: 2 }}>
                  <IconButton size="small" onClick={() => setImageZoom((z) => Math.min(z + 0.25, 3))} sx={{ bgcolor: "rgba(255,255,255,0.8)" }}>
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setImageZoom((z) => Math.max(z - 0.25, 1))} sx={{ bgcolor: "rgba(255,255,255,0.8)" }}>
                    <ZoomOutIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" gap={2}>
              <ChartCard
                title={chartConfigs[CHART_KEYS.CATEGORY]?.title || CHART_KEYS.CATEGORY}
                data={categoryData}
                height={170}
                chartType={getChartType(CHART_KEYS.CATEGORY)}
                onSettingsClick={() => openChartSettings(CHART_KEYS.CATEGORY)}
                onBarClick={handleCategoryBarClick}
              />
              <ChartCard
                title={chartConfigs[CHART_KEYS.DAY]?.title || CHART_KEYS.DAY}
                data={dayWiseData}
                height={170}
                chartType={getChartType(CHART_KEYS.DAY)}
                onSettingsClick={() => openChartSettings(CHART_KEYS.DAY)}
                dataKey="totalEnergy"
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* ── Row 3: EB + Green Energy + Peak Hour ──────────────────────────── */}
      <Box mt={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <ChartCard
              height={180}
              title="EB Energy Consumption"
              data={ebData}
              showSettings={false}
              chartType="bar"
              dataKey="ebEnergy"
              secondaryKey="ebCost"
              secondaryName="EB Cost"
              onBarClick={handleEbBarClick}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <ChartCard
              height={180}
              title="Green Energy Generation"
              data={solarData}
              showSettings={false}
              chartType="bar"
              dataKey="solarEnergy"
              secondaryKey="solarCost"
              secondaryName="Solar Cost"
              barColor="#10B981"
              onBarClick={handleSolarBarClick}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <ChartCard
              height={180}
              title={chartConfigs[CHART_KEYS.PEAK]?.title || CHART_KEYS.PEAK}
              data={peakHourData}
              chartType={getChartType(CHART_KEYS.PEAK)}
              onSettingsClick={() => openChartSettings(CHART_KEYS.PEAK)}
              dataKey="totalEnergy"
            />
          </Grid>
        </Grid>
      </Box>

      {/* ── Dialogs ──────────────────────────────────────────────────────────── */}
      <ChartSettingsDialog
        open={chartDlgOpen}
        onClose={() => setChartDlgOpen(false)}
        onApply={handleChartApply}
        activeChart={activeChart}
        title={dlgTitle} onTitleChange={setDlgTitle}
        chartType={dlgChartType} onChartTypeChange={setDlgChartType}
        chartCategory={dlgCategory} onChartCategoryChange={(val) => {
          setDlgCategory(val);
          loadMainSubList(val, activeChart);
        }}
        selectedCategory={dlgSubId} onSelectedCategoryChange={setDlgSubId}
        selectedBuilding={dlgBuilding} onSelectedBuildingChange={setDlgBuilding}
        selectedMonth={dlgMonth} onSelectedMonthChange={setDlgMonth}
        selectedDay={dlgDay} onSelectedDayChange={setDlgDay}
        mainSubList={activeChart === CHART_KEYS.FLOOR ? mainSubChart1 : mainSubChart2}
        buildingList={buildingList}
      />

      <GaugeSettingsDialog
        open={gaugeDlgOpen}
        onClose={() => setGaugeDlgOpen(false)}
        onApply={handleGaugeApply}
        gaugeTitle={dlgGaugeTitle} onGaugeTitleChange={setDlgGaugeTitle}
        gaugeUnit={dlgGaugeUnit} onGaugeUnitChange={setDlgGaugeUnit}
      />

      <CardSettingsDialog
        open={cardDlgOpen}
        onClose={() => setCardDlgOpen(false)}
        onApply={handleCardApply}
        tempCardConfigs={tempCardConfigs}
        onCardChange={handleCardChange}
      />

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      <FloorWiseModel
        open={floorModalOpen}
        handleClose={() => setFloorModalOpen(false)}
        selectedFloor={selectedFloorName}
        subDayId={subDayId}
        chartNo="chart1"
      />

      <CatergoryWiseModel
        open={categoryModalOpen}
        handleClose={() => setCategoryModalOpen(false)}
        selectedFloor={selectedFloorName}
        dayId={categoryDayId}
        chartNo="chart2"
      />

      <EbDayWiseModel
        open={ebModalOpen}
        handleClose={() => setEbModalOpen(false)}
        data={ebModalData}
        selectedMonthName={ebClickedMonth}
        type={ebModalType}
      />

      <NotificationBar
        handleClose={closeNotification}
        notificationContent={notification.message}
        openNotification={notification.status}
        type={notification.type}
      />
    </Box>
  );
};

export default EMS_Dashboard;
