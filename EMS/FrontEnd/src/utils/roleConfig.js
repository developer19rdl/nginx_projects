// Role-based menu access configuration.
// This is now a FALLBACK only — the source of truth is the DB-backed
// roles / role_module_access tables, editable from the "Add Role" /
// "Add Assign Role" screens (see AssignRoleModel.js). SideBar.js fetches
// the logged-in user's role's module list from the backend on mount and
// falls back to this static map if that call fails or hasn't resolved yet.

// Canonical list of assignable modules — keys match the menuKey used by
// hasAccess()/SideBar.js, labels are what shows up as checkboxes in the
// "Add Assign Role" screen's Module List.
export const MODULE_OPTIONS = [
  { key: 'PlantMap', label: 'Plant Map' },
  { key: 'PlantOverview', label: 'Plant Overview' },
  { key: 'IoTDashboard', label: 'Energy Dashboard' },
  { key: 'ScadaView', label: 'SCADA Dashboard' },
  { key: 'health_dashboard', label: 'Health Dashboard' },
  { key: 'utility_dashboard', label: 'Utility Dashboard' },
  { key: 'TemperatureDashboard', label: 'Temperature Dashboard' },
  { key: 'HumidityDashboard', label: 'Humidity Dashboard' },
  { key: 'CO2Dashboard', label: 'CO2 Dashboard' },
  { key: 'PressureDashboard', label: 'Air Pressure Dashboard' },
  { key: 'MeterActiveStatus', label: 'Meter Status' },
  { key: 'MachineParaAllocationTab', label: 'Device Management' },
  { key: 'Reports', label: 'Reports' },
  { key: 'Configuration', label: 'Configuration' },
  { key: 'SmsWallet', label: 'SMS Wallet' },
  { key: 'AlertRecipients', label: 'Alert Recipients' },
  { key: 'User', label: 'User' },
  { key: 'EnergySaving', label: 'Energy Saving' },
  { key: 'Maintenance', label: 'Maintenance' },
];

export const ROLE_PERMISSIONS = {
  Admin: [
    'PlantMap',
    'PlantOverview',
    'EMS_Dashboard',
    'IoTDashboard',
    'health_dashboard',
    'utility_dashboard',
    'TemperatureDashboard',
    'HumidityDashboard',
    'CO2Dashboard',
    'PressureDashboard',
    'MeterActiveStatus',
    'MachineParaAllocationTab',
    'Reports',
    'Configuration',
    'SmsWallet',
    'AlertRecipients',
    'User',
    'EnergySaving',
    'EnergyAnomalyDetection',
    'ScadaView',
    'Maintenance',
  ],
  Supervisor: [
    'PlantMap',
    'PlantOverview',
    'EMS_Dashboard',
    'IoTDashboard',
    'health_dashboard',
    'utility_dashboard',
    'TemperatureDashboard',
    'HumidityDashboard',
    'CO2Dashboard',
    'PressureDashboard',
    'MeterActiveStatus',
    'MachineParaAllocationTab',
    'Reports',
    'EnergySaving',
    'EnergyAnomalyDetection',
    'ScadaView',
    'Maintenance',
  ],
  Manager: [
    'PlantMap',
    'PlantOverview',
    'EMS_Dashboard',
    'IoTDashboard',
    'health_dashboard',
    'utility_dashboard',
    'TemperatureDashboard',
    'HumidityDashboard',
    'CO2Dashboard',
    'PressureDashboard',
    'MeterActiveStatus',
    'Reports',
    'EnergySaving',
    'EnergyAnomalyDetection',
    'ScadaView',
  ],
  User: [
    'PlantMap',
    'PlantOverview',
    'EMS_Dashboard',
    'IoTDashboard',
    'health_dashboard',
    'utility_dashboard',
    'TemperatureDashboard',
    'HumidityDashboard',
    'CO2Dashboard',
    'PressureDashboard',
    'MeterActiveStatus',
    'ScadaView',
  ],
};

// dynamicModules: the module list fetched from role_module_access for the
// user's role, when available. Pass null/undefined while it's still loading
// or if the fetch failed, to fall back to the static map above.
export const hasAccess = (userRole, menuKey, dynamicModules) => {
  if (Array.isArray(dynamicModules)) {
    return dynamicModules.includes(menuKey);
  }
  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['Manager'];
  return permissions.includes(menuKey);
};
