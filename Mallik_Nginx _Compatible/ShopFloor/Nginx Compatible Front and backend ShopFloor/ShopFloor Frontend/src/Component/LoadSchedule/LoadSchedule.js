import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import AddScheduleModal from './SubLoadSchedule/AddScheduleModal';
import DeleteConfirmationDailog from './SubLoadSchedule/DeleteConfirmationDailog';
import LoadScheduleToolbar from './SubLoadSchedule/LoadScheduleToolbar';
import NotificationBar from './SubLoadSchedule/NotificationBar';
import { Box, Button, Grid, LinearProgress, Typography } from '@mui/material';
import { connect } from 'react-redux';
import { showLoadSchedule, deleteLoadSchedule, reScheduledList } from '../../Actions';
import RescheduleModal from './SubLoadSchedule/RescheduleModal';
import { GetScheduledList } from '../../Services/NodeJsApiServices';
import AssignShiftTable from './AssignShiftTable/AssignShiftTable';

const LoadSchedule = (props) => {
    const { showLoadScheduleLoader, showLoadScheduleList, reScheduleList, reScheduleListLoader } = props

    const [open, setOpen] = useState(false);
    const [secondDailogOpen, setSecondDailogOpen] = useState(false)
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [isAddButton, setIsAddButton] = useState(true);
    const [editConfigSetup, setEditConfigSetup] = useState([]);
    console.log("editConfigSetup", editConfigSetup)
    const [assetList, setAssetList] = useState([]);
    const [isLoading, setGridLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [dailogOpen, setDailogOpen] = useState(false);
    const [boxHeight, setBoxHeight] = useState(Window.innerHeight - 250);
    const [scheduledList, setScheduledList] = useState([]);
    const [uploadLoader, setUploadLoader] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setBoxHeight(window.innerHeight - 250);
        };
        setBoxHeight(window.innerHeight - 250);
        window.addEventListener('resize', handleResize);

        // props.showLoadSchedule();
        // props.reScheduledList();
        // GetScheduledList(handleGetScheduleSuccess, handleGetScheduleException)

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [refreshData])

    const handleGetScheduleSuccess = (dataObject) => {
        setScheduledList(dataObject?.data)
    }
    const handleGetScheduleException = () => { }

    // function DeleteData(props) {
    //     return (
    //         <DeleteIcon onClick={() => {
    //             // setDeleteId(props.selectedRow.id);
    //             setDeleteDailogOpen(true);
    //         }}
    //         />
    //     )
    // }

    function DeleteData(props) {
        // Get the current date
        const currentDate = new Date();
        // Convert currentDate to the same format as scheduleDate for comparison
        const currentDateString = currentDate.toISOString().split('T')[0];

        // Check if the schedule date is current or past
        const isPastOrCurrentDate = (date) => {
            return date <= currentDateString;
        };

        return (
            <div>
                {isPastOrCurrentDate(props.scheduleDate) ? null : (
                    <DeleteIcon onClick={() => {
                        // setDeleteId(props.selectedRow.id);
                        setDeleteDailogOpen(true);
                    }} />
                )}
            </div>
        );
    }


    function EditData(props) {
        return (
            <EditIcon onClick={(event) => {
                event.stopPropagation();
                setIsAddButton(false);
                setEditConfigSetup(props.selectedRow);
                setOpen(true);
            }}
            />
        )
    }

    function Reschedule(props) {
        return (
            <Button variant="contained"
                color="success" size="small"
                onClick={(event) => {
                    event.stopPropagation();
                    setIsAddButton(false);
                    setEditConfigSetup(props.selectedRow);
                    setDailogOpen(true);
                }}
            >Reschedule</Button>
        )
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const DeletUnit = () => {
        props.deleteLoadSchedule({
            id: deleteId
        }, handleDeleteSuccess, handleException);
    }

    const handleDeleteSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setRefreshData((oldvalue) => !oldvalue);
        setTimeout(() => {
            handleClose();
            setDeleteDailogOpen(false);
        }, 3000);
    }

    const handleException = (errorObject) => {

    };

    const columns = [
        {
            field: 'machine_name',
            headerName: 'Machine Name',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'scheduleDate',
            headerName: 'Date',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'shiftNumber',
            headerName: 'Shift',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        // {
        //     field: 'maxCapacity',
        //     headerName: 'Max Capacity',
        //     minWidth: 170,
        //     align: 'center',
        //     flex: 1,
        //     headerAlign: 'center'
        // },
        // {
        //     field: 'plannedCapacity',
        //     headerName: 'Planned Capacity',
        //     minWidth: 170,
        //     align: 'center',
        //     flex: 1,
        //     headerAlign: 'center'
        // },
        // {
        //     field: 'unitName',
        //     headerName: 'Units',
        //     minWidth: 170,
        //     align: 'center',
        //     flex: 1,
        //     headerAlign: 'center'
        // },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            minWidth: 100,
            align: 'center',
            flex: 1,
            cellClassName: 'actions',
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
                // <DeleteData selectedRow={params.row} />,
                // <Reschedule selectedRow={params.row} />,
            ],
        },
    ];
    const rescheduleColumns = [
        // {
        //     field: 'id',
        //     headerName: 'Serial No',
        //     minWidth: 170,
        //     align: 'center',
        //     flex: 1,
        //     headerAlign: 'center'
        // },
        // {
        //     field: 'scheduleTime',
        //     headerName: 'Schedule Time',
        //     minWidth: 170,
        //     align: 'center',
        //     flex: 1,
        //     headerAlign: 'center'
        // },
        {
            field: 'machine_name',
            headerName: 'Machine Name',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'scheduleDate',
            headerName: 'Schedule Date',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'reScheduleDate',
            headerName: 'Rescheduled Date',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'loadCapacity',
            headerName: 'Planned Capacity',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'remark',
            headerName: 'Remarks',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        // {
        //     field: 'actions',
        //     type: 'actions',
        //     headerName: 'Actions',
        //     minWidth: 100,
        //     align: 'center',
        //     flex: 1,
        //     cellClassName: 'actions',
        //     getActions: (params) => [
        //         <EditData selectedRow={params.row} />,
        //         <DeleteData selectedRow={params.row} />,
        //         <Reschedule selectedRow={params.row} />,
        //     ],
        // },
    ];

    return (
        <Box
            sx={{

                margin: '2vh',
                height: boxHeight,
            }}
        >
            <LoadScheduleToolbar
                setIsAddButton={setIsAddButton}
                setEditConfigSetup={setEditConfigSetup}
                setOpen={setOpen}
                setSecondDailogOpen={setSecondDailogOpen}
                editConfigSetup={editConfigSetup}
                setUploadLoader={setUploadLoader}
                setRefreshData={setRefreshData}
            // userAccess={moduleAccess}
            />
            {uploadLoader &&
                <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                </Box>
            }

            {/* <DataGrid
                rows={scheduledList}
                columns={columns}
                pageSize={5}
                loading={isLoading}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                style={{ backgroundColor: '#ffffff' }}
            /> */}

            <AssignShiftTable />

            {/* <Grid container style={{ marginTop: '20px' }}>
                <Grid item xs={12}>
                    <Typography style={{ backgroundColor: '#f7f7fe', padding: '20px', border: '1px solid #e0e0e0' }}
                        variant="h5"
                        fontFamily={'Roboto Slab'}>Rescheduled</Typography>
                    <DataGrid
                        rows={reScheduleList}
                        columns={rescheduleColumns}
                        pageSize={5}
                        loading={isLoading}
                        rowsPerPageOptions={[5]}
                        disableSelectionOnClick
                        style={{ backgroundColor: '#ffffff' }}
                    />
                </Grid>
            </Grid> */}

            <AddScheduleModal
                isAddButton={isAddButton}
                configSetupData={editConfigSetup}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
                handleClose={handleClose}
                openNotification={openNotification}
                setNotification={setNotification}
                setUploadLoader={setUploadLoader}
            />
            <RescheduleModal
                isAddButton={isAddButton}
                configSetupData={editConfigSetup}
                dailogOpen={dailogOpen}
                setDailogOpen={setDailogOpen}
                setRefreshData={setRefreshData}
                handleClose={handleClose}
                openNotification={openNotification}
                setNotification={setNotification}
            />
            {/* <SensorToMachineModal
        // isAddButton={isAddButton}
        configSetupData={editConfigSetup}
        secondDailogOpen={secondDailogOpen}
        setSecondDailogOpen={setSecondDailogOpen}
        setRefreshData={setRefreshData}
        handleClose={handleClose}
        openNotification={openNotification}
        setNotification={setNotification}
      /> */}
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
            <DeleteConfirmationDailog
                open={deleteDailogOpen}
                setOpen={setDeleteDailogOpen}
                deleteId={deleteId}
                deleteService={DeletUnit}
                handleSuccess={handleDeleteSuccess}
                handleException={handleException}
            />
        </Box>
    );
}

const mapStateToProps = ({ LoadSchedule }) => {
    const { showLoadScheduleLoader, showLoadScheduleList, reScheduleList, reScheduleListLoader } = LoadSchedule;
    return { showLoadScheduleLoader, showLoadScheduleList, reScheduleList, reScheduleListLoader }
}
export default connect(mapStateToProps, { showLoadSchedule, deleteLoadSchedule, reScheduledList })(LoadSchedule);