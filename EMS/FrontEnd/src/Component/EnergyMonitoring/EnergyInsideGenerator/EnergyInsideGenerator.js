import React from 'react'
import { Card, CardContent, Grid, Paper, Typography } from '@mui/material'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Chart } from "react-google-charts";
import GaugeChart from 'react-gauge-chart';
import './EnergyInsideGenerator.css';

const data2 = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];

// PIE CHART
export const data = [
    ["Task", "Hours per Day"],
    ["Water Heater 1D", 11],
    ["Eletric furnace 1D", 2],
    ["Ac #1", 2],
    ["Living Room 1D", 2],
    ["Office 1D", 7],
];

export const options = {
    // title: "Availability Status",
    is3D: true,
    colors: ["#ff0000", "#87CEEB", "#808080", "#fd9800", "#008000"],
    legend: "none",
    pieSliceText: "label",
    pieStartAngle: 100,
    width: '100%',
    backgroundColor: '#5d5d5d',
    // tooltip: {
    //     isHtml: true,
    //     textStyle: { color: '#0a0a0a' },
    //     className: 'custom-tooltip',
    // },

};

const data1 = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];

const EnergyInsideGenerator = () => {
    return (
        <Grid container spacing={2} padding={'15px'} >
            <Grid item md={6} xs={12} sm={12} lg={3}  >
                <Paper sx={{ backgroundColor: '#f7f7f7', color: '#212529', padding: 1, borderRadius: 0, fontWeight: 'bold' }}>
                    Today's Total Power Genetation
                </Paper>
                <Card sx={{
                    borderRadius: 0, backgroundColor: '#5d5d5d', padding: '2px', height: '120px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <CardContent>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography color="#00ffff" fontSize={35} fontWeight='bold'>
                                100.5kWh
                            </Typography>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item md={6} xs={12} sm={12} lg={3}>
                <Paper sx={{ backgroundColor: '#f7f7f7', color: '#212529', padding: 1, borderRadius: 0, fontWeight: 'bold' }}>
                    Today's Total Fuel Cost
                </Paper>
                <Card sx={{
                    borderRadius: 0, backgroundColor: '#5d5d5d', padding: '2px', height: '120px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <CardContent>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography color="#00ffff" fontSize={35} fontWeight='bold'>
                                Rs. 350.00
                            </Typography>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item md={6} xs={12} sm={12} lg={3}>
                <Paper sx={{ backgroundColor: '#f7f7f7', color: '#212529', padding: 1, borderRadius: 0, fontWeight: 'bold' }}>
                    Current Month Total Power Generation
                </Paper>
                <Card sx={{
                    borderRadius: 0, backgroundColor: '#5d5d5d', padding: '2px', height: '120px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <CardContent>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography color="#00ffff" fontSize={35} fontWeight='bold'>
                                1024 kWh
                            </Typography>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item md={6} xs={12} sm={12} lg={3}>
                <Paper sx={{ backgroundColor: '#f7f7f7', color: '#212529', padding: 1, borderRadius: 0, fontWeight: 'bold' }}>
                    Current Month Fuel Cost
                </Paper>
                <Card sx={{
                    borderRadius: 0, backgroundColor: '#5d5d5d', padding: '2px', height: '120px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <CardContent>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography color="#00ffff" fontSize={35} fontWeight='bold'>
                                Rs. 2480.00
                            </Typography>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            {/* ------------------------------------------------------------------------------------------------------------------------- */}

            <Grid item md={6} xs={12} sm={12} lg={6}>
                <Paper sx={{ backgroundColor: '#f7f7f7', color: '#212529', padding: 1, borderRadius: 0, fontWeight: 'bold' }}>
                    Generator Run Hours
                </Paper>
                <Card sx={{ borderRadius: 0, backgroundColor: '#5d5d5d', padding: '3px' }}>
                    <CardContent>
                        <ResponsiveContainer width={'100%'} height={269}>
                            <BarChart width={730} height={269} data={data1}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke="white" />
                                <YAxis stroke="white" />
                                <Tooltip contentStyle={{ backgroundColor: '#5d5d5d' }} labelStyle={{ color: '#ffffff', fontWeight: 'bold' }} />
                                <Legend />
                                <Bar dataKey="pv" fill="#FF7F3E" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item md={6} xs={12} sm={12} lg={6}>
                <Paper sx={{ backgroundColor: '#f7f7f7', zIndex: 0, color: '#212529', padding: 1, borderRadius: 0, fontWeight: 'bold' }}>
                    Fuel
                </Paper>
                <Card sx={{ borderRadius: 0, padding: '0px', backgroundColor: '#5d5d5d' }}>
                    <CardContent style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 0, alignItems: 'center', height: '290px' }}>
                        <GaugeChart id="gauge-chart3"
                            nrOfLevels={30}
                            colors={["#E4003A", "#9CDBA6"]}
                            arcWidth={0.3}
                            percent={0.90}
                        />
                        <div style={{ width: '100%', paddingRight: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                            {}
                            <table id="GuageTable">
                                <tr>
                                    <th>Date</th>
                                    <th>Fuel Top Up</th>
                                </tr>
                                <tr>
                                    <td>12/04/2024</td>
                                    <td>150 Ltr</td>
                                </tr>
                                <tr>
                                    <td>19/04/2024</td>
                                    <td>250 Ltr</td>
                                </tr>
                                <tr>
                                    <td>23/04/2024</td>
                                    <td>200 Ltr</td>
                                </tr>
                                <tr>
                                    <td>29/04/2024</td>
                                    <td>180 Ltr</td>
                                </tr>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item md={6} xs={12} sm={12} lg={6}>
                <Paper sx={{ backgroundColor: '#f7f7f7', color: '#212529', padding: 1, borderRadius: 0, fontWeight: 'bold' }}>
                    Energy Generation
                </Paper>
                <Card sx={{ borderRadius: 0, backgroundColor: '#5d5d5d', padding: '3px' }}>
                    <CardContent>
                        <ResponsiveContainer width={'100%'} height={250}>
                            <BarChart width={730} height={250} data={data1}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke="white" />
                                <YAxis stroke="white" />
                                <Tooltip contentStyle={{ backgroundColor: '#5d5d5d' }} labelStyle={{ color: '#ffffff', fontWeight: 'bold' }} />
                                <Legend />
                                <Bar dataKey="pv" fill="#A1DD70" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item md={6} xs={12} sm={12} lg={6}>
                <Paper sx={{ backgroundColor: '#f7f7f7', color: '#212529', padding: 1, borderRadius: 0, fontWeight: 'bold' }}>
                    Vibratin Analysis
                </Paper>
                <Card sx={{ borderRadius: 0, backgroundColor: '#5d5d5d', padding: '3px' }}>
                    <CardContent>
                        <ResponsiveContainer width={'100%'} height={250}>
                            <AreaChart width={730} height={250} data={data1}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke="white" />
                                <YAxis stroke="white" />
                                <Tooltip contentStyle={{ backgroundColor: '#5d5d5d' }} labelStyle={{ color: '#ffffff', fontWeight: 'bold' }} />
                                <Legend />
                                <Area type="pv" dataKey="uv" stroke="#40A578" fill="#C738BD" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Grid>

        </Grid>
    )
}

export default EnergyInsideGenerator;
