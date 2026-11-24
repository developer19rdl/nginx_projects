import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Box, Typography, Card, CardContent, Autocomplete, TextField,
    Button, Checkbox, FormControlLabel, IconButton, Chip, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Alert, Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import StorageIcon from '@mui/icons-material/Storage';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { GetBulkUpdateMasters, GetBulkUpdateMasterFields, GetBulkUpdateMasterData, ExportBulkUpdateMasterData, LoadBulkUpdateFile, SubmitBulkUpdateMaster } from '../../ApiService/LoginPageService';

const getRowValue = (row, fieldName) => {
    if (!row || !fieldName) return '';
    // Try exact match
    if (row[fieldName] !== undefined && row[fieldName] !== null) {
        return row[fieldName];
    }
    // Try first letter lowercase
    const camelField = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
    if (row[camelField] !== undefined && row[camelField] !== null) {
        return row[camelField];
    }
    // Try first letter uppercase
    const pascalField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    if (row[pascalField] !== undefined && row[pascalField] !== null) {
        return row[pascalField];
    }
    // Try case-insensitive match
    const rowKey = Object.keys(row).find(k => k.toLowerCase() === fieldName.toLowerCase());
    if (rowKey !== undefined) {
        return row[rowKey];
    }
    return '';
};

const BulkUpdate = () => {
    const [mastersList, setMastersList] = useState([]);
    const [selectedMaster, setSelectedMaster] = useState(null);
    const [masterFields, setMasterFields] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [fieldsToUpdate, setFieldsToUpdate] = useState([]);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0 });
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);

    // Chunk Submission & Progress States
    const [progressModalOpen, setProgressModalOpen] = useState(false);
    const [executionState, setExecutionState] = useState({
        isSubmitting: false,
        isCompleted: false,
        isCancelled: false,
        totalValid: 0,
        invalidCount: 0,
        processedCount: 0,
        successCount: 0,
        failCount: 0,
        totalChunks: 0,
        completedChunks: 0,
        activeChunkCount: 0,
        failedChunkIndices: []
    });

    const isCancelledRef = useRef(false);
    const chunksRef = useRef([]);

    useEffect(() => {
        GetBulkUpdateMasters((res) => {
            if (res.success && res.data) setMastersList(res.data);
        }, (err) => console.error('Error fetching masters', err));
    }, []);

    const handleMasterChange = (event, newValue) => {
        setSelectedMaster(newValue);
        setMasterFields([]);
        setSelectedFields([]);
        setFieldsToUpdate([]);
        setParsedData([]);
        setUploadedFile(null);
        setStats({ total: 0, valid: 0, invalid: 0 });
        setProgressModalOpen(false);
        setExecutionState({
            isSubmitting: false,
            isCompleted: false,
            isCancelled: false,
            totalValid: 0,
            invalidCount: 0,
            processedCount: 0,
            successCount: 0,
            failCount: 0,
            totalChunks: 0,
            completedChunks: 0,
            activeChunkCount: 0,
            failedChunkIndices: []
        });

        if (newValue) {
            setLoading(true);
            GetBulkUpdateMasterFields({ type: newValue.type }, (res) => {
                if (res.success && res.data) setMasterFields(res.data);
                setLoading(false);
            }, (err) => {
                console.error('Error fetching master fields', err);
                setLoading(false);
            });
        }
    };

    const handleFieldToggle = (field) => {
        setSelectedFields(prev =>
            prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
        );
        setFieldsToUpdate(prev =>
            prev.includes(field) ? prev.filter(f => f !== field) : prev
        );
    };

    const handleUpdateColumnToggle = (field) => {
        setFieldsToUpdate(prev =>
            prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
        );
    };

    const handleSelectAllFields = () => {
        setSelectedFields([...masterFields]);
        // Note: intentionally not auto-checking fieldsToUpdate
    };
    const handleClearAllFields = () => {
        setSelectedMaster(null);
        setMasterFields([]);
        setSelectedFields([]);
        setFieldsToUpdate([]);
        setParsedData([]);
        setUploadedFile(null);
        setStats({ total: 0, valid: 0, invalid: 0 });
        setIsConfirmed(false);
    };

    const handleLoadData = () => {
        if (!selectedMaster) { alert('Please select a master first.'); return; }
        if (selectedFields.length === 0) { alert('Please select at least one field.'); return; }

        setLoading(true);
        GetBulkUpdateMasterData(
            { type: selectedMaster.type, columns: selectedFields.join(',') },
            (res) => {
                if (res.success && res.data) {
                    const mapped = res.data.map((row, i) => ({
                        id: row.id || i + 1,
                        status: 'VALID',
                        errors: '',
                        ...row
                    }));
                    setParsedData(mapped);
                    setStats({ total: mapped.length, valid: mapped.length, invalid: 0 });
                }
                setLoading(false);
            },
            (err) => {
                console.error('Error loading master data', err);
                setLoading(false);
                alert('Failed to load master data.');
            }
        );
    };

    const onDrop = useCallback((acceptedFiles) => {
        if (!selectedMaster) {
            alert('Please select a master first.');
            return;
        }
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setUploadedFile(file);
            setLoading(true);

            const formData = new FormData();
            formData.append('type', selectedMaster.type);
            formData.append('file', file);

            LoadBulkUpdateFile(formData, (res) => {
                setLoading(false);
                if (res.success && res.data) {
                    let validCount = 0, invalidCount = 0;
                    const validated = res.data.map((row, i) => {
                        const errs = [];
                        const pk = masterFields[0] || 'itemCode';
                        if (!getRowValue(row, pk)) errs.push(`${pk} is required`);

                        const status = row.status || (errs.length === 0 ? 'VALID' : 'ERROR');
                        const errors = row.errors || errs.join(', ');

                        if (status === 'VALID') validCount++; else invalidCount++;
                        return { id: row.id || i + 1, status, errors, ...row };
                    });
                    setParsedData(validated);
                    setStats({ total: validated.length, valid: validCount, invalid: invalidCount });
                } else {
                    alert(res.message || 'Failed to process file on server.');
                }
            }, (err) => {
                setLoading(false);
                console.error('Error loading bulk update file', err);
                alert(err?.message || 'Failed to upload/process file.');
            });
        }
    }, [masterFields, selectedMaster]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls']
        },
        multiple: false,
        disabled: loading || !selectedMaster
    });

    const removeFile = () => {
        setUploadedFile(null);
        setParsedData([]);
        setStats({ total: 0, valid: 0, invalid: 0 });
    };

    // Construct chunk payload on-the-fly (lazy slicing)
    const buildChunkPayload = (chunk, validRows) => {
        const chunkRows = validRows.slice(chunk.startIndex, chunk.endIndex);
        const payloadData = chunkRows.map(row => {
            const dataToUpdate = {};

            // Always include 'id' if present on the row
            const recordId = row.id !== undefined && row.id !== null ? row.id : getRowValue(row, 'id');
            if (recordId !== '' && recordId !== undefined && recordId !== null) {
                dataToUpdate['id'] = recordId;
            }

            // Include ONLY the checked columns (fieldsToUpdate)
            fieldsToUpdate.forEach(field => {
                if (dataToUpdate[field] === undefined) {
                    dataToUpdate[field] = getRowValue(row, field);
                }
            });

            return dataToUpdate;
        });

        return {
            type: selectedMaster?.type,
            data: payloadData
        };
    };

    // Engine to dispatch chunks with limited concurrency & progress tracking
    const runChunkSubmission = async (targetChunkIndices = null) => {
        const pk = masterFields.length > 0 ? masterFields[0] : 'itemCode';
        const validRows = parsedData.filter(row => row.status === 'VALID');
        const invalidRowsCount = parsedData.length - validRows.length;

        if (validRows.length === 0) {
            alert('No valid rows available to submit.');
            return;
        }

        isCancelledRef.current = false;

        let chunksToProcess = [];
        if (!targetChunkIndices) {
            // Fresh run: divide validRows into batches of CHUNK_SIZE (~2000)
            const CHUNK_SIZE = 2000;
            const totalChunks = Math.ceil(validRows.length / CHUNK_SIZE);
            const chunks = [];
            for (let i = 0; i < totalChunks; i++) {
                const startIndex = i * CHUNK_SIZE;
                const endIndex = Math.min(startIndex + CHUNK_SIZE, validRows.length);
                chunks.push({
                    index: i,
                    startIndex,
                    endIndex,
                    rowCount: endIndex - startIndex,
                    status: 'pending',
                    error: null
                });
            }
            chunksRef.current = chunks;
            chunksToProcess = chunks;

            setExecutionState({
                isSubmitting: true,
                isCompleted: false,
                isCancelled: false,
                totalValid: validRows.length,
                invalidCount: invalidRowsCount,
                processedCount: 0,
                successCount: 0,
                failCount: 0,
                totalChunks: chunks.length,
                completedChunks: 0,
                activeChunkCount: 0,
                failedChunkIndices: []
            });
        } else {
            // Retry run for specific failed chunk indices
            chunksToProcess = chunksRef.current.filter(c => targetChunkIndices.includes(c.index));
            chunksToProcess.forEach(c => {
                c.status = 'pending';
                c.error = null;
            });

            const failedRowsToRetry = chunksToProcess.reduce((sum, c) => sum + c.rowCount, 0);

            setExecutionState(prev => ({
                ...prev,
                isSubmitting: true,
                isCompleted: false,
                isCancelled: false,
                failCount: Math.max(0, prev.failCount - failedRowsToRetry),
                failedChunkIndices: prev.failedChunkIndices.filter(idx => !targetChunkIndices.includes(idx))
            }));
        }

        setProgressModalOpen(true);

        const CONCURRENCY = 2; // Limited concurrency pool (2 in-flight requests)
        let queue = [...chunksToProcess];

        const processQueue = () => {
            return new Promise((resolve) => {
                let activeCount = 0;

                const dispatchNext = () => {
                    if (isCancelledRef.current) {
                        if (activeCount === 0) {
                            resolve();
                        }
                        return;
                    }

                    while (activeCount < CONCURRENCY && queue.length > 0 && !isCancelledRef.current) {
                        const chunk = queue.shift();
                        chunk.status = 'in_flight';
                        activeCount++;

                        setExecutionState(prev => ({
                            ...prev,
                            activeChunkCount: activeCount
                        }));

                        const payload = buildChunkPayload(chunk, validRows);

                        SubmitBulkUpdateMaster(
                            payload,
                            (res) => {
                                activeCount--;
                                chunk.status = 'success';

                                setExecutionState(prev => ({
                                    ...prev,
                                    processedCount: prev.processedCount + chunk.rowCount,
                                    successCount: prev.successCount + chunk.rowCount,
                                    completedChunks: prev.completedChunks + 1,
                                    activeChunkCount: activeCount
                                }));

                                dispatchNext();
                                if (activeCount === 0 && queue.length === 0) resolve();
                            },
                            (err) => {
                                activeCount--;
                                chunk.status = 'failed';
                                chunk.error = err?.message || 'Server error';

                                setExecutionState(prev => ({
                                    ...prev,
                                    processedCount: prev.processedCount + chunk.rowCount,
                                    failCount: prev.failCount + chunk.rowCount,
                                    completedChunks: prev.completedChunks + 1,
                                    failedChunkIndices: [...prev.failedChunkIndices, chunk.index],
                                    activeChunkCount: activeCount
                                }));

                                dispatchNext();
                                if (activeCount === 0 && queue.length === 0) resolve();
                            }
                        );
                    }

                    if (activeCount === 0 && queue.length === 0) {
                        resolve();
                    }
                };

                dispatchNext();
            });
        };

        await processQueue();

        setExecutionState(prev => {
            if (!isCancelledRef.current && prev.failCount === 0) {
                // Clear UI data after successful API update
                setParsedData([]);
                setUploadedFile(null);
                setStats({ total: 0, valid: 0, invalid: 0 });
                setIsConfirmed(false);
                setFieldsToUpdate([]);
                setSelectedFields([]);
            }
            return {
                ...prev,
                isSubmitting: false,
                isCompleted: true,
                isCancelled: isCancelledRef.current,
                activeChunkCount: 0
            };
        });
    };

    const handleCancelSubmission = () => {
        isCancelledRef.current = true;
        setExecutionState(prev => ({
            ...prev,
            isCancelled: true
        }));
    };

    const handleRetryFailedChunks = () => {
        if (executionState.failedChunkIndices.length > 0) {
            runChunkSubmission(executionState.failedChunkIndices);
        }
    };

    const handleProcessRowUpdate = (newRow, oldRow) => {
        let updatedRowResult = newRow;

        setParsedData(prevRows => {
            const updatedRows = prevRows.map(row => {
                if (row.id === newRow.id) {
                    const mergedRow = { ...row, ...newRow };

                    // Synchronize case variations for selected fields
                    fieldsToUpdate.forEach(field => {
                        const camelField = field.charAt(0).toLowerCase() + field.slice(1);
                        const pascalField = field.charAt(0).toUpperCase() + field.slice(1);

                        let val = newRow[camelField] !== undefined ? newRow[camelField] : newRow[field];
                        if (val !== undefined && val !== null) {
                            // Normalize numeric strings with commas (e.g., "3,52345" -> "3.52345")
                            if (typeof val === 'string' && val.includes(',')) {
                                const converted = val.replace(',', '.');
                                if (!isNaN(Number(converted))) {
                                    val = converted;
                                }
                            }
                            mergedRow[field] = val;
                            mergedRow[camelField] = val;
                            mergedRow[pascalField] = val;
                        }
                    });

                    // Re-evaluate validation status
                    const pk = masterFields[0] || 'itemCode';
                    const pkVal = getRowValue(mergedRow, pk);
                    const status = pkVal ? 'VALID' : 'ERROR';
                    const errors = pkVal ? '' : `${pk} is required`;

                    updatedRowResult = {
                        ...mergedRow,
                        status,
                        errors
                    };
                    return updatedRowResult;
                }
                return row;
            });

            // Recalculate stats
            let validCount = 0;
            let invalidCount = 0;
            updatedRows.forEach(row => {
                if (row.status === 'VALID') validCount++; else invalidCount++;
            });
            setStats({ total: updatedRows.length, valid: validCount, invalid: invalidCount });

            return updatedRows;
        });

        return updatedRowResult;
    };

    const handleRunBulkUpdate = () => {
        if (!selectedMaster) { alert('Please select a master first.'); return; }
        if (fieldsToUpdate.length === 0) { alert('Please select at least one column to update.'); return; }
        runChunkSubmission();
    };

    const handleDownloadExcel = () => {
        if (!selectedMaster) { alert('Please select a master first.'); return; }
        if (selectedFields.length === 0) { alert('Please select at least one field.'); return; }

        setLoading(true);
        ExportBulkUpdateMasterData(
            { type: selectedMaster.type, columns: selectedFields.join(',') },
            (blob) => {
                setLoading(false);
                // Create a download link for the blob
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${selectedMaster.type}_template.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            },
            (err) => {
                console.error('Error downloading excel template', err);
                setLoading(false);
                alert('Failed to download excel template.');
            }
        );
    };

    const columns = useMemo(() => [
        {
            field: 'status',
            headerName: 'STATUS',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === 'VALID' ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 'bold', borderRadius: '4px' }}
                />
            )
        },
        ...selectedFields.map((field, index) => {
            const isChecked = fieldsToUpdate.includes(field);
            const lowerField = field.toLowerCase();
            const isTextColumn = lowerField.includes('name') ||
                lowerField.includes('desc') ||
                lowerField.includes('code');
            const alignment = isTextColumn ? 'left' : 'center';
            const justifyValue = isTextColumn ? 'flex-start' : 'center';
            const alignItemValue = isTextColumn ? 'flex-start' : 'center';
            const camelField = field.charAt(0).toLowerCase() + field.slice(1);
            const pascalField = field.charAt(0).toUpperCase() + field.slice(1);

            return {
                field: camelField,
                headerName: field.toUpperCase(),
                flex: isTextColumn ? 1.5 : 1,
                minWidth: isTextColumn ? 180 : 100,
                align: alignment,
                headerAlign: alignment,
                sortable: false,
                disableColumnMenu: true,
                editable: isChecked,
                valueGetter: (params) => getRowValue(params.row, field),
                valueSetter: (params) => {
                    let cleanVal = params.value;
                    if (typeof cleanVal === 'string' && cleanVal.includes(',')) {
                        const converted = cleanVal.replace(',', '.');
                        if (!isNaN(Number(converted))) {
                            cleanVal = converted;
                        }
                    }
                    return {
                        ...params.row,
                        [camelField]: cleanVal,
                        [field]: cleanVal,
                        [pascalField]: cleanVal
                    };
                },
                renderHeader: (params) => (
                    <Box display="flex" flexDirection="column" alignItems={alignItemValue} sx={{ pt: 0.5 }}>
                        <Box height="24px" display="flex" alignItems="center" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                            <Checkbox
                                size="small"
                                checked={isChecked}
                                onChange={(e) => handleUpdateColumnToggle(field)}
                                sx={{
                                    p: 0,
                                    color: '#003366',
                                    '&.Mui-checked': { color: '#003366' }
                                }}
                            />
                        </Box>
                        <Typography variant="caption" fontWeight="bold" sx={{ color: '#002060', mt: 0.25, whiteSpace: 'nowrap' }}>
                            {field.toUpperCase()}
                        </Typography>
                    </Box>
                ),
                renderCell: (params) => {
                    const valueStr = params.value !== undefined && params.value !== null ? String(params.value) : '';
                    return (
                        <Tooltip title={isChecked ? `${valueStr} (Double click to edit)` : valueStr} enterDelay={300} arrow>
                            <Box sx={{
                                color: '#111827',
                                fontWeight: isChecked ? 600 : 400,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: justifyValue,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                userSelect: 'none'
                            }}>
                                {valueStr}
                            </Box>
                        </Tooltip>
                    );
                }
            };
        }),
        {
            field: 'errors',
            headerName: 'ERRORS',
            flex: 1.5,
            minWidth: 180,
            renderCell: (params) => (
                <Typography variant="body2" color="error">{params.value || '-'}</Typography>
            )
        }
    ], [selectedFields, fieldsToUpdate]);

    return (
        <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '79vh' }}>

            {/* Breadcrumbs and Help */}
            {/* <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', gap: 0.5, fontSize: '0.75rem' }}>
                    <span style={{ cursor: 'pointer' }}>Masters</span> &gt; <span style={{ fontWeight: 600 }}>Bulk Update</span>
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5} sx={{ cursor: 'pointer', color: 'text.secondary' }}>
                    <HelpOutlineIcon sx={{ fontSize: 16 }} />
                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Help</Typography>
                </Box>
            </Box> */}

            {/* Page Header */}
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box sx={{ p: 1, backgroundColor: '#e3f2fd', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UploadFileIcon sx={{ color: '#0f62fe', fontSize: 24 }} />
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#002060' }}>Bulk Update</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                        Select a master, choose fields, then load existing data or upload a file to apply bulk changes.
                    </Typography>
                </Box>
            </Box>

            {/* ── Unified Control Bar ── */}
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', mb: 3 }}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Box display="flex" alignItems="stretch">

                        {/* 1. Select Master */}
                        <Box sx={{
                            flex: '0 0 250px',
                            p: 2,
                            borderRight: '1px solid #eee',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start'
                        }}>
                            <Typography variant="caption" fontWeight="bold" color="textSecondary" display="block" mb={1} sx={{ letterSpacing: '0.5px' }}>
                                SELECT MASTER *
                            </Typography>
                            <Autocomplete
                                options={mastersList}
                                getOptionLabel={(option) => option.displayName}
                                value={selectedMaster}
                                onChange={handleMasterChange}
                                size="small"
                                renderInput={(params) => (
                                    <TextField {...params} variant="outlined" size="small" placeholder="Choose master..." />
                                )}
                            />
                        </Box>

                        {/* 2. Select Fields */}
                        <Box sx={{ flex: 1, p: 2, borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" sx={{ letterSpacing: '0.5px' }}>
                                    SELECT FIELDS *
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1.5}>
                                    <Button size="small" variant="text" onClick={handleSelectAllFields}
                                        sx={{ fontSize: '0.75rem', fontWeight: 'bold', minWidth: 'auto', p: 0, color: '#0f62fe', textTransform: 'uppercase' }}>
                                        All
                                    </Button>
                                    <Button size="small" variant="text" onClick={handleClearAllFields}
                                        sx={{ fontSize: '0.75rem', fontWeight: 'bold', minWidth: 'auto', p: 0, color: '#0f62fe', textTransform: 'uppercase' }}>
                                        Clear
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={handleLoadData}
                                        startIcon={<StorageIcon sx={{ fontSize: 14 }} />}
                                        sx={{ fontSize: '0.75rem', fontWeight: 600, px: 2, py: 0.5, backgroundColor: '#0f62fe', '&:hover': { backgroundColor: '#0b4ec2' }, textTransform: 'none' }}
                                    >
                                        Load Data
                                    </Button>
                                </Box>
                            </Box>

                            {masterFields.length > 0 ? (
                                <Box
                                    display="flex"
                                    flexWrap="wrap"
                                    gap={1}
                                    sx={{
                                        overflowY: 'auto',
                                        maxHeight: '110px',
                                        pr: 1,
                                        '&::-webkit-scrollbar': { width: '6px' },
                                        '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '4px' }
                                    }}
                                >
                                    {masterFields.map((field) => {
                                        const isSelected = selectedFields.includes(field);
                                        return (
                                            <Box
                                                key={field}
                                                onClick={() => handleFieldToggle(field)}
                                                sx={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                                    px: 1.5, py: 0.4, borderRadius: '6px', cursor: 'pointer',
                                                    fontSize: '0.8rem', fontWeight: 500, userSelect: 'none',
                                                    border: isSelected ? '1px solid #0f62fe' : '1px solid #e2e8f0',
                                                    backgroundColor: isSelected ? '#e6f0ff' : '#fff',
                                                    color: isSelected ? '#0f62fe' : '#495057',
                                                    transition: 'all 0.15s',
                                                    '&:hover': { borderColor: '#0f62fe', backgroundColor: '#f0f7ff' }
                                                }}
                                            >
                                                {isSelected && <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>✓</span>}
                                                {field}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            ) : (
                                <Typography variant="caption" color="textSecondary" fontStyle="italic">
                                    {selectedMaster
                                        ? 'Fields will appear here. Select and click Load Data.'
                                        : 'Select a master first to see available fields.'}
                                </Typography>
                            )}
                        </Box>

                        {/* 3. Upload File */}
                        <Box sx={{ flex: '0 0 250px', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                            <Typography variant="caption" fontWeight="bold" color="textSecondary" display="block" mb={1} sx={{ letterSpacing: '0.5px' }}>
                                UPLOAD FILE
                            </Typography>
                            {!uploadedFile ? (
                                <Box
                                    {...getRootProps()}
                                    sx={{
                                        border: '1.5px dashed #0f62fe', borderRadius: 2, p: 1.5,
                                        textAlign: 'center', cursor: 'pointer',
                                        backgroundColor: isDragActive ? '#e6f0ff' : '#f8f9fa',
                                        '&:hover': { borderColor: '#0b4ec2', backgroundColor: '#f0f7ff' },
                                        transition: 'all 0.2s',
                                        height: '75px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        opacity: (loading || !selectedMaster) ? 0.6 : 1,
                                        pointerEvents: (loading || !selectedMaster) ? 'none' : 'auto'
                                    }}
                                >
                                    <input {...getInputProps()} />
                                    <UploadFileIcon sx={{ fontSize: 20, color: '#0f62fe', display: 'block', mx: 'auto' }} />
                                    <Typography variant="caption" display="block" color="textSecondary" mt={0.25} sx={{ fontSize: '0.75rem' }}>
                                        {loading ? 'Uploading...' : <span>Drop or <span style={{ color: '#0f62fe', fontWeight: 600 }}>browse</span></span>}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.62rem', color: '#aaa', mt: 0.25 }}>
                                        .XLSX, .CSV
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ backgroundColor: '#e8f5e9', px: 1.5, py: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 0.75, height: '75px' }}>
                                    <CheckCircleOutlineIcon sx={{ color: '#2e7d32', fontSize: 18, flexShrink: 0 }} />
                                    <Box flexGrow={1} minWidth={0}>
                                        <Typography variant="caption" fontWeight="bold" color="#2e7d32" display="block">Uploaded</Typography>
                                        <Typography variant="caption" color="textSecondary" noWrap display="block" sx={{ fontSize: '0.7rem' }}>
                                            {uploadedFile.name}
                                        </Typography>
                                    </Box>
                                    <IconButton size="small" onClick={removeFile} sx={{ p: 0.25, flexShrink: 0 }}>
                                        <CloseIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* ── Preview & Validate Header ── */}
            <Box mb={1.5} display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#002060' }}>Preview & Validate</Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                            Review your data and fix any errors before proceeding.
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" sx={{ px: 1.5, py: 0.5, backgroundColor: '#e6f0ff', color: '#0f62fe', borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 600 }}>
                        <InfoIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        Only checked columns will be updated
                    </Box>
                </Box>
                <Box display="flex" gap={2} alignItems="center">
                    <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        startIcon={<UploadFileIcon />}
                        disabled={!selectedMaster || selectedFields.length === 0}
                        onClick={handleDownloadExcel}
                        sx={{
                            textTransform: 'uppercase',
                            borderColor: '#198754',
                            color: '#198754',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            '&:hover': { borderColor: '#157347', backgroundColor: '#f4faf6' }
                        }}
                    >
                        Download to Excel
                    </Button>

                    {/* TOTAL */}
                    <Box display="flex" alignItems="center" gap={1} px={1.5} sx={{ borderLeft: '1px solid #e0e0e0' }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <StorageIcon sx={{ color: '#0f62fe', fontSize: 16 }} />
                        </Box>
                        <Box>
                            <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block" sx={{ fontSize: '0.70rem' }}>TOTAL</Typography>
                            <Typography variant="subtitle2" fontWeight="bold" color="#002060" lineHeight={1}>{stats.total}</Typography>
                        </Box>
                    </Box>

                    {/* VALID */}
                    <Box display="flex" alignItems="center" gap={1} px={1.5} sx={{ borderLeft: '1px solid #e0e0e0' }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircleOutlineIcon sx={{ color: '#2e7d32', fontSize: 16 }} />
                        </Box>
                        <Box>
                            <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block" sx={{ fontSize: '0.70rem' }}>VALID</Typography>
                            <Typography variant="subtitle2" fontWeight="bold" color="#2e7d32" lineHeight={1}>{stats.valid}</Typography>
                        </Box>
                    </Box>

                    {/* INVALID */}
                    <Box display="flex" alignItems="center" gap={1} px={1.5} sx={{ borderLeft: '1px solid #e0e0e0' }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#fde8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HighlightOffIcon sx={{ color: '#d32f2f', fontSize: 16 }} />
                        </Box>
                        <Box>
                            <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block" sx={{ fontSize: '0.70rem' }}>INVALID</Typography>
                            <Typography variant="subtitle2" fontWeight="bold" color="#d32f2f" lineHeight={1}>{stats.invalid}</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* ── DataGrid ── */}
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: 'calc(100vh - 600px)', minHeight: '350px', mb: 2 }}>
                <DataGrid
                    rows={parsedData}
                    columns={columns}
                    loading={loading}
                    rowHeight={35}
                    columnHeaderHeight={65}
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{ pagination: { paginationModel: { pageSize: 100 } } }}
                    disableRowSelectionOnClick
                    processRowUpdate={handleProcessRowUpdate}
                    onProcessRowUpdateError={(err) => console.error('Cell update failed:', err)}
                    sx={{
                        '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f7fa' },
                        '& .MuiDataGrid-cell': { borderBottom: '1px solid #f1f5f9' },
                        border: 'none'
                    }}
                />
            </Card>

            {/* ── Footer Confirmation ── */}
            <Box sx={{ backgroundColor: '#fff', p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            checked={isConfirmed}
                            onChange={(e) => setIsConfirmed(e.target.checked)}
                            color="success"
                        />
                    }
                    label={
                        <Typography variant="body2" fontWeight="bold" color="#2e7d32" sx={{ fontSize: '0.85rem' }}>
                            I have reviewed the data and confirm it is correct.
                        </Typography>
                    }
                />
                <Box display="flex" gap={2}>
                    <Button variant="outlined" color="inherit" sx={{ textTransform: 'none', px: 3, borderColor: '#ccc' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        endIcon={<KeyboardArrowRightIcon />}
                        sx={{ backgroundColor: '#0f62fe', '&:hover': { backgroundColor: '#0b4ec2' }, px: 4, textTransform: 'none' }}
                        disabled={!isConfirmed || parsedData.length === 0 || fieldsToUpdate.length === 0 || executionState.isSubmitting}
                        onClick={handleRunBulkUpdate}
                    >
                        {executionState.isSubmitting ? 'Submitting...' : 'Proceed Update'}
                    </Button>
                </Box>
            </Box>

            {/* ── Progress & Completion Modal ── */}
            <Dialog
                open={progressModalOpen}
                disableEscapeKeyDown
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', color: '#002060', pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>
                        {executionState.isSubmitting
                            ? 'Submitting Bulk Update...'
                            : executionState.isCancelled
                                ? 'Submission Stopped'
                                : 'Submission Completed'}
                    </span>
                    {!executionState.isSubmitting && (
                        <IconButton size="small" onClick={() => setProgressModalOpen(false)}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary" mb={1}>
                            {executionState.isSubmitting
                                ? `Processing ${executionState.processedCount} of ${executionState.totalValid} valid rows (${executionState.completedChunks}/${executionState.totalChunks} batches)...`
                                : executionState.isCancelled
                                    ? `Process stopped by user. ${executionState.processedCount} of ${executionState.totalValid} valid rows processed.`
                                    : `Finished submitting ${executionState.totalValid} valid rows in ${executionState.totalChunks} batches.`}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={executionState.totalValid > 0 ? Math.min(100, (executionState.processedCount / executionState.totalValid) * 100) : 0}
                            sx={{ height: 10, borderRadius: 5, backgroundColor: '#e2e8f0' }}
                        />
                        <Typography variant="caption" color="textSecondary" align="right" display="block" sx={{ mt: 0.5 }}>
                            {Math.round(executionState.totalValid > 0 ? (executionState.processedCount / executionState.totalValid) * 100 : 0)}% Complete
                        </Typography>
                    </Box>

                    {/* Stats Grid */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={3}>
                            <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#e6f0ff', textAlign: 'center' }}>
                                <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block">TOTAL VALID</Typography>
                                <Typography variant="h6" fontWeight="bold" color="#0f62fe">{executionState.totalValid}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={3}>
                            <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#e8f5e9', textAlign: 'center' }}>
                                <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block">UPDATED</Typography>
                                <Typography variant="h6" fontWeight="bold" color="#2e7d32">{executionState.successCount}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={3}>
                            <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#fde8e8', textAlign: 'center' }}>
                                <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block">FAILED</Typography>
                                <Typography variant="h6" fontWeight="bold" color="#d32f2f">{executionState.failCount}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={3}>
                            <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#fff8e1', textAlign: 'center' }}>
                                <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block">SKIPPED</Typography>
                                <Typography variant="h6" fontWeight="bold" color="#b78103">{executionState.invalidCount}</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Dynamic Alerts */}
                    {executionState.isSubmitting && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                            Submitting in background batches (2,000 rows/batch, 2 concurrent requests).
                        </Alert>
                    )}
                    {executionState.isCancelled && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                            Submission was cancelled. Remaining queued batches were stopped.
                        </Alert>
                    )}
                    {executionState.isCompleted && executionState.failCount === 0 && !executionState.isCancelled && (
                        <Alert severity="success" sx={{ mt: 1 }}>
                            All valid rows updated successfully!
                        </Alert>
                    )}
                    {executionState.isCompleted && executionState.failCount > 0 && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                            {executionState.failedChunkIndices.length} batch(es) failed ({executionState.failCount} rows). You can safely retry failed batches.
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    {executionState.isSubmitting ? (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleCancelSubmission}
                            sx={{ textTransform: 'none', fontWeight: 'bold' }}
                        >
                            Cancel Remaining Chunks
                        </Button>
                    ) : (
                        <Box display="flex" gap={1.5} width="100%" justifyContent="flex-end">
                            {executionState.failedChunkIndices.length > 0 && (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    onClick={handleRetryFailedChunks}
                                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                                >
                                    Retry Failed Chunks ({executionState.failedChunkIndices.length})
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                onClick={() => setProgressModalOpen(false)}
                                sx={{ backgroundColor: '#0f62fe', '&:hover': { backgroundColor: '#0b4ec2' }, textTransform: 'none', fontWeight: 'bold' }}
                            >
                                Close
                            </Button>
                        </Box>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BulkUpdate;


