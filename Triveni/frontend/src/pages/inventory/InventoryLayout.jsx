import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import PageHeader from '../../components/common/PageHeader';
import StockPage from './StockPage';
import LedgerPage from './LedgerPage';
import TransactionsPage from './TransactionsPage';
import HoldsPage from './HoldsPage';

// Same tabbed-shell pattern as QualityLayout.jsx/ConfigurationPage.jsx: one route, tabs swap
// which screen is mounted. Warehouse/Location master data lives under /configuration instead,
// alongside the other master-data tabs - this page is only the day-to-day stock screens.
const TABS = [
  { value: 'stock', label: 'Stock', Component: StockPage },
  { value: 'ledger', label: 'Ledger', Component: LedgerPage },
  { value: 'transactions', label: 'Transactions', Component: TransactionsPage },
  { value: 'holds', label: 'Holds', Component: HoldsPage },
];

export default function InventoryLayout() {
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedTab = searchParams.get('tab');
  const activeTab = TABS.some((t) => t.value === requestedTab) ? requestedTab : TABS[0].value;
  const ActiveComponent = TABS.find((t) => t.value === activeTab)?.Component;

  return (
    <Box>
      <PageHeader icon={<WarehouseIcon />} title="Inventory" subtitle="Finished Goods stock, movements and traceability" />

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
