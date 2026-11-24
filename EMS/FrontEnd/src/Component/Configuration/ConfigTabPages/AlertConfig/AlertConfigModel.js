import React, { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    Radio,
    FormControlLabel,
    RadioGroup,
    FormControl,
    Box,
    Card,
    CardContent,
    Typography,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { AddAlertConfiguration, AlertConfigurationUpdate } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../Utility/NotificationBar';

const AlertConfigModel = ({ open, setOpen, isAddButton, editConfigSetup, setRefreshData }) => {
    const [smtpServer, setSmtpServer] = useState('');
    const [alertEmailForm, setAlertEmailForm] = useState('');
    const [password, setPassword] = useState('');
    const [securityType, setSecurityType] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');
    const [alertTypeList, setAlertTypeList] = useState([]);
    const [alertLeadDays, setAlertLeadDays] = useState('');
    const [users, setUsers] = useState('');
    const [usersList, setUsersList] = useState([]);
    const [consumableTypeList, setConsumableTypeList] = useState([]);
    const [selectedValue, setSelectedValue] = useState('AlertParameters'); // Initialize with default value
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

    const handleRadioChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleSecurityType = (e) => {
        setSecurityType(e.target.value);
    };

    const onUsersChange = (e) => {
        setUsers(e.target.value);
    };

    const onAlertTypeChange = (e) => {
        setAlertMessage(e.target.value);
    };


    const handleSubmit = (event) => {
        event.preventDefault();
        if (isAddButton) {
            AddAlertConfiguration({
                smtpServer: smtpServer,
                alertEmailFrom: alertEmailForm,
                password: password,
                securityType: securityType
            }, handleSuccess, handleException)
        } else {
            AlertConfigurationUpdate({
                id: rowId,
                smtpServer: smtpServer,
                alertEmailFrom: alertEmailForm,
                password: password,
                securityType: securityType
            }, handleSuccess, handleException)
        }

    };

    const handleSuccess = (dataObject) => {
        console.log("the dataObject ", dataObject);
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
        console.log("the error ", errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
    };

    const ClearData = () => {
        setOpen(false);
        setSmtpServer('');
        setAlertEmailForm('');
        setPassword('');
        setSecurityType('');
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
        setSmtpServer(editConfigSetup?.smtpServer || '')
        setAlertEmailForm(editConfigSetup?.alertEmailFrom || '')
        setPassword(editConfigSetup?.password || '')
        setSecurityType(editConfigSetup?.securityType || '')
    }


    return (
        <div>
            <Dialog sx={{ '& .MuiDialog-paper': { width: '62%', maxHeight: '100%' } }}
                maxWidth="lg"
                open={open}>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {isAddButton ? 'Add ' : 'Update '} EMAIL Configuration
                    </DialogTitle>
                    <DialogContent>
                        {}
                        {/* {selectedValue === 'AlertParameters' && ( */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    fullWidth
                                    label="SMTP Server"
                                    placeholder="SMTP Server"
                                    variant="outlined"
                                    required
                                    value={smtpServer}
                                    onChange={(e) => setSmtpServer(e.target.value)}

                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    fullWidth
                                    label="Alert Email Form"
                                    placeholder="Alert Email Form"
                                    variant="outlined"
                                    required
                                    value={alertEmailForm}
                                    onChange={(e) => setAlertEmailForm(e.target.value)}

                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    placeholder="Password"
                                    variant="outlined"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}

                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Security Type</InputLabel>
                                    <Select
                                        defaultValue='Finished_Goods'
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        placeholder='Security Type'
                                        value={securityType}
                                        label="Security Type"
                                        onChange={handleSecurityType}>
                                        <MenuItem value='TLS'>TLS</MenuItem>
                                        <MenuItem value='SSL'>SSL</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>


                        </Grid>
                        {/* )} */}

                        {}

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

export default AlertConfigModel;
