import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Button, Box, Checkbox, CardContent, Typography, Card,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { PackingListAuthorizeHandler, PackingListAuthorizeList } from '../../../../ApiService/LoginPageService';
import CustomePopUp from '../../../../Utility/CustomePopUp';
import NotificationBar from '../../../GlobleFiles/ServiceNotificationBar';
import { useModuleLocks } from '../../../context/ModuleLockContext';

const PackingListAuthorize = () => {
    const moduleLocks = useModuleLocks();
    const isModuleLocked =
        moduleLocks.find(m => m.moduleName === "Packing List Authorize")?.lockStatus === "locked";

    const [selectAll, setSelectAll] = useState(false);
    const [refreshTableData, setRefreshTableData] = useState(false);
    const [approvalLists, setApprovalLists] = useState([]);
    const [customeOpen, setCustomeOpen] = useState(false);
    const [payloadData, setPayloadData] = useState([]);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [selectedType, setSelectedType] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        PackingListAuthorizeList(handleGetSuccess, handleGetException);
    }, [refreshTableData]);

    const handleGetSuccess = (dataObject) => {
        setApprovalLists(dataObject?.data || []);
    };
    const handleGetException = () => { };

    const columns = [
        {
            field: 'date',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Date</span>,
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'plNo',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>PL No</span>,
            type: 'string',
            sortable: true,
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'cCode',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Cust Code</span>,
            type: 'string',
            sortable: true,
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'cName',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Cust Name</span>,
            type: 'string',
            sortable: true,
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'selected',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}></span>,
            type: 'number',
            sortable: true,
            width: 120,
            align: 'center', headerAlign: 'center',
            renderHeader: (params) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox checked={selectAll}
                        onChange={handleSelectAllChange} />
                    <span style={{ marginLeft: '5px', fontWeight: 'bold', fontSize: '16px' }}></span>
                </div>
            ),
            renderCell: (params) => (
                <Checkbox
                    checked={params.row.selected}
                    onChange={(e) => handleCheckboxChange(e, params.row.id)}
                />
            ),
        },
    ];

    const handleCheckboxChange = (event, id) => {
        const updatedRows = approvalLists.map((row) =>
            row.id === id ? { ...row, selected: event.target.checked } : row
        );
        setApprovalLists(updatedRows);
    };

    const handleSelectAllChange = (event) => {
        setSelectAll(event.target.checked);
        const isChecked = event.target.checked;
        const updatedRows = approvalLists.map(row => {
            return { ...row, selected: isChecked };
        });
        setApprovalLists(updatedRows);
    };

    const handleApprove = () => {
        const updatedArray = approvalLists
            .filter((item) => item.selected === true)
            .map((data) => data.id);
        setCustomeOpen(true);
        setPayloadData(updatedArray);
    };

    const handleCustomeSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setRefreshTableData((oldvalue) => !oldvalue);
        setCustomeOpen(false);
        setTimeout(() => {
            handleClose();
        }, 3000);
    };

    const handleCustomeFailure = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
    };

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const handleRowClick = (params) => {
        navigate(`/ViewPackingList?isPackingListAuthorizeView=true&poRowId=${params.row.id}`);
    };

    return (
        <div style={{ margin: '10px' }}>
            <Typography style={{ fontWeight: 'bold', textAlign: 'left', fontSize: '18px', marginBottom: '10px' }}>Packing List Authorization</Typography>
            <Card style={{ boxShadow: '0 10px 10px 2px rgba(0, 0, 0, 0.2)', marginTop: '2px', borderRadius: '10px', width: '100%', height: '100%' }}>
                <CardContent>
                    <DataGrid
                        rows={approvalLists}
                        columns={columns}
                        pageSize={8}
                        rowsPerPageOptions={[8]}
                        onRowDoubleClick={handleRowClick}
                        disableSelectionOnClick
                        style={{ border: 'none' }}
                        sx={{
                            overflow: 'auto',
                            height: '50vh',
                            width: '100%',
                            '& .super-app-theme--header': {
                                WebkitTextStrokeWidth: '0.6px',
                                backgroundColor: '#93bce6',
                                color: '#1c1919'
                            },
                            '& .MuiDataGrid-cell': {
                                border: '1px solid #969696',
                            },
                            '& .MuiDataGrid-columnHeader': {
                                border: '1px solid #969696',
                            },
                        }}
                        getRowClassName={(params) => {
                            const rowIndex = approvalLists.findIndex(row => row.id === params.row.id);
                            if (rowIndex !== -1) {
                                return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
                            }
                            return '';
                        }}
                        rowHeight={40}
                        columnHeaderHeight={40}
                    />

                    <div style={{ width: '100%', textAlign: 'right' }}>
                        <Button
                            variant="contained"
                            style={{ backgroundColor: isModuleLocked ? "gray" : '#88C273', marginRight: '10px', color: "white" }}
                            onClick={() => {
                                handleApprove();
                                setSelectedType('approve');
                            }}
                            disabled={isModuleLocked}
                        >Approve</Button>
                        {/* <Button
                            variant="contained"
                            style={{ backgroundColor: isModuleLocked ? "gray" : '#F95454', color: 'white' }}
                            onClick={() => {
                                handleApprove();
                                setSelectedType('reject');
                            }}
                            disabled={isModuleLocked}
                        >Reject</Button> */}
                    </div>

                </CardContent>
            </Card>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
            <CustomePopUp
                title={'Confirmation'}
                titleColor={'#000000'}
                message={selectedType === 'approve' ? 'Are you sure you want to approve?' : "Are you sure you want to reject?"}
                messageColor={'#000000'}
                CustomIcon={selectedType === 'approve' ? ThumbUpIcon : ThumbDownIcon}
                iconColor={selectedType === 'approve' ? '#7ED4AD' : '#F72C5B'}
                confirmButtonTitle={'AGREE'}
                confirmButtonBackGround={'#41B06E'}
                confirmButtonTextColor={'#ffffff'}
                closeButtonTitle={'CLOSE'}
                closeButtonBackground={'#DD5746'}
                closeButtonTextColor={'#ffffff  '}
                customeOpen={customeOpen}
                setCustomeOpen={setCustomeOpen}
                handleCustomeSuccess={handleCustomeSuccess}
                handleCustomeFailure={handleCustomeFailure}
                customeServicesApi={PackingListAuthorizeHandler}
                bodyData={{ ids: payloadData, type: selectedType }}
            />
        </div>
    );
};

export default PackingListAuthorize;
