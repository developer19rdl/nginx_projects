import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, IconButton, Divider, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import GavelIcon from '@mui/icons-material/Gavel';
import { FetchStatutoryRequirement } from '../../ApiService/LoginPageService';

const BASE_URL = process.env.REACT_APP_IMAGE_URL;

const StatutoryRequirementModal = ({ open, onClose, customerId, customerName }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open && customerId) {
            setLoading(true);
            setError('');
            setData([]);
            FetchStatutoryRequirement(
                customerId,
                (res) => {
                    const fetched = Array.isArray(res?.data) ? res.data : [];
                    setData(fetched);
                    setLoading(false);
                },
                (err) => {
                    console.error('Failed to fetch statutory requirement', err);
                    setError('Failed to load statutory requirement document.');
                    setLoading(false);
                }
            );
        }
    }, [open, customerId]);

    const getFileUrl = (item) => {
        if (!item || !item.statutoryReq) return null;
        return `${BASE_URL}${item.statutoryReq}`;
    };

    const getFileExtension = (item) => {
        if (!item || !item.statutoryReq) return '';
        return item.statutoryReq.split('.').pop().toLowerCase();
    };

    const renderDocumentViewer = (item) => {
        const fileUrl = getFileUrl(item);
        if (!fileUrl) {
            return (
                <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                    <Typography color="textSecondary">No document available</Typography>
                </Box>
            );
        }

        const ext = getFileExtension(item);

        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            return (
                <Box sx={{ height: 500, overflow: 'auto', backgroundColor: '#f0f2f5', display: 'flex', justifyContent: 'center' }}>
                    <img src={fileUrl} alt="Statutory Document" style={{ maxWidth: '100%', objectFit: 'contain' }} />
                </Box>
            );
        } else if (ext === 'pdf') {
            return (
                <iframe
                    src={fileUrl}
                    width="100%"
                    height="520px"
                    title="Statutory Requirement Document"
                    style={{ border: 'none', backgroundColor: '#f0f2f5' }}
                />
            );
        } else if (['xls', 'xlsx'].includes(ext)) {
            return (
                <Box sx={{ height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: 1, gap: 2 }}>
                    <InsertDriveFileIcon sx={{ fontSize: 64, color: '#217346' }} />
                    <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 600 }}>
                        Excel Document
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        This document is in Excel format. Please download it to view the contents.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        href={fileUrl}
                        download
                        sx={{ backgroundColor: '#217346', '&:hover': { backgroundColor: '#185a34' }, textTransform: 'none', fontWeight: 600 }}
                    >
                        Download Excel File
                    </Button>
                </Box>
            );
        } else {
            return (
                <Box sx={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: 1, gap: 2 }}>
                    <InsertDriveFileIcon sx={{ fontSize: 60, color: '#6c757d' }} />
                    <Typography variant="h6" color="textSecondary">Unsupported File Format</Typography>
                    <Button variant="outlined" startIcon={<DownloadIcon />} href={fileUrl} download sx={{ mt: 1, textTransform: 'none' }}>
                        Download File
                    </Button>
                </Box>
            );
        }
    };

    const currentItem = data.length > 0 ? data[0] : null;
    const fileUrl = getFileUrl(currentItem);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            {/* ── Dialog Title ── */}
            <DialogTitle sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e6ef', backgroundColor: '#f9fbfd' }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{ width: 38, height: 38, borderRadius: '8px', backgroundColor: '#e8f0fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GavelIcon sx={{ fontSize: 20, color: '#2563eb' }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a233a' }}>
                            Statutory Requirement
                        </Typography>
                        {customerName && (
                            <Typography sx={{ fontSize: '0.78rem', color: '#6c757d' }}>
                                Customer: {customerName}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </DialogTitle>

            {/* ── Dialog Content ── */}
            <DialogContent sx={{ p: 2.5, backgroundColor: '#f9fbfd', minHeight: 480 }}>
                {loading ? (
                    <Box sx={{ height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <CircularProgress sx={{ color: '#2563eb' }} />
                        <Typography color="textSecondary" sx={{ fontSize: '0.9rem' }}>
                            Loading statutory requirement document...
                        </Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="error" sx={{ fontSize: '0.9rem' }}>{error}</Typography>
                    </Box>
                ) : !currentItem ? (
                    <Box sx={{ height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <GavelIcon sx={{ fontSize: 52, color: '#ced4da' }} />
                        <Typography color="textSecondary" sx={{ fontWeight: 600 }}>
                            No statutory requirement document found
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            No document has been uploaded for this customer.
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        {/* Header row with download button */}
                        {fileUrl && (
                            <Box display="flex" justifyContent="flex-end" mb={1.5}>
                                <Button
                                    variant="outlined"
                                    startIcon={<DownloadIcon />}
                                    href={fileUrl}
                                    download
                                    sx={{ textTransform: 'none', borderColor: '#2563eb', color: '#2563eb', '&:hover': { backgroundColor: '#eff6ff' } }}
                                >
                                    Download Document
                                </Button>
                            </Box>
                        )}
                        {/* Document Viewer */}
                        <Box sx={{ border: '1px solid #e0e6ef', borderRadius: 1, overflow: 'hidden' }}>
                            {renderDocumentViewer(currentItem)}
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2, px: 3, backgroundColor: '#fff', justifyContent: 'flex-end' }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{ textTransform: 'none', backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' }, fontWeight: 600 }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StatutoryRequirementModal;
