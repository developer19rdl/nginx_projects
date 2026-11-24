import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { DepartmentList, OperatortAddService, OperatortEditType, RoleAddService, RoleEditType, RoleList } from '../../../Services/NodeJsApiServices';

const AddRoleModel = ({ open, setOpen, isAddButton, editRole, setRefreshData }) => {
    const [id, setId] = useState('')
    const [RolerName, setRoleName] = useState('')
    const [Description, setDescription] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isAddButton) {
            RoleAddService({
                roleName: RolerName,
                roleDescription: Description,

            }, handleUserSuccess, handleUserException);
        } else {
            RoleEditType({
                id,
                roleName: RolerName,
                roleDescription: Description,
            }, handleUserSuccess, handleUserException);
        }
    };
    const handleUserSuccess = () => {
        setRefreshData((oldvalue) => !oldvalue);
        setOpen(false);
    };
    const handleUserException = () => {

    };


    useEffect(() => {
        setOpen(open)
        loadData();
    }, [editRole]);

    const loadData = () => {
        setId(editRole.id || '');
        setRoleName(editRole.role_name || '');
        setDescription(editRole.role_description || '');

    };

    return (
        <Dialog sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
            maxWidth='md'
            open={open} >
            <DialogTitle sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}>
                {isAddButton ? 'Add Role' : 'Edit Role'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2} >
                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            <TextField
                                fullWidth
                                // size="small"
                                id="outlined-basic"
                                label="Role Name"
                                type="text"
                                variant="outlined"
                                value={RolerName}
                                required
                                onChange={(e) => { setRoleName(e.target.value) }}
                            // InputLabelProps={
                            //     {
                            //         shrink: true
                            //     }
                            // }
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            <TextField
                                fullWidth
                                // size="small"
                                id="outlined-basic"
                                label="Role Description"
                                type="text"
                                variant="outlined"
                                value={Description}
                                required
                                onChange={(e) => { setDescription(e.target.value) }}
                            // InputLabelProps={
                            //     {
                            //         shrink: true
                            //     }
                            // }
                            />
                        </Grid>

                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        style={{}}
                        onClick={(e) => {
                            setOpen(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        style={{}}
                    >
                        {isAddButton ? 'Add' : 'Update'}
                    </Button>

                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddRoleModel