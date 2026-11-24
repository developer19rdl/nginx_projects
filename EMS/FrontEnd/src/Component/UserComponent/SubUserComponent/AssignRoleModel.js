import {
    Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
    Grid, InputLabel, ListItemText, MenuItem, Select
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { AssignRoleAddService, AssignRoleEditService, RoleListService } from '../../../Services/NodeJsApiServices';
import { MODULE_OPTIONS } from '../../../utils/roleConfig';

const AssignRoleModel = ({ open, setOpen, isAddButton, AssignRoleData, setRefreshData }) => {
    const [id, setId] = useState('');
    const [roleId, setRoleId] = useState('');
    const [moduleList, setModuleList] = useState([]);
    const [roleList, setRoleList] = useState([]);

    useEffect(() => {
        RoleListService((res) => setRoleList(res.data || []), () => {});
    }, [open]);

    useEffect(() => {
        setId(AssignRoleData.id || '');
        setRoleId(AssignRoleData.roleId || '');
        setModuleList(AssignRoleData.moduleList || []);
    }, [AssignRoleData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isAddButton) {
            AssignRoleAddService({ roleId, moduleList }, handleSuccess, handleException);
        } else {
            AssignRoleEditService({ id, roleId, moduleList }, handleSuccess, handleException);
        }
    };

    const handleSuccess = () => {
        setRefreshData((oldvalue) => !oldvalue);
        setOpen(false);
    };

    const handleException = () => {

    };

    const moduleLabel = (key) => MODULE_OPTIONS.find((m) => m.key === key)?.label || key;

    return (
        <Dialog sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
            maxWidth='sm'
            open={open}>
            <DialogTitle>
                {isAddButton ? 'Add Assign Role' : 'Edit Role'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel id="assign-role-select-label">Role</InputLabel>
                                <Select
                                    labelId="assign-role-select-label"
                                    label="Role"
                                    value={roleId}
                                    onChange={(e) => setRoleId(e.target.value)}
                                >
                                    {roleList.map((role) => (
                                        <MenuItem value={role.id} key={role.id}>{role.roleName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="module-list-select-label">Module List</InputLabel>
                                <Select
                                    labelId="module-list-select-label"
                                    label="Module List"
                                    multiple
                                    value={moduleList}
                                    onChange={(e) => setModuleList(e.target.value)}
                                    renderValue={(selected) => selected.map(moduleLabel).join(', ')}
                                >
                                    {MODULE_OPTIONS.map((option) => (
                                        <MenuItem value={option.key} key={option.key}>
                                            <Checkbox checked={moduleList.indexOf(option.key) > -1} />
                                            <ListItemText primary={option.label} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setOpen(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button type="submit">
                        {isAddButton ? 'Add' : 'Update'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AssignRoleModel
