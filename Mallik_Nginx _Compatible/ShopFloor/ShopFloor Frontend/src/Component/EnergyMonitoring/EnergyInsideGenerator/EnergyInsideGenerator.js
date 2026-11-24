import React, { useEffect, useState } from 'react'
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Typography } from '@mui/material'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Chart } from "react-google-charts";
import GaugeChart from 'react-gauge-chart';
import './EnergyInsideGenerator.css';
import { GetEnergyGeneration, GetGeneratorCurrentData, GetGeneratorRunHours, GetGeneratorTopUp } from '../../../Services/NodeJsApiServices';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GetVibrationAnalysis } from '../../../Services/PythonPrediction';
import Plot from 'react-plotly.js'
import FullscreenIcon from '@mui/icons-material/Fullscreen';

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
    const [generatorCurrentData, setGeneratorCurrentData] = useState({
        totalKWhDay: '',
        costperDay: '',
        totalKWhMonth: '',
        costperMonth: ''
    });
    const [generatorRunHours, setGeneratorRunHours] = useState([]);
    const [generatorTopUpData, setGeneratorTopUpData] = useState([]);
    const [energyGenerationData, setEnergyGenerationData] = useState([])
    const [energyConsumptionMax, setEnergyConsumptionMax] = useState(0);
    const location = useLocation();
    const generatorFuel = new URLSearchParams(location.search).get('generatorFuel');
    console.log("generatorFuelgeneratorFuelgeneratorFuelgeneratorFuel", generatorFuel)
    const [actualValues, setActualValues] = useState([]);
    const [predictionData, setPredictionData] = useState([]);
    const [open, setOpen] = React.useState(false);

    useEffect(() => {
        GetGeneratorRunHours(handleGeneratorRunHoursSuccess, handleGeneratorRunHoursExcetion)
        GetGeneratorCurrentData(handleGeneratorCurrentDataSuccess, handleGeneratorCurrentDataExcetion)
        GetGeneratorTopUp(handleGeneratorTopUpSuccess, handleGeneratorTopUpExcetion)
        GetEnergyGeneration(handleEnergySuccess, handleEnergyExcetion)
        GetVibrationAnalysis(handlePowerSpikesSuccess, handlePowerSpikesException);
    }, [])

    //RUN HOURS
    const handleGeneratorRunHoursSuccess = (dataObject) => {
        setGeneratorRunHours(dataObject?.data || []);
    }
    const handleGeneratorRunHoursExcetion = () => { }

    // Energy Generation
    const handleEnergySuccess = (dataObject) => {
        setEnergyGenerationData(dataObject?.data || [])
        setEnergyConsumptionMax(dataObject.maxValue || 0)
    }
    const handleEnergyExcetion = () => { }

    // TOPUP
    const handleGeneratorTopUpSuccess = (dataObject) => {
        setGeneratorTopUpData(dataObject?.data || [])
    }
    const handleGeneratorTopUpExcetion = () => { }

    // ALL SUCCESS HANDLERS
    const handleGeneratorCurrentDataSuccess = (dataObject) => {
        setGeneratorCurrentData({
            totalKWhDay: dataObject?.data?.totalKWhDay,
            costperDay: dataObject?.data?.costperDay,
            totalKWhMonth: dataObject?.data?.totalKWhMonth,
            costperMonth: dataObject?.data?.costperMonth
        })
    }
    const handleGeneratorCurrentDataExcetion = () => { }

    const calculatePercent = (percentage, max) => {
        return percentage / max;
    };

    // POWER SPIKES
    const handlePowerSpikesSuccess = (dataObject) => {
        setPredictionData(dataObject.predictions || [])
        setActualValues(dataObject.actual_values || [])
    }
    const handlePowerSpikesException = () => { }

    const fuelTopUps = [
        { date: '2024-07-01', fuelTopUp: '15.00 liters' },
        { date: '2024-07-10', fuelTopUp: '20.00 liters' },
        { date: '2024-07-15', fuelTopUp: '10.00 liters' },
        { date: '2024-07-20', fuelTopUp: '25.00 liters' },
        { date: '2024-07-25', fuelTopUp: '18.00 liters' }
    ];

    const handleClose = () => {
        setOpen(false);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

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
                                {generatorCurrentData.totalKWhDay}
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
                                {generatorCurrentData.costperDay}
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
                                {generatorCurrentData.totalKWhMonth}
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
                                {generatorCurrentData.costperMonth}
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
                            <BarChart width={730} height={269} data={generatorRunHours}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="Hour" stroke="white" />
                                <YAxis stroke="white" />
                                <Tooltip contentStyle={{ backgroundColor: '#5d5d5d' }} labelStyle={{ color: '#ffffff', fontWeight: 'bold' }} />
                                <Legend />
                                <Bar dataKey="Hours" fill="#A294F9" />
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
                    <CardContent style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', padding: 0, alignItems: 'center', height: '290px', flexWrap: 'wrap' }}>
                        {/* <GaugeChart id="gauge-chart3"
                            nrOfLevels={30}
                            colors={["#E4003A", "#9CDBA6"]}
                            arcWidth={0.3}
                            percent={0.90}
                        /> */}
                        <div style={{ height: '120px' }}>
                            <GaugeChart id="gauge-chart3"
                                nrOfLevels={479}
                                animate={false}
                                arcsLength={[0.3, 0.5, 0.3]}
                                colors={["#FF5F6D", "#FFC371", "green"]}
                                arcWidth={0.3}
                                percent={generatorFuel}
                                textColor={'white'}
                                needleColor="#ddf900"
                                needleBaseColor='#ddf900'

                            />
                        </div>
                        <div >
                            <div class="table-container">
                                <table id="GuageTable">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Fuel Top Up</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generatorTopUpData.map((fuel, key) => (
                                            <tr key={key}>
                                                <td>{fuel.date}</td>
                                                <td>{fuel.fuel_topup}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                            <BarChart width={730} height={250} data={energyGenerationData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" stroke="white" />
                                <YAxis stroke="white" domain={[0, energyConsumptionMax]} />
                                <Tooltip contentStyle={{ backgroundColor: '#5d5d5d' }} labelStyle={{ color: '#ffffff', fontWeight: 'bold' }} />
                                <Legend />
                                <Bar dataKey="totalEnergyConsumption" fill="#A1DD70" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item md={6} xs={12} sm={12} lg={6}>
                <Paper sx={{ backgroundColor: '#f7f7f7', color: '#212529', padding: 1, borderRadius: 0, fontWeight: 'bold', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    Vibratin Analysis
                    <FullscreenIcon onClick={handleClickOpen} />
                </Paper>
                <Card sx={{ borderRadius: 0, backgroundColor: '#5d5d5d', padding: '3px' }}>
                    <CardContent style={{ width: '100%', overflowX: 'scroll', scrollbarWidth: '1px', msOverflowStyle: 'none' }}>
                        <Plot
                            style={{ marginTop: '-5px', marginBottom: '10px' }}
                            layout={{ width: 870, height: 229 }}
                            data={[
                                {
                                    x: actualValues.map((entry) => new Date(entry.ds)),
                                    y: actualValues.map((entry) => entry.y),
                                    type: "scatter",
                                    mode: "markers",
                                    marker: { color: "Black", size: 8 }, // Green color for actual values
                                    name: "Actual Values",
                                    hoverinfo: "y+text",
                                    text: actualValues.map(
                                        (entry) =>
                                            `Actual Value: ${entry.y.toFixed(
                                                2
                                            )}<br>Date: ${new Date(
                                                entry.ds
                                            ).toLocaleString()}`
                                    ),
                                },
                                {
                                    x: predictionData.map((entry) => new Date(entry.ds)),
                                    y: predictionData.map((entry) => entry.yhat),
                                    type: "scatter",
                                    mode: "lines",
                                    line: {
                                        width: 3, // Set the desired width of the line
                                        color: "#00FF00", // Blue color for predicted values
                                    },
                                    hoverinfo: "y+text",
                                    text: predictionData.map(
                                        (entry) =>
                                            ` ${entry.yhat.toFixed(
                                                2
                                            )}<br>Date: ${new Date(
                                                entry.ds
                                            ).toLocaleString()}`
                                    ),
                                },
                                {
                                    x: predictionData.map((entry) => new Date(entry.ds)),
                                    y: predictionData.map((entry) => entry.yhat_upper),
                                    type: "scatter",
                                    mode: "none",
                                    fill: "tonexty",
                                    fillcolor: "rgba(255, 0, 0, 0.2)",
                                    name: "Upper Bound",
                                    hoverinfo: "y+name+text",
                                    text: predictionData.map(
                                        (entry) =>
                                            `Upper Bound: ${entry.yhat_upper.toFixed(
                                                2
                                            )}<br>Date: ${new Date(
                                                entry.ds
                                            ).toLocaleString()}`
                                    ),
                                },
                                {
                                    x: predictionData.map((entry) => new Date(entry.ds)),
                                    y: predictionData.map((entry) => entry.yhat_lower),
                                    type: "scatter",
                                    mode: "none",
                                    fill: "tonexty",
                                    fillcolor: "rgba(255, 0, 0, 0.2)",
                                    name: "Lower Bound",
                                    hoverinfo: "y+name+text",
                                    text: predictionData.map(
                                        (entry) =>
                                            `Lower Bound: ${entry.yhat_lower.toFixed(
                                                2
                                            )}<br>Date: ${new Date(
                                                entry.ds
                                            ).toLocaleString()}`
                                    ),
                                },
                            ]}
                        // layout={{
                        //     title: ` Prediction`,
                        //     xaxis: {
                        //         title: "Date/Time",
                        //         type: "date",
                        //     },
                        //     yaxis: { title: `${yaxis}` },
                        //     width: window.innerWidth * 0.9,
                        //     height: window.innerHeight * 0.6,
                        //     annotations: changepoints.map((entry) => ({
                        //         x: new Date(entry),
                        //         y: 0,
                        //         xref: "x",
                        //         yref: "y",
                        //         showarrow: true,
                        //         ax: 0,
                        //         ay: -300, // Adjust this value to increase or decrease the height
                        //         // font: { color: "red", size: 12 },
                        //         arrowcolor: "red",
                        //     })),
                        // }}
                        />
                    </CardContent>
                </Card>
            </Grid>
            {/* <---------------------------PREDICTION DAILOG-------------------------------> */}
            <Dialog
                sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
                maxWidth="xl"
                open={open}
            >
                <DialogTitle id="alert-dialog-title">
                    Power Spiks - This Week
                </DialogTitle>
                <DialogContent>
                    <Plot
                        style={{ marginTop: '-5px', marginBottom: '10px' }}
                        layout={{ width: 1470, height: 700 }}
                        data={[
                            {
                                x: actualValues.map((entry) => new Date(entry.ds)),
                                y: actualValues.map((entry) => entry.y),
                                type: "scatter",
                                mode: "markers",
                                marker: { color: "Black", size: 8 }, // Green color for actual values
                                name: "Actual Values",
                                hoverinfo: "y+text",
                                text: actualValues.map(
                                    (entry) =>
                                        `Actual Value: ${entry.y.toFixed(
                                            2
                                        )}<br>Date: ${new Date(
                                            entry.ds
                                        ).toLocaleString()}`
                                ),
                            },
                            {
                                x: predictionData.map((entry) => new Date(entry.ds)),
                                y: predictionData.map((entry) => entry.yhat),
                                type: "scatter",
                                mode: "lines",
                                line: {
                                    width: 3, // Set the desired width of the line
                                    color: "#00FF00", // Blue color for predicted values
                                },
                                hoverinfo: "y+text",
                                text: predictionData.map(
                                    (entry) =>
                                        ` ${entry.yhat.toFixed(
                                            2
                                        )}<br>Date: ${new Date(
                                            entry.ds
                                        ).toLocaleString()}`
                                ),
                            },
                            {
                                x: predictionData.map((entry) => new Date(entry.ds)),
                                y: predictionData.map((entry) => entry.yhat_upper),
                                type: "scatter",
                                mode: "none",
                                fill: "tonexty",
                                fillcolor: "rgba(255, 0, 0, 0.2)",
                                name: "Upper Bound",
                                hoverinfo: "y+name+text",
                                text: predictionData.map(
                                    (entry) =>
                                        `Upper Bound: ${entry.yhat_upper.toFixed(
                                            2
                                        )}<br>Date: ${new Date(
                                            entry.ds
                                        ).toLocaleString()}`
                                ),
                            },
                            {
                                x: predictionData.map((entry) => new Date(entry.ds)),
                                y: predictionData.map((entry) => entry.yhat_lower),
                                type: "scatter",
                                mode: "none",
                                fill: "tonexty",
                                fillcolor: "rgba(255, 0, 0, 0.2)",
                                name: "Lower Bound",
                                hoverinfo: "y+name+text",
                                text: predictionData.map(
                                    (entry) =>
                                        `Lower Bound: ${entry.yhat_lower.toFixed(
                                            2
                                        )}<br>Date: ${new Date(
                                            entry.ds
                                        ).toLocaleString()}`
                                ),
                            },
                        ]}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
            {/* <---------------------------PREDICTION DAILOG-------------------------------> */}
        </Grid>
    )
}

export default EnergyInsideGenerator;