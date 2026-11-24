import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AppBar, Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Toolbar } from '@mui/material';

const AddAMC = () => {
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
                

                    <Grid container spacing={2} marginBottom={2} >
    
                        <Grid item lg={12} md={12} container justifyContent="center">
                            <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">--Select Vendor--</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={age}
                                        label="--Select Vendor--"
                                        onChange={handleSelectChange}
                                    >
                                        <MenuItem value={10}>Ten</MenuItem>
                                        <MenuItem value={20}>Twenty</MenuItem>
                                        <MenuItem value={30}>Thirty</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
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
                            <CardContent sx={{ display: 'flex', justifyContent: 'center',padding:'20px' }}>
                                <Grid  container spacing={1}  sx={{display:'flex',justifyContent:'center',alignItems:'center'}} >
                                    <Grid item lg={1.5} md={1.5}  container  justifyContent="flex-start">
                                        <Typography>Period : FROM</Typography>
                                    </Grid>
                                    <Grid item lg={2.5} md={2.5}  container  justifyContent="flex-start">
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
                                    <Grid item lg={1.5} md={1.5}  container  justifyContent="flex-start">
                                        <Typography>Period : To</Typography>
                                    </Grid>
                                    <Grid item lg={2.5} md={2.5}  container  justifyContent="flex-start">
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
                                    <Grid item lg={1.5} md={1.5}  container  justifyContent="flex-start">
                                        <Typography>Service Pattern</Typography>
                                    </Grid>
                                    <Grid item lg={2.5} md={2.5}  container  justifyContent="flex-start">
                                        <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="demo-simple-select-label">--Service Pattern--</InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    value={age}
                                                    label="--Service Pattern--"
                                                    onChange={handleSelectChange}
                                                >
                                                    <MenuItem value={10}>Ten</MenuItem>
                                                    <MenuItem value={20}>Twenty</MenuItem>
                                                    <MenuItem value={30}>Thirty</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </Grid>
                                    <Grid item lg={1.5} md={1.5}  container  justifyContent="flex-start">
                                        <Typography>Department</Typography>
                                    </Grid>
                                    <Grid item lg={2.5} md={2.5}  container  justifyContent="flex-start">
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
                                    <Grid item lg={1.5} md={1.5}  container  justifyContent="flex-start">
                                        <Typography>Section</Typography>
                                    </Grid>
                                    <Grid item lg={2.5} md={2.5}  container  justifyContent="flex-start">
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
                                    <Grid item lg={1.5} md={1.5}  container  justifyContent="flex-start">
                                        <Typography>Asset Type</Typography>
                                    </Grid>
                                    <Grid item lg={2.5} md={2.5}  container  justifyContent="flex-start">
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
                                    <Grid item lg={1.5} md={1.5}  container  justifyContent="flex-start">
                                        <Typography>Asset Name</Typography>
                                    </Grid>
                                    <Grid item lg={2.5} md={2.5}  container  justifyContent="flex-start">
                                        <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="demo-simple-select-label">--Select Asset Name--</InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    value={age}
                                                    label="--Select Asset Name--"
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
export default AddAMC;
