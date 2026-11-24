import React from 'react'
import "./ViewSensorsPage.css";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const rows = [
    { id: 1, sensorName: 'Punching Machine', metricUnit: '88.9 X6.35 Punch tip' },
    { id: 2, sensorName: 'Punching Machine', metricUnit: 'Cersei' },
    { id: 3, sensorName: 'Punching Machine', metricUnit: 'Jaime' },
    { id: 4, sensorName: 'Punching Machine', metricUnit: 'Arya' },
    { id: 5, sensorName: 'Shearing Machine', metricUnit: 'Daenerys' },
    { id: 6, sensorName: 'Shearing Machine', metricUnit: 'm/s^2' },
    { id: 7, sensorName: 'RG35', metricUnit: 'Ferrara' },
    { id: 8, sensorName: 'RG80', metricUnit: 'Rossini' },
    { id: 9, sensorName: 'RG100', metricUnit: 'Harvey' },
];

const ViewSensorsPage = () => {
    return (
        <div className='view_container'>
            <div className='view_subcontainer'>
                <span className='view_headerText'>View Sensors</span>
            </div>
            <div className='view_tableContainer'>
                <table id="customers">
                    <tr>
                        <th>Sensor</th>
                        <th>Metric Unit</th>
                        <th>Action</th>
                    </tr>
                    {rows.map((item) =>
                        <tr>
                            <td>{item.sensorName}</td>
                            <td>{item.metricUnit}</td>
                            <td>
                                <div>
                                    <EditIcon titleAccess='edit' onClick={() => alert(`edit ${item.id}`)} className='editViewIconStyle' />
                                    <DeleteIcon titleAccess='delete' onClick={() => alert(`delete ${item.id}`)} className='deleteViewIconStyle' />
                                </div>
                            </td>
                        </tr>)}
                </table>
            </div>
        </div>
    )
}
export default ViewSensorsPage;
