import React, { useEffect, useState, useRef } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import isolation from '../../../Assets/Images/isolation.png'
import { Bar, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { EnergyconsumptionService, KwhEnergyService } from '../../../Services/NodeJsApiServices';
import { throttle } from 'lodash';

const CARD_BG = '#2d2d3d';
const CARD_SHADOW = '0 4px 16px rgba(0,0,0,0.4)';

const chartTooltip = {
    contentStyle: {
        backgroundColor: '#1a1a2e',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 6,
        fontSize: 11,
    },
    labelStyle: { color: '#fff', fontWeight: 'bold' },
};

export const DownEnergyCard = () => {
    const [energyperDay, setEnergyperDay] = useState([]);
    const [kwhHour, setKwhHour] = useState([]);
    const prevEnergyData = useRef([]);
    const prevKwhData = useRef([]);
    const [intervalFlag, setIntervalFlag] = useState(true);

    useEffect(() => {
        EnergyconsumptionService(handleSuccess, handleException);
        KwhEnergyService(handleKwhSuccess, handleKwhException);

        const fetchEnergyPerDay = () => {
            if (intervalFlag) {
                setIntervalFlag(false)
                EnergyconsumptionService(handleSuccess, handleException)
            }
        };
        const fetchEnergyPerHour = () => {
            if (intervalFlag) {
                setIntervalFlag(false)
                KwhEnergyService(handleKwhSuccess, handleKwhException)
            }
        };

        const throttledFetchDataOne = throttle(fetchEnergyPerDay, 180000);
        const intervalIdOne = setInterval(throttledFetchDataOne, 180000);
        const throttledFetchDataTwo = throttle(fetchEnergyPerHour, 180000);
        const intervalIdTwo = setInterval(throttledFetchDataTwo, 180000);
        return () => {
            clearInterval(intervalIdOne);
            clearInterval(intervalIdTwo);
        };
    }, []);

    const handleSuccess = (dataObject) => {
        setIntervalFlag(true);
        if (JSON.stringify(prevEnergyData.current) !== JSON.stringify(dataObject.data)) {
            prevEnergyData.current = dataObject.data;
            setEnergyperDay(dataObject.data);
        }
    };
    const handleException = () => { };

    const handleKwhSuccess = (dataObject) => {
        setIntervalFlag(true);
        if (JSON.stringify(prevKwhData.current) !== JSON.stringify(dataObject.data)) {
            prevKwhData.current = dataObject.data;
            setKwhHour(dataObject.data);
        }
    };
    const handleKwhException = () => { };

    const MiniChartCard = ({ title, data, xKey }) => (
        <Card sx={{ backgroundColor: CARD_BG, borderRadius: 2, boxShadow: CARD_SHADOW }}>
            <div style={{ padding: '10px 16px 4px' }}>
                <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{title}</Typography>
            </div>
            <CardContent sx={{ pt: 0.5 }}>
                <ResponsiveContainer width="100%" height={90}>
                    <ComposedChart data={data} margin={{ left: -60, bottom: -20 }}>
                        <XAxis dataKey={xKey} tick={false} stroke="transparent" />
                        <YAxis tick={false} stroke="transparent" />
                        <Tooltip {...chartTooltip} />
                        <Bar dataKey="energyConsum" barSize={10} fill="#00ffff" radius={[2, 2, 0, 0]} />
                        <Line type="monotone" dataKey="avgConsum" stroke="#ff7300" dot={false} strokeWidth={1.5} />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ flexGrow: 1, marginTop: '15px' }}>
            <Grid container spacing={2}>

                <Grid item xs={12} sm={12} md={5} lg={5}>
                    <MiniChartCard title="Energy / Day" data={energyperDay} xKey="date" />
                </Grid>

                <Grid item xs={12} sm={12} md={2} lg={2}>
                    <Card sx={{
                        backgroundColor: CARD_BG, borderRadius: 2, boxShadow: CARD_SHADOW,
                        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        minHeight: 130,
                    }}>
                        <CardContent>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                <img src={isolation} alt="Isolation Transformer" style={{ width: 48, height: 48, opacity: 0.85 }} />
                                <Typography sx={{ color: '#aaa', fontWeight: 600, fontSize: 11, textAlign: 'center', lineHeight: 1.4 }}>
                                    Isolation<br />Transformer
                                </Typography>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={12} md={5} lg={5}>
                    <MiniChartCard title="Energy / Hr" data={kwhHour} xKey="hour" />
                </Grid>

            </Grid>
        </Box>
    )
}
