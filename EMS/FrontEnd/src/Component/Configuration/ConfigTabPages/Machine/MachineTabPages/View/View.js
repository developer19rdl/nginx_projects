import React from 'react'
import "./View.css";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const rows = [
    { id: 1, machineName: 'Snow', maxCapacity: 'Jon', loadingTime: 35, unloadingTime: 5, maxProduction: 10, action: 'fight' },
    { id: 2, machineName: 'Lannister', maxCapacity: 'Cersei', loadingTime: 42, unloadingTime: 5, maxProduction: 10, action: 'fight' },
    { id: 3, machineName: 'Lannister', maxCapacity: 'Jaime', loadingTime: 45, unloadingTime: 5, maxProduction: 10, action: 'fight' },
    { id: 4, machineName: 'Stark', maxCapacity: 'Arya', loadingTime: 16, unloadingTime: 5, maxProduction: 10, action: 'fight' },
    { id: 5, machineName: 'Targaryen', maxCapacity: 'Daenerys', loadingTime: null, unloadingTime: 5, maxProduction: 10, action: 'fight' },
    { id: 6, machineName: 'Melisandre', maxCapacity: null, loadingTime: 150, unloadingTime: 5, maxProduction: 10, action: 'fight' },
    { id: 7, machineName: 'Clifford', maxCapacity: 'Ferrara', loadingTime: 44, unloadingTime: 5, maxProduction: 10, action: 'fight' },
    { id: 8, machineName: 'Frances', maxCapacity: 'Rossini', loadingTime: 36, unloadingTime: 5, maxProduction: 10, action: 'fight' },
    { id: 9, machineName: 'Roxie', maxCapacity: 'Harvey', loadingTime: 65, unloadingTime: 5, maxProduction: 10, action: 'fight' },
];

const View = () => {
    return (
        <div className='view_container'>
            <div className='view_subcontainer'>
                <span className='view_headerText'>View Max Capacity</span>
            </div>
            <div className='view_tableContainer'>
                <table id="customers">
                    <tr>
                        <th>Machine Name</th>
                        <th>Max Capacity</th>
                        <th>Loading Time</th>
                        <th>Unloading Time</th>
                        <th>Max. Production/Hr</th>
                        <th>Action</th>
                    </tr>
                    {rows.map((item) =>
                        <tr>
                            <td>{item.machineName}</td>
                            <td>{item.maxCapacity}</td>
                            <td>{item.loadingTime}</td>
                            <td>{item.unloadingTime}</td>
                            <td>{item.maxProduction}</td>
                            <td>
                                <div>
                                    <EditIcon titleAccess='edit' onClick={()=>alert(`edit ${item.id}`)} className='editViewIconStyle'/>
                                    <DeleteIcon titleAccess='delete' onClick={()=>alert(`delete ${item.id}`)} className='deleteViewIconStyle'/>
                                </div>
                            </td>
                        </tr>)}
                </table>
            </div>
        </div>
    )
}
export default View;
