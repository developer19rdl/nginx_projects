export const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const MONTHS_FULL = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export const MONTH_MAP = {
  January:"01", February:"02", March:"03", April:"04",
  May:"05",     June:"06",     July:"07",  August:"08",
  September:"09", October:"10", November:"11", December:"12",
};

export const DEFAULT_GAUGE_CONFIGS = {
  gauge1: { title: "Power Factor (PF)", unit: "PF",  min: 0, max: 1 },
  gauge2: { title: "Kilo Watt (Kw)",    unit: "Kw",  min: 0, max: 200 },
  gauge3: { title: "Busbar Temperature", unit: "°",  min: 0, max: 120 },
};

export const CO2_FACTOR = 0.82; // India CEA 2023 — kg CO2 per kWh

export const DEFAULT_CARD_CONFIGS = {
  card1: { title: "EB",           unit: "kWh", defaultValue: 0 },
  card2: { title: "Green Energy", unit: "kWh", defaultValue: 0 },
  card3: { title: "Generator",    unit: "kWh", defaultValue: 0 },
  card4: { title: "CO2",          unit: "Kg", defaultValue: 0 },
  card5: { title: "Alert",        unit: "",   defaultValue: 0 },
};

export const CHART_KEYS = {
  FLOOR:    "Floor/Shop Consumption",
  CATEGORY: "Category Wise Consumption",
  DAY:      "Day Wise Consumption",
  PEAK:     "Peak Hour Demand",
};
