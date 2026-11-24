import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { AssetGroupAdd, AssetGroupUpdate } from '../../../../Services/NodeJsApiServices';
// import { AssetGroupAdd, AssetGroupUpdate } from '../../../../services/LoginServiceNod';

const AssetGroupModel = ({open, setOpen, isAddButton, editAssetGroup,setNotification,setRefreshData}) => {
    const[assetGroup,setAssetGroup]=useState('');
    const[description,setDescription]=useState('');
    
    const handleClose = () => {
        setOpen(false);
        ClearData();
    };

    useEffect(()=>{
        setAssetGroup(editAssetGroup?.GroupName || '');
        setDescription(editAssetGroup?.Description || '');
    },[editAssetGroup])

    const ClearData=()=>{
        setAssetGroup('');
        setDescription('');
        setRefreshData(oldValue => !oldValue);
    }


    const onSubmit = (e) => {
        e.preventDefault();
        isAddButton === true ?
        (
            AssetGroupAdd({
                GroupName: assetGroup,
                Description :description,
            }, handleSuccess, handleException)
        ) : (
            AssetGroupUpdate({
                id:editAssetGroup.id,
                GroupName: assetGroup,
                Description :description,
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
        setTimeout(()=>{
            setOpen(false);
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
    
    return (
        <div>
            <Dialog sx={{ '& .MuiDialog-paper': { width: '32%', maxHeight: '100%' } }}
            maxWidth="lg"
            open={open}>
                <form onSubmit={onSubmit}>
                    <DialogTitle sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}>
                        {isAddButton === true ? 'Add ' : 'Update '}Asset Group
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} style={{marginTop:'20px'}}>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <TextField 
                                fullWidth 
                                label="Asset Group"
                                placeholder="Asset Group"
                                variant="outlined"
                                required
                                onChange={(e) => {
                                const value = e.target.value;
                                // Only allow alphanumeric characters and spaces
                                const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
                                setAssetGroup(filteredValue);
                                }}
                                value={assetGroup}
                            />
                            </Grid>
                           
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <TextField 
                                fullWidth 
                                label="Description"
                                placeholder="Description"
                                variant="outlined"
                                required
                                onChange={(e) => {
                                const value = e.target.value;
                                // Only allow alphanumeric characters and spaces
                                const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
                                setDescription(filteredValue);
                                }}
                                value={description}
                            />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions style={{ justifyContent: 'flex-end' }}>
                        <Button 
                        onClick={handleClose}
                        >
                        Cancel
                        </Button>
                        <Button 
                        type="submit"
                        >
                        {isAddButton ? "Add" : "Update"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    )
}

export default AssetGroupModel
