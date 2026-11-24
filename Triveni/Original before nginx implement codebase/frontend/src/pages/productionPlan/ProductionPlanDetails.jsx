import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable from '../../components/common/DataTable';
import { usePlan } from '../../hooks/useProductionPlans';

const DETAIL_COLUMNS = [
  { key: 'priority', label: 'Priority' },
  { key: 'customer_name', label: 'Customer' },
  { key: 'item_code', label: 'Item' },
  { key: 'division', label: 'Div' },
  { key: 'size', label: 'Size' },
  { key: 'lot_no', label: 'Lot No' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'schedule_date', label: 'Schedule Date' },
  { key: 'shift_name', label: 'Shift' },
  {
    key: 'machine_code',
    label: 'Machine',
    render: (row) => (row.machine_code ? row.machine_code : <StatusBadge status="Unassigned" />),
  },
  { key: 'operator_name', label: 'Operator', render: (row) => row.operator_name || '—' },
];

function Stat({ label, value }) {
  return (
    <Grid item xs={6} sm={4}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={700}>
        {value}
      </Typography>
    </Grid>
  );
}

export default function ProductionPlanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = usePlan(Number(id));

  if (isLoading || !order) return <LinearProgress />;

  return (
    <Box>
      <PageHeader
        title={`Production Order: ${order.order_no}`}
        subtitle={`Order Date: ${order.order_date}`}
        actions={
          <>
            <StatusBadge status={order.status} />
            <Button
              variant="contained"
              startIcon={<CalendarViewWeekIcon />}
              sx={{ ml: 2 }}
              onClick={() => navigate('/planning')}
            >
              Machine Planning
            </Button>
          </>
        }
      />

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Stat label="Total Items" value={order.total_rows} />
          <Stat label="Total Quantity" value={order.total_quantity} />
          <Stat label="Created By" value={order.created_by_name || '—'} />
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Order Lines
      </Typography>
      <DataTable columns={DETAIL_COLUMNS} rows={order.detailRows} emptyMessage="No rows in this order" />
    </Box>
  );
}
