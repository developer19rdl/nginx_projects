// import React, { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Grid,
//   CircularProgress,
//   Chip,
//   Stack,
//   Paper,
// } from '@mui/material';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   ReferenceLine,
// } from 'recharts';
// import NotificationBar from '../GlobleFiles/ServiceNotificationBar';
// import { GetSpcDashboardStats } from '../../ApiService/LoginPageService';

// const SPCStatsReport = () => {
//   const location = useLocation();
//   const searchParams = new URLSearchParams(location.search);
//   const id = searchParams.get('id');
//   const type = searchParams.get('type');

//   const [loading, setLoading] = useState(false);
//   const [statsData, setStatsData] = useState(null);

//   // Notification Bar state
//   const [notification, setNotification] = useState({
//     status: false,
//     type: 'success',
//     message: '',
//   });

//   const showNotification = (type, message) => {
//     setNotification({
//       status: true,
//       type,
//       message,
//     });
//   };

//   const handleCloseNotification = () => {
//     setNotification((prev) => ({ ...prev, status: false }));
//   };

//   // Fetch Stats Data
//   const fetchStatsData = () => {
//     if (!id || !type) {
//       showNotification('error', 'Missing ID or Type parameters in URL');
//       return;
//     }
//     setLoading(true);
//     GetSpcDashboardStats(
//       id,
//       type,
//       (response) => {
//         setLoading(false);
//         if (response && response.success) {
//           setStatsData(response.data);
//         } else {
//           setStatsData(null);
//           showNotification('error', response?.message || 'Failed to fetch stats data');
//         }
//       },
//       (error, errorMessage) => {
//         setLoading(false);
//         setStatsData(null);
//         showNotification('error', errorMessage || 'Server Error. Failed to fetch stats data.');
//       }
//     );
//   };

//   useEffect(() => {
//     fetchStatsData();
//   }, [id, type]);

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
//         <CircularProgress size={50} sx={{ color: '#002D68' }} />
//       </Box>
//     );
//   }

//   if (!statsData) {
//     return (
//       <Box sx={{ p: 4, textAlign: 'center' }}>
//         <NotificationBar handleClose={handleCloseNotification} notificationForm={notification} />
//         <Typography variant="h6" color="textSecondary">
//           No stats data found for this record.
//         </Typography>
//       </Box>
//     );
//   }

//   // Prep Recharts data
//   const chartData = (statsData.dates || []).map((date, idx) => ({
//     date: date,
//     xbar: statsData.xbarChart?.values?.[idx] !== undefined ? statsData.xbarChart.values[idx] : null,
//     r: statsData.rChart?.values?.[idx] !== undefined ? statsData.rChart.values[idx] : null,
//   }));

//   const { capability = {} } = statsData;

//   // Custom table styling constants
//   const labelCellStyle = {
//     width: '65%',
//     textAlign: 'right',
//     padding: '8px 12px',
//     fontSize: '13px',
//     color: '#475569',
//     fontWeight: 500,
//     borderBottom: '1px solid #E2E8F0',
//     borderRight: '1px solid #E2E8F0',
//   };

//   const symbolCellStyle = {
//     width: '15%',
//     textAlign: 'right',
//     padding: '8px 12px',
//     fontSize: '13px',
//     color: '#1E293B',
//     fontWeight: 600,
//     borderBottom: '1px solid #E2E8F0',
//     borderRight: '1px solid #E2E8F0',
//   };

//   const valueCellStyle = (bgColor) => ({
//     width: '20%',
//     textAlign: 'center',
//     padding: '8px 12px',
//     fontSize: '14px',
//     color: '#0F172A',
//     fontWeight: 700,
//     borderBottom: '1px solid #E2E8F0',
//     backgroundColor: bgColor || '#FFFFFF',
//   });

//   return (
//     <Box sx={{ width: '100%', padding: '20px', minHeight: '90vh', backgroundColor: '#F8FAFC' }}>
//       <NotificationBar handleClose={handleCloseNotification} notificationForm={notification} />

//       {/* Main Title & Pills Header */}
//       <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
//         <Typography variant="h5" sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold', color: '#0F2C59' }}>
//           SPC Stats Dashboard
//         </Typography>

//         <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
//           <Chip
//             label={statsData.parameter || 'Hex hole'}
//             sx={{
//               backgroundColor: '#F1F5F9',
//               border: '1px solid #CBD5E1',
//               color: '#334155',
//               fontWeight: 600,
//               borderRadius: '6px',
//               fontFamily: 'Inter',
//             }}
//           />
//           <Chip
//             label={`n = ${statsData.sampleSize || 3}`}
//             sx={{
//               backgroundColor: '#F1F5F9',
//               border: '1px solid #CBD5E1',
//               color: '#334155',
//               fontWeight: 600,
//               borderRadius: '6px',
//               fontFamily: 'Inter',
//             }}
//           />
//           <Chip
//             label={`${statsData.subgroupCount || 0} subgroups`}
//             sx={{
//               backgroundColor: '#F1F5F9',
//               border: '1px solid #CBD5E1',
//               color: '#334155',
//               fontWeight: 600,
//               borderRadius: '6px',
//               fontFamily: 'Inter',
//             }}
//           />
//         </Stack>
//       </Box>

//       {/* Side-by-Side Line Charts */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         {/* Xbar Chart */}
//         <Grid item xs={12} md={6}>
//           <Card sx={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
//             <CardContent>
//               <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Inter', color: '#1E293B' }}>
//                 Xbar chart
//               </Typography>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
//                   <XAxis dataKey="date" stroke="#64748B" style={{ fontSize: '11px', fontFamily: 'Inter' }} />
//                   <YAxis
//                     stroke="#64748B"
//                     domain={[
//                       (dataMin) => Math.min(dataMin, statsData.xbarChart?.yMin || 0) * 0.99,
//                       (dataMax) => Math.max(dataMax, statsData.xbarChart?.yMax || 1) * 1.01,
//                     ]}
//                     tickFormatter={(val) => val.toFixed(3)}
//                     style={{ fontSize: '11px', fontFamily: 'Inter' }}
//                   />
//                   <Tooltip contentStyle={{ fontFamily: 'Inter', borderRadius: '8px' }} />
//                   <Line
//                     type="monotone"
//                     dataKey="xbar"
//                     stroke="#1D4ED8"
//                     strokeWidth={2}
//                     activeDot={{ r: 8 }}
//                     label={{ fill: '#0F172A', fontSize: 11, dy: -10, fontWeight: 'bold' }}
//                   />
//                   {statsData.xbarChart?.target !== undefined && (
//                     <ReferenceLine
//                       y={statsData.xbarChart.target}
//                       stroke="#0D9488"
//                       strokeDasharray="4 4"
//                       label={{
//                         value: `Target: ${statsData.xbarChart.target}`,
//                         position: 'insideBottomLeft',
//                         fill: '#0D9488',
//                         fontFamily: 'Inter',
//                         fontSize: '11px',
//                         fontWeight: 'bold',
//                       }}
//                     />
//                   )}
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* R Chart */}
//         <Grid item xs={12} md={6}>
//           <Card sx={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
//             <CardContent>
//               <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Inter', color: '#1E293B' }}>
//                 R chart
//               </Typography>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
//                   <XAxis dataKey="date" stroke="#64748B" style={{ fontSize: '11px', fontFamily: 'Inter' }} />
//                   <YAxis
//                     stroke="#64748B"
//                     domain={[
//                       (dataMin) => Math.min(dataMin, statsData.rChart?.yMin || 0) * 0.9,
//                       (dataMax) => Math.max(dataMax, statsData.rChart?.yMax || 0.1) * 1.1,
//                     ]}
//                     tickFormatter={(val) => val.toFixed(3)}
//                     style={{ fontSize: '11px', fontFamily: 'Inter' }}
//                   />
//                   <Tooltip contentStyle={{ fontFamily: 'Inter', borderRadius: '8px' }} />
//                   <Line
//                     type="monotone"
//                     dataKey="r"
//                     stroke="#B45309"
//                     strokeWidth={2}
//                     activeDot={{ r: 8 }}
//                     label={{ fill: '#0F172A', fontSize: 11, dy: -10, fontWeight: 'bold' }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Cp & Cpk Side-by-Side Tables */}
//       <Grid container spacing={3}>
//         {/* Cp Parameter Card */}
//         <Grid item xs={12} md={6}>
//           <Card sx={{ boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
//             <Box sx={{ backgroundColor: '#D9E2EC', px: 2, py: 1.5, borderBottom: '1px solid #BCCCDC' }}>
//               <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: 'Inter', color: '#0F2C59' }}>
//                 Cp
//               </Typography>
//             </Box>
//             <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
//               <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter' }}>
//                 <tbody>
//                   <tr>
//                     <td style={labelCellStyle}>Lower Engineering Specification Limit:</td>
//                     <td style={symbolCellStyle}>LSL =</td>
//                     <td style={valueCellStyle('#FEF08A')}>{capability.LSL !== undefined ? capability.LSL : '-'}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Upper Engineering Specification Limit:</td>
//                     <td style={symbolCellStyle}>USL =</td>
//                     <td style={valueCellStyle('#FEF08A')}>{capability.USL !== undefined ? capability.USL : '-'}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Engineering Target (Used only if spec is two-sided):</td>
//                     <td style={symbolCellStyle}>T =</td>
//                     <td style={valueCellStyle('#FEF08A')}>{capability.target !== undefined ? capability.target : '-'}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Specification type and skewness:</td>
//                     <td style={symbolCellStyle}>Type =</td>
//                     <td style={valueCellStyle('#FFFFFF')}>{capability.USL !== undefined && capability.LSL !== undefined ? 'two-sided' : 'one-sided'}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Skew:</td>
//                     <td style={symbolCellStyle}>Skew =</td>
//                     <td style={valueCellStyle('#FFFFFF')}>n/a</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Engineering Tolerance:</td>
//                     <td style={symbolCellStyle}>ET =</td>
//                     <td style={valueCellStyle('#FFFFFF')}>
//                       {capability.USL !== undefined && capability.LSL !== undefined
//                         ? (capability.USL - capability.LSL).toFixed(3)
//                         : '--'}
//                     </td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Average Range from control chart:</td>
//                     <td style={symbolCellStyle}>Rbar =</td>
//                     <td style={valueCellStyle('#FEF08A')}>{capability.Rbar !== undefined ? capability.Rbar : '-'}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Number of measurements in each sample for which a range was calculated:</td>
//                     <td style={symbolCellStyle}>n =</td>
//                     <td style={valueCellStyle('#FEF08A')}>{capability.n !== undefined ? capability.n : '-'}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Standard deviation:</td>
//                     <td style={symbolCellStyle}>s =</td>
//                     <td style={valueCellStyle('#FEF08A')}>{capability.sigmaST !== undefined ? capability.sigmaST : '-'}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Appropriate d2 for the sample of size n:</td>
//                     <td style={symbolCellStyle}>d2 =</td>
//                     <td style={valueCellStyle('#FFFFFF')}>{capability.d2 !== undefined ? capability.d2 : '-'}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Natural Variation of the process:</td>
//                     <td style={symbolCellStyle}>NV =</td>
//                     <td style={valueCellStyle('#FEF08A')}>{capability.NV !== undefined ? capability.NV : '-'}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Potential Process Capability (Cp = ET/NV):</td>
//                     <td style={symbolCellStyle}>Cp =</td>
//                     <td style={valueCellStyle('#93C5FD')}>{capability.Cp !== undefined ? capability.Cp : '-'}</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Cpk Parameter Card */}
//         <Grid item xs={12} md={6}>
//           <Card sx={{ boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
//             <Box sx={{ backgroundColor: '#D9E2EC', px: 2, py: 1.5, borderBottom: '1px solid #BCCCDC' }}>
//               <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: 'Inter', color: '#0F2C59' }}>
//                 Cpk
//               </Typography>
//             </Box>
//             <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
//               <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter' }}>
//                 <tbody>
//                   <tr>
//                     <td style={labelCellStyle}>Process Average from control chart:</td>
//                     <td style={symbolCellStyle}>Xbar =</td>
//                     <td style={valueCellStyle('#FEF08A')}>{capability.Xbar !== undefined ? capability.Xbar : '-'}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Upper Available Tolerance:</td>
//                     <td style={symbolCellStyle}>UAT =</td>
//                     <td style={valueCellStyle('#FFFFFF')}>{capability.UAT !== undefined ? capability.UAT : '-'}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Lower Available Tolerance:</td>
//                     <td style={symbolCellStyle}>LAT =</td>
//                     <td style={valueCellStyle('#FFFFFF')}>{capability.LAT !== undefined ? capability.LAT : '-'}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Upper Process Capability Index:</td>
//                     <td style={symbolCellStyle}>CpU =</td>
//                     <td style={valueCellStyle('#FFFFFF')}>{capability.CpU !== undefined ? capability.CpU : '-'}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Lower Process Capability Index:</td>
//                     <td style={symbolCellStyle}>CpL =</td>
//                     <td style={valueCellStyle('#FFFFFF')}>{capability.CpL !== undefined ? capability.CpL : '-'}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Process Capability Index:</td>
//                     <td style={symbolCellStyle}>Cpk =</td>
//                     <td style={valueCellStyle('#93C5FD')}>{capability.Cpk !== undefined ? capability.Cpk : '-'}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>Modified Capability Index:</td>
//                     <td style={symbolCellStyle}>Cpk' =</td>
//                     <td style={valueCellStyle('#FFFFFF')}>{capability.Cpk !== undefined ? capability.Cpk : '-'}</td>
//                   </tr>
//                   {/* Empty rows to make height match the Cp card */}
//                   <tr>
//                     <td style={labelCellStyle}>&nbsp;</td>
//                     <td style={symbolCellStyle}>&nbsp;</td>
//                     <td style={valueCellStyle('#FFFFFF')}>&nbsp;</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>&nbsp;</td>
//                     <td style={symbolCellStyle}>&nbsp;</td>
//                     <td style={valueCellStyle('#FFFFFF')}>&nbsp;</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>&nbsp;</td>
//                     <td style={symbolCellStyle}>&nbsp;</td>
//                     <td style={valueCellStyle('#FFFFFF')}>&nbsp;</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>&nbsp;</td>
//                     <td style={symbolCellStyle}>&nbsp;</td>
//                     <td style={valueCellStyle('#FFFFFF')}>&nbsp;</td>
//                   </tr>
//                   <tr>
//                     <td style={labelCellStyle}>&nbsp;</td>
//                     <td style={symbolCellStyle}>&nbsp;</td>
//                     <td style={valueCellStyle('#FFFFFF')}>&nbsp;</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default SPCStatsReport;
