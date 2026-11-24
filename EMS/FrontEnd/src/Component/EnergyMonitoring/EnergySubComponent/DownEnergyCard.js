import React, { useEffect, useState, useRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { connect } from 'react-redux';
import isolation from '../../../Assets/Images/isolation.png';
import { Area, Bar, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { EnergyconsumptionService, KwhEnergyService, GetDistributerLastMonth, GetDistributerPerHour } from '../../../Services/NodeJsApiServices';
import { throttle } from 'lodash';

const CARD_BG     = '#2d2d3d';
const CARD_SHADOW = '0 4px 16px rgba(0,0,0,0.4)';

const darkTooltip = {
    contentStyle: {
        backgroundColor: '#1a1a2e',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 6,
        fontSize: 12,
    },
    labelStyle: { color: '#fff', fontWeight: 'bold' },
};

const MiniChartCard = ({ title, children }) => (
    <Card sx={{ backgroundColor: CARD_BG, boxShadow: CARD_SHADOW, borderRadius: 2 }}>
        <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography sx={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{title}</Typography>
        </div>
        <CardContent sx={{ padding: '8px !important' }}>
            {children}
        </CardContent>
    </Card>
);

const DownEnergyCard = (props) => {
    const { plantId, tabPanelName } = props;
    const [energyperDay, setEnergyperDay] = useState([]);
    const [kwhHour, setKwhHour] = useState([]);
    const prevEnergyData = useRef([]);
    const prevKwhData = useRef([]);
    const [intervalFlag, setIntervalFlag] = useState(true);

    useEffect(() => {
        if (tabPanelName === 'incomer') {
            EnergyconsumptionService(handleSuccess, handleException);
            KwhEnergyService(handleKwhSuccess, handleKwhException);
        } else {
            GetDistributerLastMonth({ plantId, feederId: props.feederId }, handleSuccess, handleException);
            GetDistributerPerHour({ plantId, feederId: props.feederId }, handleKwhSuccess, handleKwhException);
        }

        const fetchEnergyPerDay = () => {
            if (intervalFlag) {
                setIntervalFlag(false);
                if (tabPanelName === 'incomer') {
                    EnergyconsumptionService(handleSuccess, handleException);
                } else {
                    GetDistributerLastMonth({ plantId, feederId: props.feederId }, handleSuccess, handleException);
                }
            }
        };

        const fetchEnergyPerHour = () => {
            if (intervalFlag) {
                setIntervalFlag(false);
                if (tabPanelName === 'incomer') {
                    KwhEnergyService(handleKwhSuccess, handleKwhException);
                } else {
                    GetDistributerPerHour({ plantId, feederId: props.feederId }, handleKwhSuccess, handleKwhException);
                }
            }
        };

        const throttledFetchOne = throttle(fetchEnergyPerDay, 180000);
        const throttledFetchTwo = throttle(fetchEnergyPerHour, 180000);
        const idOne = setInterval(throttledFetchOne, 180000);
        const idTwo = setInterval(throttledFetchTwo, 180000);
        return () => { clearInterval(idOne); clearInterval(idTwo); };
    }, []);

    const handleSuccess = (dataObject) => {
        setIntervalFlag(true);
        if (JSON.stringify(prevEnergyData.current) !== JSON.stringify(dataObject.data)) {
            prevEnergyData.current = dataObject.data;
            setEnergyperDay(dataObject.data);
        }
    };
    const handleException = () => {};

    const handleKwhSuccess = (dataObject) => {
        setIntervalFlag(true);
        if (JSON.stringify(prevKwhData.current) !== JSON.stringify(dataObject.data)) {
            prevKwhData.current = dataObject.data;
            setKwhHour(dataObject.data);
        }
    };
    const handleKwhException = () => {};

    return (
        <Box sx={{ flexGrow: 1, marginTop: '15px' }}>
            <Grid container spacing={2}>

                {/* ENERGY/DAY CHART */}
                <Grid item xs={12} sm={12} md={5} lg={5}>
                    <MiniChartCard title="Energy / Day">
                        <ResponsiveContainer width="100%" height={90}>
                            <ComposedChart data={energyperDay} margin={{ left: -60, bottom: -20 }}>
                                <XAxis dataKey="date" tick={false} stroke="#555" />
                                <YAxis tick={false} stroke="#555" />
                                <Tooltip {...darkTooltip} />
                                <Bar dataKey="energyConsum" barSize={10} fill="#00ffff" />
                                <Line type="monotone" dataKey="avgConsum" stroke="#ff7300" dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </MiniChartCard>
                </Grid>

                {/* CENTER ICON */}
                <Grid item xs={12} sm={12} md={2} lg={2}>
                    <Card sx={{ backgroundColor: CARD_BG, boxShadow: CARD_SHADOW, borderRadius: 2, height: '100%', minHeight: 120 }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <img src={isolation} alt="Distribution" style={{ width: 50, height: 50 }} />
                            <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center', mt: 1 }}>
                                {tabPanelName === 'incomer' ? 'Power Distribution' : 'Isolation Transformer'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ENERGY/HOUR CHART */}
                <Grid item xs={12} sm={12} md={5} lg={5}>
                    <MiniChartCard title="Energy / Hr">
                        <ResponsiveContainer width="100%" height={90}>
                            <ComposedChart data={kwhHour} margin={{ left: -60, bottom: -20 }}>
                                <XAxis dataKey="hour" tick={false} stroke="#555" />
                                <YAxis tick={false} stroke="#555" />
                                <Tooltip {...darkTooltip} />
                                <Bar dataKey="energyConsum" barSize={10} fill="#00ffff" />
                                <Line type="monotone" dataKey="avgConsum" stroke="#ff7300" dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </MiniChartCard>
                </Grid>

            </Grid>
        </Box>
    );
};

const mapStateToProps = ({ MainDashboardReducer }) => {
    const { feederId } = MainDashboardReducer;
    return { feederId };
};
export default connect(mapStateToProps, {})(DownEnergyCard);
