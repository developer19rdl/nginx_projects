import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { DepartmentList, RoleListService, UserAddService, UserEditType } from '../../../Services/NodeJsApiServices';


const AddUserModel = ({ open, setOpen, isAddButton, UserData, setRefreshData }) => {
    const [id, setId] = useState('')
    const [employeeid, setEmployeeId] = useState('');
    const [employeename, setEmployeeName] = useState('')
    const [department, setDepartment] = useState('');
    const [userRole, setUserRole] = useState('');
    const [mobilenumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [departmentList, setDepartmentList] = useState([]);
    const [roleList, setRoleList] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isAddButton) {
            UserAddService({
                empid: employeeid,
                empname: employeename,
                password: password,
                departmentName: department,
                email: email,
                phoneNo: mobilenumber,
                userRole: userRole,
                userName: username

            }, handleUserSuccess, handleUserException);
        } else {
            UserEditType({
                id,
                empid: employeeid,
                empname: employeename,
                password: password,
                departmentName: department,
                email: email,
                phoneNo: mobilenumber,
                userRole: userRole,
                userName: username
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
        RoleListService(roleSuccess, roleException);
        setOpen(open)
        loadData();
    }, [UserData]);

    const loadData = () => {
        setId(UserData.id || '');
        setEmployeeId(UserData.empid || '');
        setEmployeeName(UserData.empname || '');
        setDepartment(UserData.departmentName || '');
        setUserRole(UserData.userRole || '');
        setMobileNumber(UserData.phoneNo || '');
        setEmail(UserData.email || '');
        setUserName(UserData.userName || '');
        setPassword(UserData.deviceType || '');


    };
    const departmentSuccess = (dataObject) => {
        setDepartmentList(dataObject.data || []);

    };

    const departmentException = () => {

    };

    const roleSuccess = (dataObject) => {
        setRoleList(dataObject.data || []);
    };

    const roleException = () => {

    };

    return (
        <Dialog sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
            maxWidth='lg'
            open={open} >
            <DialogTitle style={{}}>
                {isAddButton ? 'Add User' : 'Edit  User'}
            </DialogTitle>
            <form onSubmit={handleSubmit} >
                <DialogContent>
                    <Grid container spacing={2} >
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <TextField
                                fullWidth
                                // size="small"
                                id="outlined-basic"
                                label="EmployeeID"
                                type="text"
                                variant="outlined"
                                value={employeeid}
                                required
                                onChange={(e) => { setEmployeeId(e.target.value) }}
                            // InputLabelProps={
                            //     {
                            //         shrink: true
                            //     }
                            // }
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <TextField
                                fullWidth
                                // size="small"
                                id="outlined-basic"
                                label="Employee Name"
                                type="text"
                                variant="outlined"
                                value={employeename}
                                required
                                onChange={(e) => { setEmployeeName(e.target.value) }}
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
                        <Grid item xs={12} sm={12} md={4} lg={4} xl={4} style={{ display: 'flex', justifyContent: 'center' }}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">User Role</InputLabel>
                                <Select
                                    // size="small"
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="User Role"
                                    value={userRole}
                                    onChange={(e) => setUserRole(e.target.value)}
                                >
                                    {roleList.map((role) => (
                                        <MenuItem value={role.roleName} key={role.id}>{role.roleName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <TextField
                                fullWidth
                                // size="small"
                                id="outlined-basic"
                                label="Phone Number"
                                type="number"
                                variant="outlined"
                                value={mobilenumber}
                                required
                                onChange={(e) => { setMobileNumber(e.target.value) }}
                            // InputLabelProps={
                            //     {
                            //         shrink: true
                            //     }
                            // }
                            />
                        </Grid>

                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <TextField
                                fullWidth
                                // size="small"
                                id="outlined-basic"
                                label="Email"
                                type="email"
                                variant="outlined"
                                value={email}
                                required
                                onChange={(e) => { setEmail(e.target.value) }}
                            // InputLabelProps={
                            //     {
                            //         shrink: true
                            //     }
                            // }
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <TextField
                                fullWidth
                                // size="small"
                                id="outlined-basic"
                                label="User Name"
                                type="text"
                                variant="outlined"
                                value={username}
                                required
                                onChange={(e) => { setUserName(e.target.value) }}
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
                                // size="small"
                                id="outlined-basic"
                                label="Password"
                                type="text"
                                variant="outlined"
                                value={password}
                                required
                                onChange={(e) => { setPassword(e.target.value) }}
                            // InputLabelProps={
                            //     {
                            //         shrink: true
                            //     }
                            // }
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

                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddUserModel