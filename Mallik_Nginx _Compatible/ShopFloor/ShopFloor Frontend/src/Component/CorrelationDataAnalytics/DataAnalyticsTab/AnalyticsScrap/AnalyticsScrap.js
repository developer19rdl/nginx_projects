import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AppBar, Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Toolbar, useMediaQuery } from '@mui/material';
import './AnalyticsScrap.css'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

const data = [
    {
        "name": "Page A",
        "uv": 4000,
        "pv": 2400
    },
    {
        "name": "Page B",
        "uv": 3000,
        "pv": 1398
    },
    {
        "name": "Page C",
        "uv": 2000,
        "pv": 9800
    },
    {
        "name": "Page D",
        "uv": 2780,
        "pv": 3908
    },
    {
        "name": "Page E",
        "uv": 1890,
        "pv": 4800
    },
    {
        "name": "Page F",
        "uv": 2390,
        "pv": 3800
    },
    {
        "name": "Page G",
        "uv": 3490,
        "pv": 4300
    }
]

const lineChartData = [
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

const AnalyticsScrap = () => {
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
                    PRODUCTION/SCRAP ANALYSIS
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
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Typography>Energy Source</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                    <FormControl fullWidth>
                                        <InputLabel id="demo-simple-select-label">--Energy Source--</InputLabel>
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

            <Box
                sx={{
                    width: '100%'
                }}
                className='graphToolAddCardContainer'
            >
                <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#f7f7fc', padding: 2.5, color: '#000000', borderRadius: '5px 5px 0 0' }} >
                    COMPRESSOR UTILISATION ANALYSIS
                </Typography>
                <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
                    <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Grid container spacing={5}>
                            <Grid item lg={8} md={12} sm={12} xs={12} >
                                <Item>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={data}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="pv" fill="#08e1cc" />
                                            <Bar dataKey="uv" fill="#e3af1f" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Item>
                            </Grid>
                            <Grid item lg={8} md={12} sm={12} xs={12} >
                                <Item>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={lineChartData}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="pv" stroke="#8884d8" />
                                            <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Item>
                            </Grid>
                            <Grid item lg={4} md={12} sm={12} xs={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Item style={{ height: '265px', width: '400px' }}>
                                    <Box>
                                        <Typography fontWeight={'bold'} color={"#000000"} paddingTop={'10px'}>SCRAP STATISTICS</Typography>
                                        <Grid container display={'flex'} flexDirection={'row'} justifyContent={'space-between'} paddingTop={'65px'} paddingLeft={'3%'} paddingRight={'3%'}>
                                            <Grid item >
                                                <Typography textAlign={'start'} style={{ fontSize: isXs ? '11px' : '15px' }}>Total Production [Bends]:</Typography>
                                                <Typography textAlign={'start'} style={{ fontSize: isXs ? '11px' : '15px' }}>Total Scrap:</Typography>
                                                <Typography textAlign={'start'} style={{ fontSize: isXs ? '11px' : '15px' }}>Avg Scrap/Production:</Typography>
                                            </Grid>
                                            <Grid item >
                                                <Typography textAlign={'start'} style={{ fontSize: isXs ? '11px' : '15px' }}>9808</Typography>
                                                <Typography textAlign={'start'} style={{ fontSize: isXs ? '11px' : '15px' }}>0 kg</Typography>
                                                <Typography textAlign={'start'} style={{ fontSize: isXs ? '11px' : '15px' }}>0.000 kg</Typography>
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
export default AnalyticsScrap;
