import React, { useEffect, useRef, useState } from 'react'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import tower from '../../../Assets/Images/tower.png'
import Generator from '../../../Assets/Images/generator2.png'
import { Gauge } from './gauge';
import GaugeChart from 'react-gauge-chart'
import { GeneratorListService, GetEnergyDataListService } from '../../../Services/NodeJsApiServices';
import { throttle } from 'lodash';
import { useNavigate } from 'react-router-dom';

const CARD_BG = '#2d2d3d';
const CARD_SHADOW = '0 4px 16px rgba(0,0,0,0.4)';

const StatusDot = ({ color }) => (
    <div style={{
        width: 8, height: 8, borderRadius: '50%',
        backgroundColor: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0
    }} />
);

const MetricCell = ({ label, value, unit, valueColor = '#00ffff' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography sx={{ color: '#777', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.3 }}>
            {label}
        </Typography>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <Typography sx={{ color: value != null ? valueColor : '#555', fontSize: 21, fontWeight: 'bold', lineHeight: 1.1 }}>
                {value != null ? value : '—'}
            </Typography>
            {value != null && (
                <Typography sx={{ color: '#aaa', fontSize: 10, fontWeight: 600 }}>{unit}</Typography>
            )}
        </div>
    </div>
);

const Divider = () => (
    <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', margin: '6px 0' }} />
);

export const TopEnergyCard = () => {
    const navigate = useNavigate()

    const [kebData, setKebData] = useState([]);
    const [generator, setGenerator] = useState([]);
    const prevGeneratorData = useRef([]);
    const [intervalFlag, setIntervalFlag] = useState(true);
    const [apiInProgress, setApiInProgress] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!apiInProgress && intervalFlag) {
                setApiInProgress(true);
                setIntervalFlag(false);
                try {
                    await Promise.all([
                        GetEnergyDataListService(handleSuccess, handleException),
                        GeneratorListService(handleGeneratorSuccess, handleGeneratorException),
                    ]);
                } catch (error) {
                    console.error('Error in API call', error);
                } finally {
                    setApiInProgress(false);
                }
            }
        };
        const intervalId = setInterval(fetchData, 5000);
        return () => { clearInterval(intervalId); };
    }, [intervalFlag, apiInProgress]);

    const handleSuccess = (dataObject) => {
        setKebData(dataObject.data);
        checkIfApisComplete();
    };
    const handleGeneratorSuccess = (dataObject) => {
        if (JSON.stringify(prevGeneratorData.current) !== JSON.stringify(dataObject.data)) {
            prevGeneratorData.current = dataObject.data;
            setGenerator(dataObject.data);
        }
        checkIfApisComplete();
    };
    const checkIfApisComplete = () => { setIntervalFlag(true); };
    const handleException = () => { setApiInProgress(false); };
    const handleGeneratorException = () => { setApiInProgress(false); };

    const calculatePercent = (percentage, max) => percentage / max;
    const handleKebClick = () => navigate('/EnergyInsideKEB');
    const handleGeneratorClick = (fuel) => navigate(`/EnergyInsideGenerator?generatorFuel=${fuel}`);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
            <Grid container spacing={3} justifyContent={'center'} alignItems={'center'}>

                {/* ── Section title ── */}
                <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center', marginBottom: '-16px' }}>
                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        Energy Monitoring Dashboard
                    </Typography>
                </Grid>

                {/* ── Electric Board Card ── */}
                <Grid item>
                    <Card
                        onClick={handleKebClick}
                        sx={{
                            minWidth: 240, height: 215,
                            backgroundColor: CARD_BG,
                            borderLeft: '4px solid #00ffff',
                            borderRadius: 2,
                            boxShadow: CARD_SHADOW,
                            cursor: 'pointer',
                            transition: 'box-shadow 0.2s',
                            '&:hover': { boxShadow: '0 6px 22px rgba(0,255,255,0.25)' }
                        }}
                    >
                        <CardContent sx={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                                <img src={tower} alt="EB" style={{ width: 22, height: 22, opacity: 0.9 }} />
                                <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Electric Board</Typography>
                                <StatusDot color="#00ffff" />
                            </div>
                            <Divider />
                            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 0' }}>
                                <MetricCell label="Voltage" value={kebData.Voltage} unit="V" />
                                <MetricCell label="Current" value={kebData.Current} unit="A" />
                            </div>
                            <Divider />
                            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 0' }}>
                                <MetricCell label="Power Factor" value={kebData.pF} unit="pF" valueColor="#ddf900" />
                                <MetricCell label="Frequency" value={kebData.Frequency} unit="Hz" valueColor="#ddf900" />
                            </div>
                            <Divider />
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                                <MetricCell label="Energy" value={kebData.kWh} unit="kWh" />
                            </div>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ── Center Gauge Card ── */}
                <Grid item>
                    <Card sx={{ width: 480, backgroundColor: CARD_BG, borderRadius: 2, boxShadow: CARD_SHADOW }}>
                        <CardContent>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>

                                {/* EB side */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: 110, minHeight: 193 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>EB</Typography>
                                        <StatusDot color="#00ffff" />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <Typography sx={{ color: '#00ffff', fontSize: 24, fontWeight: 'bold', lineHeight: 1 }}>
                                            {kebData.kWhDay}
                                        </Typography>
                                        <Typography sx={{ color: '#aaa', fontSize: 12, fontWeight: 600, mt: 0.5 }}>
                                            kWh/Day
                                        </Typography>
                                    </div>
                                </div>

                                {/* Gauge */}
                                <Gauge value={kebData.kW} />

                                {/* GEN side */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: 110, minHeight: 193 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>GEN</Typography>
                                        <StatusDot color="#ff4444" />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <Typography sx={{ color: '#00ffff', fontSize: 24, fontWeight: 'bold', lineHeight: 1 }}>
                                            {kebData.kWhMonth}
                                        </Typography>
                                        <Typography sx={{ color: '#aaa', fontSize: 12, fontWeight: 600, mt: 0.5 }}>
                                            kWh/Month
                                        </Typography>
                                    </div>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ── Generator Card ── */}
                <Grid item>
                    <Card
                        onClick={() => handleGeneratorClick(calculatePercent(generator.litre, 479))}
                        sx={{
                            backgroundColor: CARD_BG,
                            borderLeft: '4px solid #ff6b35',
                            borderRadius: 2,
                            boxShadow: CARD_SHADOW,
                            cursor: 'pointer',
                            transition: 'box-shadow 0.2s',
                            '&:hover': { boxShadow: '0 6px 22px rgba(255,107,53,0.25)' }
                        }}
                    >
                        <CardContent sx={{ padding: '12px 16px !important' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 2 }}>
                                <img src={Generator} alt="GEN" style={{ width: 22, height: 22 }} />
                                <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>GENERATOR</Typography>
                                <StatusDot color="#ff4444" />
                            </div>
                            <div style={{ height: 115, marginTop: '-4px' }}>
                                <GaugeChart
                                    id="gauge-chart3"
                                    nrOfLevels={479}
                                    animate={false}
                                    arcsLength={[0.3, 0.5, 0.3]}
                                    colors={["#FF5F6D", "#FFC371", "green"]}
                                    arcWidth={0.3}
                                    percent={calculatePercent(generator.litre, 479)}
                                    textColor={'#ffffff'}
                                    needleColor="#ddf900"
                                    needleBaseColor='#ddf900'
                                />
                            </div>
                            <Divider />
                            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '5px 0' }}>
                                <MetricCell label="Voltage" value={generator.Voltage} unit="V" />
                                <MetricCell label="Fuel" value={generator.litre} unit="Ltr" />
                                <MetricCell label="Frequency" value={generator.Frequency} unit="Hz" />
                            </div>
                            <Divider />
                            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '5px 0' }}>
                                <MetricCell label="Power" value={generator.kW} unit="kW" valueColor="#ddf900" />
                                <MetricCell label="Pwr Factor" value={generator.pF} unit="PF" valueColor="#ddf900" />
                                <MetricCell label="Current" value={generator.current} unit="A" />
                            </div>
                            <Divider />
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                                <MetricCell label="Energy" value={generator.kWh} unit="kWh" valueColor="#ddf900" />
                            </div>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>
        </div>
    )
}
