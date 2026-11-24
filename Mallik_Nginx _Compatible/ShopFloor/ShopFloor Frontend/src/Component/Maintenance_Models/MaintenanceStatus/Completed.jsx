import React, { useEffect, useState } from 'react'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Grid,  Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { MaintenanceAprovalshow, Maintenanceshowreject } from '../../../services/LoginServiceNod';
import { PendingView } from './PendingView';

function ViewTable() {
    return (
        <Tooltip title="Edit Data">
            <RemoveRedEyeIcon />
        </Tooltip>
    )
}

const Completed = () => {
    const [open, setOpen] = useState(false);
    const [rowid,setRowid] =useState([]);
    const [rowdata, setrowdata] = useState(false);
    const [row2,setrow2]=useState([])

    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));

    const columns = [
        {
            field: 'id',
            headerClassName: 'super-app-theme--header',
            headerName: 'Maintenance ID',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'Maintype',
            headerClassName: 'super-app-theme--header',
            headerName: 'Maintenance Type',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'AffectedMachine',
            headerClassName: 'super-app-theme--header',
            headerName: 'Machine',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'Severity',
            headerClassName: 'super-app-theme--header',
            headerName: 'Severity',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'ProblemNote',
            headerClassName: 'super-app-theme--header',
            headerName: 'Problem Note',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'fromdate',
            headerClassName: 'super-app-theme--header',
            headerName: 'Date',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'fromtime',
            headerClassName: 'super-app-theme--header',
            headerName: 'Time',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Action',
            flex:1,
    
            getActions: (params) => [
                <ViewTable selectedRow={params.row} />,
            ],
        },
    ];

    function ViewTable({selectedRow}) {
        return (
            <Tooltip title="Edit Data">
                <RemoveRedEyeIcon   onClick={(event) => {
                event.stopPropagation();
                setrowdata(selectedRow)
                setRowid(selectedRow.id)
                setOpen(true);
            }} />
            </Tooltip>
        )

    }

    useEffect(() => {
        Maintenanceshowreject(handelMaintenanceAprovalshow,MaintenanceAprovalshowException)
    }, []);

    const handelMaintenanceAprovalshow=(dataObject)=>{
       setrow2(dataObject.data || [])
       console.log("row2===",dataObject.data)
    }

    const MaintenanceAprovalshowException=()=>{
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '10px', marginTop: '10px' }}>
                <Typography
                    sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold' }}
                    variant="h5">
                    Maintenance Status
                </Typography>
            </div>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} marginTop={2}>
                    <Card style={{ boxShadow: '0 1px 1px 1px rgba(0, 0, 0, 0.2)', borderRadius: '10px', width: '100%', height: '100%'}}>
                        <CardContent>
                        <DataGrid
                            rows={row2}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 5,
                                    },
                                },
                            }}
                            style={{ height: '400px' }}
                            pageSizeOptions={[5]}
                            checkboxSelection
                            disableRowSelectionOnClick
                        />
                        {open && (
                            <PendingView
                                open={open}
                                ison={true}
                                setOpen={setOpen}
                                rowid={rowid}
                                setRowid={setRowid}
                                rowdata={rowdata}
                                setrowdata={setrowdata}
                            />
                        )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
       
    )
}
export default Completed;
