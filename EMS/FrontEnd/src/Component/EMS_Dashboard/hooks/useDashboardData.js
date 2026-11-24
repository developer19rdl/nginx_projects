import { useState, useEffect, useCallback } from "react";
import {
  CategoryLiveShowList,
  CategoryWiseConsumtion,
  FloorCategoryShowList,
  GetEBMonthlyEnergy,
  GetSolarMonthlyEnergy,
  GetBuildingOtherEnergy,
  MeterBuildingShowList,
  MainSubCategoryShowList,
  GetBuildingHourlyEnergy,
  SaveChartSettingsList,
  GaugeSettingsList,
  GetDashboardSummary,
} from "../../../Services/NodeJsApiServices";
import { DEFAULT_GAUGE_CONFIGS, CHART_KEYS } from "../constants";

export function useDashboardData() {
  const [liveData, setLiveData] = useState([]);
  const [summaryByPlant, setSummaryByPlant] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [ebData, setEbData] = useState([]);
  const [solarData, setSolarData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [floorCategoryData, setFloorCategoryData] = useState([]);
  const [dayWiseData, setDayWiseData] = useState([]);
  const [peakHourData, setPeakHourData] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [gaugeConfigs, setGaugeConfigs] = useState(DEFAULT_GAUGE_CONFIGS);
  const [chartConfigs, setChartConfigs] = useState({});
  const [mainSubChart1, setMainSubChart1] = useState([]);
  const [mainSubChart2, setMainSubChart2] = useState([]);

  // ── initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Live gauge data
    CategoryLiveShowList(
      (dataObject) => {
        const gaugeData = dataObject?.data || [];
        setLiveData(gaugeData);
        if (gaugeData.length > 0) {
          setGaugeConfigs((prev) => {
            const next = { ...prev };
            gaugeData.forEach((g) => {
              if (g.gaugeNo) {
                next[g.gaugeNo] = {
                  ...(next[g.gaugeNo] || {}),
                  ...(g.title && { title: g.title }),
                  ...(g.units && { unit: g.units }),
                };
              }
            });
            return next;
          });
        }
      },
      (err) => console.error("Live gauge error:", err)
    );

    // Dashboard summary cards (EB, Green, Generator, CO2, Alert per plant)
    GetDashboardSummary(
      {},
      (res) => setSummaryByPlant(res?.data || []),
      (err) => console.error("Dashboard summary error:", err)
    );

    GetEBMonthlyEnergy(
      (data) => setEbData(data || []),
      (err) => console.error("EB monthly error:", err)
    );

    GetSolarMonthlyEnergy(
      (data) => setSolarData(data || []),
      (err) => console.error("Solar monthly error:", err)
    );

    CategoryWiseConsumtion(
      { categoryId: null, buildingId: 12, floorId: 6, chartNo: "chart2" },
      (dataObject) => {
        setCategoryData(dataObject?.data || []);
        _applyChartSettings(dataObject, "chart2", CHART_KEYS.CATEGORY, setMainSubChart2, setChartConfigs);
      },
      (err) => console.error("Category wise error:", err)
    );

    GetBuildingOtherEnergy(
      { month: "Feb", buildingId: 12 },
      (data) => setDayWiseData(data || []),
      (err) => console.error("Day wise energy error:", err)
    );

    GetBuildingHourlyEnergy(
      { month: "Feb", buildingId: 12, day: "Day 5" },
      (data) => setPeakHourData(data || []),
      (err) => console.error("Peak hour energy error:", err)
    );

    FloorCategoryShowList(
      (dataObject) => {
        setFloorCategoryData(dataObject?.data || []);
        _applyChartSettings(dataObject, "chart1", CHART_KEYS.FLOOR, setMainSubChart1, setChartConfigs);
      },
      (err) => console.error("Floor category error:", err)
    );

    MeterBuildingShowList(
      (dataObj) => setBuildingList(dataObj?.data || []),
      (err) => console.error("Building list error:", err)
    );
  }, []);

  // Re-fetch summary when plant selection changes
  useEffect(() => {
    const params = selectedPlantId ? { plantId: selectedPlantId } : {};
    GetDashboardSummary(
      params,
      (res) => setSummaryByPlant(res?.data || []),
      (err) => console.error("Dashboard summary error:", err)
    );
  }, [selectedPlantId]);

  // ── save chart settings ────────────────────────────────────────────────────
  const saveChartSettings = useCallback((payload, onSuccess, onError) => {
    SaveChartSettingsList(payload, onSuccess, onError);
  }, []);

  // ── refresh day/peak after settings apply ─────────────────────────────────
  const refreshDayWise = useCallback(({ month, buildingId }) => {
    GetBuildingOtherEnergy(
      { month, buildingId },
      (data) => setDayWiseData(data || []),
      (err) => console.error("Day wise refresh error:", err)
    );
  }, []);

  const refreshPeakHour = useCallback(({ month, buildingId, day }) => {
    GetBuildingHourlyEnergy(
      { month, buildingId, day },
      (data) => setPeakHourData(data || []),
      (err) => console.error("Peak hour refresh error:", err)
    );
  }, []);

  // ── refresh chart1 & chart2 data after save ───────────────────────────────
  const refreshCategoryCharts = useCallback(() => {
    CategoryWiseConsumtion(
      { categoryId: null, buildingId: 12, floorId: 6, chartNo: "chart2" },
      (dataObject) => {
        setCategoryData(dataObject?.data || []);
        _applyChartSettings(dataObject, "chart2", CHART_KEYS.CATEGORY, setMainSubChart2, setChartConfigs);
      },
      (err) => console.error("Category refresh error:", err)
    );
    FloorCategoryShowList(
      (dataObject) => {
        setFloorCategoryData(dataObject?.data || []);
        _applyChartSettings(dataObject, "chart1", CHART_KEYS.FLOOR, setMainSubChart1, setChartConfigs);
      },
      (err) => console.error("Floor category refresh error:", err)
    );
  }, []);

  // ── load sub-category list on demand ──────────────────────────────────────
  const loadMainSubList = useCallback((category, chartKey) => {
    if (!category) return;
    const setter = chartKey === CHART_KEYS.FLOOR ? setMainSubChart1 : setMainSubChart2;
    MainSubCategoryShowList(
      { category },
      (dataObj) => setter(dataObj?.data || []),
      (err) => console.error("MainSub list error:", err)
    );
  }, []);

  // ── save gauge settings ───────────────────────────────────────────────────
  const saveGaugeSettings = useCallback((gaugeData, onSuccess, onError) => {
    GaugeSettingsList(gaugeData, onSuccess, onError);
  }, []);

  const updateGaugeConfig = useCallback((gaugeNo, updates) => {
    setGaugeConfigs((prev) => ({
      ...prev,
      [gaugeNo]: { ...prev[gaugeNo], ...updates },
    }));
  }, []);

  const updateChartConfigs = useCallback((updates) => {
    setChartConfigs((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    liveData,
    summaryByPlant,
    selectedPlantId,
    setSelectedPlantId,
    ebData,
    solarData,
    categoryData,
    floorCategoryData,
    dayWiseData,
    peakHourData,
    buildingList,
    gaugeConfigs,
    chartConfigs,
    mainSubChart1,
    mainSubChart2,
    saveChartSettings,
    refreshDayWise,
    refreshPeakHour,
    refreshCategoryCharts,
    loadMainSubList,
    saveGaugeSettings,
    updateGaugeConfig,
    updateChartConfigs,
  };
}

// ── private helper ────────────────────────────────────────────────────────────
function _applyChartSettings(dataObject, expectedChartNo, chartKey, setSubList, setChartConfigs) {
  const settings = dataObject?.chartSettings;
  if (!settings) return;
  const { chartName, type, category, mainSubId } = settings;

  setChartConfigs((prev) => ({
    ...prev,
    [chartKey]: {
      title: chartName || chartKey,
      type: (type || "bar").toLowerCase(),
      category: category || "",
      mainSubId: mainSubId != null ? mainSubId : "",
    },
  }));

  if (category) {
    MainSubCategoryShowList(
      { category },
      (dataObj) => setSubList(dataObj?.data || []),
      (err) => console.error("SubList load error:", err)
    );
  }
}
