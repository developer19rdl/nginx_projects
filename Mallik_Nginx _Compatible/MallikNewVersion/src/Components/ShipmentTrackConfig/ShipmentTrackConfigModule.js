import {
    Button, Box, Dialog, DialogContent, DialogTitle, TextField, Grid, DialogActions, Typography, IconButton, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import React, { useEffect, useState } from 'react';
import NotificationBar from '../GlobleFiles/ServiceNotificationBar';
import { AddShipmentTrackConfig, DeleteShipmentTrackConfig } from '../../ApiService/LoginPageService';

const ShipmentTrackConfigModule = ({ open, setOpen, isAddButton, editData, setRefreshData, configList = [] }) => {
    const [time, setTime] = useState('09:00');
    const [emailsList, setEmailsList] = useState([{ id: null, email: '' }]);
    const [updatingId, setUpdatingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        if (open) {
            if (isAddButton) {
                // Add mode: check if 09:00 already exists
                const defaultTime = '09:00';
                setTime(defaultTime);
                const existingConfig = configList.find(c => c.time === defaultTime);
                if (existingConfig) {
                    setEmailsList(existingConfig.recipients.map(r => ({ id: r.id, email: r.email })));
                    setUpdatingId(existingConfig.id);
                } else {
                    setEmailsList([{ id: null, email: '' }]);
                    setUpdatingId(null);
                }
            } else if (editData) {
                // Edit mode: find the most up-to-date configuration from configList using editData.id
                const currentId = editData.id;
                const latestConfig = configList.find(c => c.id === currentId);

                if (latestConfig) {
                    setTime(latestConfig.time || '09:00');
                    if (latestConfig.recipients && latestConfig.recipients.length > 0) {
                        setEmailsList(latestConfig.recipients.map(r => ({ id: r.id, email: r.email })));
                    } else {
                        setEmailsList([{ id: null, email: '' }]);
                    }
                    setUpdatingId(latestConfig.id);
                } else {
                    // Fallback to static editData if not found in list yet
                    setTime(editData.time || '09:00');
                    if (editData.recipients && editData.recipients.length > 0) {
                        setEmailsList(editData.recipients.map(r => ({ id: r.id, email: r.email })));
                    } else {
                        setEmailsList([{ id: null, email: '' }]);
                    }
                    setUpdatingId(editData.id || null);
                }
            }
        }
    }, [open, editData, isAddButton, configList]);

    const ClearData = () => {
        setTime('09:00');
        setEmailsList([{ id: null, email: '' }]);
        setUpdatingId(null);
    };

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const handleDeleteRecipient = async (index, recipientId) => {
        if (recipientId) {
            setLoading(true);
            const deletePromise = new Promise((resolve) => {
                DeleteShipmentTrackConfig({ id: recipientId }, resolve, resolve)
                    ?.then(resolve)
                    ?.catch(resolve);
                setTimeout(resolve, 500); // safety fallback
            });

            await deletePromise;
            setLoading(false);
            setRefreshData((old) => !old);
        }

        const newList = emailsList.filter((_, i) => i !== index);
        setEmailsList(newList.length > 0 ? newList : [{ id: null, email: '' }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate time
        if (!time) {
            setNotification({
                status: true,
                type: 'error',
                message: 'Please specify a schedule time.',
            });
            return;
        }

        // Validate and clean new emails (only those that are newly added locally and do not have an ID)
        const newCleanedEmails = emailsList
            .filter(item => !item.id && (item.email || '').trim() !== '')
            .map(item => item.email.trim());

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmail = newCleanedEmails.find(email => !emailRegex.test(email));
        if (invalidEmail) {
            setNotification({
                status: true,
                type: 'error',
                message: `"${invalidEmail}" is not a valid email address.`,
            });
            return;
        }

        // Ensure there is at least one configured email total
        const totalCleanedEmails = emailsList.map(item => (item.email || '').trim()).filter(email => email !== '');
        if (totalCleanedEmails.length === 0) {
            setNotification({
                status: true,
                type: 'error',
                message: 'At least one recipient email address is required.',
            });
            return;
        }

        setLoading(true);

        try {
            if (newCleanedEmails.length > 0 || time !== editData?.time) {
                // The backend strictly requires a non-empty emails array.
                // We send the full list of emails along with the ID to update the time.
                const payload = {
                    time: time,
                    emails: totalCleanedEmails.map(email => ({ email: email }))
                };
                
                if (updatingId) {
                    payload.id = updatingId;
                }
                
                AddShipmentTrackConfig(payload, handleAddSuccess, handleAddException);
            } else {
                // If they only deleted emails, just show success since the deletion is already synced
                setLoading(false);
                setNotification({
                    status: true,
                    type: 'success',
                    message: 'Configurations updated successfully!',
                });
                setRefreshData((oldvalue) => !oldvalue);
                setTimeout(() => {
                    handleClose();
                    setOpen(false);
                    ClearData();
                }, 2000);
            }
        } catch (error) {
            setLoading(false);
            setNotification({
                status: true,
                type: 'error',
                message: 'An unexpected error occurred during submission.',
            });
        }
    };

    const handleAddSuccess = (dataObject) => {
        setLoading(false);
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message || 'Configuration saved successfully!',
        });

        setRefreshData((oldvalue) => !oldvalue);
        setTimeout(() => {
            handleClose();
            setOpen(false);
            ClearData();
        }, 2000);
    };

    const handleAddException = (errorObject, errorMessage) => {
        setLoading(false);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage || 'Failed to save configuration.',
        });
    };

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
            maxWidth="sm"
            open={open}
        >
            <DialogTitle style={{ background: '#002D68', color: 'white', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {isAddButton ? 'Add Shipment Config' : 'View/Edit Shipment Config'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Schedule Time"
                                type="time"
                                variant="filled"
                                size="small"
                                value={time}
                                InputLabelProps={{ shrink: true }}
                                onChange={(e) => {
                                    const newTime = e.target.value;
                                    setTime(newTime);
                                    const existingConfig = configList.find(c => c.time === newTime && c.id !== (editData?.id || null));
                                    if (existingConfig) {
                                        setEmailsList(existingConfig.recipients.map(r => ({ id: r.id, email: r.email })));
                                        setUpdatingId(existingConfig.id);
                                    } else if (!isAddButton && editData?.time === newTime) {
                                        const latestConfig = configList.find(c => c.id === editData.id);
                                        if (latestConfig) {
                                            setEmailsList(latestConfig.recipients ? latestConfig.recipients.map(r => ({ id: r.id, email: r.email })) : [{ id: null, email: '' }]);
                                        } else {
                                            setEmailsList(editData.recipients ? editData.recipients.map(r => ({ id: r.id, email: r.email })) : [{ id: null, email: '' }]);
                                        }
                                        setUpdatingId(editData.id || null);
                                    } else {
                                        setUpdatingId(null);
                                    }
                                }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#002D68' }}>
                                Recipient Emails
                            </Typography>
                            <Box sx={{ maxHeight: '200px', overflowY: 'auto', pr: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {emailsList.map((item, index) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TextField
                                            fullWidth
                                            variant="filled"
                                            size="small"
                                            label={`Email #${index + 1}`}
                                            placeholder="email@example.com"
                                            value={item.email}
                                            type="email"
                                            required
                                            onChange={(e) => {
                                                const newList = [...emailsList];
                                                newList[index] = { ...newList[index], email: e.target.value };
                                                setEmailsList(newList);
                                            }}
                                        />
                                        {emailsList.length > 1 && (
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteRecipient(index, item.id)}
                                                size="small"
                                                disabled={loading}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setEmailsList([...emailsList, { id: null, email: '' }]);
                                }}
                                sx={{ mt: 2, mb: 1, borderColor: '#002D68', color: '#002D68', textTransform: 'none' }}
                                size="small"
                                disabled={loading}
                            >
                                + Add Recipient Email
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        variant="contained"
                        style={{ width: '150px', background: '#002D68', color: 'white' }}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} style={{ color: 'white' }} /> : 'Submit'}
                    </Button>
                    <Button
                        variant="contained"
                        style={{ width: '150px', background: '#002D68', color: 'white' }}
                        onClick={() => {
                            setOpen(false);
                            ClearData();
                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
                <NotificationBar
                    handleClose={handleClose}
                    notificationContent={openNotification.message}
                    openNotification={openNotification.status}
                    type={openNotification.type}
                />
            </form>
        </Dialog>
    );
};

export default ShipmentTrackConfigModule;
