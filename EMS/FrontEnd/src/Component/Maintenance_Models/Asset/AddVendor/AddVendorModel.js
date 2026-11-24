import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { VendorAdd, VendorUpdate } from '../../../../Services/NodeJsApiServices';
// import {VendorAdd, VendorUpdate } from '../../../../services/LoginServiceNod';

const AddVendorModel = ({ open, setOpen, isAddButton, editVendor, setNotification, setRefreshData }) => {
    const [vendorName, setVendorName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [contactPerson, setContactPerson] = useState('');

    const handleClose = () => {
        setOpen(false);
        ClearData();
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    useEffect(() => {
        setVendorName(editVendor?.VendorName || '');
        setAddress(editVendor?.Address || '');
        setEmail(editVendor?.Email || '');
        setContactNo(editVendor?.ContactNo || '');
        setContactPerson(editVendor?.ContactPerson || '');
    }, [editVendor])

    const ClearData = () => {
        setVendorName('');
        setAddress('');
        setEmail('');
        setAddress('');
        setContactNo('');
        setContactPerson('');
        setRefreshData(oldValue => !oldValue);
    }


    const onSubmit = (e) => {
        e.preventDefault();
        isAddButton === true ?
            (
                VendorAdd({
                    VendorName: vendorName,
                    Address: address,
                    Email: email,
                    ContactNo: contactNo,
                    ContactPerson: contactPerson,
                }, handleSuccess, handleException)
            ) : (
                VendorUpdate({
                    id: editVendor.id,
                    VendorName: vendorName,
                    Address: address,
                    Email: email,
                    ContactNo: contactNo,
                    ContactPerson: contactPerson,
                }, handleSuccess, handleException)
            );
    }

    const handleSuccess = (dataObject) => {
        console.log(dataObject);
        setRefreshData(oldValue => !oldValue);
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            setOpen(false);
            handleClose();
        }, 2000);

        setRefreshData(oldValue => !oldValue);
        ClearData();
    }

    const handleException = (errorObject, errorMessage) => {
        console.log(errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        ClearData();
    }

    const handleVendorNameChange = (e) => {
        const value = e.target.value;
        const regex = /^[A-Za-z\s]*$/;

        if (regex.test(value)) {
            setVendorName(value);
        }
    };




    return (
        <div>
            <Dialog sx={{ '& .MuiDialog-paper': { width: '52%', maxHeight: '100%' } }}
                maxWidth="lg"
                open={open}>
                <form onSubmit={onSubmit}>
                    <DialogTitle >
                        {isAddButton === true ? 'Add ' : 'Update '}Vendor
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} style={{ marginTop: '20px' }}>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <TextField
                                    fullWidth
                                    label="Vendor Name"
                                    placeholder='Vendor Name'
                                    variant="outlined"
                                    required
                                    onChange={handleVendorNameChange}
                                    // onChange={(e) => { setVendorName(e.target.value) }}
                                    value={vendorName} />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    placeholder='Address'
                                    variant="outlined"
                                    required
                                    onChange={(e) => { setAddress(e.target.value) }}
                                    value={address} />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    placeholder='Email'
                                    variant="outlined"
                                    required
                                    type="email"
                                    onChange={(e) => { setEmail(e.target.value) }}
                                    value={email} />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <TextField
                                    fullWidth
                                    label="Contact No"
                                    placeholder='Contact No'
                                    variant="outlined"
                                    required
                                    onChange={(e) => {
                                        // Remove non-numeric characters using regular expression
                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                        // Set the cleaned value to state
                                        setContactNo(numericValue);
                                    }}
                                    value={contactNo}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <TextField
                                    fullWidth
                                    label="Contact Person"
                                    placeholder="Contact Person"
                                    variant="outlined"
                                    required
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Only allow alphabetic characters and spaces
                                        const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
                                        setContactPerson(filteredValue);
                                    }}
                                    value={contactPerson}
                                />
                            </Grid>

                        </Grid>
                    </DialogContent>
                    <DialogActions style={{ justifyContent: 'flex-end' }}>
                        <Button
                            type="submit"
                        >
                            {isAddButton ? "Add" : "Update"}
                        </Button>
                        <Button
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    )
}

export default AddVendorModel
