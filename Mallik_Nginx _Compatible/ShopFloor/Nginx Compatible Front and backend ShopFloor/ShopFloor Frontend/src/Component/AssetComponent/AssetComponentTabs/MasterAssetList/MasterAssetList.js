import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AppBar, Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Toolbar } from '@mui/material';

const MasterAssetList = () => {
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
        // className='toolAddCardContainer'
        >
            <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
                <CardContent>
                    <Grid container spacing={2} marginBottom={8} >
                        <Grid item md={2.4} container justifyContent="flex-start">
                            <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">--Select Department--</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={age}
                                        label="--Select Department--"
                                        onChange={handleSelectChange}
                                    >
                                        <MenuItem value={10}>Ten</MenuItem>
                                        <MenuItem value={20}>Twenty</MenuItem>
                                        <MenuItem value={30}>Thirty</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>
                        <Grid item md={2.4} container justifyContent="flex-start">
                            <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">--Select Section--</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={age}
                                        label="--Select Section--"
                                        onChange={handleSelectChange}
                                    >
                                        <MenuItem value={10}>Ten</MenuItem>
                                        <MenuItem value={20}>Twenty</MenuItem>
                                        <MenuItem value={30}>Thirty</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>
                        <Grid item md={2.4} container justifyContent="flex-start">
                            <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">--Select Asset Type--</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={age}
                                        label="--Select Asset Type--"
                                        onChange={handleSelectChange}
                                    >
                                        <MenuItem value={10}>Ten</MenuItem>
                                        <MenuItem value={20}>Twenty</MenuItem>
                                        <MenuItem value={30}>Thirty</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>
                        <Grid item md={2.4} container justifyContent="flex-start" alignItems={'center'}>
                            <Button variant="contained">View</Button>
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
                            View Assets
                        </Typography>
                        <Card sx={{ borderRadius: '0 0 5px 5px', padding: '0px', boxShadow: 'none' }} >
                            <CardContent sx={{ padding: '0px' }}>
                                <div className='view_tableContainer'>
                                    <table id="customers">
                                        <tr>
                                            <th>Department</th>
                                            <th>Section</th>
                                            <th>Machine Name</th>
                                            <th>Location</th>
                                            <th>Asset Type</th>
                                            <th>Manufacturer</th>
                                            <th>Asset Model</th>
                                            <th>PO Details</th>
                                            <th>Invoice Details</th>
                                            <th>Waranty Start Date</th>
                                            <th>Waranty End Date</th>
                                        </tr>
                                        {/* {rows.map((item) => */}
                                        <tr>
                                            <td>IT</td>
                                            <td>1</td>
                                            <td>Punching</td>
                                            <td>Bngalore</td>
                                            <td>Fixed</td>
                                            <td>MNC</td>
                                            <td>1.21</td>
                                            <td>Accepted</td>
                                            <td>12/4/1236</td>
                                            <td>12/4/2023</td>
                                            <td>12/4/2025</td>
                                        </tr>
                                        {/* )} */}
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}
export default MasterAssetList;
