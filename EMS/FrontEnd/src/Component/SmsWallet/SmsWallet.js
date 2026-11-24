import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SmsIcon from '@mui/icons-material/Sms';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';
import TodayIcon from '@mui/icons-material/Today';
import SmsWalletToolbar from './SmsWalletToolbar';
import AddSmsPackageModal from './AddSmsPackageModal';
import { SmsWalletSummary, SmsWalletPurchaseHistory, SmsWalletSendLog } from '../../Services/NodeJsApiServices';

const StatCard = ({ icon, label, value, sub, color }) => (
    <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
                width: 44, height: 44, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', backgroundColor: `${color}20`, color,
            }}>
                {icon}
            </Box>
            <Box>
                <Typography sx={{ fontSize: 13, color: '#78909c' }}>{label}</Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 700 }}>{value}</Typography>
                {sub && <Typography sx={{ fontSize: 11, color: '#90a4ae' }}>{sub}</Typography>}
            </Box>
        </CardContent>
    </Card>
);

const SmsWallet = () => {
    const [summary, setSummary] = useState({ totalPurchased: 0, totalSent: 0, remaining: 0, sentToday: 0, exhausted: false });
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [sendLog, setSendLog] = useState([]);
    const [addOpen, setAddOpen] = useState(false);
    const [refreshData, setRefreshData] = useState(false);

    useEffect(() => {
        SmsWalletSummary((d) => setSummary(d?.data || {}), () => {});
        SmsWalletPurchaseHistory((d) => setPurchaseHistory(d?.data || []), () => {});
        SmsWalletSendLog((d) => setSendLog(d?.data || []), () => {});
    }, [refreshData]);

    const usagePct = summary.totalPurchased > 0
        ? Math.min(100, Math.round((summary.totalSent / summary.totalPurchased) * 100))
        : 0;

    const purchaseColumns = [
        { field: 'id', headerName: '#', width: 70, align: 'center', headerAlign: 'center' },
        { field: 'smsCount', headerName: 'SMS Count', flex: 1, minWidth: 120, align: 'center', headerAlign: 'center',
          renderCell: (p) => Number(p.value).toLocaleString() },
        { field: 'addedAt', headerName: 'Added On', flex: 1, minWidth: 160, align: 'center', headerAlign: 'center',
          renderCell: (p) => p.value ? new Date(p.value).toLocaleString() : '—' },
        { field: 'addedBy', headerName: 'Added By', flex: 1, minWidth: 140, align: 'center', headerAlign: 'center',
          renderCell: (p) => p.value || '—' },
        { field: 'note', headerName: 'Note', flex: 1, minWidth: 140, align: 'center', headerAlign: 'center',
          renderCell: (p) => p.value || '—' },
        { field: 'status', headerName: 'Status', width: 110, align: 'center', headerAlign: 'center',
          renderCell: (p) => (
            <Chip label={p.value} size="small"
                sx={{ backgroundColor: p.value === 'Active' ? '#e8f5e9' : '#eceff1', color: p.value === 'Active' ? '#2e7d32' : '#455a64', fontWeight: 600 }}
            />
          ) },
    ];

    const sendLogColumns = [
        { field: 'id', headerName: '#', width: 70, align: 'center', headerAlign: 'center' },
        { field: 'sentAt', headerName: 'Time', flex: 1, minWidth: 160, align: 'center', headerAlign: 'center',
          renderCell: (p) => p.value ? new Date(p.value).toLocaleString() : '—' },
        { field: 'source', headerName: 'Source', width: 130, align: 'center', headerAlign: 'center' },
        { field: 'recipientPhone', headerName: 'Recipient', flex: 1, minWidth: 130, align: 'center', headerAlign: 'center',
          renderCell: (p) => p.value || '—' },
        { field: 'message', headerName: 'Message', flex: 2, minWidth: 220, align: 'center', headerAlign: 'center',
          renderCell: (p) => p.value || '—' },
        { field: 'status', headerName: 'Status', width: 150, align: 'center', headerAlign: 'center',
          renderCell: (p) => {
            const color = p.value === 'sent' ? '#2e7d32' : p.value === 'failed' ? '#c62828' : '#e65100';
            const bg = p.value === 'sent' ? '#e8f5e9' : p.value === 'failed' ? '#ffebee' : '#fff3e0';
            return <Chip label={p.value} size="small" sx={{ backgroundColor: bg, color, fontWeight: 600 }} />;
          } },
    ];

    return (
        <Box sx={{ width: '100%' }}>
            <SmsWalletToolbar setAddOpen={setAddOpen} />

            {summary.exhausted && (
                <Box sx={{ mb: 2, p: 2, borderRadius: 1, backgroundColor: '#ffebee', border: '1px solid #ef9a9a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#c62828', fontWeight: 600 }}>
                        Your SMS balance is exhausted — alert SMS sends will be skipped until a new package is added.
                    </Typography>
                    <Chip label="Exhausted" sx={{ backgroundColor: '#c62828', color: '#fff', fontWeight: 700 }} />
                </Box>
            )}

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<ShoppingCartIcon />} label="Total SMS Purchased" value={summary.totalPurchased.toLocaleString()} sub="All time" color="#1565c0" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<SmsIcon />} label="SMS Remaining" value={summary.remaining.toLocaleString()} sub={`${usagePct}% used`} color={summary.exhausted ? '#c62828' : '#e65100'} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<MarkChatReadIcon />} label="SMS Sent (All Time)" value={summary.totalSent.toLocaleString()} sub="Total sent" color="#6a1b9a" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<TodayIcon />} label="SMS Sent Today" value={summary.sentToday.toLocaleString()} sub={new Date().toLocaleDateString()} color="#2e7d32" />
                </Grid>
            </Grid>

            <Card elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>SMS Balance Usage</Typography>
                        {summary.exhausted && <Chip label="Exhausted" size="small" sx={{ backgroundColor: '#c62828', color: '#fff' }} />}
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={usagePct}
                        sx={{ height: 10, borderRadius: 5, backgroundColor: '#eceff1', '& .MuiLinearProgress-bar': { backgroundColor: summary.exhausted ? '#ef9a9a' : '#1565c0' } }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography sx={{ fontSize: 12, color: '#78909c' }}>Used: {summary.totalSent.toLocaleString()}</Typography>
                        <Typography sx={{ fontSize: 12, color: '#78909c' }}>Remaining: {summary.remaining.toLocaleString()} / {summary.totalPurchased.toLocaleString()}</Typography>
                    </Box>
                </CardContent>
            </Card>

            <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontWeight: 700, mb: 1, fontFamily: 'Roboto Slab' }}>SMS Package Purchase History</Typography>
                <Box sx={{ height: 350 }}>
                    <DataGrid
                        rows={purchaseHistory}
                        columns={purchaseColumns}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 25]}
                        disableSelectionOnClick
                        getRowId={(row) => row.id}
                        sx={{ backgroundColor: '#fff' }}
                    />
                </Box>
            </Box>

            <Box>
                <Typography sx={{ fontWeight: 700, mb: 1, fontFamily: 'Roboto Slab' }}>Alert SMS Send Log</Typography>
                <Box sx={{ height: 400 }}>
                    <DataGrid
                        rows={sendLog}
                        columns={sendLogColumns}
                        pageSize={10}
                        rowsPerPageOptions={[10, 25, 50]}
                        disableSelectionOnClick
                        getRowId={(row) => row.id}
                        sx={{ backgroundColor: '#fff' }}
                    />
                </Box>
            </Box>

            <AddSmsPackageModal
                open={addOpen}
                setOpen={setAddOpen}
                remaining={summary.remaining}
                setRefreshData={setRefreshData}
            />
        </Box>
    );
};

export default SmsWallet;
