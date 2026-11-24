import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AppBar, Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Toolbar } from '@mui/material';
import './AddCertificate.css'

const AddCertificate = () => {
    const [age, setAge] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);

    const handleSelectChange = (event) => {
        setAge(event.target.value);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Format the date as "YYYY-MM-DD" for the input field
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

    return (
        <Box
            sx={{
                width: '100%'
            }}
            className='toolAddCardContainer'
        >
            <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#f7f7fc', padding: 2.5, color: '#000000', borderRadius: '5px 5px 0 0' }} >
                VENDER DETAILS
            </Typography>
            <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
                <CardContent>
                    {/* <Grid container spacing={2} width={{ lg: "100%", md: '100%' }} alignItems={'center'} >
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <Typography>Maintenance Id</Typography>
                        </Grid>
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <TextField style={{ width: '280px' }} disabled value={"mac_44"} id="per-day-input" variant="outlined" />
                        </Grid>
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <Typography>Maintenance Id</Typography>
                        </Grid>
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <TextField style={{ width: '280px' }} disabled value={"mac_44"} id="per-day-input" variant="outlined" />
                        </Grid>
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <Typography>Maintenance Id</Typography>
                        </Grid>
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <TextField style={{ width: '280px' }} disabled value={"mac_44"} id="per-day-input" variant="outlined" />
                        </Grid>
                    </Grid> */}

                    {/* <Grid container spacing={3} alignItems="center" justifyContent={'flex-start'} style={{ backgroundColor: 'lightblue' }} direction={'row'}>
                        <Grid item xl={1.2} lg={2} md={1} container justifyContent="flex-start" style={{ backgroundColor: 'lightcoral' }}>
                            <Typography>Maintenance Id</Typography>
                        </Grid>
                        <Grid item xl={2} lg={2} md={1} container justifyContent="flex-start">
                            <TextField disabled value={"mac_44"} id="per-day-input" variant="outlined" />
                        </Grid>
                        <Grid item xl={2} lg={2} md={1} container justifyContent="flex-start">
                            <Typography>Maintenance Id</Typography>
                        </Grid>
                        <Grid item xl={2} lg={2} md={1} container justifyContent="flex-start">
                            <TextField disabled value={"mac_44"} id="per-day-input" variant="outlined" />
                        </Grid>
                        <Grid item xl={2} lg={2} md={1} container justifyContent="flex-start">
                            <Typography>Maintenance Id</Typography>
                        </Grid>
                        <Grid item xl={2} lg={2} md={1} container justifyContent="flex-start">
                            <TextField disabled value={"mac_44"} id="per-day-input" variant="outlined" />
                        </Grid>
                        <Grid item xl={2} lg={2} md={1} container justifyContent="flex-start">
                            <Typography>Maintenance Id</Typography>
                        </Grid>
                        <Grid item xl={2} lg={2} md={1} container justifyContent="flex-start">
                            <TextField disabled value={"mac_44"} id="per-day-input" variant="outlined" />
                        </Grid>
                        <Grid item xl={2} lg={2} md={1} container justifyContent="flex-start">
                            <Typography>Maintenance Id</Typography>
                        </Grid>
                        <Grid item xl={2} lg={2} md={1} container justifyContent="flex-start">
                            <TextField disabled value={"mac_44"} id="per-day-input" variant="outlined" />
                        </Grid>
                    </Grid> */}

                    <Grid container spacing={2} marginBottom={2} >
                        <Grid item md={2.4} container justifyContent="flex-start">
                            <TextField fullWidth label="Name" id="per-day-input" variant="outlined" />
                        </Grid>
                        <Grid item md={2.4} container justifyContent="flex-start">
                            <TextField fullWidth label="E mail" id="per-day-input" variant="outlined" />
                        </Grid>
                        <Grid item md={2.4} container justifyContent="flex-start">
                            <TextField fullWidth label="Address" id="per-day-input" variant="outlined" />
                        </Grid>
                        <Grid item md={2.4} container justifyContent="flex-start">
                            <TextField fullWidth label="Company" id="per-day-input" variant="outlined" />
                        </Grid>
                        <Grid item md={2.4} container justifyContent="flex-start">
                            <TextField fullWidth label="Phone" id="per-day-input" variant="outlined" />
                        </Grid>
                    </Grid>

                    {/* INSIDE CARD */}
                    <Box
                        sx={{
                            width: '100%'
                        }}
                        className='toolAddCardContainer'
                    >
                        <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#f7f7fc', padding: 2.5, color: '#000000', borderRadius: '5px 5px 0 0' }} >
                            CERTIFICATE DETAILS
                        </Typography>
                        <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
                            <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} >
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Typography>Certificate Date</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <TextField
                                            type='date'
                                            id="per-day-input"
                                            variant="outlined"
                                            sx={{ width: { lg: "222px", md: '222px', xs: '178px', sm: '222px' } }}
                                            value={selectedDate}
                                            onChange={handleDateChange}
                                            required
                                            inputProps={{ min: tomorrowFormatted }} // Set the minimum date
                                        />
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Typography>Expire Date</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <TextField
                                            type='date'
                                            id="per-day-input"
                                            variant="outlined"
                                            sx={{ width: { lg: "222px", md: '222px', xs: '178px', sm: '222px' } }}
                                            value={selectedDate}
                                            onChange={handleDateChange}
                                            required
                                            inputProps={{ min: tomorrowFormatted }} // Set the minimum date
                                        />
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Typography>Inspection Pattern</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="demo-simple-select-label">--Inspection Pattern--</InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    value={age}
                                                    label="Inspection Pattern"
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
                                        <Typography>Department</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="demo-simple-select-label">--Select Department--</InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    value={age}
                                                    label="Select Department"
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
                                        <Typography>Section</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="demo-simple-select-label">--Select Section--</InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    value={age}
                                                    label="Select Section"
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
                                        <Typography>Asset Type</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="demo-simple-select-label">--Select Asset Type--</InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    value={age}
                                                    label="Select Asset Type"
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
                                        <Typography>Asset Name</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="demo-simple-select-label">--Select Asset Name--</InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    value={age}
                                                    label="Select Asset Name"
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
                                        <Button variant="contained">Apply</Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}
export default AddCertificate;

