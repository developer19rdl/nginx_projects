import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AppBar, Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Toolbar } from '@mui/material';

const AssetAdd = () => {
    const [age, setAge] = useState('');
    const [selectedRadioValue, setSelectedRadioValue] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleSelectChange = (event) => {
        setAge(event.target.value);
    };

    const handleRadioChange = (event) => {
        setSelectedRadioValue(event.target.value);
    };

    return (
        <Box
            sx={{
                width: '100%',
                maxHeight: '700px', overflowY: 'auto' 
            }}
            className='toolAddCardContainer'
            
        >
            <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#f7f7fc', padding: 2.5, color: '#000000', borderRadius: '5px 5px 0 0' }} >
                Add Asset
            </Typography>
            <Card sx={{ borderRadius: '0 0 5px 5px', boxShadow: 'none' }} >
                <CardContent sx={{ display: 'flex', justifyContent: 'center',padding:'20px' }}>
                    <Grid container spacing={1}  sx={{display:'flex',justifyContent:'center',alignItems:'center'}} >
                        <Grid item lg={1.5} md={1.5}  container  justifyContent="flex-start" >
                            <Typography fontWeight="bold" variant="body1">Department</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container  justifyContent="flex-start">
                            {/* <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}> */}
                            <Box style={{ width: '280px' }}>
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
                        
                        <Grid item lg={1.5} md={1.5} container justifyContent="flex-start">
                            <Typography fontWeight="bold" variant="body1">Section</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container justifyContent="flex-start">
                            {/* <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}> */}
                            <Box style={{ width: '280px' }}>
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
                        <Grid item lg={1.5} md={1.5} container justifyContent="flex-start">
                            <Typography fontWeight="bold" variant="body1">Machine Name</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container justifyContent="flex-start">
                            <TextField style={{ width: '280px' }} id="per-day-input" label="Machine Name" variant="outlined" />
                        </Grid>
                        <Grid item lg={1.5} md={1.5} container justifyContent="flex-start">
                            <Typography fontWeight="bold" variant="body1">Financial Asset Id</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container justifyContent="flex-start">
                            <TextField style={{ width: '280px' }} id="per-day-input" label="Financial Asset Id" variant="outlined" />
                        </Grid>
                        <Grid item lg={1.5} md={1.5} container justifyContent="flex-start">
                            <Typography fontWeight="bold" variant="body1">Vendor</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container justifyContent="flex-start">
                            {/* <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}> */}
                            <Box style={{ width: '280px' }}>
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
                        <Grid item lg={1.5} md={1.5} container justifyContent="flex-start">
                            <Typography fontWeight="bold" variant="body1">Asset Type</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container justifyContent="flex-start">
                            {/* <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}> */}
                            <Box style={{ width: '280px' }}>
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
                        <Grid item lg={1.5} md={1.5} container justifyContent="flex-start">
                            <Typography fontWeight="bold" variant="body1">Manufacturer</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container justifyContent="flex-start">
                            <TextField style={{ width: '280px' }} id="per-day-input" label="Manufacturer" variant="outlined" />
                        </Grid>
                        <Grid item lg={1.5} md={1.5} container justifyContent="flex-start">
                            <Typography fontWeight="bold" variant="body1">Asset Model</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container justifyContent="flex-start">
                            <TextField style={{ width: '280px' }} id="per-day-input" label="Asset Model" variant="outlined" />
                        </Grid>
                        <Grid item lg={1.5} md={1.5} container justifyContent="flex-start">
                            <Typography fontWeight="bold" variant="body1">PO Details</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container justifyContent="flex-start">
                            <TextField style={{ width: '280px' }} id="per-day-input" label="PO Details" variant="outlined" />
                        </Grid>
                        <Grid item lg={1.5} md={1.5} container justifyContent="flex-start">
                            <Typography fontWeight="bold" variant="body1">Invoice Details</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container justifyContent="flex-start">
                            <TextField style={{ width: '280px' }} id="per-day-input" label="Invoice Details" variant="outlined" />
                        </Grid>
                        <Grid item lg={1.5} md={1.5} container justifyContent="flex-start">
                            <Typography fontWeight="bold" variant="body1">Waranty Start Date</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container justifyContent="flex-start">
                            <TextField
                                type='date'
                                id="per-day-input"
                                variant="outlined"
                                // sx={{ width: { lg: "222px", md: '222px', xs: '178px', sm: '222px' } }}
                                value={selectedDate}
                                onChange={handleDateChange}
                                required
                                style={{ width: '280px' }}
                            />
                        </Grid>
                        <Grid item lg={1.5} md={1.5} container justifyContent="flex-start">
                            <Typography fontWeight="bold" variant="body1">Waranty End Date</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container justifyContent="flex-start">
                            <TextField
                                type='date'
                                id="per-day-input"
                                variant="outlined"
                                // sx={{ width: { lg: "222px", md: '222px', xs: '178px', sm: '222px' } }}
                                value={selectedDate}
                                onChange={handleDateChange}
                                required
                                style={{ width: '280px' }}
                            />
                        </Grid>
                        <Grid item lg={1.5} md={1.5} container justifyContent="flex-start">
                            <Typography fontWeight="bold" variant="body1">Waranty Run Hours</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container justifyContent="flex-start">
                            <TextField style={{ width: '280px' }} type='number' id="per-day-input" label="Waranty Run Hours" variant="outlined" />
                        </Grid>
                        <Grid item lg={1.5} md={1.5} container justifyContent="flex-start">
                            <Typography fontWeight="bold" variant="body1">Waranty Type</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container justifyContent="flex-start">
                            {/* <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}> */}
                            <Box style={{ width: '280px' }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">--Select Waranty Type--</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={age}
                                        label="--Select Waranty Type--"
                                        onChange={handleSelectChange}
                                    >
                                        <MenuItem value={10}>Service</MenuItem>
                                        <MenuItem value={20}>Replacement</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>
                        <Grid item lg={1.5} md={1.5} container justifyContent="flex-start">
                            <Typography fontWeight="bold" variant="body1">Description</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container justifyContent="flex-start">
                            <TextField style={{ width: '280px' }} id="per-day-input" label="Description" variant="outlined" />
                        </Grid>
                        <Grid item lg={1.5} md={1.5} container justifyContent="flex-start">
                            <Typography fontWeight="bold" variant="body1">Asset Image</Typography>
                        </Grid>
                        <Grid item lg={2.5} md={2.5} container justifyContent="flex-start">
                            <TextField style={{ width: '280px' }} type='file' id="per-day-input" variant="outlined" />
                        </Grid>
                        <Grid item lg={12} md={12} container justifyContent="center" marginTop={"10px"}>
                            <Button variant="contained">Add</Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    )
}
export default AssetAdd;
