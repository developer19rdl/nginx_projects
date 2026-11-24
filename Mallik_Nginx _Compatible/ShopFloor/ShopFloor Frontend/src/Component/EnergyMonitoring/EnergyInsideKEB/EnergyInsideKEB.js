import React, { useEffect, useState } from 'react'
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Paper, Typography } from '@mui/material'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Chart } from "react-google-charts";
import { GetEnergyConsumption, GetEnergyConsumptionMonth, GetHourlyPowerByDevice, GetKEBCurrentData, GetTopFiveDevices } from '../../../Services/NodeJsApiServices';
import { GetPowerSpikes } from '../../../Services/PythonPrediction';
import Plot from 'react-plotly.js';
import axios from 'axios';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const data2 = [
    { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

export const data = [
    ["Task", "Hours per Day"],
    ["Water Heater 1D", 11],
    ["Eletric furnace 1D", 2],
    ["Ac #1", 2],
    ["Living Room 1D", 2],
    ["Office 1D", 7],
];

export const options = {
    is3D: true,
    colors: ["#3FA2F6", "#FF4191", "#F4CE14", "#AF47D2", "#40A578"],
    legend: "none",
    pieSliceText: "label",
    width: '100%',
    height: '100%',
    backgroundColor: '#2d2d3d',
    pieHole: 0,
    chartArea: { left: 0, top: 0, width: '100%', height: '100%' },
    slices: { 0: { offset: 0 }, 1: { offset: 0 }, 2: { offset: 0 }, 3: { offset: 0 }, 4: { offset: 0 } }
};

const data1 = [
    { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

const CARD_BG = '#2d2d3d';
const CARD_SHADOW = '0 4px 16px rgba(0,0,0,0.4)';

const StatCard = ({ label, value, unit, accentColor, Icon }) => (
    <Card sx={{
        borderRadius: 2,
        backgroundColor: CARD_BG,
        borderLeft: `4px solid ${accentColor}`,
        padding: '16px 20px',
        height: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: CARD_SHADOW,
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#aaa', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                {label}
            </Typography>
            <Icon sx={{ color: accentColor, fontSize: 20, opacity: 0.75 }} />
        </div>
        <Typography sx={{ color: accentColor, fontSize: 30, fontWeight: 'bold', lineHeight: 1 }}>
            {value}
            {unit && <span style={{ fontSize: 15, marginLeft: 6, opacity: 0.85 }}>{unit}</span>}
        </Typography>
    </Card>
);

const ChartCard = ({ title, children, minHeight }) => (
    <Card sx={{ borderRadius: 2, backgroundColor: CARD_BG, boxShadow: CARD_SHADOW, minHeight: minHeight || 'auto' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{title}</Typography>
        </div>
        {children}
    </Card>
);

const chartAxisProps = {
    stroke: '#666',
    tick: { fill: '#999', fontSize: 11 },
};

const chartTooltipStyle = {
    contentStyle: {
        backgroundColor: '#1a1a2e',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 6,
        fontSize: 12,
    },
    labelStyle: { color: '#fff', fontWeight: 'bold' },
    itemStyle: { color: '#00ffff' },
};

const EnergyInsideKEB = () => {
    const [actualValues, setActualValues] = useState([]);
    const [predictionData, setPredictionData] = useState([]);
    const [energyConsumption, setEnergyConsumption] = useState([]);
    const [powerSpikesData, setPowerSpikesData] = useState([]);
    const [energyConsumptionMonth, setEnergyConsumptionMonth] = useState([]);
    const [energyConsumptionMax, setEnergyConsumptionMax] = useState(0);
    const [energyConsumptionMaxMonth, setEnergyConsumptionMaxMonth] = useState(0);
    const [topFiveDevices, setTopFiveDevices] = useState([]);
    const [hourlyPowerByDevice, setHourlyPowerByDevice] = useState([]);
    const [allKeyName, setAllKeyNames] = useState([]);
    const [kebCurrentData, setKebCurrentData] = useState({
        totalKWhDay: '',
        costperDay: '',
        totalKWhMonth: '',
        costperMonth: '',
    });
    const [open, setOpen] = React.useState(false);
    const [pinnedTooltip, setPinnedTooltip] = useState(null);

    useEffect(() => {
        GetKEBCurrentData(handleKebCurrentDataSuccess, handleKebCurrentDataException);
        GetHourlyPowerByDevice(handleHourlyPowerByDeviceSuccess, handleHourlyPowerByDeviceException);
        GetTopFiveDevices(handleTopFiveDevicesSuccess, handleTopFiveDevicesException);
        GetEnergyConsumption(handleEnergyConsumptionSuccess, handleEnergyConsumptionException);
        GetEnergyConsumptionMonth(handleEnergyConsumptionMonthSuccess, handleEnergyConsumptionMonthException);
        GetPowerSpikes(handlePowerSpikesSuccess, handlePowerSpikesException);
    }, [])

    const handleKebCurrentDataSuccess = (dataObject) => {
        setKebCurrentData({
            totalKWhDay: dataObject?.data?.totalKWhDay || '',
            costperDay: dataObject?.data?.costperDay || '',
            totalKWhMonth: dataObject?.data?.totalKWhMonth || '',
            costperMonth: dataObject?.data?.costperMonth || ''
        })
    }
    const handleKebCurrentDataException = () => { }

    const handleEnergyConsumptionMonthSuccess = (dataObject) => {
        setEnergyConsumptionMonth(dataObject.data || [])
        setEnergyConsumptionMaxMonth(dataObject.maxValue || 0)
    }
    const handleEnergyConsumptionMonthException = () => { }

    const handleHourlyPowerByDeviceSuccess = (dataObject) => {
        setHourlyPowerByDevice(dataObject?.data || []);
        const copyArray = dataObject?.data;
        const keyName = [];
        copyArray.forEach((setData) => {
            let keys = Object.keys(setData);
            let filteredKeys = keys.filter(key => !key.toLowerCase().includes('time'));
            keyName.push(filteredKeys);
        });
        const flattened = keyName.flat();
        const uniqueArray = [...new Set(flattened)];
        console.log(uniqueArray);
        setAllKeyNames(uniqueArray);
    }
    const handleHourlyPowerByDeviceException = () => { }

    const handleEnergyConsumptionSuccess = (dataObject) => {
        setEnergyConsumption(dataObject.data || [])
        setEnergyConsumptionMax(dataObject.maxValue || 0)
    }
    const handleEnergyConsumptionException = () => { }

    const handleTopFiveDevicesSuccess = (dataObject) => {
        const colors = ["#3FA2F6", "#FF4191", "#F4CE14", "#AF47D2", "#40A578"];
        const transformedData = dataObject?.data.map((item, index) => [item.machineName, parseFloat(item.totalKWh), colors[index]]);
        const data = [["Machine Name", "Total KWH", "Color"], ...transformedData];
        setTopFiveDevices(data || []);
        console.log("datadatadatadatadatadata", data)
    }
    const handleTopFiveDevicesException = () => { }

    const handlePowerSpikesSuccess = (dataObject) => {
        setPredictionData(dataObject.predictions || [])
        setActualValues(dataObject.actual_values || [])
    }
    console.log(predictionData)
    const handlePowerSpikesException = () => { }

    function getRandomHexColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const sortPayload = (payload) =>
        [...payload].sort((a, b) => {
            const av = parseFloat(a.value) || 0;
            const bv = parseFloat(b.value) || 0;
            if (bv !== av) return bv - av;
            return a.name.localeCompare(b.name);
        });

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;
        return (
            <div style={{
                backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px',
                padding: '8px 12px', fontSize: '11px', minWidth: '160px', pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}>
                <p style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '12px', color: '#ffffff' }}>{label}</p>
                {sortPayload(payload).map((entry, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '1px 0', color: entry.fill || entry.color }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{entry.name}</span>
                        <span style={{ fontWeight: 'bold', flexShrink: 0 }}>{parseFloat(entry.value).toFixed(2)}</span>
                    </div>
                ))}
                <p style={{ fontSize: '10px', color: '#555', marginTop: '4px', marginBottom: 0 }}>Click bar to pin & scroll</p>
            </div>
        );
    };

    const handleChartClick = (data) => {
        if (data && data.activePayload && data.activePayload.length) {
            if (pinnedTooltip && pinnedTooltip.label === data.activeLabel) {
                setPinnedTooltip(null);
            } else {
                setPinnedTooltip({ payload: data.activePayload, label: data.activeLabel });
            }
        }
    };

    return (
        <Grid container spacing={2} padding={'15px'}>

            {/* ── STAT CARDS ── */}
            <Grid item md={6} xs={12} sm={12} lg={3}>
                <StatCard
                    label="Current Day Power Total"
                    value={`${kebCurrentData?.totalKWhDay}`}
                    unit="kWh"
                    accentColor="#00ffff"
                    Icon={ElectricBoltIcon}
                />
            </Grid>
            <Grid item md={6} xs={12} sm={12} lg={3}>
                <StatCard
                    label="Current Day Power Cost"
                    value={`Rs. ${kebCurrentData?.costperDay}`}
                    accentColor="#00e5a0"
                    Icon={CurrencyRupeeIcon}
                />
            </Grid>
            <Grid item md={6} xs={12} sm={12} lg={3}>
                <StatCard
                    label="Current Month Total Power"
                    value={`${kebCurrentData?.totalKWhMonth}`}
                    unit="kWh"
                    accentColor="#ff9500"
                    Icon={CalendarMonthIcon}
                />
            </Grid>
            <Grid item md={6} xs={12} sm={12} lg={3}>
                <StatCard
                    label="Current Month Bill"
                    value={`Rs. ${kebCurrentData?.costperMonth}`}
                    accentColor="#a78bfa"
                    Icon={ReceiptLongIcon}
                />
            </Grid>

            {/* ── HOURLY POWER BY MACHINE ── */}
            <Grid item md={6} xs={12} sm={12} lg={6}>
                <ChartCard title="Hourly Power by Machine/Asset">
                    <CardContent>
                        <ResponsiveContainer width={'100%'} height={270}>
                            <BarChart width={730} height={270} data={hourlyPowerByDevice} onClick={handleChartClick} style={{ cursor: 'pointer' }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                                <XAxis dataKey="time" {...chartAxisProps} />
                                <YAxis {...chartAxisProps} />
                                <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 9999 }} active={pinnedTooltip === null} />
                                {allKeyName && allKeyName.map((keyName, index) => (
                                    <Bar key={index} dataKey={keyName} stackId="a" fill={getRandomHexColor()} radius={index === allKeyName.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </ChartCard>
                {pinnedTooltip && (
                    <div style={{
                        backgroundColor: CARD_BG, border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
                        marginTop: '8px', padding: '10px 14px', fontSize: '11px', boxShadow: CARD_SHADOW,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#fff' }}>
                                📌 {pinnedTooltip.label} — pinned
                            </span>
                            <span onClick={() => setPinnedTooltip(null)} style={{ cursor: 'pointer', color: '#888', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✕</span>
                        </div>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {sortPayload(pinnedTooltip.payload).map((entry, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '2px 0', color: entry.fill || entry.color }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{entry.name}</span>
                                    <span style={{ fontWeight: 'bold', flexShrink: 0 }}>{parseFloat(entry.value).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <p style={{ fontSize: '10px', color: '#555', marginTop: '6px', marginBottom: 0 }}>Click same bar to unpin</p>
                    </div>
                )}
            </Grid>

            {/* ── TOP 5 MACHINES PIE ── */}
            <Grid item md={6} xs={12} sm={12} lg={6}>
                <ChartCard title="Top 5 Machine/Asset Last Week">
                    <CardContent style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '0 0 16px 0', alignItems: 'center' }}>
                        <Chart
                            chartType="PieChart"
                            data={topFiveDevices}
                            options={options}
                            width={"58%"}
                            height={"290px"}
                        />
                        <div style={{ width: '42%', paddingRight: '16px' }}>
                            <Typography style={{ textAlign: 'end', fontWeight: 600, color: '#aaa', fontSize: 12, marginBottom: 10 }}>Total</Typography>
                            {topFiveDevices.slice(1).map((machine, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: machine[2], flexShrink: 0 }} />
                                        <Typography fontSize={12} style={{ color: '#ddd' }}>{machine[0]}</Typography>
                                    </div>
                                    <Typography fontSize={12} fontWeight='bold' style={{ color: '#fff', flexShrink: 0 }}>{machine[1]}</Typography>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </ChartCard>
            </Grid>

            {/* ── ENERGY CONSUMPTION ── */}
            <Grid item md={6} xs={12} sm={12} lg={6}>
                <ChartCard title="Energy Consumption">
                    <CardContent>
                        <ResponsiveContainer width={'100%'} height={250}>
                            <BarChart width={730} height={250} data={energyConsumption}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                                <XAxis dataKey="date" {...chartAxisProps} />
                                <YAxis {...chartAxisProps} domain={[0, energyConsumptionMax]} />
                                <Tooltip {...chartTooltipStyle} />
                                <Legend wrapperStyle={{ color: '#aaa', fontSize: 12 }} />
                                <Bar dataKey="EnergyConsumption" fill="#00ffff" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </ChartCard>
            </Grid>

            {/* ── MONTH WISE CONSUMPTION ── */}
            <Grid item md={6} xs={12} sm={12} lg={6}>
                <ChartCard title="Month Wise Consumption">
                    <CardContent>
                        <ResponsiveContainer width={'100%'} height={250}>
                            <BarChart width={730} height={250} data={energyConsumptionMonth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                                <XAxis dataKey="month" {...chartAxisProps} />
                                <YAxis {...chartAxisProps} domain={[0, energyConsumptionMaxMonth]} />
                                <Tooltip {...chartTooltipStyle} />
                                <Legend wrapperStyle={{ color: '#aaa', fontSize: 12 }} />
                                <Bar dataKey="EnergyConsumption" fill="#00ffff" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </ChartCard>
            </Grid>

        </Grid>
    )
}

export default EnergyInsideKEB
