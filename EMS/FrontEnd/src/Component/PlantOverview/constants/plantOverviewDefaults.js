// Starter screen shown before the first fetch resolves / before any screens
// have been configured yet. Unlike the SCADA Dashboard's "Motor 1/2/3"
// placeholders, Plant Overview starts with a single "Plant Overview" home
// screen — the plant-footprint image (Server room / Line 1-4 / Warehouse)
// that every click-hotspot on later screens can link back to via "Home".
export const PLANT_OVERVIEW_DEFAULT_TABS = [
    { name: "Plant Overview", image: "", markers: [], id: null },
];
