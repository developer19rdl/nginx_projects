import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { RoleAddService, RoleEditService } from '../../../Services/NodeJsApiServices';

const AddRoleModel = ({ open, setOpen, isAddButton, RoleData, setRefreshData }) => {
    const [id, setId] = useState('');
    const [roleName, setRoleName] = useState('');
    const [roleDescription, setRoleDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isAddButton) {
            RoleAddService({ roleName, roleDescription }, handleRoleSuccess, handleRoleException);
        } else {
            RoleEditService({ id, roleName, roleDescription }, handleRoleSuccess, handleRoleException);
        }
    };

    const handleRoleSuccess = () => {
        setRefreshData((oldvalue) => !oldvalue);
        setOpen(false);
    };

    const handleRoleException = () => {

    };

    useEffect(() => {
        setId(RoleData.id || '');
        setRoleName(RoleData.roleName || '');
        setRoleDescription(RoleData.roleDescription || '');
    }, [RoleData]);

    return (
        <Dialog sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
            maxWidth='sm'
            open={open}>
            <DialogTitle>
                {isAddButton ? 'Add Role' : 'Edit Role'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            <TextField
                                fullWidth
                                id="outlined-basic"
                                label="Role Name"
                                type="text"
                                variant="outlined"
                                value={roleName}
                                required
                                onChange={(e) => { setRoleName(e.target.value) }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            <TextField
                                fullWidth
                                id="outlined-basic"
                                label="Role Description"
                                type="text"
                                variant="outlined"
                                value={roleDescription}
                                onChange={(e) => { setRoleDescription(e.target.value) }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button type="submit">
                        {isAddButton ? 'Add' : 'Update'}
                    </Button>
                    <Button
                        onClick={() => {
                            setOpen(false);
                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddRoleModel
