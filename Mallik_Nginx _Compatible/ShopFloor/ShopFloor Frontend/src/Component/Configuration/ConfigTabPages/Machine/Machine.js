import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import MachineModal from './SubMachine/MachineModal';
import MachineToolbar from './SubMachine/MachineToolbar';
import DeleteConfirmationDailog from './SubMachine/DeleteConfirmationDailog';
import NotificationBar from './SubMachine/NotificationBar';
import { connect } from 'react-redux';
import { showMachine, deleteMachine } from '../../../../Actions';
import { MachineDalete } from '../../../../Services/NodeJsApiServices';
import { GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


const Machine = (props) => {

const { machineList, machineLoader } = props;
console.log("machineList com", machineList)

const handleDownloadExcel = async () => {
if (!machineList || machineList.length === 0) {
  alert("No data to export!");
  return;
}

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Machine Master");

    // ✅ Columns
    worksheet.columns = [
      { header: 'Sl No', key: 'slno', width: 10 },
      { header: 'Machine Code', key: 'machine_tag', width: 20 },
      { header: 'Machine Name', key: 'machine_name', width: 25 },
      { header: 'Department', key: 'departmentName', width: 20 },
      { header: 'Max Capacity', key: 'max_capacity', width: 15 },
      { header: 'Unit', key: 'unit', width: 15 },
      { header: 'Loading Time', key: 'loading_time', width: 15 },
      { header: 'Unloading Time', key: 'unloading_time', width: 18 },
      { header: 'Max Production/Hr', key: 'max_production_per_hour', width: 22 },
      { header: 'Dashboard Display', key: 'is_dashboard_display', width: 20 },
      { header: 'Health Dashboard', key: 'isSensorHealth', width: 20 },
    ];

    // ✅ Rows
    machineList.forEach((row, index) => {
      worksheet.addRow({
        slno: index + 1,
        ...row,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Machine_Master_List.xlsx");
  };
  const columns = [
      {
        field: 'slno',
        headerName: 'Sl No',
        minWidth: 80,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        renderCell: (params) =>
          params.api.getRowIndexRelativeToVisibleRows(params.id) + 1,
      },
      {
        field: 'machine_tag',
        headerName: 'M.C CODE',
        minWidth: 170,
        align: 'center',
        flex: 1,
        headerAlign: 'center'
      },
      {
        field: 'machine_name',
        headerName: 'Machine Name',
        minWidth: 170,
        align: 'center',
        flex: 1,
        headerAlign: 'center'
      },
      {
        field: 'departmentName',
        headerName: 'Department',
        minWidth: 170,
        align: 'center',
        flex: 1,
        headerAlign: 'center'
      },
      {
        field: 'max_capacity',
        headerName: 'Max Capacity',
        minWidth: 170,
        align: 'center',
        flex: 1,
        headerAlign: 'center'
      },
      {
        field: 'unit',
        headerName: 'Capacity Measuring Unit',
        minWidth: 170,
        align: 'center',
        flex: 1,
        headerAlign: 'center'
      },
    {
      field: 'loading_time',
      headerName: 'Loading Time',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'unloading_time',
      headerName: 'Unloading Time',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'max_production_per_hour',
      headerName: 'Max Production Hour',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'is_dashboard_display',
      headerName: 'Dashboard Display',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'isSensorHealth',
      headerName: 'Health Dashboard Display',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
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
        <DeleteData selectedRow={params.row} />,
      ],
    },
  ];

  const [open, setOpen] = useState(false);
  const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [isAddButton, setIsAddButton] = useState(true);
  const [editConfigSetup, setEditConfigSetup] = useState([]);
  const [assetList, setAssetList] = useState([]);
  const [isLoading, setGridLoading] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const [openNotification, setNotification] = useState({
    status: false,
    type: 'error',
    message: '',
  });

  useEffect(() => {
    props.showMachine();
  }, [refreshData]);

  function DeleteData(props) {
    return (
      <DeleteIcon onClick={() => {
        setDeleteId(props.selectedRow.id);
        setDeleteDailogOpen(true);
      }}
      />
    )
  }

  function EditData(props) {
    return (
      <EditIcon onClick={(event) => {
        event.stopPropagation();
        setIsAddButton(false);
        setEditConfigSetup(props.selectedRow);
        console.log("setEditConfigSetup", props.selectedRow)
        setOpen(true);
      }}
      />
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
    MachineDalete({
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
    <div style={{ height: 400, width: '100%' }}>
      <MachineToolbar
        setIsAddButton={setIsAddButton}
        setEditConfigSetup={setEditConfigSetup}
        setOpen={setOpen}
        editConfigSetup={editConfigSetup}
        handleDownloadExcel={handleDownloadExcel}
      />
      <DataGrid
        rows={machineList}
        columns={columns}
        pageSize={5}
        loading={isLoading}
        rowsPerPageOptions={[5]}
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
      <MachineModal
        isAddButton={isAddButton}
        configSetupData={editConfigSetup}
        open={open}
        setOpen={setOpen}
        setRefreshData={setRefreshData}
        handleClose={handleClose}
        openNotification={openNotification}
        setNotification={setNotification}
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
        deleteService={DeletUnit}
        handleSuccess={handleDeleteSuccess}
        handleException={handleException}
      />
    </div>
  );
}

const mapStateToProps = ({ config }) => {
  const { machineList, machineLoader } = config;
  return { machineList, machineLoader }
}
// export default connect(mapStateToProps, { showMachine, deleteMachine })(Machine);
export default React.memo(connect(mapStateToProps, { showMachine, deleteMachine })(Machine));



