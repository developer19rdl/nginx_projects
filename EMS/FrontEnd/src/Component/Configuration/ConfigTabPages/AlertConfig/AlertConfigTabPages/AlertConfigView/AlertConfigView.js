import React from 'react'
import "./AlertConfigView.css";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const rows = [
    {
        id: 1, smsGateWay: 'smtp.gmail.com', alertEmailTo: 'santhoshshetty671990@gmail.com', alertEmailFrom: 'santhoshshetty671987@gmail.com', securityType: 'ssl', alertPhoneNo: '9535946090'
    }
];

const AlertConfigView = () => {
    return (
        <div className='view_container'>
            <div className='view_subcontainer'>
                <span className='view_headerText'>Consumable</span>
            </div>
            <div className='view_tableContainer'>
                <table id="customers">
                    <tr>
                        <th>SMS Gateway</th>
                        <th>Alert Email To</th>
                        <th>Alert Email From</th>
                        <th>Security Type</th>
                        <th>Alert Phone No.</th>
                    </tr>
                    {rows.map((item) =>
                        <tr>
                            <td>{item.smsGateWay}</td>
                            <td>{item.alertEmailTo}</td>
                            <td>{item.alertEmailFrom}</td>
                            <td>{item.securityType}</td>
                            <td>{item.alertPhoneNo}</td>
                        </tr>)}
                </table>
            </div>
        </div>
    )
}
export default AlertConfigView;
