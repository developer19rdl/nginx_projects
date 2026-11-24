import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PageHeader from '../../components/common/PageHeader';
import PendingInspections from './PendingInspections';
import InspectionList from './InspectionList';
import CapaTracker from './CapaTracker';

// Same tabbed-shell pattern as ConfigurationPage.jsx: one route, tabs swap which screen is
// mounted without navigating away. Inspection Plans / Defect Catalog (the configuration/master
// data side of Quality) live under /configuration instead, alongside Checklist Templates and
// Downtime Reasons - this page is only the day-to-day operational screens.
const TABS = [
  { value: 'pending', label: 'Pending Inspections', Component: PendingInspections },
  { value: 'inspections', label: 'All Inspections', Component: InspectionList },
  { value: 'capa', label: 'CAPA Tracker', Component: CapaTracker },
];

export default function QualityLayout() {
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedTab = searchParams.get('tab');
  const activeTab = TABS.some((t) => t.value === requestedTab) ? requestedTab : TABS[0].value;
  const ActiveComponent = TABS.find((t) => t.value === activeTab)?.Component;

  return (
    <Box>
      <PageHeader icon={<FactCheckIcon />} title="Quality" subtitle="Inspect completed lots before they're released to inventory" />

      <Tabs
        value={activeTab}
        onChange={(e, value) => setSearchParams({ tab: value })}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </Tabs>

      {ActiveComponent && <ActiveComponent />}
    </Box>
  );
}
