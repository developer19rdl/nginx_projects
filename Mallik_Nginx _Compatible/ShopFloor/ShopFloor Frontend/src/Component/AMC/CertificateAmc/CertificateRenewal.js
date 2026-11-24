import React from 'react'
import { DataGrid } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Tooltip } from '@mui/material';
import { useEffect } from 'react';
import CertificateRenewalTools from './CertificateRenewalTools';
import { Certificaterenewaldata } from '../../../Services/NodeJsApiServices';
// import { Certificaterenewaldata } from '../../../services/LoginServiceNod';

const CertificateRenewal = () => {
    const [rows, setRow] = useState([]);
    const [deleteId, setDeleteId] = useState('');
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [isLoading, setGridLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [department, setDepartment] = useState('');
    const [machine, setMachine] = useState('');
    const [amcStartDate, setAmcStartDate] = useState('');
    const [amcEndDate, setAmcEndDate] = useState('');
    const [noOfAmc, setNoOfAmc] = useState('');
    const [renewal, setrenewal] = useState([]);



    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        Certificaterenewaldata(handleVendorShow, handeVendorException);
    }, [refreshData]);



    const handleVendorShow = (dataObject) => {
        setRow(dataObject.data);
        setGridLoading(false)

    }

    const handeVendorException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    }


    useEffect(() => {
        console.log("renewal", renewal)
        setDepartment(renewal?.dname || '');
        setMachine(renewal?.MachineName || '');
        setAmcStartDate(renewal?.CertiDate || '');
        setAmcEndDate(renewal?.ExpDate || '');


    }, [renewal]);

    const columns = [
        {
            field: 'dname',
            headerClassName: 'super-app-theme--header',
            headerName: 'Department',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'machine_name',
            headerClassName: 'super-app-theme--header',
            headerName: 'Machine',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'CertiDate',
            headerName: 'AMC Start Date',
            headerClassName: 'super-app-theme--header',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'ExpDate',
            headerName: 'Amc End Date',
            headerClassName: 'super-app-theme--header',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            headerClassName: 'super-app-theme--header',
            width: 250,
            cellClassName: 'actions',
            disableClickEventBubbling: true,
            getActions: (params) => [
                <Button
                    onClick={(event) => {
                        event.stopPropagation();
                        setIsModalVisible(true);
                        setrenewal(params.row);
                    }}>Renewal</Button>

            ],
        },
    ];

    // function EditData(props) {
    //     return (
    //       <Tooltip title="Edit">
    //         <EditIcon style={{cursor: 'pointer'}}
    //           onClick={(event) => {
    //             event.stopPropagation();
    //             setIsAddButton(false);
    //             setOpen(true);
    //           }}
    //         />
    //       </Tooltip>
    //     );
    // }

    function DeleteData(props) {
        return (
            <Tooltip title="Delete">
                <DeleteIcon style={{ color: '#012738', cursor: 'pointer' }}
                    onClick={() => {
                        setDeleteId(props.selectedRow.id);
                        console.log(props.selectedRow.id);
                        setDeleteDailogOpen(true);
                    }} />
            </Tooltip>
        );
    }

    return (
        <div style={{ height: 400, width: '100%' }}>
            <CertificateRenewalTools />

            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={8}
                loading={isLoading}
                rowsPerPageOptions={[8]}
                disableSelectionOnClick
                sx={{
                    '& .MuiDataGrid-columnHeaders': {
                        color: '#000000', // Header text color
                        fontWeight: 'bold', // Header font weight
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 'bold', // Ensures the header font weight is bold
                    },
                }}
            />

            <>
                <Dialog sx={{ '& .MuiDialog-paper': { width: '32%', maxHeight: '100%' } }}
                    maxWidth="lg"
                    open={isModalVisible}>
                    <form>
                        <DialogTitle   sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}                        >
                            Renewal Certificate
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} style={{ marginTop: '20px' }}>
                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                    <TextField
                                        fullWidth
                                        label="Department"
                                        placeholder='Department'
                                        variant="outlined"
                                        required
                                        // onChange={(e) => { setDepartment(e.target.value) }}
                                        value={department} />
                                </Grid>
                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                    <TextField
                                        fullWidth
                                        label="Machine"
                                        placeholder='Machine'
                                        variant="outlined"
                                        required
                                        // onChange={(e) => { setMachine(e.target.value) }}
                                        value={machine} />
                                </Grid>
                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                    <TextField
                                        fullWidth
                                        label="Amc Start Date"
                                        placeholder='Amc Start Date'
                                        variant="outlined"
                                        type='date'
                                        required
                                        onChange={(e) => { setAmcStartDate(e.target.value) }}
                                        value={amcStartDate} />
                                </Grid>
                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                    <TextField
                                        fullWidth
                                        label="Amc End Date"
                                        placeholder='Amc End Date'
                                        variant="outlined"
                                        type='date'
                                        required
                                        onChange={(e) => { setAmcEndDate(e.target.value) }}
                                        value={amcEndDate} />
                                </Grid>
                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                    <TextField
                                        fullWidth
                                        label="No Of Amc"
                                        placeholder='No Of Amc'
                                        variant="outlined"
                                        required
                                        // onChange={(e) => { setNoOfAmc(e.target.value) }}
                                        value={noOfAmc} />
                                </Grid>
                            </Grid>

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleModalClose} >Cancel</Button>
                            <Button type='submit' >
                                Renew
                            </Button>
                        </DialogActions>
                    </form>

                </Dialog>
            </>

            {/* <DeleteConfirmationDailog
        open={deleteDailogOpen}
        setOpen={setDeleteDailogOpen}
        deleteId={deleteId}
        deleteService={VendorDelete}
        handleSuccess={handleDeleteSuccess}
        handleException={handleDeleteException}
      /> */}
        </div>
    )
}

export default CertificateRenewal
