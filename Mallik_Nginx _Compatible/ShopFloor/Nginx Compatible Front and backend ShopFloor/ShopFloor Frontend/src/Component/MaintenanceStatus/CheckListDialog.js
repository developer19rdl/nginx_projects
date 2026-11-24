import React , {useState,useEffect} from  'react'
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DataGrid } from '@mui/x-data-grid';
import { ShowMaintChecklist } from '../../Services/NodeJsApiServices';
import ViewModal from '../Checklist/ViewModal';
import ViewModalMaint from '../Checklist/ViewModalMaint';
import VerifyModal from '../Checklist/VerifyModal';
// import VerifyModal from '../Checklist/VerifyModal';

const CheckListDialog = (props) => {
    const { onClose, value: valueProp, openCheckList,machineTag,setMachineTag,checkListId,setCheckListId, setRowid,rowid, ...other } = props;
    const [value, setValue] = React.useState(valueProp);
    const [checklistShow, setChecklistShow] = useState([]);
        const [refreshData, setRefreshData] = useState(false);
        // const [checkListId,setCheckListId] = useState()
    
    const [verifyModal, setVerifyModal] = useState(false);
        const [currentFrequency, setCurrentFrequency] = useState('');
    
    const radioGroupRef = React.useRef(null);
      const [viewModalOpen, setViewModalOpen] = useState(false);
          const [selectedRow, setSelectedRow] = useState('');

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
                field: 'frequency',
                headerClassName: 'super-app-theme--header',
                headerName:
                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        Frequency
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
                        Checklist Description
                    </span>,
        
                type: 'string',
                sortable: true,
                minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
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
                field: 'documentVersion',
                headerClassName: 'super-app-theme--header',
                headerName:
                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        Document Version
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
                    <View selectedRow={params.row} />,
                ],
            },
        ];

        function View(props) {
            return (
                <Button
                    variant="outlined"
                    size='small'
                    style={{ fontWeight: 'bold' }}
                    onClick={() => {
                        setViewModalOpen(true)
                        setSelectedRow(props.selectedRow)
                        // setCheckListId(props.selectedRow.checklistId)
                    }
                    }
                >View</Button>
            );
        }

       console.log("machineTagmachineTagmachineTagmachineTagmachineTagmachineTag",machineTag)

  /* useEffect(() => {
    if (machineTag) {
        ShowMaintChecklist({ machineTag: machineTag || null },handleSucessShow, handleExceptionShow)
    } else {
        console.warn('Checklist API not called: machineTag is undefined');
    }
    }, [machineTag,openCheckList]);

    const handleSucessShow = (dataObject) => {
        setChecklistShow(dataObject?.data || []);
    }

    const handleExceptionShow = (errorObject, errorMessage) => {

    }*/

        const handleEntering = () => {
            if (machineTag) {
              console.log('Calling API with machineTag:', machineTag);
              ShowMaintChecklist(
                { machineTag, checkListId },
                handleSucessShow,
                handleExceptionShow
              );
            } else {
              console.warn('No machineTag provided');
            }
          };
        
          const handleSucessShow = (dataObject) => {
            setChecklistShow(dataObject?.data || []);
          };
        
          const handleExceptionShow = (errorObject, errorMessage) => {
            console.error('Checklist API error:', errorMessage);
          };

    React.useEffect(() => {
      if (!openCheckList) {
        setValue(valueProp);
      }
    }, [valueProp, openCheckList]);
  
    // const handleEntering = () => {
    //   if (radioGroupRef.current != null) {
    //     radioGroupRef.current.focus();
    //   }
    // };
  
    const handleCancel = () => {
      onClose();
    };
  
    const handleOk = () => {
      onClose(value);
    };
  
    const handleChange = (event) => {
      setValue(event.target.value);
    };
  

  return (
    <>
    <Dialog
    sx={{ '& .MuiDialog-paper': { width: '80%', height: 435, minWidth:1000 } }}
    maxWidth="xs"
    TransitionProps={{ onEntering: handleEntering }}
    open={openCheckList}
    {...other}
  >
    <DialogTitle>Checklist</DialogTitle>
    <DialogContent dividers>
      <DataGrid
                     rows={checklistShow}
                     columns={columns}
                     pageSize={8}
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
                         const rowIndex = checklistShow.findIndex(row => row.id === params.row.id);
                         if (rowIndex !== -1) {
                             console.log(' ');
                             return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
                         }
                         return '';
                     }}
                 />
    </DialogContent>
    <DialogActions>
      <Button autoFocus onClick={handleCancel}>
        Cancel
      </Button>
    </DialogActions>
  </Dialog>
  
       <ViewModalMaint
            viewModalOpen={viewModalOpen}
            setViewModalOpen={setViewModalOpen}
            setRefreshData={setRefreshData}
            selectedRow={selectedRow}
            machineTag={machineTag}
            checkListId={checkListId}
            rowMaintId={rowid}
            setRowMaintId={setRowid}

        />     

                    {/* <VerifyModal
                        verifyModal={verifyModal}
                        setVerifyModal={setVerifyModal}
                        currentFrequency={currentFrequency}
                        // currentAnswerType={currentAnswerType}
                        viewRowId={rowId}
                        selectedRowData={selectedRowData}
                        selectedDate={selectedDate}
                        calenderDate={calenderDate}
                    /> */}





  </>
  )
}

export default CheckListDialog
