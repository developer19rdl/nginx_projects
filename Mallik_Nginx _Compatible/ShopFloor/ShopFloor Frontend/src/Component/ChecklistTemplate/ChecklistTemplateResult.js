import React, { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { Box, Button, Card, CardContent, Tooltip } from '@mui/material';
import NotificationBar from '../../Utility/NotificationBar';
import { DataGrid } from '@mui/x-data-grid';
import ChecklistTemplateTitle from './ChecklistTemplateTitle';
import ChecklistTemplateModule from './ChecklistTemplateModule';
import { TemplateDelete, ShowTemplate } from '../../Services/NodeJsApiServices'
import DeleteConfirmationDailog from '../../Utility/DeleteConfirmationDailog';
import '../../App.css';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import AddLayoutModule from './AddLayoutModule';

const ChecklistTemplateResult = (props) => {
    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [editData, setEditData] = useState([]);
    const [id, setId] = useState('');
    const [password, setConfirmPassword] = useState('');
    const [btnReset, setBtnReset] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false)
    const [deleteId, setDeleteId] = useState('');
    const [layoutModuleOpen, setLayoutModuleOpen] = useState(false);
    // ---------------------------------------------------------------------------------------------
    const [templateList, setTemplateList] = useState([]);
    const [seletcedRow, setSelectedRow] = useState('')

    const columns = [
        {
            field: 'name',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Template Name
                </span>,
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'description',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Template Description
                </span>,

            type: 'string',
            sortable: true,
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
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
                <View selectedRow={params.row} />,
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,
                <Layout selectedRow={params.row} />,
            ],
        },
    ];

    useEffect(() => {
        ShowTemplate(handleSucessShow, handleExceptionShow)
    }, [refreshData]);

    const handleSucessShow = (dataObject) => {
        setTemplateList(dataObject?.data || []);
        // setGridLoading(false);
        console.log("dataObject", dataObject)
    }
    const handleExceptionShow = (errorObject, errorMessage) => {

    }

    function EditData(props) {
        return (
            <EditIcon
                style={{ color: 'black' }}
                onClick={(event) => {
                    setIsAddButton(false);
                    setEditData(props.selectedRow);
                    setOpen(true);
                }}
            />
        );
    }

    function DeleteData(props) {
        return (
            <DeleteIcon
                style={{ color: 'black' }}
                onClick={() => {
                    setDeleteId(props.selectedRow.id);
                    setDeleteDailogOpen(true);
                }}
            />
        );
    }

    function Layout(props) {
        return (
            <Button variant="outlined" size="small" onClick={() => {
                setSelectedRow(props.selectedRow)
                setLayoutModuleOpen(true)
            }
            }>Layout</Button>
        );
    }

    function View(props) {
        return (
            <RemoveRedEyeIcon
                style={{ color: 'black' }}
                onClick={() => {
                    // if (userPermission[0]?.deleteData === 1) {
                    //     setDeleteId(props.selectedRow.id);
                    //     setDeleteDailogOpen(true);
                    // }
                }}
            />
        );
    }

    const deletehandleSuccess = (dataObject) => {
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
    };
    const deletehandleException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            // handleClose();
        }, 3000);
    };

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    return (
        // <div style={{ height: '60vh', width: '100%' }}>
        <div style={{ height: 400, width: '100%' }}>

            {/* <h2>{props.name}</h2>
            <button onClick={()=>props.changeUserName()}>Click me</button> */}
            <ChecklistTemplateTitle
                setIsAddButton={setIsAddButton}
                setEditData={setEditData}
                setOpen={setOpen}
            />
            {/* <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <Card style={{ boxShadow: '0 10px 10px 2px rgba(0, 0, 0, 0.2)', borderRadius: '10px', width: '98%', height: '100%' }}>
                    <CardContent>
                        <Box
                            sx={{
                                height: '150%',
                                width: '100%',
                                '& .super-app-theme--header': {
                                    backgroundColor: '#93bce6',
                                    color: '#1c1919'
                                },
                            }}
                        > */}
            <DataGrid
                rows={templateList}
                columns={columns}
                pageSize={8}
                // loading={isLoading}
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
                getRowClassName={(params) => {
                    // Find the index of the row within the rows array
                    const rowIndex = templateList.findIndex(row => row.id === params.row.id);
                    // Check if the index is valid
                    if (rowIndex !== -1) {
                        console.log(' ');
                        return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
                    }
                    return ''; // Return default class if index is not found
                }}
            // rowHeight={40}
            // columnHeaderHeight={40}
            />
            {/* </Box>
                    </CardContent>
                </Card>

            </div> */}

            <ChecklistTemplateModule
                isAddButton={isAddButton}
                editData={editData}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}

            />
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
                // selectedMaster={selectedMaster}
                deleteService={TemplateDelete}
                handleSuccess={deletehandleSuccess}
                handleException={deletehandleException}
            />
            <AddLayoutModule
                setLayoutModuleOpen={setLayoutModuleOpen}
                layoutModuleOpen={layoutModuleOpen}
                seletcedRow={seletcedRow}
            />
        </div>
    )
}

export default ChecklistTemplateResult
// const mapStateToProps = ({ config }) => {
//     const { name } = config;
//     return { name }
// }
// export default connect(mapStateToProps, { })(CustomerResult);