import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const rows = [
    { id: 1, serialNo: '1022', vernderName: 'maruthi', periodFrom: '14/09/1975', periodTo: '12/06/1789', inspectionPattern: 'xyz', department: 'cs', section: 'a', assetType: 'saving', assetName: 'fixed', action: 'icon' },
    { id: 2, serialNo: '1022', vernderName: 'maruthi', periodFrom: '14/09/1975', periodTo: '12/06/1789', inspectionPattern: 'xyz', department: 'cs', section: 'a', assetType: 'saving', assetName: 'fixed', action: 'icon' },
    { id: 3, serialNo: '1022', vernderName: 'maruthi', periodFrom: '14/09/1975', periodTo: '12/06/1789', inspectionPattern: 'xyz', department: 'cs', section: 'a', assetType: 'saving', assetName: 'fixed', action: 'icon' },
    { id: 4, serialNo: '1022', vernderName: 'maruthi', periodFrom: '14/09/1975', periodTo: '12/06/1789', inspectionPattern: 'xyz', department: 'cs', section: 'a', assetType: 'saving', assetName: 'fixed', action: 'icon' },
];

const ViewAMC = () => {
    const [age, setAge] = useState('');

    const handleSelectChange = (event) => {
        setAge(event.target.value);
    };
    return (
        // <Card sx={{ paddingBottom: '15px', marginTop: '15px' }}>
        //     <CardContent>
        //         <Typography variant="h5" component="div">
        //             ViewCertificate
        //         </Typography>
        <div className='view_container'>
            <div className='view_subcontainer'>
                <span className='view_headerText'>View Warranty Dues</span>
            </div>
            <div className='view_tableContainer'>
                <table id="customers">
                    <tr>
                        <th>Serial No</th>
                        <th>Vender Name</th>
                        <th>Period From</th>
                        <th>Period To</th>
                        <th>Service Pattern</th>
                        <th>Department</th>
                        <th>Section</th>
                        <th>Asset Type</th>
                        <th>Asset Name</th>
                        <th>Action</th>
                    </tr>
                    {rows.map((item) =>
                        <tr>
                            <td>{item.serialNo}</td>
                            <td>{item.vernderName}</td>
                            <td>{item.periodFrom}</td>
                            <td>{item.periodTo}</td>
                            <td>{item.inspectionPattern}</td>
                            <td>{item.department}</td>
                            <td>{item.section}</td>
                            <td>{item.assetType}</td>
                            <td>{item.assetName}</td>
                            <td>{item.action}</td>
                        </tr>)}
                </table>
                <button style={{backgroundColor:'#17a2b8',color:'white',marginTop:'10px',marginBottom:'10px',borderRadius:'5px',borderColor:'#17a2b8'}}>Export to Excel</button>
            </div>
            
        </div >
        //     </CardContent>
        // </Card>
    );
}
export default ViewAMC;