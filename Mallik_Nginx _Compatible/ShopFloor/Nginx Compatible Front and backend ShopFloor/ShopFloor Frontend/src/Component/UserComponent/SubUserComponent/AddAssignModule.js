

import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, ListItemText, MenuItem, Select, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { AssignModuleListService, AssignRoleAddService, AssignRoleEditType, DepartmentList, OperatortAddService, OperatortEditType, RoleAddService, RoleEditType, RoleList } from '../../../Services/NodeJsApiServices';

const AddAssignModule = ({ open, setOpen, isAddButton, AssignRole, setRefreshData }) => {
    const [id, setId] = useState('')
    const [RolerName, setRoleName] = useState('')
    const [roleNameList, setRoleNameList] = useState([]);
    const [moduleList, setModuleList] = useState([]);
    const [selectedModules, setSelectedModules] = useState([]);


    const handleSubmit = (e) => {
        e.preventDefault();
        if (isAddButton) {
            AssignRoleAddService({
                roleId: RolerName,
                moduleIds: selectedModules,

            }, handleUserSuccess, handleUserException);
        } else {
            AssignRoleEditType({
                id,
                roleId: RolerName,
                moduleIds: selectedModules,
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
        AssignModuleListService(handleModuleSuccess, handleModuleException);
        RoleList(handleRoleList, handleRoleException)

        setOpen(open)
        loadData();
    }, [AssignRole]);

    const loadData = () => {
        setId(AssignRole.id || '');
        setRoleName(AssignRole.role_id || '');
        setSelectedModules(AssignRole.permissions || [])
    };
    const handleModuleSuccess = (dataObject) => {
        setModuleList(dataObject.data)
    };
    const handleModuleException = () => {

    };
    const handleRoleList = (dataObject) => {
        setRoleNameList(dataObject.data)
    };
    const handleRoleException = () => {

    };

    const handleModuleChange = (event) => {
        setSelectedModules(event.target.value);
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
                        <Grid item xs={12} sm={12} md={4} lg={4} xl={4} style={{ display: 'flex', justifyContent: 'center' }}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Role</InputLabel>
                                <Select
                                    // size="small"
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Role"
                                    value={RolerName}
                                    onChange={(e) => setRoleName(e.target.value)}
                                >
                                    {roleNameList && roleNameList.map((item) => (
                                        <MenuItem value={item.id} key={item.id}>{item.role_name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} lg={4} xl={4} style={{ display: 'flex', justifyContent: 'center' }}>
                            {/* <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Module List</InputLabel>
                                <Select
                                    // size="small"
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Role"
                                    value={moduleName}
                                    onChange={(e) => setModuleName(e.target.value)}
                                >
                                    {moduleList && moduleList.map((item) => (
                                        <MenuItem value={item.moduleId} key={item.moduleId}>{item.moduleName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl> */}
                            <FormControl fullWidth>
                                <InputLabel id="module-select-label">Module List</InputLabel>
                                <Select
                                    labelId="module-select-label"
                                    id="module-select"
                                    multiple
                                    label="Module List"
                                    value={selectedModules}
                                    onChange={handleModuleChange}
                                    renderValue={(selected) =>
                                        moduleList
                                            .filter((module) => selected.includes(module.moduleId))
                                            .map((module) => module.moduleName)
                                            .join(', ')
                                    }
                                >
                                    {moduleList.map((module) => (
                                        <MenuItem key={module.moduleId} value={module.moduleId}>
                                            <Checkbox checked={selectedModules.includes(module.moduleId)} />
                                            <ListItemText primary={module.moduleName} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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

export default AddAssignModule