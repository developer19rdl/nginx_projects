import React, { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';

import { Box, Button, Grid, LinearProgress, Typography } from '@mui/material';
import { connect } from 'react-redux';
import { showLoadSchedule, deleteLoadSchedule, reScheduledList } from '../../../Actions';

import AssignScheduleToolbar from './AssignScheduleToolbar ';
import AssignShiftOT from '../AssignShiftTable/AssignShiftOT';
import AddShiftModelOT from './AddShiftModelOT';

const AssignSchedule = (props) => {
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

       

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [refreshData])

    const handleGetScheduleSuccess = (dataObject) => {
        setScheduledList(dataObject?.data)
    }
    const handleGetScheduleException = () => { }



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

    

    return (
        <Box
            sx={{

                margin: '2vh',
                height: boxHeight,
            }}
        >
            <AssignScheduleToolbar
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

           

            <AssignShiftOT />

            

            <AddShiftModelOT
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
           
        </Box>
    );
}

const mapStateToProps = ({ LoadSchedule }) => {
    const { showLoadScheduleLoader, showLoadScheduleList, reScheduleList, reScheduleListLoader } = LoadSchedule;
    return { showLoadScheduleLoader, showLoadScheduleList, reScheduleList, reScheduleListLoader }
}
export default connect(mapStateToProps, { showLoadSchedule, deleteLoadSchedule, reScheduledList })(AssignSchedule);