import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState, useCallback, useMemo } from "react";
import { SobConsolidateSob, SobResetNpdCheck, SobNpdItemsDeleteMultiple } from "../../../ApiService/LoginPageService";
import * as XLSX from "xlsx";

const columns = [
    {
        field: "contractNo",
        headerClassName: "super-app-theme--header",
        headerName: (
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>Contract No</span>
        ),
        type: "string",
        sortable: true,
        minWidth: 120,
        flex: 1,
        align: "center",
        headerAlign: "center",
    },
    {
        field: "product",
        headerClassName: "super-app-theme--header",
        headerName: (
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>Product</span>
        ),
        type: "string",
        sortable: true,
        minWidth: 200,
        flex: 2,
        align: "Center",
        headerAlign: "center",
    },
    {
        field: "fimNo",
        headerClassName: "super-app-theme--header",
        headerName: (
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>FIM No</span>
        ),
        type: "string",
        sortable: true,
        minWidth: 120,
        flex: 1,
        align: "center",
        headerAlign: "center",
    },
    {
        field: "partNo",
        headerClassName: "super-app-theme--header",
        headerName: (
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>Part No</span>
        ),
        type: "string",
        sortable: true,
        minWidth: 150,
        flex: 1,
        align: "center",
        headerAlign: "center",
    },
    {
        field: "Qty",
        headerClassName: "super-app-theme--header",
        headerName: (
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>Qty</span>
        ),
        type: "string",
        sortable: true,
        minWidth: 80,
        flex: 1,
        align: "center",
        headerAlign: "center",
    },
];

const NpdList = ({ openNpdList, setOpenNpdList, masterId, setRefeshMissing }) => {

    const [npdRows, setNpdRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);

    const handleSuccess = useCallback((dataObject) => {
        setIsLoading(false);
        setNpdRows(dataObject?.npdRows || []);
    }, []);

    const handleException = useCallback(() => {
        setIsLoading(false);
        setNpdRows([]);
    }, []);

    // Fetch NPD data every time the dialog opens
    useEffect(() => {
        if (openNpdList && masterId) {
            setIsLoading(true);
            SobConsolidateSob(
                { id: masterId },
                handleSuccess,
                handleException
            );
        }
    }, [openNpdList, masterId, handleSuccess, handleException]);

    const handleClose = useCallback(() => {
        setOpenNpdList(false);
        setNpdRows([]);
        setSelectedRows([]);
        if (setRefeshMissing) {
            setRefeshMissing(prev => !prev);
        }
    }, [setOpenNpdList, setRefeshMissing]);

    const handleDownload = useCallback(() => {
        if (npdRows && npdRows.length > 0) {
            // Map the rows to have proper Excel column headers
            const exportData = npdRows.map(row => ({
                "Contract No": row.contractNo,
                "Product": row.product,
                "FIM No": row.fimNo,
                "Part No": row.partNo,
                "Qty": row.Qty
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "NPD List");
            XLSX.writeFile(wb, "NPD_List.xlsx");
        }
    }, [npdRows]);

    const handleRefresh = useCallback(() => {
        setIsLoading(true);
        SobResetNpdCheck({ id: masterId }, (res) => {
            // The API returns the updated data directly, so we avoid an extra API call
            setIsLoading(false);
            setNpdRows(res?.data || []);
        }, (err) => {
            setIsLoading(false);
        });
    }, [masterId]);

    const handleDelete = useCallback(() => {
        if (selectedRows.length === 0) return;
        setIsLoading(true);
        const payload = {
            sobIds: selectedRows,
            sobMstId: masterId
        };
        SobNpdItemsDeleteMultiple(payload, (res) => {
            // Success, fetch fresh data
            SobConsolidateSob(
                { id: masterId },
                handleSuccess,
                handleException
            );
            setSelectedRows([]); // clear selection
        }, (err) => {
            setIsLoading(false);
        });
    }, [selectedRows, masterId, handleSuccess, handleException]);

    // Optimize row index lookup for styling
    const rowIdToIndexMap = useMemo(() => {
        const map = new Map();
        npdRows.forEach((row, index) => {
            map.set(row.id, index);
        });
        return map;
    }, [npdRows]);

    return (
        <Dialog
            open={openNpdList}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            sx={{ "& .MuiDialog-paper": { width: "100%", maxHeight: "85vh" } }}
        >
            <DialogTitle
                style={{
                    background: "#002D68",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "18px",
                }}
            >
                NPD List
            </DialogTitle>
            <DialogContent style={{ padding: "16px" }}>
                <DataGrid
                    rows={npdRows}
                    columns={columns}
                    loading={isLoading}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10 },
                        },
                    }}
                    checkboxSelection
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectedRows(newSelection);
                    }}
                    rowSelectionModel={selectedRows}
                    disableRowSelectionOnClick
                    sx={{
                        marginTop: "10px",
                        height: "55vh",
                        width: "100%",
                        "& .super-app-theme--header": {
                            WebkitTextStrokeWidth: "0.6px",
                            backgroundColor: "#93bce6",
                            color: "#1c1919",
                        },
                        "& .MuiDataGrid-cell": {
                            border: "1px solid #969696",
                        },
                        "& .MuiDataGrid-columnHeader": {
                            border: "1px solid #969696",
                        },
                    }}
                    getRowClassName={(params) => {
                        const rowIndex = rowIdToIndexMap.get(params.row.id);
                        if (rowIndex !== undefined) {
                            return rowIndex % 2 === 0 ? "Mui-evenRow" : "Mui-oddRow";
                        }
                        return "";
                    }}
                    rowHeight={40}
                    columnHeaderHeight={40}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    disabled={selectedRows.length === 0 || isLoading}
                    style={{ width: "150px", background: selectedRows.length === 0 ? "gray" : "#d32f2f", color: "white" }}
                    onClick={handleDelete}
                >
                    Delete
                </Button>
                <Button
                    variant="contained"
                    disabled={npdRows.length === 0}
                    style={{ width: "150px", background: npdRows.length === 0 ? "gray" : "#002D68", color: "white" }}
                    onClick={handleDownload}
                >
                    Download
                </Button>
                <Button
                    variant="contained"
                    style={{ width: "150px", background: "#002D68", color: "white" }}
                    onClick={handleRefresh}
                >
                    Refresh
                </Button>
                <Button
                    variant="contained"
                    style={{ width: "150px", background: "#002D68", color: "white" }}
                    onClick={handleClose}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NpdList;
