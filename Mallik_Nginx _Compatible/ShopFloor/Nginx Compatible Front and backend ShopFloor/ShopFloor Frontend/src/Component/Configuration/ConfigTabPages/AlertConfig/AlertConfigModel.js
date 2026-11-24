import React, { useState } from 'react';
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

const AlertConfigModel = ({ open, setOpen, isAddButton, editConfigSetup, setNotification, setRefreshData }) => {
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

    const handleClose = () => {
        setOpen(false);
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



    return (
        <div>
            <Dialog sx={{ '& .MuiDialog-paper': { width: '62%', maxHeight: '100%' } }}
                maxWidth="lg"
                open={open}>
                <form>
                    <DialogTitle sx={{ color: '#000000', fontWeight: 'bold' }}>
                        {isAddButton ? 'Add ' : 'Update '} Alert Configuration
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} style={{}}>
                            <Grid item xs={12} marginBottom={2}>
                                <Box display="flex" justifyContent="center">
                                    <FormControl component="fieldset">
                                        <RadioGroup row value={selectedValue} onChange={handleRadioChange}>
                                            <FormControlLabel value="AlertParameters" control={<Radio 
                                            sx={{
                                                color: '#686D76', // unselected color
                                                '&.Mui-checked': {
                                                    color: '#000000', // selected color
                                                }
                                            }}
                                            />} label="Email Settings" />
                                            <FormControlLabel value="SetAlerts" control={<Radio 
                                            sx={{
                                                color: '#686D76', // unselected color
                                                '&.Mui-checked': {
                                                    color: '#000000', // selected color
                                                }
                                            }}
                                            />} label="Set Alerts" />
                                        </RadioGroup>
                                    </FormControl>
                                </Box>
                            </Grid>
                        </Grid>
                        {selectedValue === 'AlertParameters' && (
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
                        )}

                        {selectedValue === 'SetAlerts' && (
                            <Grid container spacing={2}>

                                <Grid item xs={12} sm={12}>
                                    <FormControl fullWidth>
                                        <InputLabel id="machine-select-label">Alert Type</InputLabel>
                                        <Select
                                            labelId="machine-select-label"
                                            id="machine-select"
                                            label="Alert Type"
                                            value={alertType}
                                            required
                                            onChange={onAlertTypeChange}
                                        >
                                            {alertTypeList.map((data, index) => (
                                                <MenuItem key={index} value={data.id}>{data.departmentName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <TextField
                                        fullWidth
                                        label="Alert Lead Days "
                                        placeholder="Alert Lead Days"
                                        variant="outlined"
                                        required
                                        value={alertLeadDays}
                                        onChange={(e) => setAlertLeadDays(e.target.value)}

                                    />
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <FormControl fullWidth>
                                        <InputLabel id="machine-select-label">Users</InputLabel>
                                        <Select
                                            labelId="machine-select-label"
                                            id="machine-select"
                                            label="Users"
                                            value={users}
                                            required
                                            onChange={onUsersChange}
                                        >
                                            {usersList.map((data, index) => (
                                                <MenuItem key={index} value={data.id}>{data.departmentName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                            </Grid>
                        )}

                    </DialogContent>
                    <DialogActions style={{ justifyContent: 'flex-end' }}>
                        <Button onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {isAddButton ? "Add" : "Update"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default AlertConfigModel;
