import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AppBar, Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Toolbar } from '@mui/material';

const VendorAddType = () => {
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
                maxHeight: '600px', overflowY: 'auto' 
            }}
            className='toolAddCardContainer'
            
        >
            <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#f7f7fc', padding: 2.5, color: '#000000', borderRadius: '5px 5px 0 0' }} >
              ADD VENDOR TYPE
            </Typography>
            <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
                <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} >
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <Typography>Vendor Type</Typography>
                        </Grid>
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <TextField style={{ width: '280px' }} id="per-day-input" label="Vendor Type" variant="outlined" />
                        </Grid>
    
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <Typography>Description</Typography>
                        </Grid>
                        <Grid item lg={6} md={6} container justifyContent="center">
                            <TextField style={{ width: '280px' }} id="per-day-input" label="Description" variant="outlined" />
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
export default VendorAddType;
