import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AppBar, Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Toolbar } from '@mui/material';
import './ForCasting.css'

const ForCasting = () => {
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
                COMPRESSOR UTILISATION ANALYSIS
            </Typography>
            <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
                <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} >
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <Typography>Predict Till:</Typography>
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
                            <Typography>Parameter</Typography>
                        </Grid>
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">--Select Parameter--</InputLabel>
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
                            <Typography>Machine</Typography>
                        </Grid>
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">--Select Machine--</InputLabel>
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
                            <Button variant="contained">Search</Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    )
}
export default ForCasting;
