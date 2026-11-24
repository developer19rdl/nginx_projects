import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { DepartmentList, OperatortAddService, OperatortEditType } from '../../../Services/NodeJsApiServices';

const AddOperatorModel = ({ open, setOpen, isAddButton, OperatorData, setRefreshData }) => {
    const [id, setId] = useState('')
    const [operatorid, setOperatorId] = useState('');
    const [operatorName, setOperatorName] = useState('')
    const [department, setDepartment] = useState('');
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('');
    const [departmentList, setDepartmentList] = useState([]);
    const [passwordError, setPasswordError] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        // if (isAddButton && password !== confirmPassword) {
        //     setPasswordError(true);
        //     return;
        // }
        if (isAddButton) {
            OperatortAddService({
                operatorName: operatorName,
                departmentName: department,
                operatorId: operatorid,
                password: password,

            }, handleUserSuccess, handleUserException);
        } else {
            OperatortEditType({
                id,
                operatorName: operatorName,
                departmentName: department,
                operatorId: operatorid,
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
        DepartmentList(departmentSuccess, departmentException);
        setOpen(open)
        loadData();
    }, [OperatorData]);

    const departmentSuccess = (dataObject) => {
        setDepartmentList(dataObject.data || []);

    };

    const departmentException = () => {

    };
    const loadData = () => {
        setId(OperatorData.id || '');
        setOperatorId(OperatorData.operatorId || '');
        setOperatorName(OperatorData.operatorName || '');
        setDepartment(OperatorData.departmentName || '');
        setPassword(OperatorData.password || '');
        setConfirmPassword(OperatorData.departmentName || '');

    };
    /////////
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        if (confirmPassword && newPassword !== confirmPassword) {
            setPasswordError(true);
        } else {
            setPasswordError(false);
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const newConfirmPassword = e.target.value;
        setConfirmPassword(newConfirmPassword);
        if (password && newConfirmPassword !== password) {
            setPasswordError(true);
        } else {
            setPasswordError(false);
        }
    };

    return (
        <Dialog sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
            maxWidth='lg'
            open={open} >
            <DialogTitle style={{}}>
                {isAddButton ? 'Add Operator' : 'Edit  Operator'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2} >
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <TextField
                                fullWidth
                                // size="small"
                                id="outlined-basic"
                                label="Operator Name"
                                type="text"
                                variant="outlined"
                                value={operatorName}
                                required
                                onChange={(e) => { setOperatorName(e.target.value) }}
                            // InputLabelProps={
                            //     {
                            //         shrink: true
                            //     }
                            // }
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} lg={4} xl={4} style={{ display: 'flex', justifyContent: 'center' }}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Department</InputLabel>
                                <Select
                                    // size="small"
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Department"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                >
                                    {departmentList && departmentList.map((item) => (
                                        <MenuItem value={item.id} key={item.id}>{item.departmentName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <TextField
                                fullWidth
                                // size="small"
                                id="outlined-basic"
                                label="operator Id"
                                type="text"
                                variant="outlined"
                                value={operatorid}
                                required
                                onChange={(e) => { setOperatorId(e.target.value) }}
                            // InputLabelProps={
                            //     {
                            //         shrink: true
                            //     }
                            // }
                            />
                        </Grid>
                        {isAddButton && <Grid item xs={12} sm={12} md={4} lg={4}>
                            <TextField
                                fullWidth

                                id="outlined-basic"
                                label="password"
                                type="text"
                                variant="outlined"
                                value={password}
                                required
                                onChange={handlePasswordChange}
                            // error={passwordError}
                            // helperText={passwordError ? "Passwords do not match" : ""}

                            />
                        </Grid>}
                        {isAddButton && <Grid item xs={12} sm={12} md={4} lg={4}>
                            <TextField
                                fullWidth
                                id="outlined-basic"
                                label="confirmPassword"
                                type="text"
                                variant="outlined"
                                value={confirmPassword}
                                required
                                onChange={handleConfirmPasswordChange}
                                error={passwordError}
                                helperText={passwordError ? "Passwords do not match" : ""}

                            />
                        </Grid>}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        style={{}}
                    >
                        {isAddButton ? 'Add' : 'Update'}
                    </Button>
                    <Button
                        style={{}}
                        onClick={(e) => {
                            setOpen(false);
                            setPasswordError(false)
                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddOperatorModel