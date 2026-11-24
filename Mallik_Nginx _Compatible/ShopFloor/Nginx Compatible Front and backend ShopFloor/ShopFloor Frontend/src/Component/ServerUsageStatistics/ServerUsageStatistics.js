import React, { useState } from 'react'
import './ServerUsageStatistics.css'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import { FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import ServerUsageHederCards from './ServerUsageHederCards';

const data = [
    {
        "name": "Page A",
        "uv": 4000,
        "pv": 2400,
        "amt": 2400
    },
    {
        "name": "Page B",
        "uv": 3000,
        "pv": 1398,
        "amt": 2210
    },
    {
        "name": "Page C",
        "uv": 2000,
        "pv": 9800,
        "amt": 2290
    },
    {
        "name": "Page D",
        "uv": 2780,
        "pv": 3908,
        "amt": 2000
    },
    {
        "name": "Page E",
        "uv": 1890,
        "pv": 4800,
        "amt": 2181
    },
    {
        "name": "Page F",
        "uv": 2390,
        "pv": 3800,
        "amt": 2500
    },
    {
        "name": "Page G",
        "uv": 3490,
        "pv": 4300,
        "amt": 2100
    }
]

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const ServerUsageStatistics = () => {
    const [age, setAge] = useState('');
    const [searchClick, setSearchClick] = useState(false)
    const [open, setOpen] = React.useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [checked, setChecked] = useState({
        TYPE: false,
        CURRENT: false,
        MAX: false,
        SEVERITY: false,
        TIMESTAMP: false,
    });
    const [filterChecked, setFilterChecked] = useState({
        Any: false,
        Active: false,
        Cleared: false,
        Acknowledged: false,
        UnAcknowledged: false,
    });

    const handleChange = (event) => {
        setChecked({ ...checked, [event.target.name]: event.target.checked });
    };

    const handleFilterChange = (event) => {
        setFilterChecked({ ...filterChecked, [event.target.name]: event.target.checked });
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSelectChange = (event) => {
        setAge(event.target.value);
    };

    const handleFilterOpen = () => {
        setFilterOpen(true)
    }
    const handleFilterClose = () => {
        setFilterOpen(false)
    }

    const handleExportOpen = () => {
        setExportOpen(true)
    }
    const handleExportClose = () => {
        setExportOpen(false)
    }

    const handleSearchClick = () => {
        setSearchClick(!searchClick)
    }

    return (
        <>
            <ServerUsageHederCards />
            <Box sx={{ width: '100%', padding: 1 }}>

                <Grid container spacing={2}>

                    <Grid item xs={12} sm={12} lg={6} md={6}>
                        <Item>
                            <Grid container display={'flex'} justifyContent={'space-between'}>
                                <Grid item>
                                    <Typography style={{ fontSize: '13px', color: '#000000', fontWeight: 'bold' }}>CPU Load Trend</Typography>
                                </Grid>
                                <Grid item>
                                    <AccessAlarmsIcon />
                                </Grid>
                            </Grid>
                            <Grid container display={'flex'} justifyContent={'space-between'} style={{ marginBottom: '10px' }}>
                                <Grid item display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                    <AccessTimeIcon /><Typography style={{ fontSize: '13px', color: '#000000', fontWeight: 'bold' }}>Real Time- Last 30 Mins</Typography>
                                </Grid>
                            </Grid>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={data}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="pv" stroke="#8884d8" />
                                    <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Item>
                    </Grid>
                    <Grid item xs={12} sm={12} lg={6} md={6}>
                        <Item>
                            <Grid container display={'flex'} justifyContent={'space-between'}>
                                <Grid item>
                                    <Typography style={{ fontSize: '13px', color: '#000000', fontWeight: 'bold' }}>Server Load Trend</Typography>
                                </Grid>
                                <Grid item>
                                    <AccessAlarmsIcon />
                                </Grid>
                            </Grid>
                            <Grid container display={'flex'} justifyContent={'space-between'} style={{ marginBottom: '10px' }}>
                                <Grid item display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                    <AccessTimeIcon /><Typography style={{ fontSize: '13px', color: '#000000', fontWeight: 'bold' }}>Real Time- Last 30 Mins</Typography>
                                </Grid>
                            </Grid>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={data}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="pv" stroke="#8884d8" />
                                    <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Item>
                    </Grid>
                    <Grid item xs={12} sm={12} lg={6} md={6}>
                        <Item>
                            <Grid container display={'flex'} justifyContent={'space-between'}>
                                <Grid item>
                                    <Typography style={{ fontSize: '13px', color: '#000000', fontWeight: 'bold' }}>Memory Usage Trend</Typography>
                                </Grid>
                                <Grid item>
                                    <AccessAlarmsIcon />
                                </Grid>
                            </Grid>
                            <Grid container display={'flex'} justifyContent={'space-between'} style={{ marginBottom: '10px' }}>
                                <Grid item display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                    <AccessTimeIcon /><Typography style={{ fontSize: '13px', color: '#000000', fontWeight: 'bold' }}>Real Time- Last 30 Mins</Typography>
                                </Grid>
                            </Grid>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={data}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="pv" stroke="#8884d8" />
                                    <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Item>
                    </Grid>
                    <Grid item xs={12} sm={12} lg={6} md={6}>
                        <Item>
                            <Grid container display={'flex'} justifyContent={'space-between'}>
                                <Grid item>
                                    <Typography style={{ fontSize: '13px', color: '#000000', fontWeight: 'bold' }}>Alert Report</Typography>
                                </Grid>
                                <Grid item>
                                    <SearchIcon onClick={handleSearchClick} />
                                    <DensityMediumIcon onClick={handleClickOpen} />
                                    <FilterAltIcon onClick={handleFilterOpen} />
                                    <ImportExportIcon onClick={handleExportOpen} />
                                </Grid>
                            </Grid>
                            <Grid container display={'flex'} justifyContent={'space-between'} alignItems={'center'} >
                                {searchClick ?
                                    <TextField
                                        id="outlined-basic"
                                        label="Search"
                                        variant="outlined"
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    :
                                    <>
                                        <Grid item display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                            <AccessTimeIcon /><Typography style={{ fontSize: '13px' }}>Real Time- Last 30 Mins</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel id="demo-simple-select-label">--Show Entries--</InputLabel>
                                                    <Select
                                                        labelId="demo-simple-select-label"
                                                        id="demo-simple-select"
                                                        value={age}
                                                        label="--Energy Source--"
                                                        onChange={handleSelectChange}
                                                    >
                                                        <MenuItem value={10}>2</MenuItem>
                                                        <MenuItem value={20}>3</MenuItem>
                                                        <MenuItem value={30}>5</MenuItem>
                                                        <MenuItem value={30}>All</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </Grid>
                                    </>
                                }
                                <Grid item>
                                </Grid>
                            </Grid>
                            <Grid container style={{ overflowY: 'scroll', height: '244px' }}>
                                <Grid item width={'100%'} paddingTop={1}>
                                    <div>
                                        <div>
                                            <table id="customers">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>TIME</th>
                                                        {checked.TYPE === true ? null : <th>TYPE</th>}
                                                        {checked.CURRENT === true ? null : <th>CURRENT</th>}
                                                        {checked.MAX === true ? null : <th>MAX</th>}
                                                        {checked.SEVERITY === true ? null : <th>SEVERITY</th>}
                                                        {checked.TIMESTAMP === true ? null : <th>TIME STAMP</th>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>2023/09/10</td>
                                                        <td>1.74</td>
                                                        {checked.TYPE === true ? null : <td>82.55</td>}
                                                        {checked.CURRENT === true ? null : <td>136.44</td>}
                                                        {checked.MAX === true ? null : <td>136.44</td>}
                                                        {checked.SEVERITY === true ? null : <td>136.44</td>}
                                                        {checked.TIMESTAMP === true ? null : <td>136.44</td>}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </Grid>
                            </Grid>
                        </Item>
                    </Grid>
                </Grid>

                {/* ----DAILOGBOX FOR 3line---- */}
                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Columns to display"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <FormControl>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={checked.TYPE}
                                            onChange={handleChange}
                                            name="TYPE"
                                            color="primary"
                                        />
                                    }
                                    label="TYPE"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={checked.CURRENT}
                                            onChange={handleChange}
                                            name="CURRENT"
                                            color="primary"
                                        />
                                    }
                                    label="CURRENT"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={checked.MAX}
                                            onChange={handleChange}
                                            name="MAX"
                                            color="primary"
                                        />
                                    }
                                    label="MAX"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={checked.SEVERITY}
                                            onChange={handleChange}
                                            name="SEVERITY"
                                            color="primary"
                                        />
                                    }
                                    label="SEVERITY"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={checked.TIMESTAMP}
                                            onChange={handleChange}
                                            name="TIMESTAMP"
                                            color="primary"
                                        />
                                    }
                                    label="TIME STAMP"
                                />
                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                </Dialog>
                {/* ----DAILOGBOX FOR FILTER---- */}
                <Dialog
                    open={filterOpen}
                    onClose={handleFilterClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Columns to filter"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <FormControl>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filterChecked.Any}
                                            onChange={handleFilterChange}
                                            name="Any"
                                            color="primary"
                                        />
                                    }
                                    label="Any"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filterChecked.Active}
                                            onChange={handleFilterChange}
                                            name="Active"
                                            color="primary"
                                        />
                                    }
                                    label="Active"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filterChecked.MAX}
                                            onChange={handleFilterChange}
                                            name="MAX"
                                            color="primary"
                                        />
                                    }
                                    label="MAX"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filterChecked.Acknowledged}
                                            onChange={handleFilterChange}
                                            name="Acknowledged"
                                            color="primary"
                                        />
                                    }
                                    label="Acknowledged"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filterChecked.UnAcknowledged}
                                            onChange={handleFilterChange}
                                            name="UnAcknowledged"
                                            color="primary"
                                        />
                                    }
                                    label="UnAcknowledged"
                                />
                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                </Dialog>
                {/* ----DAILOGBOX FOR EXPORT---- */}
                <Dialog
                    open={exportOpen}
                    onClose={handleExportClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Export as"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <Typography className='exportTextFromate'>CSV Format</Typography>
                            <Typography className='exportTextFromate'>Exel Format</Typography>
                            <Typography className='exportTextFromate'>Pdf Format</Typography>
                            <Typography className='exportTextFromate'>Copy Data</Typography>
                        </DialogContentText>
                    </DialogContent>
                </Dialog>
            </Box>
        </>
    )
}
export default ServerUsageStatistics;
