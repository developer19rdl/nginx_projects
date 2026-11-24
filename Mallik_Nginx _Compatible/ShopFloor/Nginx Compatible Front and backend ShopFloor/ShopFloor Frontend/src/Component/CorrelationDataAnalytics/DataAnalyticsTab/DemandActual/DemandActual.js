import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AppBar, Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Toolbar, useMediaQuery } from '@mui/material';
import './DemandActual.css'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

const data = [
    {
      "name": "Page A",
      "uv": 4000,
      "pv": 2400,
      "amt": 2400
    },
    {
      "name": "Page B",
      "uv": 3000,
      "pv": 1398,
      "amt": 2210
    },
    {
      "name": "Page C",
      "uv": 2000,
      "pv": 9800,
      "amt": 2290
    },
    {
      "name": "Page D",
      "uv": 2780,
      "pv": 3908,
      "amt": 2000
    },
    {
      "name": "Page E",
      "uv": 1890,
      "pv": 4800,
      "amt": 2181
    },
    {
      "name": "Page F",
      "uv": 2390,
      "pv": 3800,
      "amt": 2500
    },
    {
      "name": "Page G",
      "uv": 3490,
      "pv": 4300,
      "amt": 2100
    }
  ]


const DemandActual = () => {
    const [age, setAge] = useState('');
    const [selectedRadio, setSelectedRadio] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectDateFrom, setSelectDateFrom] = useState(null)
    const [selectDateTo, setSelectDateTo] = useState(null)
    const isXs = useMediaQuery('(max-width:600px)');

    const handleSelectChange = (event) => {
        setAge(event.target.value);
    };

    const handleRadioChange = (event) => {
        setSelectedRadio(event.target.value);

        // Set specific dates for each radio button
        switch (event.target.value) {
            case 'Today':
                setSelectedDate(new Date());
                break;
            case 'Yesterday':
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setSelectedDate(yesterday);
                break;
            case 'This week':
                // Set the start date of the current week
                const thisWeekStartDate = new Date();
                thisWeekStartDate.setDate(thisWeekStartDate.getDate() - thisWeekStartDate.getDay());
                setSelectedDate(thisWeekStartDate);
                break;
            case 'Last week':
                // Set the start date of the previous week
                const lastWeekStartDate = new Date();
                lastWeekStartDate.setDate(lastWeekStartDate.getDate() - lastWeekStartDate.getDay() - 7);
                setSelectedDate(lastWeekStartDate);
                break;
            case 'This month':
                // Set the start date of the current month
                const thisMonthStartDate = new Date();
                thisMonthStartDate.setDate(1);
                setSelectedDate(thisMonthStartDate);
                break;
            case 'Last month':
                // Set the start date of the previous month
                const lastMonthStartDate = new Date();
                lastMonthStartDate.setMonth(lastMonthStartDate.getMonth() - 1);
                lastMonthStartDate.setDate(1);
                setSelectedDate(lastMonthStartDate);
                break;
            default:
                setSelectedDate(null); // For 'Custom' or other cases where a specific date isn't predefined
        }
    };

    const handleDateChangeFrom = (e) => {
        setSelectDateFrom(e.target.value);
    };

    const handleDateChangeTo = (e) => {
        setSelectDateTo(e.target.value);
    };

    // #######
    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));

    return (
        <>
            <Box
                sx={{
                    width: '100%'
                }}
                className='toolAddCardContainer'
            >
                <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#f7f7fc', padding: 2.5, color: '#000000', borderRadius: '5px 5px 0 0' }} >
                    ENERGY [DEMAND/ACTUAL] ANALYSIS
                </Typography>
                <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
                    <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} >
                            <Grid item lg={12} md={12} container justifyContent="center">
                                <FormControl component="fieldset" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0px' }}>
                                    <RadioGroup
                                        aria-label="options"
                                        name="options"
                                        value={selectedRadio}
                                        onChange={handleRadioChange}
                                        sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}
                                    >
                                        <FormControlLabel
                                            value="Today"
                                            control={<Radio />}
                                            label="Today"
                                        />
                                        <FormControlLabel
                                            value="Yesterday"
                                            control={<Radio />}
                                            label="Yesterday"
                                        />
                                        <FormControlLabel
                                            value="This week"
                                            control={<Radio />}
                                            label="This week"
                                        />
                                        <FormControlLabel
                                            value="Last week"
                                            control={<Radio />}
                                            label="Last week"
                                        />
                                        <FormControlLabel
                                            value="This month"
                                            control={<Radio />}
                                            label="This month"
                                        />
                                        <FormControlLabel
                                            value="Last month"
                                            control={<Radio />}
                                            label="Last month"
                                        />
                                        <FormControlLabel
                                            value="Custom"
                                            control={<Radio />}
                                            label="Custom"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography>Date From</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <TextField
                                    type='date'
                                    id="per-day-input"
                                    variant="outlined"
                                    sx={{ width: { lg: "222px", md: '222px', xs: '178px', sm: '222px' } }}
                                    value={selectedDate ? selectedDate.toISOString().slice(0, 10) : selectDateFrom}
                                    onChange={handleDateChangeFrom}
                                />
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography>Date To</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <TextField
                                    type='date'
                                    id="per-day-input"
                                    variant="outlined"
                                    sx={{ width: { lg: "222px", md: '222px', xs: '178px', sm: '222px' } }}
                                    value={selectedDate ? selectedDate.toISOString().slice(0, 10) : selectDateTo}
                                    onChange={handleDateChangeTo}
                                />
                            </Grid>
                            <Grid item lg={12} md={12} container justifyContent="center">
                                <Button variant="contained">Search</Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>

            {/* <----GRAPGH CONTAINER----> */}
            <Box
                sx={{
                    width: '100%'
                }}
                className='graphToolAddCardContainer'
            >
                <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#f7f7fc', padding: 2.5, color: '#000000', borderRadius: '5px 5px 0 0' }} >
                    Energy Usage Analysis [ Punching Machine ]
                </Typography>
                <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
                    <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Grid container spacing={5}>
                            <Grid item lg={8} md={12} sm={12} xs={12} >
                                <Item>
                                    <Typography textAlign={'center'} paddingBottom={'10px'} fontWeight={'bold'} >Demand vs Actual vs Lost energy</Typography>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <ComposedChart width={730} height={250} data={data}>
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <CartesianGrid stroke="#f5f5f5" />
                                            <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" />
                                            <Bar dataKey="pv" barSize={20} fill="#413ea0" />
                                            <Line type="monotone" dataKey="uv" stroke="#ff7300" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </Item>
                            </Grid>
                            <Grid item lg={4} md={12} sm={12} xs={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Item style={{ height: '265px', width: '400px' }}>
                                    <Box>
                                        <Grid container display={'flex'} flexDirection={'row'} justifyContent={'space-between'} paddingTop={'85px'} paddingLeft={'3%'} paddingRight={'3%'}>
                                            <Grid item >
                                                <Typography textAlign={'start'} style={{ fontSize: isXs ? '11px' : '15px' }}>Demand Energy</Typography>
                                                <Typography textAlign={'start'} style={{ fontSize: isXs ? '11px' : '15px' }}>Actual Energy</Typography>
                                                <Typography textAlign={'start'} style={{ fontSize: isXs ? '11px' : '15px' }}>Lost energy</Typography>
                                            </Grid>
                                            <Grid item >
                                                <Typography textAlign={'start'} style={{ fontSize: isXs ? '11px' : '15px' }}>11888 kwh</Typography>
                                                <Typography textAlign={'start'} style={{ fontSize: isXs ? '11px' : '15px' }}>1545 kwh</Typography>
                                                <Typography textAlign={'start'} style={{ fontSize: isXs ? '11px' : '15px' }}>238 kwh</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Item>
                            </Grid>

                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        </>
    )
}
export default DemandActual;