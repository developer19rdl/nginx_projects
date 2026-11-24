export const DEFAULT_MARKER_DATA = {
    x: 0, y: 0, label: "", unit: "", tagKey: "",
    icon: "location",
    textColor: "#ffffff",
    bgColor: "#040408",
    widgetType: "card",
    alignment: "top",
    cardWidth: "", cardHeight: "", cardRadius: "",
    width: "", height: "",
    tableRow: "", tableColGroup: "", tableSubCol: "",
    maxVal: 100,
    threshold1: 30, color1: "#4caf50",
    threshold2: 60, color2: "#ffeb3b",
    color3: "#f44336",
    statusType: "analog",
    statusThreshold1: 20, statusThreshold2: 40,
    statusThreshold3: 60, statusThreshold4: 80,
    statusImage1: "", statusImage2: "", statusImage3: "",
    statusImage4: "", statusImage5: "",
    statusImage0: "", statusImage1_digital: "",
    fontSize: 24, decimalPoints: 2, iconSize: "medium",
    chartLast: "8hr",
    chartAggregation: "avg",
    chartInterval: "15min",
    chartWidth: 360,
    chartHeight: 220,
    chartMode: "single", combinedSensors: [],
    specMin: "", specMax: "", controlLow: "", controlMax: "",
};

export const DEFAULT_TABS = [
    { name: "Motor 1", image: "", markers: [], id: null },
    { name: "Motor 2", image: "", markers: [], id: null },
    { name: "Motor 3", image: "", markers: [], id: null },
];

export const DEFAULT_MARKER_STYLE = {
    textColor: "#ffffff",
    bgColor: "#040408",
    widgetType: "card",
    alignment: "top",
    cardWidth: "", cardHeight: "", cardRadius: "",
    width: "", height: "",
    tableRow: "", tableColGroup: "", tableSubCol: "",
    maxVal: 100,
    threshold1: 30, color1: "#4caf50",
    threshold2: 60, color2: "#ffeb3b",
    color3: "#f44336",
    statusType: "analog",
    statusThreshold1: 20, statusThreshold2: 40,
    statusThreshold3: 60, statusThreshold4: 80,
    fontSize: 24, decimalPoints: 2, iconSize: "medium",
    chartLast: "8hr",
    chartAggregation: "avg",
    chartInterval: "15min",
    chartWidth: 360,
    chartHeight: 220,
    chartMode: "single", combinedSensors: [],
    specMin: "", specMax: "", controlLow: "", controlMax: "",
};

// Per-widget-type resize floors — a shared generic minimum would let recharts
// render garbage or text spill outside circular/SVG widgets well before it's
// reached, so each type gets a floor derived from its own current default size.
export const WIDGET_MIN_SIZE = {
    card: { width: 70, height: 40 },
    text: { width: 50, height: 28 },
    status: { width: 160, height: 45 },
    gauge: { width: 60, height: 60 },
    semicircle: { width: 90, height: 50 },
    progress: { width: 120, height: 50 },
    sevensegment: { width: 80, height: 40 },
    linechart: { width: 150, height: 120 },
    barchart: { width: 150, height: 120 },
    areachart: { width: 150, height: 120 },
    cyclebadge: { width: 46, height: 46 },
};

// Combined "Analytics" mode sensor cap — matches the fixed chart color palette
// size (COMBINED_CHART_COLORS in ScadaController.js) so two lines can never
// render with the same color.
export const MAX_COMBINED_SENSORS = 8;

// Chart-type options for the "Analytics" (combined multi-sensor) tab's Chart
// Type dropdown. Combined-mode widgets only make sense as one of these —
// "Cycling Badge" is the odd one out (not a chart at all): one round badge
// that rotates through each selected sensor's CURRENT live value in turn
// (Temperature → Humidity → CO2, ... in the order they were picked), instead
// of N separate badges side by side — for when several sensors need to share
// one small spot on the image or one table cell.
export const CHART_TYPE_OPTIONS = [
    { value: "linechart", label: "Line Chart" },
    { value: "barchart", label: "Bar Chart" },
    { value: "areachart", label: "Area Chart" },
    { value: "cyclebadge", label: "Cycling Badge (one value at a time)" },
];

// Time-range options for graph widgets ("Last") — must match HourOffset keys
// supported by the ChartData1 backend controller.
export const CHART_LAST_OPTIONS = [
    { value: "8hr", label: "8 Hrs" },
    { value: "1day", label: "1 Day" },
    { value: "1week", label: "1 Week" },
    { value: "15days", label: "15 Days" },
    { value: "30days", label: "30 Days" },
];

// Grouping interval options — must match IntervalInSeconds keys supported
// by the ChartData1 backend controller.
export const CHART_INTERVAL_OPTIONS = [
    { value: "15min", label: "15 Min" },
    { value: "30min", label: "30 Min" },
    { value: "1hr", label: "1 Hr" },
    { value: "1day", label: "1 Day" },
];

// Aggregation options — must match AggregateTypes keys supported by the
// ChartData1 backend controller.
export const CHART_AGGREGATION_OPTIONS = [
    { value: "avg", label: "Average" },
    { value: "min", label: "Min" },
    { value: "max", label: "Max" },
    { value: "count", label: "Count" },
];
