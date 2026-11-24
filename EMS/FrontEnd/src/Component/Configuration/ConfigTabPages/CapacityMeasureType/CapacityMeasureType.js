import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import CapacityMeasureToolbar from "./SubCapacityMeasureType/CapacityMeasureToolbar";
import CapacityMeasureModal from "./SubCapacityMeasureType/CapacityMeasureModal";
import {
  CapacityMeasureDalete,
  CapacityMeasureView,
} from "../../../../Services/NodeJsApiServices";
import NotificationBar from "../../../../Utility/NotificationBar";
import DeleteConfirmationDailog from "../../../../Utility/DeleteConfirmationDailog";

const CapacityMeasureType = (props) => {
    const [open, setOpen] = useState(false);
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState("");
    const [isAddButton, setIsAddButton] = useState(true);
    const [editConfigSetup, setEditConfigSetup] = useState([]);
    const [isLoading, setGridLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [rows, setrows] = useState([]);
    const [openNotification, setNotification] = useState({
        status: false,
        type: "error",
        message: "",
    });

    useEffect(() => {
        CapacityMeasureView(handleSuccess, handleException);
    }, [refreshData]);

    const handleSuccess = (dataObject) => {
        setGridLoading(false);
        setrows(dataObject?.data || []);
    };

    const handleException = (errorObject) => {};

    const columns = [
        {
        field: "capacityMeasureType",
        headerName: "Production Type",
        minWidth: 170,
        align: "center",
        flex: 1,
        headerAlign: "center",
        },
        {
        field: "capacityMeasure",
        headerName: "Description",
        minWidth: 170,
        align: "center",
        flex: 1,
        headerAlign: "center",
        },
        {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        minWidth: 100,
        align: "center",
        flex: 1,
        cellClassName: "actions",
        getActions: (params) => [
            <EditData selectedRow={params.row} />,
            <DeleteData selectedRow={params.row} />,
        ],
        },
    ];

    function DeleteData(props) {
        return (
        <DeleteIcon
            onClick={() => {
            setDeleteId(props.selectedRow.id);
            setDeleteDailogOpen(true);
            }}
        />
        );
    }

    function EditData(props) {
        return (
        <EditIcon
            onClick={(event) => {
            event.stopPropagation();
            setIsAddButton(false);
            setEditConfigSetup(props.selectedRow);
            setOpen(true);
            }}
        />
        );
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: "",
            message: "",
        });
    };

    const DeletUnit = () => {
        props.deleteCapacityMeasure(
        {
            id: deleteId,
        },
        handleDeleteSuccess,
        handleException
        );
    };

    const handleDeleteSuccess = (dataObject) => {
        setNotification({
        status: true,
        type: "success",
        message: dataObject.message,
        });
        setRefreshData((oldvalue) => !oldvalue);
        setTimeout(() => {
        handleClose();
        setDeleteDailogOpen(false);
        }, 3000);
    };

    return (
        <div style={{ height: 400, width: "100%" }}>
            <CapacityMeasureToolbar
                setIsAddButton={setIsAddButton}
                setEditConfigSetup={setEditConfigSetup}
                setOpen={setOpen}
                editConfigSetup={editConfigSetup}
            />

            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                loading={isLoading}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                style={{ backgroundColor: "#ffffff" }}
            />

            <CapacityMeasureModal
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
                deleteService={CapacityMeasureDalete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleException}
            />
        </div>
    );
};

export default CapacityMeasureType;
