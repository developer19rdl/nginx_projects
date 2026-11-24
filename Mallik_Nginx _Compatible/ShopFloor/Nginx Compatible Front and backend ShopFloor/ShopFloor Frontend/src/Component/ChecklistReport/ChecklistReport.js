import React, { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { AllShowMasterAdd, DepartmentList, FetchAsstTypeAsset, getAssetDepartmentBased, GetChecklistReport, getMachinesDepartmentBased, GetReportAsset, GetReportSection } from '../../Services/NodeJsApiServices';
import NotificationBar from '../../Utility/NotificationBar';
import { ChecklistReportDownload } from '../../Services/DownloadCsvReportsService';

const ChecklistReport = () => {
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);
    const [departmentList, setDepartmentList] = useState([]);
    const [department, setDepartment] = useState('');
    const [sectionList, setSetSectionList] = useState([]);
    const [section, setSection] = useState('');
    const [assetList, setAssetList] = useState([]);
    const [asset, setAsset] = useState('');
    const [frequency, setFrequency] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reportLists, setReportLists] = useState([]);
    const [assetTypeList, setAssetTypeList] = useState([]);
    const [assetType, setAssetType] = useState('');
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const [selectedAssetName, setSelectedAssetName] = useState('');   
    const [machineList, setMachineList] = useState([]);
    

    const columns = [
        {
            field: 'checkname',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Checklist Name
                </span>,
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'departmentName',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Department
                </span>,

            type: 'number',
            sortable: true,
            sortable: false,
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'sectionName',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Section
                </span>,
            type: 'string',
            sortable: true,
            minWidth: 80, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'machineName',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Asset
                </span>,

            type: 'number',
            sortable: true,
            sortable: false,
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'frequency',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Frequency
                </span>,
            type: 'string',
            sortable: true,
            sortable: false,
            minWidth: 50,
            flex: 1,
            align: 'center', headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            flex: 1,
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Actions
                </span>,
            cellClassName: 'actions',
            disableClickEventBubbling: true,
            getActions: (params) => [
                <ReportDownload selectedRow={params.row} />,
                // <DeleteData selectedRow={params.row} />,
            ],
        },
    ];

    useEffect(() => {
        const handleResize = () => {
            setScreenHeight(window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        // AllShowMasterAdd({
        //     masterType: "department"
        // }, handleDepartmentSucess, handleDepartmentException);

         DepartmentList(handleDepartmentSucess, handleDepartmentException);



    }, [])

    // DEPARTMENT
    const handleDepartmentSucess = (dataObject) => {
        setDepartmentList(dataObject.data || []);
    }
    const handleDepartmentException = () => {
        setDepartmentList([]);
    }

    // SECTION
    const handleSectionSucess = (dataObject) => {
        setSetSectionList(dataObject.data || []);
    }
    const handleSectionException = () => {
        setSetSectionList([]);
    }

    // ASSET
    const handleAssetSucess = (dataObject) => {
        setAssetList(dataObject.data || []);
    }
    const handleAssetException = () => {
        setAssetList([]);
    }

    function ReportDownload(props) {
        return (
            <Tooltip title="Report">
                <DownloadForOfflineIcon
                    // style={{ color: userPermission[0]?.deleteData === 0 ? '#706f6f' : 'black' }}
                    style={{ color: '#387F39' }}
                    onClick={() => {
                        // if (userPermission[0]?.deleteData === 1) {
                        //     setDeleteId(props.selectedRow.id);
                        //     setDeleteDailogOpen(true);
                        // }
                        ChecklistReportDownload({ checkListId: props.selectedRow.checklist,  name: props.selectedRow.checkname, frequency: frequency, fromdate: fromDate, todate: toDate }, handleReportDownloadSuccess, handleReportDownloadException);
                    }}
                />
            </Tooltip>
        );
    }

    const handleReportDownloadSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            handleClose();
        }, 2000);
    }
    const handleReportDownloadException = (errorObject, errorMessage) => {
        console.log("the error ", errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
    }

    const handleSubmit = () => {
        GetChecklistReport({
            department: department,
            section: section,
            machine: asset,
            frequency: frequency,
            fromdate: fromDate,
            todate: toDate
        }, handleSubmitSucess, handleSubmitException)
    }

    const handleSubmitSucess = (dataObject) => {
        setReportLists(dataObject?.data || [])
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            handleClose();
        }, 2000);
    };
    const handleSubmitException = (errorObject, errorMessage) => {
        console.log("the error ", errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
        }, 2000);
    };

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

        const onSectionChange = (e) => {
            setSection(e.target.value);
              FetchAsstTypeAsset(
                  { id: e.target.value },
                  handleAsseTypeSuccess,
                  handleAsseTypeException
                );
          };

           const handleAsseTypeSuccess = (dataObject) => {
                setAssetTypeList(dataObject.data || []);
            };

        const handleAsseTypeException = (errorStaus, errorMessage) => {
            console.log(errorMessage);
        };


               const handleAssetTypeChanged = (value, AssetTypeView) => {
        
                    if(AssetTypeView === "Machine Asset"){
                        getMachinesDepartmentBased(
                            {  id: department,  typeId: value },
                            handleMachinesList,
                            handleMachineListException
                        );
                    }
        
                    if(AssetTypeView === "Tool Asset" || AssetTypeView === "Instrumental Asset"){
                        getAssetDepartmentBased(
                            { id: department, typeId: value },
                            handleAssetList,
                            handleAssetListException
                        );
                    }
                };

    const handleMachinesList = (dataObject) => {
        setMachineList(dataObject.data || []);
    }

    const handleMachineListException = () => { }

     const handleAssetList = (dataObject) => {
        setAssetList(dataObject.data || []);
    }
    const handleAssetListException = () => { }
        




    return (
        <div style={{ height: 400, width: '100%' }}>

            <Grid container spacing={2}>

                <Grid item xs={12} sm={12} md={1.7} lg={1.7} xl={1.7}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Department</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Department"
                            variant="filled"
                            value={department}
                            onChange={(e) => {
                                setDepartment(e.target.value)
                                GetReportSection({ id: e.target.value }, handleSectionSucess, handleSectionException)

                            }}
                        >
                            {departmentList.map((data) => (
                                <MenuItem key={data.id} value={data?.id} >{data?.departmentName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={12} md={1.7} lg={1.7} xl={1.7} >
                    {/* <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Section</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Section"
                            variant="filled"
                            value={section}
                            onChange={(e) => {
                                setSection(e.target.value)
                                GetReportAsset({ id: e.target.value }, handleAssetSucess, handleAssetException)
                            }}
                        >
                            {sectionList.map((data) => (
                                <MenuItem key={data.id} value={data?.id} >{data?.sectionName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl> */}

                       <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Section</InputLabel>
                            <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Section"
                            placeholder="Section"
                            value={section}
                            required
                            onChange={(e) => onSectionChange(e)}
                            >
                            {sectionList.length !== 0 ? (
                                <MenuItem value="" key={0}>
                                <em>Select Section</em>
                                </MenuItem>
                            ) : (
                                <MenuItem value="" key={0}>
                                <em>Select Department </em>
                                </MenuItem>
                            )}
                            {sectionList?.map((data, index) => {
                                return (
                                <MenuItem value={data.id} key={index}>
                                    {data.sectionName}
                                </MenuItem>
                                );
                            })}
                            </Select>
                        </FormControl>
                </Grid>
                                <Grid item xs={12} sm={12} md={1.7} lg={1.7} xl={1.7} >
                                                <FormControl fullWidth>
                                            <InputLabel id="demo-simple-select-label">Asset Type</InputLabel>
                                            <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            label="Asset Type"
                                            placeholder="Asset Type"
                                            value={assetType}
                                            onChange={(e) => {
                                               const value = e.target.value;
                
                                                const selectedAsset = assetTypeList.find(
                                                (item) => item.id === value
                                                );
                                                setAssetType(value); // Store the ID
                                                const assetTypeName = selectedAsset?.AssetTypeView || "";
                                                setSelectedAssetName(assetTypeName); // Store the name
                                                if (assetTypeName) handleAssetTypeChanged(value, assetTypeName);
                                            }}
                                            >
                                            {assetTypeList.length !== 0 ? (
                                                <MenuItem value="" key={0}>
                                                <em>Select Asset Type</em>
                                                </MenuItem>
                                            ) : (
                                                <MenuItem value="" key={0}>
                                                <em>Select Section</em>
                                                </MenuItem>
                                            )}
                                            {assetTypeList?.map((data, index) => (
                                                <MenuItem value={data.id} key={index}>
                                                {data.AssetTypeView}
                                                </MenuItem>
                                            ))}
                                            </Select>
                                        </FormControl>
                                         </Grid>

                            <Grid item xs={12} sm={12} md={1.7} lg={1.7} xl={1.7} >
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Asset</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Section"
                                        variant="filled"
                                        value={asset}
                                        onChange={(e) => setAsset(e.target.value)}
                                    >
                                        {(selectedAssetName === "Machine Asset" ? machineList : assetList).map((data) => (
                                            <MenuItem key={data.id} value={data?.id}>{data?.machineName || data?.asset}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                                <Grid item xs={12} sm={12} md={1.7} lg={1.7} xl={1.7} >
                                    <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Frequency</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Section"
                                        variant="filled"
                                        value={frequency}
                                        onChange={(e) => setFrequency(e.target.value)}
                                    >
                                        <MenuItem value={'daily'} >Daily</MenuItem>
                                        <MenuItem value={'monthly'} >Monthly</MenuItem>
                                        <MenuItem value={'quarterly'} >Quarterly</MenuItem>
                                        <MenuItem value={'semi_annually'} >Semi Annually</MenuItem>
                                        <MenuItem value={'annually'} >Annually</MenuItem>
                                    </Select>
                                </FormControl>
                                </Grid>

                <Grid item xs={12} sm={12} md={1.7} lg={1.7} xl={1.7} >
                    <TextField
                        id="filled-basic"
                        label="From"
                        variant="filled"
                        type="date"
                        fullWidth
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        InputLabelProps={{ shrink: true, style: { color: '#000000', fontWeight: 'bold' } }}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={1.7} lg={1.7} xl={1.7} >
                    <TextField
                        id="filled-basic"
                        label="To"
                        variant="filled"
                        type="date"
                        fullWidth
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        InputLabelProps={{ shrink: true, style: { color: '#000000', fontWeight: 'bold' } }}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={1.7} lg={1.7} xl={1.7} display={'flex'} alignItems={'center'} justifyContent={'center'} >
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            backgroundColor: "#051622", color: "#ffff",
                            "&:hover": {
                                backgroundColor: "#183b52", // Change to your desired hover color
                            },
                        }}                    >
                        Submit
                    </Button>
                </Grid>

                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} marginTop={2} >
                    <Box sx={{ height: screenHeight - 310, width: '100%' }}>
                        <DataGrid
                            rows={reportLists}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 5,
                                    },
                                },
                            }}
                            sx={{
                                '& .MuiDataGrid-columnHeaders': {
                                    color: '#000000', // Header text color
                                    fontWeight: 'bold', // Header font weight
                                },
                                '& .MuiDataGrid-columnHeaderTitle': {
                                    fontWeight: 'bold', // Ensures the header font weight is bold
                                },
                            }}
                            getRowClassName={(params) => {
                                const rowIndex = reportLists.findIndex(row => row.id === params.row.id);
                                if (rowIndex !== -1) {
                                    console.log(' ');
                                    return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
                                }
                                return '';
                            }}
                            pageSizeOptions={[5]}
                            disableRowSelectionOnClick
                        // rowHeight={40}
                        // columnHeaderHeight={40}
                        />
                    </Box>
                </Grid>
            </Grid >
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
            {/* </CardContent >
        </Card> */}
        </div>
    )
}

export default ChecklistReport