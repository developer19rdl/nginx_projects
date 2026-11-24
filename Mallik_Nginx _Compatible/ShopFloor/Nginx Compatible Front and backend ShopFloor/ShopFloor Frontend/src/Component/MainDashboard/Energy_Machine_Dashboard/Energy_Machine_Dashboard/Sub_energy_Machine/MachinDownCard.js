import { Box, Card, CardActionArea, Grid, Stack, Typography } from '@mui/material';
import React from 'react'

import GaugeChart from './GaugeChart';
import CalendarComponent from './CalendarComponent';
import { Area, Bar, CartesianGrid, ComposedChart, Label, Legend, Line, Tooltip, XAxis, YAxis } from 'recharts';
import DownTimeBarCart from './DownTimeBarCart';
import { ProductivityComponentChart } from './ProductivityComponentChart';
import EnergyLineChart from './EnergyLineChart';


export const MachinDownCard = () => {
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
        },
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        },
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        },
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        },
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        },
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        }
        ,
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        }
        ,
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        }
        ,
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        }
        ,
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        }
        ,
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        }
        ,
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        }
        ,
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        }
        ,
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        }
        ,
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        }
        ,
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        }
        ,
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        },
        {
            "name": "Page G",
            "uv": 3490,
            "pv": 4300,
            "amt": 2100
        }

    ]
    return (
        <Box marginTop={"1%"} >
            <Grid container spacing={2}>
                <Grid item lg={8} sm={10} xs={10}>
                    <Grid container spacing={2} >
                        <Grid item lg={8} sm={12} md={7} xs={12} >
                            <Card
                                sx={{
                                    borderRadius: '5px',
                                    borderRadius: '5px',
                                    border: '2px solid #ccc',
                                    borderColor: '#00ffff',
                                    // overflow:'auto',
                                    width: '100%',
                                }}
                            >
                                <CardActionArea
                                // sx={{ boxShadow: 5, }}
                                >
                                    <Grid
                                        container
                                        // direction="row"
                                        backgroundColor='#E8E2E2'
                                        padding={1}
                                    >
                                        <Grid
                                            item

                                        >
                                            <Typography
                                                sx={{
                                                    color: '#434242',


                                                    // overflow: 'hidden',
                                                    // textOverflow: 'ellipsis',
                                                    // whiteSpace: 'nowrap',
                                                }}
                                            >
                                                % OEE
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    {/* <Box > */}
                                    <Grid container spacing={1} sx={{ backgroundColor: '#09090c', paddingBottom: '10px', paddingTop: '5px' }}>
                                        <Grid item sm={6} xs={12} lg={3} md={3} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <GaugeChart height='200vh' fontSize={"36px"} />
                                        </Grid>
                                        <Grid item sm={6} xs={12} lg={2.8} md={2.8}>
                                            <Grid container direction={"column"} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <Grid item>
                                                    <Typography variant="h6" gutterBottom color={"#ffff"}>
                                                        Availability
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <GaugeChart height={150} />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item sm={6} xs={12} lg={2.8} md={2.8}>
                                            <Grid container direction={"column"} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <Grid item>
                                                    <Typography variant="h6" gutterBottom color={"#ffff"}>
                                                        Performance
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <GaugeChart height={150} />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item sm={6} xs={12} lg={2.8} md={2.8}>
                                            <Grid container direction={"column"} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <Grid item>
                                                    <Typography variant="h6" gutterBottom color={"#ffff"}>
                                                        Quality
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <GaugeChart height={150} />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    {/* </Box> */}
                                </CardActionArea>
                            </Card>
                        </Grid>

                        <Grid item lg={4} sm={12} md={5} xs={12} >
                            <Card
                                sx={{
                                    borderRadius: '5px',
                                    borderRadius: '5px',
                                    border: '2px solid #ccc',
                                    borderColor: '#00ffff',
                                    width: '100%'
                                }}
                            >
                                <CardActionArea
                                // sx={{ boxShadow: 5, }}
                                >
                                    <Grid
                                        container
                                        direction="row"
                                        backgroundColor='#E8E2E2'
                                        padding={0.6}
                                    >
                                        <Grid
                                            item

                                        >
                                            <Typography
                                                sx={{
                                                    color: '#434242',


                                                    // overflow: 'hidden',
                                                    // textOverflow: 'ellipsis',
                                                    // whiteSpace: 'nowrap',
                                                }}
                                            >
                                                Utilization Efficiency
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    <Grid container sx={{ backgroundColor: '#09090c', paddingBottom: '16px', paddingTop: '5px' }} >
                                        <Grid item sm={6} xs={6} lg={6} md={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <GaugeChart height={200} fontSize={"36px"} />
                                        </Grid>
                                        <Grid item sm={6} xs={6} lg={6} md={6}>
                                            <Grid container direction={'column'}  >
                                                <Grid item>
                                                    <Typography variant="h6" gutterBottom color={"#ffff"}>
                                                        Max Capacity
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Stack direction={'row'} spacing={1} alignItems="baseline">
                                                        <Typography variant="h6" color={"#ffff"}>
                                                            240
                                                        </Typography>
                                                        <Typography fontSize={11} color={"#ffff"}>
                                                            Sheet
                                                        </Typography>
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                            <Grid container direction={'column'}  >
                                                <Grid item>
                                                    <Typography variant="h6" gutterBottom color={"#ffff"}>
                                                        Loaded Capacity
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Stack direction={'row'} spacing={1} alignItems="baseline">
                                                        <Typography variant="h6" color={"#ffff"}>
                                                            240
                                                        </Typography>
                                                        <Typography fontSize={11} color={"#ffff"}>
                                                            Sheet
                                                        </Typography>
                                                    </Stack>
                                                </Grid>
                                            </Grid>

                                        </Grid>
                                    </Grid>

                                </CardActionArea>
                            </Card>
                        </Grid>

                        <Grid item lg={6} sm={12} md={12} xs={12} >
                            <Card
                                sx={{
                                    borderRadius: '5px',
                                    borderRadius: '5px',
                                    border: '2px solid #ccc',
                                    borderColor: '#00ffff',
                                }}
                            >
                                <CardActionArea
                                // sx={{ boxShadow: 5, }}
                                >
                                    <Grid
                                        container
                                        direction="row"
                                        backgroundColor='#E8E2E2'
                                        padding={1}
                                    >
                                        <Grid
                                            item

                                        >
                                            <Typography
                                                sx={{
                                                    color: '#434242',


                                                    // overflow: 'hidden',
                                                    // textOverflow: 'ellipsis',
                                                    // whiteSpace: 'nowrap',
                                                }}
                                            >
                                                Down Time

                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Box sx={{ backgroundColor: '#09090c', }}>
                                        <Grid container >
                                            <Grid item lg={12} md={12} sm={12} xs={12}>
                                                <DownTimeBarCart />
                                            </Grid>

                                        </Grid>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>

                        <Grid item lg={6} sm={12} md={12} xs={12} >
                            <Card
                                sx={{
                                    borderRadius: '5px',
                                    borderRadius: '5px',
                                    border: '2px solid #ccc',
                                    borderColor: '#00ffff',
                                }}
                            >
                                <CardActionArea
                                // sx={{ boxShadow: 5, }}
                                >
                                    <Grid
                                        container
                                        direction="row"
                                        backgroundColor='#E8E2E2'
                                        padding={1}
                                    >
                                        <Grid
                                            item

                                        >
                                            <Typography
                                                sx={{
                                                    color: '#434242',


                                                    // overflow: 'hidden',
                                                    // textOverflow: 'ellipsis',
                                                    // whiteSpace: 'nowrap',
                                                }}
                                            >
                                                Productivity

                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Box sx={{ backgroundColor: '#09090c', }}>
                                        <Grid container >
                                            <Grid item lg={12} md={12} sm={12} xs={12}>
                                                <ProductivityComponentChart />
                                            </Grid>

                                        </Grid>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>

                        <Grid item lg={6} sm={12} md={12} xs={12} >
                            <Card
                                sx={{
                                    borderRadius: '5px',
                                    borderRadius: '5px',
                                    border: '2px solid #ccc',
                                    borderColor: '#00ffff',
                                }}
                            >
                                <CardActionArea
                                // sx={{ boxShadow: 5, }}
                                >
                                    <Grid
                                        container
                                        direction="row"
                                        backgroundColor='#E8E2E2'
                                        padding={1}
                                    >
                                        <Grid
                                            item

                                        >
                                            <Typography
                                                sx={{
                                                    color: '#434242',


                                                    // overflow: 'hidden',
                                                    // textOverflow: 'ellipsis',
                                                    // whiteSpace: 'nowrap',
                                                }}
                                            >
                                                Energy


                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Box sx={{ backgroundColor: '#09090c', }}>
                                        <Grid container >
                                            <Grid item lg={12} md={12} sm={12} xs={12}>
                                                <EnergyLineChart />
                                            </Grid>

                                        </Grid>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>

                        <Grid item lg={6} sm={12} md={12} xs={12} >
                            <Card
                                sx={{
                                    borderRadius: '5px',
                                    borderRadius: '5px',
                                    border: '2px solid #ccc',
                                    borderColor: '#00ffff',
                                }}
                            >
                                <CardActionArea
                                // sx={{ boxShadow: 5, }}
                                >
                                    <Grid
                                        container
                                        direction="row"
                                        backgroundColor='#E8E2E2'
                                        padding={1}
                                    >
                                        <Grid
                                            item

                                        >
                                            <Typography
                                                sx={{
                                                    color: '#434242',


                                                    // overflow: 'hidden',
                                                    // textOverflow: 'ellipsis',
                                                    // whiteSpace: 'nowrap',
                                                }}
                                            >
                                                Vibration

                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Box sx={{ backgroundColor: '#09090c', }}>
                                        <Grid container >
                                            <Grid item xs={12}>
                                                <EnergyLineChart />
                                            </Grid>

                                        </Grid>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>


                    </Grid>
                </Grid>
                <Grid item lg={4} sm={10} xs={10}>
                    <Grid container spacing={2}>
                        <Grid item lg={12} sm={12} xs={12} md={12} >
                            <Card
                                sx={{
                                    borderRadius: '5px',
                                    borderRadius: '5px',
                                    border: '2px solid #ccc',
                                    borderColor: '#00ffff',
                                }}
                            >
                                <CardActionArea
                                // sx={{ boxShadow: 5, }}
                                >
                                    <Grid
                                        container
                                        direction={'row'}
                                        spacing={2}

                                        padding={1}
                                    >
                                        <Grid
                                            item

                                        >
                                            <Typography
                                                sx={{
                                                    color: '#434242',


                                                    // overflow: 'hidden',
                                                    // textOverflow: 'ellipsis',
                                                    // whiteSpace: 'nowrap',
                                                }}
                                            >
                                                Machine Availability
                                            </Typography>

                                        </Grid>
                                        <Grid item>
                                            <Typography
                                                sx={{



                                                    // overflow: 'hidden',
                                                    // textOverflow: 'ellipsis',
                                                    // whiteSpace: 'nowrap',
                                                }}
                                            >
                                                15-09-2023
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Box style={{}} >

                                        <CalendarComponent />

                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>
                        <Grid item lg={12} sm={12} xs={12} md={8}>
                            <Card
                                sx={{
                                    borderRadius: '5px',
                                    borderRadius: '5px',
                                    border: '2px solid #ccc',
                                    borderColor: '#00ffff',
                                }}
                            >
                                <CardActionArea
                                // sx={{ boxShadow: 5, }}
                                >
                                    <Grid
                                        container
                                        direction="row"
                                        spacing={15}
                                        backgroundColor='#E8E2E2'
                                        padding={1}

                                    >
                                        <Grid
                                            item

                                        >
                                            <Typography
                                                sx={{
                                                    color: '#434242',


                                                    // overflow: 'hidden',
                                                    // textOverflow: 'ellipsis',
                                                    // whiteSpace: 'nowrap',
                                                }}
                                            >
                                                Production
                                            </Typography>
                                        </Grid>
                                        <Grid
                                            item

                                        >
                                            <Typography
                                                sx={{
                                                    color: '#434242',


                                                    // overflow: 'hidden',
                                                    // textOverflow: 'ellipsis',
                                                    // whiteSpace: 'nowrap',
                                                }}
                                            >
                                                Shift 2: 10 Sheet

                                            </Typography>
                                        </Grid>

                                    </Grid>

                                    <Grid container sx={{ backgroundColor: '#09090c', }}>
                                        <Grid item xs={12}>

                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                                                <div style={{ fontSize: 10, fontWeight: 'bold' }}>Energy/Day</div>
                                                <ComposedChart width={480} height={188} data={data} margin={{ bottom: -20, right: 50 }}>
                                                    <XAxis dataKey="name" tick={false} />
                                                    <YAxis tick={false} />
                                                    <Tooltip />

                                                    <Bar dataKey="pv" barSize={10} fill="#413ea0" />
                                                    <Line type="monotone" dataKey="uv" stroke="#ff7300" />
                                                </ComposedChart>

                                                {/* Label below the chart */}
                                                <div style={{ fontSize: 10, fontWeight: 'bold', color: '#ffff' }}>Day</div>
                                            </div>
                                        </Grid>

                                    </Grid>

                                </CardActionArea>
                            </Card>
                        </Grid>
                    </Grid>

                </Grid>
            </Grid>

        </Box>


    )
}
