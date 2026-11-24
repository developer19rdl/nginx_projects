import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AppBar, Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Toolbar } from '@mui/material';

const TransferAsset = () => {
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
                    From
                </Typography>
                <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
                    <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} >
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography fontWeight="bold" variant="body1">Department</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
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
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography fontWeight="bold" variant="body1">Section</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
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
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography fontWeight="bold" variant="body1">Asset Type</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
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
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography fontWeight="bold" variant="body1">Asset Name</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
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
                                <Button variant="contained">Move</Button>
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
                    To
                </Typography>
                <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
                    <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} >
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography fontWeight="bold" variant="body1">Department</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
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
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography fontWeight="bold" variant="body1">Section</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
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
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography fontWeight="bold" variant="body1">Asset Type</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
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
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        </>
    )
}
export default TransferAsset;
