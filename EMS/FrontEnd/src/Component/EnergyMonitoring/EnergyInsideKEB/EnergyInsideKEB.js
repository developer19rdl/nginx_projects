import React, { useEffect, useState } from 'react'
import { Card, CardContent, Grid, Typography } from '@mui/material'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Chart } from "react-google-charts";
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {
    GetKEBCurrentData,
    GetTopFiveDevices,
    GetHourlyPowerByDevice,
    GetEnergyConsumption,
    GetEnergyConsumptionMonth,
} from '../../../Services/NodeJsApiServices';

const CARD_BG    = '#2d2d3d';
const CARD_SHADOW = '0 4px 16px rgba(0,0,0,0.4)';

export const pieOptions = {
    is3D: true,
    colors: ['#3FA2F6', '#FF4191', '#F4CE14', '#AF47D2', '#40A578'],
    legend: 'none',
    pieSliceText: 'label',
    width: '100%',
    height: '100%',
    backgroundColor: CARD_BG,
    pieHole: 0,
    chartArea: { left: 0, top: 0, width: '100%', height: '100%' },
    slices: { 0: { offset: 0 }, 1: { offset: 0 }, 2: { offset: 0 }, 3: { offset: 0 }, 4: { offset: 0 } }
};

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

const StatCard = ({ label, value, unit, accentColor, Icon }) => (
    <Card sx={{
        borderRadius: 2, backgroundColor: CARD_BG,
        borderLeft: `4px solid ${accentColor}`,
        padding: '16px 20px', height: '120px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
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

const ChartCard = ({ title, children }) => (
    <Card sx={{ borderRadius: 2, backgroundColor: CARD_BG, boxShadow: CARD_SHADOW }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{title}</Typography>
        </div>
        {children}
    </Card>
);

function getRandomHexColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const EnergyInsideKEB = ({ meterId = null }) => {
    const [kebCurrentData, setKebCurrentData] = useState({ totalKWhDay: '—', costperDay: '—', totalKWhMonth: '—', costperMonth: '—' });
    const [topFiveDevices, setTopFiveDevices] = useState([]);
    const [hourlyPowerByDevice, setHourlyPowerByDevice] = useState([]);
    const [allKeyName, setAllKeyNames] = useState([]);
    const [energyConsumption, setEnergyConsumption] = useState([]);
    const [energyConsumptionMax, setEnergyConsumptionMax] = useState(0);
    const [energyConsumptionMonth, setEnergyConsumptionMonth] = useState([]);
    const [energyConsumptionMaxMonth, setEnergyConsumptionMaxMonth] = useState(0);
    const [pinnedTooltip, setPinnedTooltip] = useState(null);

    useEffect(() => {
        GetKEBCurrentData(handleKebCurrentDataSuccess, () => {}, meterId);
        GetTopFiveDevices(handleTopFiveDevicesSuccess, () => {});
        GetHourlyPowerByDevice(handleHourlyPowerByDeviceSuccess, () => {});
        GetEnergyConsumption(handleEnergyConsumptionSuccess, () => {}, meterId);
        GetEnergyConsumptionMonth(handleEnergyConsumptionMonthSuccess, () => {}, meterId);
    }, [meterId]);

    const handleKebCurrentDataSuccess = (dataObject) => {
        setKebCurrentData({
            totalKWhDay:   dataObject?.data?.totalKWhDay   || '—',
            costperDay:    dataObject?.data?.costperDay    || '—',
            totalKWhMonth: dataObject?.data?.totalKWhMonth || '—',
            costperMonth:  dataObject?.data?.costperMonth  || '—',
        });
    };

    const handleTopFiveDevicesSuccess = (dataObject) => {
        const colors = ['#3FA2F6', '#FF4191', '#F4CE14', '#AF47D2', '#40A578'];
        const transformed = (dataObject?.data || []).map((item, i) => [item.machineName, parseFloat(item.totalKWh), colors[i]]);
        setTopFiveDevices([['Machine Name', 'Total KWH', 'Color'], ...transformed]);
    };

    const handleHourlyPowerByDeviceSuccess = (dataObject) => {
        const data = dataObject?.data || [];
        setHourlyPowerByDevice(data);
        const keySet = new Set();
        data.forEach(row => Object.keys(row).filter(k => k !== 'time').forEach(k => keySet.add(k)));
        setAllKeyNames([...keySet]);
    };

    const handleEnergyConsumptionSuccess = (dataObject) => {
        const data = dataObject?.data || [];
        const max = Math.max(...data.map(d => parseFloat(d.energyConsum || 0)), 0);
        setEnergyConsumption(data);
        setEnergyConsumptionMax(parseFloat((max * 1.1).toFixed(2)));
    };

    const handleEnergyConsumptionMonthSuccess = (dataObject) => {
        setEnergyConsumptionMonth(dataObject?.data || []);
        setEnergyConsumptionMaxMonth(dataObject?.maxValue || 0);
    };

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
                backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 6, padding: '8px 12px', fontSize: 11, minWidth: 160,
                pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}>
                <p style={{ fontWeight: 'bold', marginBottom: 4, fontSize: 12, color: '#fff' }}>{label}</p>
                {sortPayload(payload).map((entry, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '1px 0', color: entry.fill || entry.color }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{entry.name}</span>
                        <span style={{ fontWeight: 'bold', flexShrink: 0 }}>{parseFloat(entry.value).toFixed(2)}</span>
                    </div>
                ))}
                <p style={{ fontSize: 10, color: '#555', marginTop: 4, marginBottom: 0 }}>Click bar to pin & scroll</p>
            </div>
        );
    };

    const handleChartClick = (data) => {
        if (data?.activePayload?.length) {
            if (pinnedTooltip?.label === data.activeLabel) {
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
                <StatCard label="Current Day Power Total" value={`${kebCurrentData.totalKWhDay}`} unit="kWh" accentColor="#00ffff" Icon={ElectricBoltIcon} />
            </Grid>
            <Grid item md={6} xs={12} sm={12} lg={3}>
                <StatCard label="Current Day Power Cost" value={`Rs. ${kebCurrentData.costperDay}`} accentColor="#00e5a0" Icon={CurrencyRupeeIcon} />
            </Grid>
            <Grid item md={6} xs={12} sm={12} lg={3}>
                <StatCard label="Current Month Total Power" value={`${kebCurrentData.totalKWhMonth}`} unit="kWh" accentColor="#ff9500" Icon={CalendarMonthIcon} />
            </Grid>
            <Grid item md={6} xs={12} sm={12} lg={3}>
                <StatCard label="Current Month Bill" value={`Rs. ${kebCurrentData.costperMonth}`} accentColor="#a78bfa" Icon={ReceiptLongIcon} />
            </Grid>

            {/* ── HOURLY POWER BY DEVICE ── */}
            <Grid item md={6} xs={12} sm={12} lg={6}>
                <ChartCard title="Hourly Power by Meter (Last 24 Hours)">
                    <CardContent>
                        <ResponsiveContainer width={'100%'} height={270}>
                            <BarChart data={hourlyPowerByDevice} onClick={handleChartClick} style={{ cursor: 'pointer' }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                                <XAxis dataKey="time" {...chartAxisProps} />
                                <YAxis {...chartAxisProps} />
                                <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 9999 }} active={pinnedTooltip === null} />
                                {allKeyName.map((keyName, index) => (
                                    <Bar key={index} dataKey={keyName} stackId="a" fill={getRandomHexColor()}
                                        radius={index === allKeyName.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </ChartCard>
                {pinnedTooltip && (
                    <div style={{
                        backgroundColor: CARD_BG, border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 8, marginTop: 8, padding: '10px 14px', fontSize: 11, boxShadow: CARD_SHADOW,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontWeight: 'bold', fontSize: 12, color: '#fff' }}>📌 {pinnedTooltip.label} — pinned</span>
                            <span onClick={() => setPinnedTooltip(null)} style={{ cursor: 'pointer', color: '#888', fontSize: 14, fontWeight: 'bold', lineHeight: 1 }}>✕</span>
                        </div>
                        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                            {sortPayload(pinnedTooltip.payload).map((entry, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '2px 0', color: entry.fill || entry.color }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{entry.name}</span>
                                    <span style={{ fontWeight: 'bold', flexShrink: 0 }}>{parseFloat(entry.value).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <p style={{ fontSize: 10, color: '#555', marginTop: 6, marginBottom: 0 }}>Click same bar to unpin</p>
                    </div>
                )}
            </Grid>

            {/* ── TOP 5 DEVICES PIE ── */}
            <Grid item md={6} xs={12} sm={12} lg={6}>
                <ChartCard title="Top 5 Meters Last Week">
                    <CardContent style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '0 0 16px 0', alignItems: 'center' }}>
                        <Chart
                            chartType="PieChart"
                            data={topFiveDevices.length > 1 ? topFiveDevices : [['Machine Name', 'Total KWH'], ['No Data', 1]]}
                            options={pieOptions}
                            width={"58%"}
                            height={"290px"}
                        />
                        <div style={{ width: '42%', paddingRight: 16 }}>
                            <Typography style={{ textAlign: 'end', fontWeight: 600, color: '#aaa', fontSize: 12, marginBottom: 10 }}>Total</Typography>
                            {topFiveDevices.slice(1).map((machine, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
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

            {/* ── ENERGY CONSUMPTION (30-day) ── */}
            <Grid item md={6} xs={12} sm={12} lg={6}>
                <ChartCard title="Energy Consumption">
                    <CardContent>
                        <ResponsiveContainer width={'100%'} height={250}>
                            <BarChart data={energyConsumption}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                                <XAxis dataKey="date" {...chartAxisProps} />
                                <YAxis {...chartAxisProps} domain={[0, energyConsumptionMax]} />
                                <Tooltip {...chartTooltipStyle} />
                                <Legend wrapperStyle={{ color: '#aaa', fontSize: 12 }} />
                                <Bar dataKey="energyConsum" fill="#00ffff" radius={[3, 3, 0, 0]} />
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
                            <BarChart data={energyConsumptionMonth}>
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
    );
};

export default EnergyInsideKEB;
