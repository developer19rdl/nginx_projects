// import React from 'react'
// import "./SetAlertViewPage.css";
// import Box from '@mui/material/Box';
// import { DataGrid } from '@mui/x-data-grid';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';

// const rows = [
//     { id: 1, machineName: 'Punching Machine', Sensor: '88.9 X6.35 Punch tip', FilterType: 'Grinding', MaxOutlier: '240 hours', action: 'fight', max: '35', min: '3.5', units: "m/s^2", message: 'Shearing Machine Vibration' },
//     { id: 2, machineName: 'Punching Machine', Sensor: 'Cersei', FilterType: 'Grinding', MaxOutlier: '2 hours', action: 'fight', max: '35', min: '3.5', units: "m/s^2", message: 'Shearing Machine Vibration' },
//     { id: 3, machineName: 'Punching Machine', Sensor: 'Jaime', FilterType: 'Grinding', MaxOutlier: '1 hours', action: 'fight', max: '35', min: '3.5', units: "m/s^2", message: 'Shearing Machine Vibration' },
//     { id: 4, machineName: 'Punching Machine', Sensor: 'Arya', FilterType: 'Grinding', MaxOutlier: '1 hours', action: 'fight', max: '35', min: '3.5', units: "m/s^2", message: 'Shearing Machine Vibration' },
//     { id: 5, machineName: 'Shearing Machine', Sensor: 'Daenerys', FilterType: 'Grinding', MaxOutlier: '1 hours', action: 'fight', max: '35', min: '3.5', units: "m/s^2", message: 'Shearing Machine Vibration' },
//     { id: 6, machineName: 'Shearing Machine', Sensor: null, FilterType: 'Replacement', MaxOutlier: '1 hours', action: 'fight', max: '35', min: '3.5', units: "m/s^2", message: 'Shearing Machine Vibration' },
//     { id: 7, machineName: 'RG35', Sensor: 'Ferrara', FilterType: 'Grinding', MaxOutlier: '1 hours', action: 'fight', max: '35', min: '3.5', units: "m/s^2", message: 'Shearing Machine Vibration' },
//     { id: 8, machineName: 'RG80', Sensor: 'Rossini', FilterType: 'Grinding', MaxOutlier: '1 hours', action: 'fight', max: '35', min: '3.5', units: "m/s^2", message: 'Shearing Machine Vibration' },
//     { id: 9, machineName: 'RG100', Sensor: 'Harvey', FilterType: 'Grinding', MaxOutlier: '1 hours', action: 'fight', max: '35', min: '3.5', units: "m/s^2", message: 'Shearing Machine Vibration' },
// ];

// const SetAlertViewPage = () => {
//     return (
//         <div className='view_container'>
//             <div className='view_subcontainer'>
//                 <span className='view_headerText'>View Threshholds</span>
//             </div>
//             <div className='view_tableContainer'>
//                 <table id="customers">
//                     <tr>
//                         <th>Machine Name</th>
//                         <th>Sensor</th>
//                         <th>Filter Type</th>
//                         <th>Max</th>
//                         <th>Min</th>
//                         <th>Max. Outlier</th>
//                         <th>Units</th>
//                         <th>Message</th>
//                         <th>Action</th>
//                     </tr>
//                     {rows.map((item) =>
//                         <tr>
//                             <td>{item.machineName}</td>
//                             <td>{item.Sensor}</td>
//                             <td>{item.FilterType}</td>
//                             <td>{item.max}</td>
//                             <td>{item.min}</td>
//                             <td>{item.MaxOutlier}</td>
//                             <td>{item.units}</td>
//                             <td>{item.message}</td>
//                             <td>
//                                 <div>
//                                     <EditIcon titleAccess='edit' onClick={() => alert(`edit ${item.id}`)} className='editViewIconStyle' />
//                                     <DeleteIcon titleAccess='delete' onClick={() => alert(`delete ${item.id}`)} className='deleteViewIconStyle' />
//                                 </div>
//                             </td>
//                         </tr>)}
//                 </table>
//             </div>
//         </div>
//     )
// }
// export default SetAlertViewPage;
