// import React, { useState, useEffect } from 'react';
// import {
//     Dialog, DialogTitle, DialogContent, DialogActions,
//     Button, Box, Typography, IconButton, Grid, Paper,
//     Pagination, Divider
// } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// import DownloadIcon from '@mui/icons-material/Download';
// import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
// import { FetchPackingInstructions } from '../../ApiService/LoginPageService';

// const BASE_URL = process.env.REACT_APP_IMAGE_URL;

// const PackingInstructionModal = ({ open, onClose, items, contractNo }) => {
//     const [data, setData] = useState([]);
//     const [selectedItem, setSelectedItem] = useState(null);
//     const [page, setPage] = useState(1);
//     const itemsPerPage = 4;
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (open && items && items.length > 0) {
//             setLoading(true);
//             const payload = {
//                 items: items.map(i => i.itemCode).filter(Boolean)
//             };
//             FetchPackingInstructions(
//                 payload,
//                 (res) => {
//                     const fetchedData = Array.isArray(res?.data) ? res.data : [];
//                     setData(fetchedData);
//                     if (fetchedData.length > 0) {
//                         setSelectedItem(fetchedData[0]);
//                     }
//                     setLoading(false);
//                 },
//                 (err) => {
//                     console.error('Failed to fetch packing instructions', err);
//                     setLoading(false);
//                 }
//             );
//         }
//     }, [open, items]);

//     const handlePageChange = (event, value) => {
//         setPage(value);
//     };

//     // Calculate pagination
//     const totalPages = Math.ceil(data.length / itemsPerPage);
//     const displayedItems = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);

//     const getFileUrl = (item) => {
//         if (!item || !item.packingInstruction) return null;
//         return `${BASE_URL}${item.packingInstruction}`;
//     };

//     const getFileExtension = (item) => {
//         if (!item || !item.packingInstruction) return '';
//         return item.packingInstruction.split('.').pop().toLowerCase();
//     };

//     const renderDocumentViewer = (item) => {
//         const fileUrl = getFileUrl(item);
//         if (!fileUrl) {
//             return (
//                 <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: 1 }}>
//                     <Typography color="textSecondary">No document available</Typography>
//                 </Box>
//             );
//         }

//         const ext = getFileExtension(item);

//         if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
//             return (
//                 <Box sx={{ height: 500, overflow: 'auto', backgroundColor: '#f0f2f5', display: 'flex', justifyContent: 'center' }}>
//                     <img src={fileUrl} alt="Document" style={{ maxWidth: '100%', objectFit: 'contain' }} />
//                 </Box>
//             );
//         } else if (ext === 'pdf') {
//             return (
//                 <iframe
//                     src={fileUrl}
//                     width="100%"
//                     height="500px"
//                     title="Document"
//                     style={{ border: 'none', backgroundColor: '#f0f2f5' }}
//                 />
//             );
//         } else if (['xls', 'xlsx'].includes(ext)) {
//             return (
//                 <Box sx={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: 1 }}>
//                     <InsertDriveFileIcon sx={{ fontSize: 60, color: '#2563eb', mb: 2 }} />
//                     <Typography variant="h6" color="textSecondary">Excel Document</Typography>
//                     <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>Please download to view contents</Typography>
//                     <Button variant="contained" startIcon={<DownloadIcon />} href={fileUrl} download>
//                         Download Excel File
//                     </Button>
//                 </Box>
//             );
//         } else {
//             return (
//                 <Box sx={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: 1 }}>
//                     <InsertDriveFileIcon sx={{ fontSize: 60, color: '#6c757d', mb: 2 }} />
//                     <Typography variant="h6" color="textSecondary">Unsupported File Format</Typography>
//                     <Button variant="outlined" startIcon={<DownloadIcon />} href={fileUrl} download sx={{ mt: 2 }}>
//                         Download File
//                     </Button>
//                 </Box>
//             );
//         }
//     };

//     return (
//         <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
//             <DialogTitle sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e6ef' }}>
//                 <Box>
//                     <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#1a233a' }}>
//                         Packing Instructions
//                     </Typography>
//                     <Typography sx={{ fontSize: '0.8rem', color: '#6c757d' }}>
//                         CR No: {contractNo || 'N/A'} | Total Items: {data.length}
//                     </Typography>
//                 </Box>

//             </DialogTitle>

//             <DialogContent sx={{ p: 0, display: 'flex', minHeight: 600, backgroundColor: '#f9fbfd' }}>
//                 {loading ? (
//                     <Box sx={{ p: 4, display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
//                         <Typography>Loading...</Typography>
//                     </Box>
//                 ) : (
//                     <Grid container sx={{ flexGrow: 1 }}>
//                         {/* LEFT PANEL - Items List */}
//                         <Grid item xs={3} sx={{ borderRight: '1px solid #e0e6ef', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
//                             <Box sx={{ p: 2, borderBottom: '1px solid #e0e6ef' }}>
//                                 <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Items ({data.length})</Typography>
//                             </Box>

//                             <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
//                                 {displayedItems.map((item, idx) => {
//                                     const isSelected = selectedItem?.itemCode === item.itemCode;
//                                     return (
//                                         <Paper
//                                             key={idx}
//                                             elevation={0}
//                                             onClick={() => setSelectedItem(item)}
//                                             sx={{
//                                                 p: 1.5, mb: 1,
//                                                 cursor: 'pointer',
//                                                 border: `1px solid ${isSelected ? '#2563eb' : '#e0e6ef'}`,
//                                                 backgroundColor: isSelected ? '#eff6ff' : '#fff',
//                                                 borderRadius: 1,
//                                                 '&:hover': { backgroundColor: '#f8f9fa' }
//                                             }}
//                                         >
//                                             <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: isSelected ? '#1d4ed8' : '#1a233a' }}>
//                                                 {item.itemCode || 'Unknown Code'}
//                                             </Typography>
//                                         </Paper>
//                                     );
//                                 })}
//                             </Box>

//                             <Box sx={{ p: 1.5, borderTop: '1px solid #e0e6ef', display: 'flex', justifyContent: 'center', }}>
//                                 <Box
//                                     sx={{
//                                         p: 1.5,
//                                         borderTop: '1px solid #e0e6ef',
//                                         display: 'flex',
//                                         justifyContent: 'space-between',
//                                         alignItems: 'center'
//                                     }}
//                                 >
//                                     <Button
//                                         size="small"
//                                         variant="outlined"
//                                         disabled={page === 1}
//                                         onClick={() => setPage(page - 1)}
//                                     >
//                                         Prev
//                                     </Button>

//                                     <Typography variant="body2">
//                                         {page} / {totalPages}
//                                     </Typography>

//                                     <Button
//                                         size="small"
//                                         variant="outlined"
//                                         disabled={page === totalPages}
//                                         onClick={() => setPage(page + 1)}
//                                     >
//                                         Next
//                                     </Button>
//                                 </Box>                            </Box>
//                         </Grid>

//                         {/* RIGHT PANEL - Content */}
//                         <Grid item xs={9} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
//                             {selectedItem ? (
//                                 <Box sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

//                                     {/* Header Info */}
//                                     <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//                                         <Typography sx={{ fontWeight: 600, color: '#1a233a' }}>
//                                             Item: <span style={{ color: '#2563eb' }}>{selectedItem.itemCode}</span>
//                                         </Typography>
//                                         {getFileUrl(selectedItem) && (
//                                             <Button
//                                                 variant="outlined"
//                                                 startIcon={<DownloadIcon />}
//                                                 href={getFileUrl(selectedItem)}
//                                                 download
//                                                 sx={{ textTransform: 'none' }}
//                                             >
//                                                 Download Document
//                                             </Button>
//                                         )}
//                                     </Box>

//                                     {/* Document Viewer */}
//                                     <Paper elevation={0} sx={{ border: '1px solid #e0e6ef', borderRadius: 1, overflow: 'hidden', flexGrow: 1 }}>
//                                         {renderDocumentViewer(selectedItem)}
//                                     </Paper>

//                                 </Box>
//                             ) : (
//                                 <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                                     <Typography color="textSecondary">Select an item to view instructions</Typography>
//                                 </Box>
//                             )}
//                         </Grid>
//                     </Grid>
//                 )}
//             </DialogContent>

//             <Divider />

//             <DialogActions sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'flex-end', backgroundColor: '#fff' }}>
//                 <Button onClick={onClose} variant="contained" sx={{ textTransform: 'none', backgroundColor: '#2563eb' }}>
//                     Close
//                 </Button>
//             </DialogActions>
//         </Dialog>
//     );
// };

// export default PackingInstructionModal;
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';

const BASE_URL = process.env.REACT_APP_IMAGE_URL;

const PackingInstructionModal = ({
    open,
    onClose,
    packingInstruction
}) => {

    const fileUrl = packingInstruction
        ? `${BASE_URL}${packingInstruction}`
        : null;

    const extension = packingInstruction
        ? packingInstruction.split('.').pop().toLowerCase()
        : '';

    const renderFile = () => {
        if (!fileUrl) {
            return (
                <Box
                    sx={{
                        height: 400,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Typography>No Packing Instruction Available</Typography>
                </Box>
            );
        }

        // Images
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 400
                    }}
                >
                    <img
                        src={fileUrl}
                        alt="Packing Instruction"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '600px',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
            );
        }

        // PDF
        if (extension === 'pdf') {
            return (
                <iframe
                    src={fileUrl}
                    title="Packing Instruction"
                    width="100%"
                    height="600px"
                    style={{
                        border: 'none'
                    }}
                />
            );
        }

        // Excel
        if (['xls', 'xlsx'].includes(extension)) {
            return (
                <Box
                    sx={{
                        height: 400,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    <InsertDriveFileIcon
                        sx={{
                            fontSize: 80,
                            color: '#2563eb'
                        }}
                    />

                    <Typography variant="h6">
                        Excel File
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        href={fileUrl}
                        download
                    >
                        Download File
                    </Button>
                </Box>
            );
        }

        // Other Files
        return (
            <Box
                sx={{
                    height: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2
                }}
            >
                <InsertDriveFileIcon sx={{ fontSize: 80 }} />

                <Typography>
                    Unsupported File Type
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    href={fileUrl}
                    download
                >
                    Download File
                </Button>
            </Box>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                Packing Instruction
            </DialogTitle>

            <DialogContent>
                {renderFile()}
            </DialogContent>

            <DialogActions>
                <Button
                    variant="contained"
                    onClick={onClose}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PackingInstructionModal;