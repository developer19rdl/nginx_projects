import React from 'react'
import "./ToolsView.css";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const rows = [
    { id: 1, machineName: 'Punching Machine', toolName: '88.9 X6.35 Punch tip', toolType: 'Grinding', alertBasedOn: '240 hours', action: 'fight' },
    { id: 2, machineName: 'Punching Machine', toolName: 'Cersei', toolType: 'Grinding', alertBasedOn: '2 hours', action: 'fight' },
    { id: 3, machineName: 'Punching Machine', toolName: 'Jaime', toolType: 'Grinding', alertBasedOn: '1 hours', action: 'fight' },
    { id: 4, machineName: 'Punching Machine', toolName: 'Arya', toolType: 'Grinding', alertBasedOn: '1 hours', action: 'fight' },
    { id: 5, machineName: 'Shearing Machine', toolName: 'Daenerys', toolType: 'Grinding', alertBasedOn: '1 hours', action: 'fight' },
    { id: 6, machineName: 'Shearing Machine', toolName: null, toolType: 'Replacement', alertBasedOn: '1 hours', action: 'fight' },
    { id: 7, machineName: 'RG35', toolName: 'Ferrara', toolType: 'Grinding', alertBasedOn: '1 hours', action: 'fight' },
    { id: 8, machineName: 'RG80', toolName: 'Rossini', toolType: 'Grinding', alertBasedOn: '1 hours', action: 'fight' },
    { id: 9, machineName: 'RG100', toolName: 'Harvey', toolType: 'Grinding', alertBasedOn: '1 hours', action: 'fight' },
];

const ToolsView = () => {
    return (
        <div className='view_container'>
            <div className='view_subcontainer'>
                <span className='view_headerText'>View Tool Alerts</span>
            </div>
            <div className='view_tableContainer'>
                <table id="customers">
                    <tr>
                        <th>Machine Name</th>
                        <th>Tool Name</th>
                        <th>Tools Type</th>
                        <th>Alert Based </th>
                        <th>Action</th>
                    </tr>
                    {rows.map((item) =>
                        <tr>
                            <td>{item.machineName}</td>
                            <td>{item.toolName}</td>
                            <td>{item.toolType}</td>
                            <td>{item.alertBasedOn}</td>
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
export default ToolsView;
