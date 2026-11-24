import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Chip,
  Stack,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import NotificationBar from '../GlobleFiles/ServiceNotificationBar';
import {
  GetSpcDashboardList,
  GetSpcDashboardDetail,
  GetSpcDashboardStats,
  GetSpcParameterDetail,
} from '../../ApiService/LoginPageService';

const SPCDashboard = () => {
  const [dashboardType, setDashboardType] = useState('Production');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState([]);

  // Detail Modal States
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailSelectedMonth, setDetailSelectedMonth] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}`;
  });

  // Stats Modal States
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsData, setStatsData] = useState(null);

  const [selectedRow, setSelectedRow] = useState(null);

  // Parameter Modal States
  const [paramModalOpen, setParamModalOpen] = useState(false);
  const [paramLoading, setParamLoading] = useState(false);
  const [paramRecords, setParamRecords] = useState([]);
  const [selectedParamRow, setSelectedParamRow] = useState(null);


  // Notification Bar state
  const [notification, setNotification] = useState({
    status: false,
    type: 'success',
    message: '',
  });

  const showNotification = useCallback((type, message) => {
    setNotification({
      status: true,
      type,
      message,
    });
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, status: false }));
  }, []);

  // Fetch Dashboard Data
  const fetchDashboardData = (type) => {
    setLoading(true);
    GetSpcDashboardList(
      type,
      (response) => {
        setLoading(false);
        if (response && response.success) {
          setDashboardData(response.data || []);
        } else {
          setDashboardData([]);
          showNotification('error', response?.message || 'Failed to fetch dashboard data');
        }
      },
      (error, errorMessage) => {
        setLoading(false);
        setDashboardData([]);
        showNotification('error', errorMessage || 'Server Error. Failed to fetch dashboard data.');
      }
    );
  };

  // Fetch data on type change or component mount
  useEffect(() => {
    fetchDashboardData(dashboardType);
  }, [dashboardType]);

  const handleTypeChange = (event) => {
    setDashboardType(event.target.value);
  };

  const fetchDetailData = useCallback((row, month, type) => {
    if (!row) return;
    setDetailLoading(true);
    
    let formattedMonth = '';
    if (month) {
      const [yyyy, mm] = month.split('-');
      formattedMonth = `${mm}/${yyyy}`;
    }

    GetSpcDashboardDetail(
      row.id,
      type,
      formattedMonth,
      (response) => {
        setDetailLoading(false);
        if (response && response.success) {
          setDetailData(response.data || null);
        } else {
          setDetailData(null);
          showNotification('error', response?.message || 'Failed to fetch quality parameter details');
        }
      },
      (error, errorMessage) => {
        setDetailLoading(false);
        setDetailData(null);
        showNotification('error', errorMessage || 'Server Error. Failed to fetch details.');
      }
    );
  }, [showNotification]);

  // Handle click on View Details eye icon
  const handleEyeClick = useCallback((row) => {
    setSelectedRow(row);
    setDetailModalOpen(true);
    fetchDetailData(row, detailSelectedMonth, dashboardType);
  }, [dashboardType, detailSelectedMonth, fetchDetailData]);

  const handleDetailMonthChange = (e) => {
    const newMonth = e.target.value;
    setDetailSelectedMonth(newMonth);
    if (selectedRow) {
      fetchDetailData(selectedRow, newMonth, dashboardType);
    }
  };

  // Handle click on Stats Report chart icon (Opens Dialog modal now)
  const handleChartClick = useCallback((row) => {
    setSelectedRow(row);
    setStatsLoading(true);
    setStatsModalOpen(true);

    GetSpcDashboardStats(
      row.id,
      dashboardType,
      (response) => {
        setStatsLoading(false);
        if (response && response.success) {
          setStatsData(response.data || null);
        } else {
          setStatsData(null);
          showNotification('error', response?.message || 'Failed to fetch SPC statistics');
        }
      },
      (error, errorMessage) => {
        setStatsLoading(false);
        setStatsData(null);
        showNotification('error', errorMessage || 'Server Error. Failed to fetch stats.');
      }
    );
  }, [dashboardType, showNotification]);

  const handleCloseDetailModal = useCallback(() => {
    setDetailModalOpen(false);
    setDetailData(null);
    setSelectedRow(null);
  }, []);

  const handleCloseStatsModal = useCallback(() => {
    setStatsModalOpen(false);
    setStatsData(null);
    setSelectedRow(null);
  }, []);

  const fetchParameterRecords = useCallback((parameter, month) => {
    if (!selectedRow || !parameter) return;
    setParamLoading(true);
    
    const [yyyy, mm] = month.split('-');
    const formattedMonth = `${mm}/${yyyy}`;

    const data = {
      type: dashboardType,
      month: formattedMonth,
    };

    GetSpcParameterDetail(
      selectedRow.id,
      parameter,
      data,
      (response) => {
        setParamLoading(false);
        if (response && response.success) {
          setParamRecords(response.data?.data || []);
        } else {
          setParamRecords([]);
          showNotification('error', response?.message || 'Failed to fetch parameter records');
        }
      },
      (error, errorMessage) => {
        setParamLoading(false);
        setParamRecords([]);
        showNotification('error', errorMessage || 'Server Error. Failed to fetch records.');
      }
    );
  }, [selectedRow, dashboardType, showNotification]);

  const handleParamRowClick = useCallback((parameter) => {
    setSelectedParamRow(parameter);
    setParamModalOpen(true);
    fetchParameterRecords(parameter, detailSelectedMonth);
  }, [fetchParameterRecords, detailSelectedMonth]);

  const handleCloseParamModal = () => {
    setParamModalOpen(false);
    setSelectedParamRow(null);
    setParamRecords([]);
  };

  const handleDownloadRecords = () => {
    if (!paramRecords || paramRecords.length === 0) return;
    
    const headers = ['Date', 'Value', 'QC Test No', 'JC No', 'Item Code', 'Added By'];
    
    const rows = paramRecords.map(record => [
      record.date || '',
      record.value !== null && record.value !== undefined ? record.value : '',
      record.record?.qcTestNo || '',
      record.record?.jcNo || '',
      record.record?.itemCode || '',
      record.record?.addedBy || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Parameter_Records_${selectedParamRow}_${detailSelectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format rows with proper indices and formatted references (Memoized)
  const rowData = useMemo(() => {
    return dashboardData.map((row, index) => ({
      sNo: index + 1,
      ...row,
      formattedReferences: row.references ? row.references.replaceAll(',', ' / ') : '-',
    }));
  }, [dashboardData]);

  // Columns configuration for standard DataGrid
  const columns = useMemo(() => [
    {
      field: 'sNo',
      headerClassName: 'super-app-theme--header',
      headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Sl.No</span>,
      width: 80,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
    },
    {
      field: 'spcId',
      headerClassName: 'super-app-theme--header',
      headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>SPC ID</span>,
      minWidth: 120,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'formattedReferences',
      headerClassName: 'super-app-theme--header',
      headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Reference</span>,
      minWidth: 200,
      flex: 1.5,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'productName',
      headerClassName: 'super-app-theme--header',
      headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Process</span>,
      minWidth: 150,
      flex: 1.2,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'parameter',
      headerClassName: 'super-app-theme--header',
      headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Quality Parameter</span>,
      minWidth: 180,
      flex: 1.2,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'range',
      headerClassName: 'super-app-theme--header',
      headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Range</span>,
      width: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'value',
      headerClassName: 'super-app-theme--header',
      headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Value</span>,
      width: 90,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerClassName: 'super-app-theme--header',
      headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>View Opt</span>,
      width: 160,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1.5} justifyContent="center" alignItems="center">
          <Tooltip title="View Quality Parameter Details">
            <IconButton
              size="small"
              onClick={() => handleEyeClick(params.row)}
              sx={{
                backgroundColor: '#0A2540',
                color: '#FFFFFF',
                width: '42px',
                height: '32px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#1E3A5F',
                  transform: 'scale(1.08)',
                },
              }}
            >
              <VisibilityIcon sx={{ fontSize: '18px' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="View SPC Stats & Charts">
            <IconButton
              size="small"
              onClick={() => handleChartClick(params.row)}
              sx={{
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                width: '42px',
                height: '32px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#0369A1',
                  transform: 'scale(1.08)',
                },
              }}
            >
              <BarChartIcon sx={{ fontSize: '18px' }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [handleEyeClick, handleChartClick]);

  // Table styling cell declarations for capability tables (balanced padding for both screens)
  const labelCellStyle = {
    width: '65%',
    textAlign: 'right',
    padding: '4px 10px',
    fontSize: '12px',
    color: '#475569',
    fontWeight: 500,
    borderBottom: '1px solid #E2E8F0',
    borderRight: '1px solid #E2E8F0',
  };

  const symbolCellStyle = {
    width: '15%',
    textAlign: 'right',
    padding: '4px 10px',
    fontSize: '12px',
    color: '#1E293B',
    fontWeight: 600,
    borderBottom: '1px solid #E2E8F0',
    borderRight: '1px solid #E2E8F0',
  };

  const valueCellStyle = (bgColor) => ({
    width: '20%',
    textAlign: 'center',
    padding: '4px 10px',
    fontSize: '13px',
    color: '#0F172A',
    fontWeight: 700,
    borderBottom: '1px solid #E2E8F0',
    backgroundColor: bgColor || '#FFFFFF',
  });

  return (
    <div style={{ height: '70vh', width: '100%', padding: '10px' }}>
      <NotificationBar
        handleClose={handleCloseNotification}
        notificationForm={notification}
      />

      {/* Title & Filter Header block matching standard application screens */}
      <Box
        sx={{
          mb: '10px',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginLeft: '10px',
          marginRight: '10px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Typography
            sx={{ m: 1, fontFamily: 'Roboto Slab', fontWeight: 'bold' }}
            variant="h5"
          >
            SPC Dashboard
          </Typography>
        </div>

        {/* Dropdown alignment on the right, matching standard parameters/options controls */}
        <Box sx={{ m: 1 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={dashboardType}
                  onChange={handleTypeChange}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    color: '#000000',
                    border: '1px solid #CBD5E1',
                    height: '36px',
                  }}
                >
                  <MenuItem value="Production">Production</MenuItem>
                  <MenuItem value="Assembly">Assembly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Grid Panel Card matching standard system style */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '-10px' }}>
        <Card
          style={{
            boxShadow: '0 10px 10px 2px rgba(0, 0, 0, 0.2)',
            marginTop: '10px',
            borderRadius: '10px',
            width: '98%',
            height: '100%',
          }}
        >
          <CardContent>
            <Box sx={{ height: '62vh', width: '100%' }}>
              <DataGrid
                rows={rowData}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                loading={loading}
                disableSelectionOnClick
                style={{ border: 'none' }}
                sx={{
                  overflow: 'auto',
                  width: '100%',
                  '& .super-app-theme--header': {
                    WebkitTextStrokeWidth: '0.6px',
                    backgroundColor: '#93bce6',
                    color: '#1c1919',
                  },
                  '& .MuiDataGrid-cell': {
                    border: '1px solid #969696',
                  },
                  '& .MuiDataGrid-columnHeader': {
                    border: '1px solid #969696',
                  },
                }}
                getRowClassName={(params) => {
                  // O(1) row class calculation using the already mapped sNo
                  return params.row.sNo % 2 !== 0 ? 'Mui-evenRow' : 'Mui-oddRow';
                }}
                rowHeight={42}
                columnHeaderHeight={42}
              />
            </Box>
          </CardContent>
        </Card>
      </div>

      {/* Quality Parameter Details Modal - Standard background color styled */}
      <Dialog
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '12px',
            padding: '5px',
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 1.5, background: '#002D68', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold', color: 'white' }}>
            Quality Parameter Details
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseDetailModal}
            sx={{
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress size={40} sx={{ color: '#002D68' }} />
            </Box>
          ) : detailData ? (
            <Box sx={{ p: 1 }}>
              <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontWeight="bold" color="textSecondary">
                    Filter by Month:
                  </Typography>
                  <input
                    type="month"
                    value={detailSelectedMonth}
                    onChange={handleDetailMonthChange}
                    style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #BCCCDC', fontFamily: 'Inter', outline: 'none' }}
                  />
                </Box>
              </Box>
              {/* Header Info Block */}
              <Box
                sx={{
                  border: '1px solid #BCCCDC',
                  borderRadius: '8px',
                  p: 2,
                  mb: 2.5,
                  backgroundColor: '#F8FAFC',
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" mb={1}>
                      <Typography sx={{ minWidth: '150px', fontWeight: 'bold', color: '#1E293B' }}>Process</Typography>
                      <Typography sx={{ color: '#475569' }}>: {selectedRow?.productName || '-'}</Typography>
                    </Box>
                    <Box display="flex" mb={1}>
                      <Typography sx={{ minWidth: '150px', fontWeight: 'bold', color: '#1E293B' }}>QC Parameter</Typography>
                      <Typography sx={{ color: '#475569' }}>: {selectedRow?.parameter || '-'}</Typography>
                    </Box>
                    <Box display="flex">
                      <Typography sx={{ minWidth: '150px', fontWeight: 'bold', color: '#1E293B' }}>Reference Header</Typography>
                      <Typography sx={{ color: '#475569' }}>: {selectedRow?.references?.split(',').join(' / ') || '-'}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box display="flex" mb={1}>
                      <Typography sx={{ minWidth: '150px', fontWeight: 'bold', color: '#1E293B' }}>Expected Value</Typography>
                      <Typography sx={{ color: '#475569' }}>: {detailData.expVal ? `${detailData.expVal} mm` : '-'}</Typography>
                    </Box>
                    <Box display="flex" mb={1}>
                      <Typography sx={{ minWidth: '150px', fontWeight: 'bold', color: '#1E293B' }}>Max Tolerance</Typography>
                      <Typography sx={{ color: '#475569' }}>: {detailData.maxTolerance ? `${detailData.maxTolerance} mm` : '-'}</Typography>
                    </Box>
                    <Box display="flex">
                      <Typography sx={{ minWidth: '150px', fontWeight: 'bold', color: '#1E293B' }}>Min Tolerance</Typography>
                      <Typography sx={{ color: '#475569' }}>: {detailData.minTolerance ? `${detailData.minTolerance} mm` : '-'}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box display="flex" mb={1}>
                      <Typography sx={{ minWidth: '150px', fontWeight: 'bold', color: '#1E293B' }}>Visual</Typography>
                      <Typography sx={{ color: '#475569' }}>: {detailData.expVisInspec || 'Free from Scratch, Damage, Rust'}</Typography>
                    </Box>
                    <Box display="flex">
                      <Typography sx={{ minWidth: '150px', fontWeight: 'bold', color: '#1E293B' }}>Evaluation Method</Typography>
                      <Typography sx={{ color: '#475569' }}>: {detailData.evalMethod || '-'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Subgroups Table or standard Empty State */}
              {!detailData.dates || detailData.dates.length === 0 ? (
                <Box
                  sx={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    p: 6,
                    textAlign: 'center',
                    backgroundColor: '#F8FAFC',
                    mt: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ fontFamily: 'Inter, sans-serif', color: '#64748B', fontWeight: 600, mb: 1 }}>
                    No Subgroup Measurements Found
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', color: '#94A3B8' }}>
                    There are no recorded measurements or dates for this parameter yet.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ border: '1px solid #BCCCDC', borderRadius: '8px', overflow: 'auto', mt: 3 }}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          align="center"
                          sx={{
                            backgroundColor: '#93BCE6',
                            color: '#1C1919',
                            fontWeight: 'bold',
                            fontFamily: 'Inter',
                            borderRight: '1px solid #BCCCDC',
                            borderBottom: '1px solid #BCCCDC',
                            padding: '12px',
                            width: '120px',
                          }}
                        >
                          PARAMETER
                        </TableCell>
                        {detailData.dates?.map((date) => (
                          <TableCell
                            key={date}
                            align="center"
                            sx={{
                              backgroundColor: '#93BCE6',
                              color: '#1C1919',
                              fontWeight: 'bold',
                              fontFamily: 'Inter',
                              borderRight: '1px solid #BCCCDC',
                              borderBottom: '1px solid #BCCCDC',
                              padding: '12px',
                              fontSize: '13px',
                              lineHeight: 1.2,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {`DATE:\n${date}`}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detailData.tableData?.map((row, index) => {
                        const isSpecialRow = row.parameter === 'Xbar' || row.parameter === 'R';
                        return (
                          <TableRow
                            key={row.parameter || index}
                            onClick={!isSpecialRow ? () => handleParamRowClick(row.parameter) : undefined}
                            sx={{
                              backgroundColor: row.parameter === 'Xbar' ? '#F1F5F9' : '#FFFFFF',
                              cursor: !isSpecialRow ? 'pointer' : 'default',
                              '&:hover': {
                                backgroundColor: '#E2E8F0',
                              },
                            }}
                          >
                            <TableCell
                              align="center"
                              sx={{
                                backgroundColor: '#4B6584',
                                color: '#FFFFFF',
                                fontWeight: 'bold',
                                fontFamily: 'Inter',
                                borderRight: '1px solid #BCCCDC',
                                borderBottom: '1px solid #BCCCDC',
                                padding: '12px',
                              }}
                            >
                              {row.parameter}
                            </TableCell>
                            {detailData.dates?.map((date) => {
                              const val = row[date];
                              return (
                                <TableCell
                                  key={date}
                                  align="center"
                                  sx={{
                                    fontFamily: 'Inter',
                                    fontWeight: isSpecialRow ? 'bold' : 'normal',
                                    fontSize: '14px',
                                    color: '#000000',
                                    borderRight: '1px solid #BCCCDC',
                                    borderBottom: '1px solid #BCCCDC',
                                    padding: '12px',
                                  }}
                                >
                                  {val !== null && val !== undefined ? val : '-'}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <Typography variant="body1" color="textSecondary">
                No detail data found for this entry.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* SPC Stats Dialog (Optimized layout & standard background color styled) */}
      <Dialog
        open={statsModalOpen}
        onClose={handleCloseStatsModal}
        maxWidth="xl"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '12px',
            padding: '5px',
            maxHeight: '95vh',
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 1.5, background: '#002D68', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold', color: 'white' }}>
            SPC Stats Dashboard
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseStatsModal}
            sx={{
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 1.5, overflowY: 'auto' }}>
          {statsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <CircularProgress size={45} sx={{ color: '#002D68' }} />
            </Box>
          ) : statsData ? (
            <Box>
              {/* Header Pills */}
              <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, px: 0.5 }}>
                <Chip
                  label={statsData.parameter || 'Hex hole'}
                  sx={{
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontWeight: 600,
                    borderRadius: '6px',
                    fontFamily: 'Inter',
                    height: '28px',
                  }}
                />
                <Chip
                  label={`n = ${statsData.sampleSize || 3}`}
                  sx={{
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontWeight: 600,
                    borderRadius: '6px',
                    fontFamily: 'Inter',
                    height: '28px',
                  }}
                />
                {/* <Chip
                  label={`${statsData.subgroupCount || 0} subgroups`}
                  sx={{
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontWeight: 600,
                    borderRadius: '6px',
                    fontFamily: 'Inter',
                    height: '28px',
                  }}
                /> */}
              </Stack>

              {/* Side-by-Side Line Charts */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {/* Xbar Chart */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08)', borderRadius: '10px' }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'Inter', color: '#1E293B' }}>
                        Xbar chart
                      </Typography>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart
                          data={(statsData.dates || []).map((date, idx) => ({
                            date: date,
                            xbar: statsData.xbarChart?.values?.[idx] !== undefined ? statsData.xbarChart.values[idx] : null,
                          }))}
                          margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="date" stroke="#64748B" style={{ fontSize: '10px', fontFamily: 'Inter' }} />
                          <YAxis
                            stroke="#64748B"
                            domain={[
                              (dataMin) => Math.min(dataMin, statsData.xbarChart?.yMin || 0) * 0.99,
                              (dataMax) => Math.max(dataMax, statsData.xbarChart?.yMax || 1) * 1.01,
                            ]}
                            tickFormatter={(val) => val.toFixed(2)}
                            style={{ fontSize: '10px', fontFamily: 'Inter' }}
                          />
                          <ChartTooltip contentStyle={{ fontFamily: 'Inter', borderRadius: '8px', fontSize: '12px' }} />
                          <Line
                            type="monotone"
                            dataKey="xbar"
                            stroke="#16A34A"
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                            label={{ fill: '#0F172A', fontSize: 10, dy: -8, fontWeight: 'bold' }}
                          />
                          {statsData.xbarChart?.target !== undefined && (
                            <ReferenceLine
                              y={statsData.xbarChart.target}
                              stroke="#2563EB"
                              strokeDasharray="4 4"
                              label={{
                                value: `Target: ${statsData.xbarChart.target}`,
                                position: 'insideBottomLeft',
                                fill: '#2563EB',
                                fontFamily: 'Inter',
                                fontSize: '10px',
                                fontWeight: 'bold',
                              }}
                            />
                          )}
                          {statsData.xbarChart?.yMax !== undefined && (
                            <ReferenceLine
                              y={statsData.xbarChart.yMax}
                              stroke="#EF4444"
                              strokeDasharray="4 4"
                              label={{
                                value: `yMax: ${statsData.xbarChart.yMax}`,
                                position: 'insideTopLeft',
                                fill: '#EF4444',
                                fontFamily: 'Inter',
                                fontSize: '10px',
                                fontWeight: 'bold',
                              }}
                            />
                          )}
                          {statsData.xbarChart?.yMin !== undefined && (
                            <ReferenceLine
                              y={statsData.xbarChart.yMin}
                              stroke="#EF4444"
                              strokeDasharray="4 4"
                              label={{
                                value: `yMin: ${statsData.xbarChart.yMin}`,
                                position: 'insideBottomLeft',
                                fill: '#EF4444',
                                fontFamily: 'Inter',
                                fontSize: '10px',
                                fontWeight: 'bold',
                              }}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* R Chart */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08)', borderRadius: '10px' }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'Inter', color: '#1E293B' }}>
                        R chart
                      </Typography>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart
                          data={(statsData.dates || []).map((date, idx) => ({
                            date: date,
                            r: statsData.rChart?.values?.[idx] !== undefined ? statsData.rChart.values[idx] : null,
                          }))}
                          margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="date" stroke="#64748B" style={{ fontSize: '10px', fontFamily: 'Inter' }} />
                          <YAxis
                            stroke="#64748B"
                            domain={[
                              (dataMin) => Math.min(dataMin, statsData.rChart?.yMin || 0) * 0.9,
                              (dataMax) => Math.max(dataMax, statsData.rChart?.yMax || 0.1) * 1.1,
                            ]}
                            tickFormatter={(val) => val.toFixed(2)}
                            style={{ fontSize: '10px', fontFamily: 'Inter' }}
                          />
                          <ChartTooltip contentStyle={{ fontFamily: 'Inter', borderRadius: '8px', fontSize: '12px' }} />
                          <Line
                            type="monotone"
                            dataKey="r"
                            stroke="#16A34A"
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                            label={{ fill: '#0F172A', fontSize: 10, dy: -8, fontWeight: 'bold' }}
                          />
                          {statsData.rChart?.yMax !== undefined && (
                            <ReferenceLine
                              y={statsData.rChart.yMax}
                              stroke="#EF4444"
                              strokeDasharray="4 4"
                              label={{
                                value: `yMax: ${statsData.rChart.yMax}`,
                                position: 'insideTopLeft',
                                fill: '#EF4444',
                                fontFamily: 'Inter',
                                fontSize: '10px',
                                fontWeight: 'bold',
                              }}
                            />
                          )}
                          {statsData.rChart?.yMin !== undefined && (
                            <ReferenceLine
                              y={statsData.rChart.yMin}
                              stroke="#EF4444"
                              strokeDasharray="4 4"
                              label={{
                                value: `yMin: ${statsData.rChart.yMin}`,
                                position: 'insideBottomLeft',
                                fill: '#EF4444',
                                fontFamily: 'Inter',
                                fontSize: '10px',
                                fontWeight: 'bold',
                              }}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Side-by-Side Cp & Cpk Tables - Stretched to match heights perfectly */}
              <Grid container spacing={2} alignItems="stretch">
                {/* Cp table */}
                <Grid item xs={12} md={6} style={{ display: 'flex' }}>
                  <Card sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                    <Box sx={{ backgroundColor: '#D9E2EC', px: 2, py: 1, borderBottom: '1px solid #BCCCDC' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontFamily: 'Inter', color: '#0F2C59' }}>
                        Cp
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', fontFamily: 'Inter', tableLayout: 'fixed' }}>
                        <colgroup>
                          <col style={{ width: '65%' }} />
                          <col style={{ width: '15%' }} />
                          <col style={{ width: '20%' }} />
                        </colgroup>
                        <tbody>
                          <tr>
                            <td style={labelCellStyle}>Lower Engineering Specification Limit:</td>
                            <td style={symbolCellStyle}>LSL =</td>
                            <td style={valueCellStyle('#FEF08A')}>{statsData.capability?.LSL !== undefined ? statsData.capability.LSL : '-'}</td>
                          </tr>
                          <tr>
                            <td style={labelCellStyle}>Upper Engineering Specification Limit:</td>
                            <td style={symbolCellStyle}>USL =</td>
                            <td style={valueCellStyle('#FEF08A')}>{statsData.capability?.USL !== undefined ? statsData.capability.USL : '-'}</td>
                          </tr>
                          <tr>
                            <td style={labelCellStyle}>Engineering Target (Used only if spec is two-sided):</td>
                            <td style={symbolCellStyle}>T =</td>
                            <td style={valueCellStyle('#FEF08A')}>{statsData.capability?.target !== undefined ? statsData.capability.target : '-'}</td>
                          </tr>
                          <tr>
                            <td style={labelCellStyle}>Average Range from control chart:</td>
                            <td style={symbolCellStyle}>Rbar =</td>
                            <td style={valueCellStyle('#FEF08A')}>{statsData.capability?.Rbar !== undefined ? statsData.capability.Rbar : '-'}</td>
                          </tr>
                          <tr>
                            <td style={labelCellStyle}>Number of measurements in each sample for which a range was calculated:</td>
                            <td style={symbolCellStyle}>n =</td>
                            <td style={valueCellStyle('#FEF08A')}>{statsData.capability?.n !== undefined ? statsData.capability.n : '-'}</td>
                          </tr>
                          <tr>
                            <td style={labelCellStyle}>Appropriate d2 for the sample of size n:</td>
                            <td style={symbolCellStyle}>d2 =</td>
                            <td style={valueCellStyle('#FFFFFF')}>{statsData.capability?.d2 !== undefined ? statsData.capability.d2 : '-'}</td>
                          </tr>
                          <tr>
                            <td style={labelCellStyle}>
                              Natural Variation of the process:
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 'normal', marginTop: '2px' }}>
                                NV = 6 * Rbar / d2
                              </span>
                            </td>
                            <td style={symbolCellStyle}>NV =</td>
                            <td style={valueCellStyle('#FEF08A')}>{statsData.capability?.NV !== undefined ? statsData.capability.NV : '-'}</td>
                          </tr>
                          <tr>
                            <td style={labelCellStyle}>
                              Potential Process Capability:
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 'normal', marginTop: '2px' }}>
                                Cp = ET / NV
                              </span>
                            </td>
                            <td style={symbolCellStyle}>Cp =</td>
                            <td style={valueCellStyle('#93C5FD')}>{statsData.capability?.Cp !== undefined ? statsData.capability.Cp : '-'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Cpk table */}
                <Grid item xs={12} md={6} style={{ display: 'flex' }}>
                  <Card sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                    <Box sx={{ backgroundColor: '#D9E2EC', px: 2, py: 1, borderBottom: '1px solid #BCCCDC' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontFamily: 'Inter', color: '#0F2C59' }}>
                        Cpk
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', fontFamily: 'Inter', tableLayout: 'fixed' }}>
                        <colgroup>
                          <col style={{ width: '65%' }} />
                          <col style={{ width: '15%' }} />
                          <col style={{ width: '20%' }} />
                        </colgroup>
                        <tbody>
                          <tr>
                            <td style={labelCellStyle}>Process Average from control chart:</td>
                            <td style={symbolCellStyle}>Xbar =</td>
                            <td style={valueCellStyle('#FEF08A')}>{statsData.capability?.Xbar !== undefined ? statsData.capability.Xbar : '-'}</td>
                          </tr>
                          <tr>
                            <td style={labelCellStyle}>
                              Upper Available Tolerance:
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 'normal', marginTop: '2px' }}>
                                UAT = USL - Xbar
                              </span>
                            </td>
                            <td style={symbolCellStyle}>UAT =</td>
                            <td style={valueCellStyle('#FFFFFF')}>{statsData.capability?.UAT !== undefined ? statsData.capability.UAT : '-'}</td>
                          </tr>
                          <tr>
                            <td style={labelCellStyle}>
                              Lower Available Tolerance:
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 'normal', marginTop: '2px' }}>
                                LAT = Xbar - LSL
                              </span>
                            </td>
                            <td style={symbolCellStyle}>LAT =</td>
                            <td style={valueCellStyle('#FFFFFF')}>{statsData.capability?.LAT !== undefined ? statsData.capability.LAT : '-'}</td>
                          </tr>
                          <tr>
                            <td style={labelCellStyle}>
                              Upper Process Capability Index:
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 'normal', marginTop: '2px' }}>
                                CpU = 3 * UAT / NV
                              </span>
                            </td>
                            <td style={symbolCellStyle}>CpU =</td>
                            <td style={valueCellStyle('#FFFFFF')}>{statsData.capability?.CpU !== undefined ? statsData.capability.CpU : '-'}</td>
                          </tr>
                          <tr>
                            <td style={labelCellStyle}>
                              Lower Process Capability Index:
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 'normal', marginTop: '2px' }}>
                                CpL = 3 * LAT / NV
                              </span>
                            </td>
                            <td style={symbolCellStyle}>CpL =</td>
                            <td style={valueCellStyle('#FFFFFF')}>{statsData.capability?.CpL !== undefined ? statsData.capability.CpL : '-'}</td>
                          </tr>
                          <tr>
                            <td style={labelCellStyle}>
                              Process Capability Index:
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 'normal', marginTop: '2px' }}>
                                Cpk = min(CpU, CpL)
                              </span>
                            </td>
                            <td style={symbolCellStyle}>Cpk =</td>
                            <td style={valueCellStyle('#93C5FD')}>{statsData.capability?.Cpk !== undefined ? statsData.capability.Cpk : '-'}</td>
                          </tr>
                          <tr>
                            <td style={labelCellStyle}>
                              Modified Capability Index:
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 'normal', marginTop: '2px' }}>
                                Cpk' = min(Cp, Cpk)
                              </span>
                            </td>
                            <td style={symbolCellStyle}>Cpk' =</td>
                            <td style={valueCellStyle('#FFFFFF')}>{statsData.capability?.Cpk !== undefined ? statsData.capability.Cpk : '-'}</td>
                          </tr>
                          {/* 1 Empty spacer row to align exactly with the 8 rows in Cp table */}
                          <tr>
                            <td style={labelCellStyle}>&nbsp;</td>
                            <td style={symbolCellStyle}>&nbsp;</td>
                            <td style={valueCellStyle('#FFFFFF')}>&nbsp;</td>
                          </tr>
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <Typography variant="body1" color="textSecondary">
                No stats data found for this entry.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        maxWidth="md"
        fullWidth
        open={paramModalOpen}
        onClose={handleCloseParamModal}
        PaperProps={{
          sx: {
            borderRadius: '12px',
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 1.5, background: '#002D68', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold', color: 'white' }}>
            Parameter Records: {selectedParamRow}
          </Typography>
          <Box>
            <IconButton onClick={handleDownloadRecords} sx={{ color: 'white', mr: 1 }} disabled={paramRecords.length === 0}>
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={handleCloseParamModal} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: '300px', p: 2 }}>
          <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold" color="textSecondary">
                Month:
              </Typography>
              <Typography variant="body1" sx={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: '#F8FAFC', border: '1px solid #BCCCDC', fontFamily: 'Inter' }}>
                {detailSelectedMonth}
              </Typography>
            </Box>
          </Box>
          {paramLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <CircularProgress size={40} sx={{ color: '#002D68' }} />
            </Box>
          ) : paramRecords.length === 0 ? (
            <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '8px', p: 4, textAlign: 'center', backgroundColor: '#F8FAFC', mt: 1 }}>
              <Typography variant="h6" sx={{ color: '#64748B', fontWeight: 600, mb: 1 }}>
                No Records Found
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                There are no detailed records for parameter {selectedParamRow} in this month.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ border: '1px solid #BCCCDC', borderRadius: '8px', overflow: 'auto', mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Date', 'Value', 'QC Test No', 'JC No', 'Item Code', 'Added By'].map(head => (
                      <TableCell
                        key={head}
                        align="center"
                        sx={{ backgroundColor: '#F1F5F9', color: '#1E293B', fontWeight: 'bold', fontFamily: 'Inter', borderBottom: '1px solid #BCCCDC', p: 1.5 }}
                      >
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paramRecords.map((recordItem, idx) => (
                    <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell align="center">{recordItem.date}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>{recordItem.value}</TableCell>
                      <TableCell align="center">{recordItem.record?.qcTestNo || '-'}</TableCell>
                      <TableCell align="center">{recordItem.record?.jcNo || '-'}</TableCell>
                      <TableCell align="center">{recordItem.record?.itemCode || '-'}</TableCell>
                      <TableCell align="center">{recordItem.record?.addedBy || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SPCDashboard;
