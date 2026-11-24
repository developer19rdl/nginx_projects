import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';


const rows = [
    { id: 1, serialNo: '1022', venderName: 'maruthi', periodFrom: '14/09/1975', periodTo: '12/06/1789', inspectionPattern: 'xyz', department: 'cs', section: 'a', assetType: 'saving', assetName: 'fixed', action: 'icon' },
    { id: 2, serialNo: '1022', venderName: 'maruthi', periodFrom: '14/09/1975', periodTo: '12/06/1789', inspectionPattern: 'xyz', department: 'cs', section: 'a', assetType: 'saving', assetName: 'fixed', action: 'icon' },
    { id: 3, serialNo: '1022', venderName: 'maruthi', periodFrom: '14/09/1975', periodTo: '12/06/1789', inspectionPattern: 'xyz', department: 'cs', section: 'a', assetType: 'saving', assetName: 'fixed', action: 'icon' },
    { id: 4, serialNo: '1022', venderName: 'maruthi', periodFrom: '14/09/1975', periodTo: '12/06/1789', inspectionPattern: 'xyz', department: 'cs', section: 'a', assetType: 'saving', assetName: 'fixed', action: 'icon' },
];

const columns = [
    { field: 'serialNo', headerName: 'Serial No', width: 120 },
    { field: 'venderName', headerName: 'Vender Name', width: 150 },
    { field: 'periodFrom', headerName: 'Period From', width: 150 },
    { field: 'periodTo', headerName: 'Period To', width: 150 },
    { field: 'inspectionPattern', headerName: 'Service Pattern', width: 150 },
    { field: 'department', headerName: 'Department', width: 120 },
    { field: 'section', headerName: 'Section', width: 120 },
    { field: 'assetType', headerName: 'Asset Type', width: 120 },
    { field: 'assetName', headerName: 'Asset Name', width: 120 },
    { field: 'action', headerName: 'Action', width: 120 },
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
            <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                checkboxSelection
            />
            <Button
                variant="contained"
                style={{ backgroundColor: '#17a2b8', color: 'white', marginTop: '10px', borderRadius: '5px' }}
            >
                Export to Excel
            </Button>
        </div>
            
        </div >
        //     </CardContent>
        // </Card>
    );
}
export default ViewAMC;