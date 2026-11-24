import {
    Button, Box, Dialog, Tooltip, DialogContent, DialogTitle, TextField, Grid, DialogActions, InputLabel, Select, MenuItem, FormControl, FormControlLabel, Checkbox, CardContent, Typography, InputAdornment,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import NotificationBar from '../GlobleFiles/ServiceNotificationBar';
import { AddBankMaster, BankMasterUpdate } from '../../ApiService/LoginPageService';

const BankMasterModule = ({ open, setOpen, isAddButton, editData, setRefreshData, }) => {

    const [bankCode, setBankCode] = useState('');
    const [bankName, setBankName] = useState('');
    const [acName, setAcName] = useState('');
    const [acNo, setAcNo] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [micrCode, setMicrCode] = useState('');
    const [branchName, setBranchName] = useState('');
    const [acType, setAcType] = useState('');
    const [shiftCode, setShiftCode] = useState('');
    const [active, setActive] = useState(true);
    const [Description, setDescription] = useState('');

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        if (editData) {
            setBankCode(editData?.bankCode || '');
            setBankName(editData?.bankName || '');
            setAcName(editData?.acName || '');
            setAcNo(editData?.acNo || '');
            setIfscCode(editData?.ifscCode || '');
            setMicrCode(editData?.micrCode || '');
            setBranchName(editData?.branchName || '');
            setAcType(editData?.acType || '');
            setShiftCode(editData?.shiftCode || '');
            setActive(Number(editData?.active) === 1);
        }
    }, [editData]);

    const ClearData = () => {
        setBankCode('');
        setBankName('');
        setAcName('');
        setAcNo('');
        setIfscCode('');
        setMicrCode('');
        setBranchName('');
        setAcType('');
        setShiftCode('');
        setActive(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            bankCode,
            bankName,
            acName,
            acNo,
            ifscCode,
            micrCode,
            branchName,
            acType,
            shiftCode,
            // active: active ? '1' : '0',
        };

        if (isAddButton) {
            AddBankMaster(
                payload,
                handleSobAddSuccess,
                handleSobAddException
            );
        } else {
            BankMasterUpdate(
                {
                    id: editData?.id,
                    ...payload,
                },
                handleSobAddSuccess,
                handleSobAddException
            );
        }
    };
    const handleSobAddSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });

        setRefreshData((oldvalue) => !oldvalue);
        setTimeout(() => {
            handleClose();
            setOpen(false);
            ClearData();
        }, 3000);
    }

    const handleSobAddException = () => {

    }
    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    // Simply update local state; the value is sent with the PUT on save
    const handleStatusChange = (e) => {
        setActive(e.target.checked);
    };
    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
            maxWidth="sm"
            open={open}
        >
            <DialogTitle style={{ background: '#002D68', color: 'white', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {isAddButton ? 'Add Bank' : 'Edit Bank'}

            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent >
                    <Grid container spacing={2}>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Bank Code"
                                size="small"
                                variant="filled"
                                value={bankCode}
                                onChange={(e) => setBankCode(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Bank Name"
                                size="small"
                                variant="filled"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Account Name"
                                size="small"
                                variant="filled"
                                value={acName}
                                onChange={(e) => setAcName(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Account Number"
                                size="small"
                                variant="filled"
                                value={acNo}
                                onChange={(e) => setAcNo(e.target.value)}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="IFSC Code"
                                size="small"
                                variant="filled"
                                value={ifscCode}
                                onChange={(e) => setIfscCode(e.target.value)}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="MICR Code"
                                size="small"
                                variant="filled"
                                value={micrCode}
                                onChange={(e) => setMicrCode(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Branch Name"
                                size="small"
                                variant="filled"
                                value={branchName}
                                onChange={(e) => setBranchName(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small" variant="filled">
                                <InputLabel>Account Type</InputLabel>
                                <Select
                                    value={acType}
                                    onChange={(e) => setAcType(e.target.value)}
                                >
                                    <MenuItem value="SB">Savings</MenuItem>
                                    <MenuItem value="CA">Current</MenuItem>
                                    <MenuItem value="OD">OD</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Shift Code"
                                size="small"
                                variant="filled"
                                value={shiftCode}
                                onChange={(e) => setShiftCode(e.target.value)}
                            />
                        </Grid>

                        {/* <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={active}
                                        onChange={handleStatusChange}
                                    />
                                }
                                label="Active"
                            />
                        </Grid> */}

                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        style={{ width: '150px', background: '#002D68', color: 'white' }}
                        type='submit'
                    >
                        {
                            isAddButton ? 'Submit' : 'Update'
                        }

                    </Button>
                    <Button
                        variant="contained"
                        style={{ width: '150px', background: '#002D68', color: 'white' }}
                        onClick={(e) => {
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
    )
}

export default BankMasterModule
