import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SettingsIcon from '@mui/icons-material/Settings';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { PERMISSIONS } from '../../constants';
import DowntimeReasonMaster from '../downtime/DowntimeReasonMaster';
import ChecklistTemplateList from '../checklist/ChecklistTemplateList';
import InspectionPlanList from '../quality/InspectionPlanList';
import DefectCatalogMaster from '../quality/DefectCatalogMaster';
import WarehouseMaster from './WarehouseMaster';
import ShiftMaster from './ShiftMaster';

// Each tab is its own already-built module screen, rendered as-is (including its own "New ..."
// action button) - switching tabs never navigates away from /configuration, it just swaps which
// one is mounted. Drilling into "New"/"Edit" from Checklist Templates/Inspection Plans still goes
// to its own dedicated builder page (unchanged) since that's a separate, larger flow, not a tab.
const TABS = [
  { value: 'shifts', label: 'Shifts', permission: PERMISSIONS.SHIFT_VIEW, Component: ShiftMaster },
  { value: 'downtime', label: 'Downtime Reasons', permission: PERMISSIONS.DOWNTIME_VIEW, Component: DowntimeReasonMaster },
  { value: 'checklists', label: 'Checklist Templates', permission: PERMISSIONS.CHECKLIST_VIEW, Component: ChecklistTemplateList },
  { value: 'inspection-plans', label: 'Inspection Plans', permission: PERMISSIONS.QUALITY_VIEW, Component: InspectionPlanList },
  { value: 'defect-catalog', label: 'Defect Catalog', permission: PERMISSIONS.QUALITY_VIEW, Component: DefectCatalogMaster },
  { value: 'warehouses', label: 'Warehouses', permission: PERMISSIONS.INVENTORY_VIEW, Component: WarehouseMaster },
];

export default function ConfigurationPage() {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const availableTabs = TABS.filter((t) => hasPermission(t.permission));
  const requestedTab = searchParams.get('tab');
  const activeTab = availableTabs.some((t) => t.value === requestedTab) ? requestedTab : availableTabs[0]?.value;
  const ActiveComponent = availableTabs.find((t) => t.value === activeTab)?.Component;

  return (
    <Box>
      <PageHeader icon={<SettingsIcon />} title="Configuration" subtitle="Shared setup used across Machine Planning and the operator app" />

      <Tabs
        value={activeTab || false}
        onChange={(e, value) => setSearchParams({ tab: value })}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {availableTabs.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </Tabs>

      {ActiveComponent && <ActiveComponent />}
    </Box>
  );
}
