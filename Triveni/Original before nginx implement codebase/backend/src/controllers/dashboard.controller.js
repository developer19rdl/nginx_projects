const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const dashboardService = require('../services/dashboard.service');
const machineInsightsService = require('../services/machineInsights.service');

const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary();
  success(res, { message: 'OK', data: summary });
});

const getCharts = asyncHandler(async (req, res) => {
  const charts = await dashboardService.getCharts(req.query);
  success(res, { message: 'OK', data: charts });
});

const getMachineLiveStatus = asyncHandler(async (req, res) => {
  const machines = await dashboardService.getMachineLiveStatus();
  success(res, { message: 'OK', data: machines });
});

const getMachineInsights = asyncHandler(async (req, res) => {
  const insights = await machineInsightsService.getMachineInsights(Number(req.params.id));
  success(res, { message: 'OK', data: insights });
});

const TREND_PERIODS = new Set(['today', 'weekly', 'monthly']);

const getDowntimeTrends = asyncHandler(async (req, res) => {
  const period = TREND_PERIODS.has(req.query.period) ? req.query.period : 'today';
  const trends = await machineInsightsService.getDowntimeTrends(Number(req.params.id), period);
  success(res, { message: 'OK', data: trends });
});

const getProductionTrend = asyncHandler(async (req, res) => {
  const period = TREND_PERIODS.has(req.query.period) ? req.query.period : 'today';
  const trend = await machineInsightsService.getProductionTrendForPeriod(Number(req.params.id), period);
  success(res, { message: 'OK', data: trend });
});

module.exports = { getSummary, getCharts, getMachineLiveStatus, getMachineInsights, getDowntimeTrends, getProductionTrend };
