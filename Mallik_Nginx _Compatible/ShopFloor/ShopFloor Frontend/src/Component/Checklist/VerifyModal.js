import React, { useEffect, useState } from 'react';
import {
    Button, Box, Dialog, Tooltip, DialogContent, DialogTitle, TextField, Grid, DialogActions, InputLabel, Select, MenuItem, FormControl, FormControlLabel, Checkbox, CardContent, Typography, Autocomplete, InputAdornment, OutlinedInput, ListItemText, RadioGroup, Radio, FormGroup, FormLabel,
} from '@mui/material';
import NotificationBar from '../../Utility/NotificationBar';
import { DataGrid } from '@mui/x-data-grid';
import {  GetChecklistVerifyLists, MaintenanceUpdateCheckList, UpdateTableCellAnswer } from '../../Services/NodeJsApiServices';
import CellAssignModal from './CellAssignModal';

const VerifyModal = ({
    isAddButton, editData, verifyModal, setVerifyModal, currentFrequency,/* currentAnswerType,*/ viewRowId, selectedRowData, selectedDate, calenderDate, rowMaintId, setRowMaintId
}) => {
    const [rowId, setRowId] = useState('');
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);
    const [cellAssignModal, setCellAssignModal] = useState(false);
    const [verifiedLists, setVerifiedLists] = useState([]);
    console.log("verifiedListsverifiedLists", verifiedLists)
    const [gridHeaderName, setGridHeaderName] = useState('');
    const [checklistBodyDetails, setChecklistBodyDetails] = useState('');
    const [checklistRowData, setChecklistRowData] = useState('');
    const [currentAnswerType, setCurrentAnswerType] = useState('');
    const [refreshData, setRefreshData] = useState(false);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
       
        verifyModal && GetChecklistVerifyLists({ templateid: selectedRowData.templateid, frequency: currentFrequency , checkListId: selectedRowData.checklistid}, handleGetListSuccess, handleGetListException)
    }, [verifyModal, refreshData])

    const handleGetListSuccess = (dataObject) => {
        const transformedData = dataObject?.data.map((item, index) => {
            return {
                ...item,
                sno: index + 1,
                item: item.layout_details.item,  // Add item outside of layout_details
                layout_details: {
                    ...item.layout_details,  // Keep the original layout_details intact
                    item: item.layout_details.item  // Ensure item is also inside layout_details
                }
            };
        });
        setVerifiedLists(transformedData)
    }
    const handleGetListException = () => { }

    // SUBMIT
    const handleSubmit = (event) => {
        event.preventDefault();
        if (isAddButton) {
        } else {
        }
    };

    const handleSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            ClearData();
            handleClose();
        }, 2000);
    };
    const handleException = (errorObject, errorMessage) => {
        console.log("the error ", errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
        }, 2000);
    };

    const ClearData = () => {
        setVerifyModal(false);
    }

    const loaderData = () => {
        setRowId(editData?.id || '');
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const dailyColumns = [
        {
            field: 'sno',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Sno
                </span>,
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'item',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Checklist Item
                </span>,

            type: 'string',
            sortable: true,
            width: 500,
            // minWidth: 100,
            // flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: '1',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Object 1
                </span>,
            sortable: true,
            sortable: false,
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center',
            editable: currentAnswerType === 'userData' ? true : false,
        },
    ];


        // UPDATED Code  
        const currentYear = new Date(calenderDate).getFullYear();
        const currentMonth = new Date(calenderDate).getMonth(); // 0-indexed, January is 0
    
        // Get the number of days in the current month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
        // Generate columns for each day of the current month
        for (let day = 1; day <= daysInMonth; day++) {
            dailyColumns.push({
                field: `${day}`,
                headerClassName: 'super-app-theme--header',
                headerName: (
                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {`${day}`}
                    </span>
                ),
                type: 'string', // or whatever type you need
                sortable: true,
                // minWidth: 50,
                editable: currentAnswerType === 'userData' ? true : false,
                // flex: 1,
                width: 30,
                align: 'center',
                headerAlign: 'center',
            });
        }


    const monthNames = [
        "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR"
      ];

    const monthlyColumns = [
        {
            field: 'sno',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Sno
                </span>,
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'item',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Checklist Item
                </span>,

            type: 'string',
            sortable: true,
            width: 500,
            // flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
    ];

    monthNames.forEach((month, index) => {
        monthlyColumns.push({
          field: month,
          headerClassName: 'super-app-theme--header',
          headerName: (
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {month}
            </span>
          ),
          type: 'string',
          sortable: true,
          editable: currentAnswerType === 'userData',
          width: 60,
          align: 'center',
          headerAlign: 'center',
        });
      });


      const quarterlyNames = [ "APR_MAY_JUN", "JUL_AUG_SEP", "OCT_NOV_DEC", "JAN_FEB_MAR"
      ];

    const quarterlyColumns = [
        {
            field: 'sno',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Sno
                </span>,
            type: 'string',
            sortable: true,
            minWidth: 30,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'item',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Checklist Item
                </span>,

            type: 'string',
            sortable: true,
            width: 500,
            // flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
    ];

    
    quarterlyNames.forEach((month, index) => {
        quarterlyColumns.push({
          field: month,
          headerClassName: 'super-app-theme--header',
          headerName: (
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {month}
            </span>
          ),
          type: 'string',
          sortable: true,
          editable: currentAnswerType === 'userData',
          width: 60,
          align: 'center',
          headerAlign: 'center',
        });
      });


      const semiAnnuallyNames = [ "APR_MAY_JUN_JUL_AUG_SEP", "OCT_NOV_DEC_JAN_FEB_MAR"];

    const semiAnnuallyColumns = [
        {
            field: 'sno',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Sno
                </span>,
            type: 'string',
            sortable: true,
            minWidth: 30,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'item',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Checklist Item
                </span>,

            type: 'string',
            sortable: true,
            width: 500,
            // flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
    ];

    
    semiAnnuallyNames.forEach((month, index) => {
        semiAnnuallyColumns.push({
          field: month,
          headerClassName: 'super-app-theme--header',
          headerName: (
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {month}
            </span>
          ),
          type: 'string',
          sortable: true,
          editable: currentAnswerType === 'userData',
          width: 60,
          align: 'center',
          headerAlign: 'center',
        });
      });


      const annuallyNames = ["APR_MAY_JUN_JUL_AUG_SEP_OCT_NOV_DEC_JAN_FEB_MAR"];

    const annuallyColumns = [
        {
            field: 'sno',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Sno
                </span>,
            type: 'string',
            sortable: true,
            minWidth: 30,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'item',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Checklist Item
                </span>,

            type: 'string',
            sortable: true,
            width: 500,
            // flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
    ];

    
    annuallyNames.forEach((month, index) => {
        annuallyColumns.push({
          field: month,
          headerClassName: 'super-app-theme--header',
          headerName: (
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {month}
            </span>
          ),
          type: 'string',
          sortable: true,
          editable: currentAnswerType === 'userData',
          width: 60,
          align: 'center',
          headerAlign: 'center',
        });
      });

    const handleCellClick = (params) => {
        if (params.field === 'item' || params.field === 'sno') {
            console.log("do nothing")
        } else {
            setCurrentAnswerType(params.row.answertype);
            setGridHeaderName(params.field)
            setChecklistBodyDetails(params.row.layout_details)
            setChecklistRowData(params.row)
            params.row.answertype !== 'userData' && setCellAssignModal(true)
        }
    }

    const handleRowUpdate = (newRow, oldRow) => {
        const field = Object.keys(newRow).find(key => newRow[key] !== oldRow[key]);
        // Log or use the field name
        if (field === 'item' || field === 'sno') {
            console.log("do nothing")
        } else {
            console.log('Editing cell in field:', newRow[2]);
            UpdateTableCellAnswer({ id: newRow.layoutid, date: field, ans: newRow[field],frequency: currentFrequency, currentAnswerType:currentAnswerType }, handleUpdateSuccess, handleUpdateException)
        }
    }

    const handleUpdateSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            handleClose();
        }, 2000);
    };
    const handleUpdateException = (errorObject, errorMessage) => {
        console.log("the error ", errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
        }, 2000);
    };

const handleSubmitCheckList = () => {
    if (!rowMaintId) {
        console.error("rowMaintId is missing");
        return;
    }
    MaintenanceUpdateCheckList(
        { id: rowMaintId },
        handleCheckListSuccess,
        handleCheckListException
    );
};


    const handleCheckListSuccess = (dataObject) => {
          setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            handleClose();
        }, 2000);
        }

    const handleCheckListException = (errorObject, errorMessage) => {
        console.log("the error ", errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
        }, 2000);
        }

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { minWidth: '50%' } }}
            open={verifyModal}
            fullScreen
        >
            <DialogTitle style={{ background: '#002D68', color: 'white' }}>
                VERIFY CHECKLIST
            </DialogTitle>
            <DialogContent style={{ paddingTop: '20px' }}>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>

                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <Box
                                sx={{
                                    width: '100%',
                                    '& .super-app-theme--header': {
                                        backgroundColor: '#93bce6',
                                        color: '#1c1919'
                                    },
                                }}
                            >
                                <DataGrid
                                    rows={verifiedLists}
                                    columns={
                                        currentFrequency === 'daily' ?
                                        dailyColumns :
                                            currentFrequency === "monthly" ?
                                            monthlyColumns :
                                                currentFrequency === "quarterly" ?
                                                    quarterlyColumns :
                                                    currentFrequency === "semi_annually" ?
                                                        semiAnnuallyColumns :
                                                        currentFrequency === "annually" ?
                                                            annuallyColumns :
                                                            [] // ✅ Safe fallback
                                    }
                                    
                                    pageSize={8}
                                    rowsPerPageOptions={[8]}
                                    onCellClick={handleCellClick}
                                    disableSelectionOnClick
                                    style={{ border: 'none', }}
                                    sx={{
                                        cursor: 'pointer',
                                        overflow: 'auto',
                                        height: Number(screenHeight) - 160,
                                        width: '100%',
                                        '& .super-app-theme--header': {
                                            WebkitTextStrokeWidth: '0.6px',

                                        },
                                        '& .MuiDataGrid-cell': {
                                            border: '1px solid #969696',
                                            padding: '4px 8px', // Smaller padding
                                        },
                                        '& .MuiDataGrid-columnHeader': {
                                            border: '1px solid #969696', // Add border to column headers
                                            padding: '4px 8px'
                                        },
                                    }}
                                    getRowClassName={(params) => {
                                        const rowIndex = verifiedLists.findIndex(row => row.id === params.row.id);
                                        if (rowIndex !== -1) {
                                            console.log(' ');
                                            return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
                                        }
                                        return '';
                                    }}
                                    rowHeight={28} // Reduced from 40
                                    columnHeaderHeight={30} // Reduced from 40
                                    processRowUpdate={handleRowUpdate}
                                />
                            </Box>
                        </Grid>

                    </Grid>
                </form>
            </DialogContent>
            <DialogActions>
                 {/* <FormControlLabel required control={<Checkbox />} label="Mark as Complete" /> */}
                   <Button
                    variant="contained"
                    style={{ width: '150px', background: '#002D68', color: 'white' }}
                    onClick={() => {
                        handleSubmitCheckList();
                    }}
                   >
                    Complete 
                    {/* Submission */}
                </Button>
                <Button
                    variant="contained"
                    style={{ width: '150px', background: '#002D68', color: 'white' }}
                    onClick={() => {
                        setVerifyModal(false)
                        ClearData();
                    }}
                >
                    Cancel
                </Button>
            </DialogActions>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
            <CellAssignModal
                setCellAssignModal={setCellAssignModal}
                cellAssignModal={cellAssignModal}
                gridHeaderName={gridHeaderName}
                checklistBodyDetails={checklistBodyDetails}
                checklistRowData={checklistRowData}
                setRefreshData={setRefreshData}
                currentFrequency={currentFrequency}
                currentAnswerType={currentAnswerType}
            />
        </Dialog>
    )
}

export default VerifyModal