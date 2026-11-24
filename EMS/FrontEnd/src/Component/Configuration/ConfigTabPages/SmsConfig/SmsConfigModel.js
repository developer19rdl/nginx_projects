import React, { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
} from '@mui/material';
import { AddSmsConfiguration, SmsConfigurationUpdate } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../Utility/NotificationBar';

const SmsConfigModel = ({ open, setOpen, isAddButton, editConfigSetup, setRefreshData }) => {
    const [provider, setProvider] = useState('');
    const [gatewayUrl, setGatewayUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [senderId, setSenderId] = useState('');
    const [route, setRoute] = useState('');
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [rowId, setRowId] = useState('')

    useEffect(() => {
        !isAddButton && loaderData();
    }, [editConfigSetup])

    const handleCloseButton = () => {
        setOpen(false);
        ClearData();
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (isAddButton) {
            AddSmsConfiguration({
                provider, gatewayUrl, apiKey, senderId, route,
            }, handleSuccess, handleException)
        } else {
            SmsConfigurationUpdate({
                id: rowId, provider, gatewayUrl, apiKey, senderId, route,
            }, handleSuccess, handleException)
        }
    };

    const handleSuccess = (dataObject) => {
        setRefreshData(oldvalue => !oldvalue);
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            ClearData();
            handleClose();
        }, 2000);
    };
    const handleException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
    };

    const ClearData = () => {
        setOpen(false);
        setProvider('');
        setGatewayUrl('');
        setApiKey('');
        setSenderId('');
        setRoute('');
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const loaderData = () => {
        setRowId(editConfigSetup?.id || '')
        setProvider(editConfigSetup?.provider || '')
        setGatewayUrl(editConfigSetup?.gatewayUrl || '')
        setApiKey(editConfigSetup?.apiKey || '')
        setSenderId(editConfigSetup?.senderId || '')
        setRoute(editConfigSetup?.route || '')
    }

    return (
        <div>
            <Dialog sx={{ '& .MuiDialog-paper': { width: '62%', maxHeight: '100%' } }}
                maxWidth="lg"
                open={open}>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {isAddButton ? 'Add ' : 'Update '} SMS Configuration
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    fullWidth
                                    label="Provider"
                                    placeholder="e.g. Fast2SMS, MSG91"
                                    variant="outlined"
                                    value={provider}
                                    onChange={(e) => setProvider(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    fullWidth
                                    label="Gateway URL"
                                    placeholder="Gateway URL"
                                    variant="outlined"
                                    required
                                    value={gatewayUrl}
                                    onChange={(e) => setGatewayUrl(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    fullWidth
                                    label="API Key"
                                    placeholder="API Key"
                                    variant="outlined"
                                    required
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Sender ID"
                                    placeholder="e.g. RDLEMS"
                                    variant="outlined"
                                    value={senderId}
                                    onChange={(e) => setSenderId(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Route"
                                    placeholder="e.g. v3"
                                    variant="outlined"
                                    value={route}
                                    onChange={(e) => setRoute(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions style={{ justifyContent: 'flex-end' }}>
                        <Button onClick={handleCloseButton}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {isAddButton ? "Add" : "Update"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </div>
    );
};

export default SmsConfigModel;
