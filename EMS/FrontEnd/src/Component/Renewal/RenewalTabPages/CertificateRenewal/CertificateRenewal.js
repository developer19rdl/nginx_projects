import React from 'react'
import "./CertificateRenewal.css";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const rows = [
    { id: 1, Department: "Planning and Scheduling", Machine: 'Punching Machine', AMCstartDate: '2022-02-20', AMCendDate: '2022-02-26', Action: 'Renewal' },
    { id: 2, Department: "Planning and Scheduling", Machine: 'Punching Machine', AMCstartDate: '2022-02-20', AMCendDate: '2022-02-26', Action: 'Renewal' },
    { id: 3, Department: "Planning and Scheduling", Machine: 'Punching Machine', AMCstartDate: '2022-02-20', AMCendDate: '2022-02-26', Action: 'Renewal' },
    { id: 4, Department: "Planning and Scheduling", Machine: 'Punching Machine', AMCstartDate: '2022-02-20', AMCendDate: '2022-02-26', Action: 'Renewal' },
    { id: 5, Department: "Punching", Machine: 'Shearing Machine', AMCstartDate: '2022-02-20', AMCendDate: '2022-02-26', Action: 'Renewal' },
    { id: 6, Department: "Punching", Machine: 'Shearing Machine', AMCstartDate: '2022-02-20', AMCendDate: '2022-02-26', Action: 'Renewal' },
    { id: 7, Department: "Punching", Machine: 'RG35', AMCstartDate: '2022-02-20', AMCendDate: '2022-02-26', Action: 'Renewal' },
    { id: 8, Department: "Welding", Machine: 'RG80', AMCstartDate: '2022-02-20', AMCendDate: '2022-02-26', Action: 'Renewal' },
    { id: 9, Department: "Welding", Machine: 'RG100', AMCstartDate: '2022-02-20', AMCendDate: '2022-02-26', Action: 'Renewal' },
];

const CertificateRenewal = () => {
    return (
        <div className='view_container'>
            <div className='view_subcontainer'>
                <span className='view_headerText'>View Certificate</span>
            </div>
            <div className='view_tableContainer'>
                <table id="customers">
                    <tr>
                        <th>Department</th>
                        <th>Machine</th>
                        <th>Certificate start date</th>
                        <th>Certificate end date</th>
                        <th>Action</th>
                    </tr>
                    {rows.map((item) =>
                        <tr>
                            <td>{item.Department}</td>
                            <td>{item.Machine}</td>
                            <td>{item.AMCstartDate}</td>
                            <td>{item.AMCendDate}</td>
                            <td>{item.Action}</td>
                        </tr>)}
                </table>
            </div>
        </div>
    )
}
export default CertificateRenewal;
