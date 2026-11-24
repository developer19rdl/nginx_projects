import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AppBar, Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Toolbar } from '@mui/material';
import './AlertConfigAdd.css';

const AlertConfigAdd = () => {
    const [age, setAge] = useState('');
    const [selectedRadioValue, setSelectedRadioValue] = useState('');

    const handleSelectChange = (event) => {
        setAge(event.target.value);
    };

    const handleRadioChange = (event) => {
        setSelectedRadioValue(event.target.value);
    };

    return (
        <>
            <Box
                sx={{
                    width: '100%'
                }}
                className='toolAddCardContainer'
            >
                <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#f7f7fc', padding: 2.5, color: '#000000', borderRadius: '5px 5px 0 0' }} >
                    ALERT PARAMETERS
                </Typography>
                <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
                    <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} >
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography>SMTP Server</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <TextField id="per-day-input" label="SMTP Server" variant="outlined" />
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography>Alert Email From</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <TextField id="per-day-input" label="Alert Email From" variant="outlined" />
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography>Password</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <TextField type='password' id="per-day-input" label="Password" variant="outlined" />
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography>Security Type</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <FormControl component="fieldset" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0px' }}>
                                    <RadioGroup
                                        aria-label="options"
                                        name="options"
                                        value={selectedRadioValue}
                                        onChange={handleRadioChange}
                                        sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}
                                    >
                                        <FormControlLabel
                                            value="TLS"
                                            control={<Radio />}
                                            label="TLS"
                                        />
                                        <FormControlLabel
                                            value="SSL"
                                            control={<Radio />}
                                            label="SSL"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                            <Grid item lg={12} md={12} container justifyContent="center">
                                <Button variant="contained">Add</Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
            {/* <-----Bottom Card SET ALERTS-----> */}
            <Box
                sx={{
                    width: '100%'
                }}
                className='setAlertoolAddCardContainer'
            >
                <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#f7f7fc', padding: 2.5, color: '#000000', borderRadius: '5px 5px 0 0' }} >
                    SET ALERTS
                </Typography>
                <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
                    <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} >
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography>Select Alert Type</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                    <FormControl fullWidth>
                                        <InputLabel id="demo-simple-select-label">--Select Alert Type--</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={age}
                                            label="Age"
                                            onChange={handleSelectChange}
                                        >
                                            <MenuItem value={10}>Ten</MenuItem>
                                            <MenuItem value={20}>Twenty</MenuItem>
                                            <MenuItem value={30}>Thirty</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography>Alert Lead Days:</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <TextField type='number' id="per-day-input" label="Alert Lead Days:" variant="outlined" />
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography>Select Users</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                    <FormControl fullWidth>
                                        <InputLabel id="demo-simple-select-label">--Select Users--</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={age}
                                            label="Age"
                                            onChange={handleSelectChange}
                                        >
                                            <MenuItem value={10}>Ten</MenuItem>
                                            <MenuItem value={20}>Twenty</MenuItem>
                                            <MenuItem value={30}>Thirty</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Grid>
                            <Grid item lg={12} md={12} container justifyContent="center">
                                <Button variant="contained">Add</Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        </>
    )
}
export default AlertConfigAdd;
