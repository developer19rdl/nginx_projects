// import { Cancel } from '@mui/icons-material';
// import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
// import { DataGrid } from '@mui/x-data-grid';
// import React, { useEffect, useState } from 'react'
// import { BomDetailsView } from '../../ApiService/LoginPageService';
// import { BomExportDOWNLOAD } from '../../ApiService/DownloadCsvReportsService';

// const AllBOMList = ({ openAllView, setOpenAllView }) => {

//     const [bomDetails, setBomDetails] = useState([]);

//     useEffect(() => {
//         BomDetailsView(handleBomDetailsViewSuccess, handleBomDetailsViewException);
//     }, [openAllView]);


//     const handleBomDetailsViewSuccess = (dataObject) => {
//         setBomDetails(dataObject?.data || []);
//     }

//     const handleBomDetailsViewException = () => {

//     }

//     const columns = [
//         {
//             field: 'bomItemCode',
//             headerClassName: 'super-app-theme--header',
//             headerName:
//                 <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
//                     BOM Item Code
//                 </span>,
//             type: 'string',
//             sortable: true,
//             minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
//         },
//         {
//             field: 'itemCode',
//             headerClassName: 'super-app-theme--header',
//             headerName:
//                 <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
//                     Item Code
//                 </span>,

//             type: 'string',
//             sortable: true,
//             minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
//         },

//         {
//             field: 'Qty',
//             headerClassName: 'super-app-theme--header',
//             headerName:
//                 <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
//                     QTY
//                 </span>,

//             type: 'string',
//             sortable: true,
//             minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
//         },
//         {
//             field: 'jcPart',
//             headerClassName: 'super-app-theme--header',
//             headerName:
//                 <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
//                     JC Part
//                 </span>,

//             type: 'string',
//             sortable: true,
//             minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
//         },


//     ];

//     const handleBomExportDOWNLOADSuccess = () => {

//     }

//     const handleBomExportDOWNLOADException = () => {

//     }

//     return (
//         <Dialog
//             sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '100%' } }}
//             maxWidth="xl"
//             open={openAllView}
//         >
//             <DialogTitle style={{ background: '#002D68', color: 'white' }}>
//                 Import BOM Item Data
//             </DialogTitle>
//             <DialogContent>
//                 <DataGrid
//                     rows={bomDetails}
//                     columns={columns}
//                     pageSize={8}

//                     rowsPerPageOptions={[8]}
//                     disableSelectionOnClick
//                     style={{ border: 'none' }}
//                     sx={{
//                         overflow: 'auto',
//                         height: '50vh',
//                         // minHeight: '500px',
//                         width: '100%',
//                         '& .super-app-theme--header': {
//                             WebkitTextStrokeWidth: '0.6px',
//                             backgroundColor: '#93bce6',
//                             color: '#1c1919'

//                         },
//                         '& .MuiDataGrid-cell': {
//                             border: '1px solid #969696',
//                         },
//                         '& .MuiDataGrid-columnHeader': {
//                             border: '1px solid #969696', // Add border to column headers
//                         },
//                     }}
//                     getRowClassName={(params) => {
//                         // Find the index of the row within the rows array
//                         const rowIndex = [].findIndex(row => row.id === params.row.id);
//                         // Check if the index is valid
//                         if (rowIndex !== -1) {
//                             console.log(' ');
//                             return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
//                         }
//                         return ''; // Return default class if index is not found
//                     }}
//                     rowHeight={40}
//                     columnHeaderHeight={40}
//                 />
//             </DialogContent>
//             <DialogActions>
//                 <Button variant="contained" style={{ width: '150px', background: '#002D68', color: 'white' }}
//                     onClick={() => {
//                         BomExportDOWNLOAD(handleBomExportDOWNLOADSuccess, handleBomExportDOWNLOADException);
//                     }}
//                 >
//                     Download
//                 </Button>

//                 <Button variant="contained" style={{ width: '150px', background: '#002D68', color: 'white' }}
//                     onClick={() => {
//                         setOpenAllView(false);
//                     }}
//                 >
//                     Cancel
//                 </Button>
//             </DialogActions>

//         </Dialog>
//     )
// }

// export default AllBOMList

import { Cancel } from '@mui/icons-material';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { BomDetailsView } from '../../ApiService/LoginPageService';
import { BomExportDOWNLOAD } from '../../ApiService/DownloadCsvReportsService';

const AllBOMList = ({ openAllView, setOpenAllView }) => {

    const [bomDetails, setBomDetails] = useState([]);
    const [loadview, setLoadview] = useState(false);
    const [pagination, setPagination] = useState({
        cursor: 0,
        direction: 'next',
        hasMore: false,
        hasPrevious: false,
        nextCursor: 0,
        prevCursor: 0,
        total: 0
    });

    useEffect(() => {
        if (openAllView) {
            // Reset to page 0 when opening the view
            const initialCursor = 0;
            const initialDirection = 'next';
            setPagination(prev => ({
                ...prev,
                cursor: initialCursor,
                direction: initialDirection,
                hasMore: false,
                hasPrevious: false
            }));
            fetchBomDetails(initialCursor, initialDirection);
        }
    }, [openAllView]);

    const fetchBomDetails = (cursor, direction) => {
        setLoadview(true);
        BomDetailsView(
            { cursor, direction },
            handleBomDetailsViewSuccess,
            handleBomDetailsViewException
        );
    };

    const handleBomDetailsViewSuccess = (dataObject) => {
        setLoadview(false);
        if (dataObject?.success) {
            setBomDetails(dataObject?.data || []);
            setPagination(prev => ({
                ...prev,
                hasMore: !!dataObject.hasMore,
                hasPrevious: !!dataObject.hasPrevious,
                nextCursor: dataObject.nextCursor ?? 0,
                prevCursor: dataObject.prevCursor ?? 0,
                total: prev.total === 0 ? (dataObject.total || 0) : prev.total
            }));
        }
    };

    const handleBomDetailsViewException = () => {
        setLoadview(false);
        console.error('Failed to fetch BOM details');
    };

    const handleNextPage = () => {
        const nextCursor = pagination.nextCursor;
        setPagination(prev => ({ ...prev, cursor: nextCursor, direction: 'next' }));
        fetchBomDetails(nextCursor, 'next');
    };

    const handlePrevPage = () => {
        const prevCursor = pagination.prevCursor;
        setPagination(prev => ({ ...prev, cursor: prevCursor, direction: 'prev' }));
        fetchBomDetails(prevCursor, 'prev');
    };

    // ✅ FIXED DOWNLOAD FUNCTION
    const handleDownloadClick = () => {
        try {
            setLoadview(true);

            BomExportDOWNLOAD(
                () => {
                    // ✅ success
                    setLoadview(false);
                },
                () => {
                    // ❌ error
                    setLoadview(false);
                    console.error('Download failed');
                }
            );

        } catch (error) {
            console.error(error);
            setLoadview(false);
        }
    };

    const columns = [
        {
            field: 'bomItemCode',
            headerName: 'BOM Item Code',
            minWidth: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'itemCode',
            headerName: 'Item Code',
            minWidth: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'Qty',
            headerName: 'QTY',
            minWidth: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'jcPart',
            headerName: 'JC Part',
            minWidth: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        }
    ];

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '100%' } }}
            maxWidth="xl"
            open={openAllView}
        >
            <DialogTitle style={{ background: '#002D68', color: 'white' }}>
                Import BOM Item Data
            </DialogTitle>

            <DialogContent>
                <DataGrid
                    rows={bomDetails}
                    columns={columns}
                    getRowId={(row) => row.id || row.bomItemCode || Math.random()}
                    pageSize={8}
                    rowsPerPageOptions={[8]}
                    disableSelectionOnClick
                    hideFooter   // ✅ hides pagination + row count
                    style={{ border: 'none' }}
                    sx={{
                        overflow: 'auto',
                        height: '50vh',
                        width: '100%',

                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#93bce6',
                            color: '#1c1919',
                            fontWeight: 'bold'
                        },

                        // optional: header cell border
                        '& .MuiDataGrid-columnHeader': {
                            border: '1px solid #969696',
                        },

                        // body cell border
                        '& .MuiDataGrid-cell': {
                            border: '1px solid #969696',
                        },
                    }}
                />
            </DialogContent>

            <DialogActions style={{ justifyContent: 'space-between', padding: '16px 24px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        onClick={handlePrevPage}
                        disabled={!pagination.hasPrevious || loadview}
                        style={{ borderColor: '#002D68', color: '#002D68' }}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleNextPage}
                        disabled={!pagination.hasMore || loadview}
                        style={{ borderColor: '#002D68', color: '#002D68' }}
                    >
                        Next
                    </Button>
                    <span style={{ fontSize: '14px', color: '#666' }}>
                        Total Records: {pagination.total}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>

                    {/* ✅ DOWNLOAD BUTTON WITH FIXED LOADER */}
                    <Button
                        variant="contained"
                        style={{ width: '150px', background: '#002D68', color: 'white' }}
                        onClick={handleDownloadClick}
                        disabled={loadview}
                    >
                        {loadview ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Download'
                        )}
                    </Button>

                    {/* CANCEL BUTTON */}
                    <Button
                        variant="contained"
                        style={{ width: '150px', background: '#002D68', color: 'white' }}
                        onClick={() => setOpenAllView(false)}
                    >
                        Cancel
                    </Button>

                </div>
            </DialogActions>
        </Dialog>
    );
};

export default AllBOMList;