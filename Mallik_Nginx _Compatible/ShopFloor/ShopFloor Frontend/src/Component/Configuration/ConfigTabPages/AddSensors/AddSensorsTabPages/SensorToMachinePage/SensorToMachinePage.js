import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AppBar, Button, Checkbox, FormControl, FormControlLabel, Grid, InputLabel, ListItemText, MenuItem, Radio, RadioGroup, Select, TextField, Toolbar } from '@mui/material';
import './SensorToMachinePage.css'

const SensorToMachine = () => {
    const [age, setAge] = useState('');
    const [selectedValues, setSelectedValues] = useState([]);

    const handleSelectChange = (event) => {
        setAge(event.target.value);
    };

    const handleDropSelectChange = (event) => {
        setSelectedValues(event.target.value);
    };

    return (
        <Box
            sx={{
                width: '100%'
            }}
            className='toolAddCardContainer'
        >
            <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#f7f7fc', padding: 2.5, color: '#000000', borderRadius: '5px 5px 0 0' }} >
                Sensors To Machine
            </Typography>
            <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
                <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} >
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <Typography>Sensor Class Module</Typography>
                        </Grid>
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">--Sensor Class Module--</InputLabel>
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
                            <Typography>Select Machines</Typography>
                        </Grid>
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">--Select Machines--</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        multiple
                                        value={selectedValues}
                                        onChange={handleDropSelectChange}
                                        renderValue={(selected) => (
                                            <div>
                                                {selected.map((value) => (
                                                    <span key={value}>{value}, </span>
                                                ))}
                                            </div>
                                        )}
                                    >
                                        <MenuItem value={10}>
                                            <Checkbox checked={selectedValues.includes(10)} />
                                            <ListItemText primary="Ten" />
                                        </MenuItem>
                                        <MenuItem value={20}>
                                            <Checkbox checked={selectedValues.includes(20)} />
                                            <ListItemText primary="Twenty" />
                                        </MenuItem>
                                        <MenuItem value={30}>
                                            <Checkbox checked={selectedValues.includes(30)} />
                                            <ListItemText primary="Thirty" />
                                        </MenuItem>
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
    )
}
export default SensorToMachine;
