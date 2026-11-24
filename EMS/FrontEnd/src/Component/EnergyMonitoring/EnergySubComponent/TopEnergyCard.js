import React, { useEffect, useRef, useState } from 'react'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import SolarPowerRoundedIcon from '@mui/icons-material/SolarPowerRounded';
import WindPowerRoundedIcon from '@mui/icons-material/WindPowerRounded';
import '../../EnergyMonitoring/EnergyMonitoring.css'
import tower from '../../../Assets/Images/tower.png'
import Generator from '../../../Assets/Images/generator2.png'
import { Gauge } from './gauge';
import { Stack } from '@mui/material';
import { GeneratorListService, GetEnergyDataListService, GetPlantDistributorData, GetSolarIncomerData, GetWindmillIncomerData } from '../../../Services/NodeJsApiServices';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import { useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';

const CARD_BG     = '#2d2d3d';
const CARD_SHADOW = '0 4px 16px rgba(0,0,0,0.4)';

const MetricCell = ({ value, unit, valueColor = '#00ffff', unitColor = 'white', size = '23px' }) => (
    <Stack direction="row" spacing={1} alignItems="baseline">
        <Typography sx={{ fontSize: size, fontWeight: 'bold', color: valueColor }}>{value}</Typography>
        {unit && <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: unitColor }}>{unit}</Typography>}
    </Stack>
);

const incomerCardSx = (accentColor) => ({
    backgroundColor: CARD_BG,
    borderLeft: `4px solid ${accentColor}`,
    boxShadow: CARD_SHADOW,
    transition: 'box-shadow 0.2s',
    '&:hover': { boxShadow: `0 6px 22px ${accentColor}44` },
});

const TopEnergyCard = (props) => {
    const { tabPanelName, plantId } = props;
    const navigate = useNavigate();
    const [kebData, SetKebData] = useState([]);
    const [generator, SetGenerator] = useState([]);
    const prevGeneratorData = useRef([]);
    const [intervalFlag, setIntervalFlag] = useState(true);
    const [width, setWidth] = useState(window.innerWidth);
    const [solarData, setSolarData] = useState([]);
    const [windmillData, setWindmillData] = useState([]);
    const [apiInProgress, setApiInProgress] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!apiInProgress && intervalFlag) {
                setApiInProgress(true);
                setIntervalFlag(false);
                try {
                    if (tabPanelName === 'incomer') {
                        await Promise.all([
                            GetEnergyDataListService(handleSuccess, handleException),
                            GeneratorListService(handleGeneratorSuccess, handleGeneratorException),
                            GetSolarIncomerData(handleSolarSuccess, handleSolarException),
                            GetWindmillIncomerData(handleWindmillSuccess, handleWindmillException),
                        ]);
                    } else {
                        await GetPlantDistributorData({ plantId, feederId: props.feederId }, handleSuccess, handleException);
                    }
                } catch (error) {
                    console.error('Error in API call', error);
                } finally {
                    setApiInProgress(false);
                }
            }
        };
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, [intervalFlag, apiInProgress]);

    const checkIfApisComplete = () => setIntervalFlag(true);

    const handleWindmillSuccess  = (d) => { setWindmillData(d?.data || []); checkIfApisComplete(); };
    const handleWindmillException = () => setApiInProgress(false);
    const handleSolarSuccess     = (d) => { setSolarData(d?.data || []); checkIfApisComplete(); };
    const handleSolarException   = () => setApiInProgress(false);
    const handleSuccess          = (d) => { SetKebData(d?.data || {}); checkIfApisComplete(); };
    const handleException        = () => setApiInProgress(false);
    const handleGeneratorSuccess = (d) => {
        if (JSON.stringify(prevGeneratorData.current) !== JSON.stringify(d.data)) {
            prevGeneratorData.current = d.data;
            SetGenerator(d.data);
        }
        checkIfApisComplete();
    };
    const handleGeneratorException = () => setApiInProgress(false);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
            <Grid container spacing={3} justifyContent="center" alignItems="center">

                {/* EB CARD */}
                {tabPanelName === 'incomer' && (
                    <Grid item>
                        <Card sx={{ ...incomerCardSx('#00ffff'), minWidth: width / 10, height: 240, cursor: 'pointer' }}>
                            <CardContent>
                                <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" mb={1}>
                                    <img src={tower} alt="EB" style={{ width: 22, height: 22 }} />
                                    <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>EB</Typography>
                                    <Brightness1Icon style={{ fontSize: 12, color: '#00ffff' }} />
                                </Stack>
                                <Stack spacing={1.5} mt={1} alignItems="center">
                                    <MetricCell value={kebData.Current} unit="A" />
                                    <Stack direction="row" spacing={2}>
                                        <MetricCell value={kebData.pF} unit="pF" valueColor="#ddf900" unitColor="#00ffff" />
                                        <MetricCell value={kebData.Frequency} unit="Hz" valueColor="#ddf900" unitColor="#00ffff" />
                                    </Stack>
                                    <MetricCell value={kebData.kWh} unit="kWh" valueColor="#ddf900" unitColor="#00ffff" size="16px" />
                                    <MetricCell value={kebData.Voltage} unit="V" />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* SOLAR CARDS */}
                {tabPanelName === 'incomer' && solarData.map((solar, key) => (
                    <Grid item key={key}>
                        <Card sx={{ ...incomerCardSx('#FF8225'), minWidth: width / 10, height: 240 }}>
                            <CardContent>
                                <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" mb={1}>
                                    <SolarPowerRoundedIcon style={{ color: '#FF8225', fontSize: 20 }} />
                                    <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>SOLAR</Typography>
                                    <Brightness1Icon style={{ fontSize: 12, color: '#FF8225' }} />
                                </Stack>
                                <Stack spacing={1.5} mt={1} alignItems="center">
                                    <MetricCell value={solar.Current} unit="A" />
                                    <Stack direction="row" spacing={2}>
                                        <MetricCell value={solar.pF} unit="pF" valueColor="#ddf900" unitColor="#00ffff" />
                                        <MetricCell value={solar.Frequency} unit="Hz" valueColor="#ddf900" unitColor="#00ffff" />
                                    </Stack>
                                    <MetricCell value={solar.kWh} unit="kWh" valueColor="#ddf900" unitColor="#00ffff" size="16px" />
                                    <MetricCell value={solar.Voltage} unit="V" />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* CENTER GAUGE CARD */}
                <Grid item>
                    <Card sx={{
                        width: 480, backgroundColor: CARD_BG, boxShadow: CARD_SHADOW,
                        paddingTop: tabPanelName === 'incomer' ? '15px' : 0,
                        paddingBottom: tabPanelName === 'incomer' ? '15px' : 0,
                    }}>
                        <CardContent>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: 193 }}>
                                    {tabPanelName === 'incomer' ? (
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <Typography style={{ fontWeight: 'bold', fontSize: 13, color: 'white' }}>EB</Typography>
                                            <Brightness1Icon style={{ fontSize: 12, color: '#00ffff' }} />
                                        </Stack>
                                    ) : (
                                        <MetricCell value={kebData.Voltage} unit="V" />
                                    )}
                                    {tabPanelName !== 'incomer' && (
                                        <MetricCell value={kebData.kWh} unit="kWh" valueColor="#ddf900" unitColor="#00ffff" size="16px" />
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Typography sx={{ color: '#00ffff', fontWeight: 'bold', fontSize: '1.5rem' }}>
                                            {kebData.kWhDay}
                                        </Typography>
                                        <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>
                                            kWh/Day
                                        </Typography>
                                    </div>
                                </div>

                                <div><Gauge value={kebData.kW} /></div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: 193 }}>
                                    {tabPanelName === 'incomer' ? (
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <Typography style={{ fontWeight: 'bold', fontSize: 13, color: 'white' }}>GEN</Typography>
                                            <Brightness1Icon style={{ fontSize: 12, color: 'red' }} />
                                        </Stack>
                                    ) : (
                                        <MetricCell value={kebData.Current} unit="A" />
                                    )}
                                    {tabPanelName !== 'incomer' && (
                                        <MetricCell value={kebData.pF} unit="pF" valueColor="#ddf900" unitColor="#00ffff" />
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Typography sx={{ color: '#00ffff', fontWeight: 'bold', fontSize: '1.5rem' }}>
                                            {kebData.kWhMonth}
                                        </Typography>
                                        <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>
                                            kWh/Month
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                            {tabPanelName !== 'incomer' && (
                                <Stack mt={1} direction="row" spacing={1} justifyContent="center" alignItems="baseline">
                                    <MetricCell value={kebData.Frequency} unit="Hz" valueColor="#ddf900" unitColor="#00ffff" />
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* WINDMILL CARDS */}
                {tabPanelName === 'incomer' && windmillData.map((windmill, key) => (
                    <Grid item key={key}>
                        <Card sx={{ ...incomerCardSx('#f7cc4c'), minWidth: width / 10, height: 240 }}>
                            <CardContent>
                                <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" mb={1}>
                                    <WindPowerRoundedIcon style={{ color: '#f7cc4c', fontSize: 20 }} />
                                    <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>Windmill</Typography>
                                    <Brightness1Icon style={{ fontSize: 12, color: '#f7cc4c' }} />
                                </Stack>
                                <Stack spacing={1.5} mt={1} alignItems="center">
                                    <Stack direction="row" spacing={2}>
                                        <MetricCell value={windmill.Voltage} unit="V" />
                                        <MetricCell value={windmill.Current} unit="A" />
                                    </Stack>
                                    <Stack direction="row" spacing={2}>
                                        <MetricCell value={windmill.pF} unit="pF" valueColor="#ddf900" unitColor="#00ffff" />
                                        <MetricCell value={windmill.Frequency} unit="Hz" valueColor="#ddf900" unitColor="#00ffff" />
                                    </Stack>
                                    <MetricCell value={windmill.kWh} unit="kWh" valueColor="#ddf900" unitColor="#00ffff" size="16px" />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* GENERATOR CARD */}
                {tabPanelName === 'incomer' && (
                    <Grid item>
                        <Card sx={{ ...incomerCardSx('#FF4C4C'), minWidth: width / 10, height: 240 }}>
                            <CardContent>
                                <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" mb={1}>
                                    <img src={Generator} alt="Generator" style={{ width: 20, height: 20 }} />
                                    <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>Generator</Typography>
                                    <Brightness1Icon style={{ fontSize: 12, color: '#FF4C4C' }} />
                                </Stack>
                                <Stack spacing={1.5} mt={1} alignItems="center">
                                    <MetricCell value={generator.current} unit="A" />
                                    <Stack direction="row" spacing={2}>
                                        <MetricCell value={generator.pF} unit="pF" valueColor="#ddf900" unitColor="#00ffff" />
                                        <MetricCell value={generator.Frequency} unit="Hz" valueColor="#ddf900" unitColor="#00ffff" />
                                    </Stack>
                                    <MetricCell value={generator.kWh} unit="kWh" valueColor="#ddf900" unitColor="#00ffff" size="16px" />
                                    <MetricCell value={generator.Voltage} unit="V" />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

            </Grid>
        </div>
    );
};

const mapStateToProps = ({ MainDashboardReducer }) => {
    const { feederId } = MainDashboardReducer;
    return { feederId };
};
export default connect(mapStateToProps, {})(TopEnergyCard);
