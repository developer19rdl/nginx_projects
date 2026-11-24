import React, { useState } from 'react'
import { Box, Button, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';

const Inspection = () => {
    const [age, setAge] = useState('');

    const handleSelectChange = (event) => {
        setAge(event.target.value);
    };

    return (
        <Box
            sx={{
                width: '100%'
            }}
        >
            {/* <Typography variant="h6" component="div" sx={{ flexGrow: 1, backgroundColor: '#1976d2', padding: 2.5, color: '#ffffff' }} >
                Add Max Energy
            </Typography> */}
            <Card sx={{ borderRadius: 0, padding: '25px', boxShadow: 'none', }} >
                <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} justifyContent={'center'} >
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
                            <Button variant="contained">View</Button>
                        </Grid>
                    </Grid>

                </CardContent>
            </Card>
            <Box
                sx={{
                    width: '100%'
                }}
                className='toolAddCardContainer'
            >
                <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#f7f7fc', padding: 2.5, color: '#000000', borderRadius: '5px 5px 0 0' }} >
                    CERTIFICATE DETAILS
                </Typography>
                <Card sx={{ borderRadius: '0 0 5px 5px', padding: '5px', boxShadow: 'none' }} >
                    <CardContent >
                        <div className='view_tableContainer'>
                            <table id="customers">
                                <tr>
                                    <th>Vender Name</th>
                                    <th>Inspection date - Action</th>
                                </tr>
                                {/* {rows.map((item) => */}
                                    <tr>
                                        <td>Harish</td>
                                        <td>22/04/2023</td>
                                    </tr>
                                    {/* )} */}
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    )
}
export default Inspection;
