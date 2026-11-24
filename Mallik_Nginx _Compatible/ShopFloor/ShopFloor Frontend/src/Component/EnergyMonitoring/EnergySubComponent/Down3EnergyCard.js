import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { throttle } from 'lodash';
import { GetMeterDataListService } from '../../../Services/NodeJsApiServices';

const CARD_SHADOW = '0 4px 12px rgba(0,0,0,0.35)';

export const Down3EnergyCard = () => {
    const [meterDataList, setMeterDataList] = useState([]);
    const [intervalFlag, setIntervalFlag] = useState(true);

    useEffect(() => {
        GetMeterDataListService(handleSuccess, handleException)
        const fetchData = () => {
            if (intervalFlag) {
                setIntervalFlag(false)
                GetMeterDataListService(handleSuccess, handleException)
            }
        };
        const throttledFetchData = throttle(fetchData, 9000);
        const intervalId = setInterval(throttledFetchData, 9000);
        return () => { clearInterval(intervalId); };
    }, [])

    const handleSuccess = (dataObject) => {
        setIntervalFlag(true);
        setMeterDataList(dataObject.data);
    };
    const handleException = (errorObject) => { };

    return (
        <Box marginTop={2}>
            <Grid
                container spacing={1.5}
                style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap' }}
            >
                {meterDataList && meterDataList.map((item, key) => {
                    const hasData = item.kW !== null;
                    const accentColor = hasData ? '#00ffff' : '#ff4d4d';
                    return (
                        <Grid item xs={12} sm={6} md={2} lg={1} xl={1} key={key}>
                            <Card sx={{
                                minWidth: 100, minHeight: 140,
                                backgroundColor: '#2d2d3d',
                                borderLeft: `3px solid ${accentColor}`,
                                borderRadius: 2,
                                boxShadow: CARD_SHADOW,
                            }}>
                                <CardContent sx={{ padding: '10px 12px !important' }}>
                                    <Typography sx={{
                                        color: '#aaa', fontSize: 11, fontWeight: 600,
                                        textTransform: 'uppercase', letterSpacing: 0.7,
                                        textAlign: 'center', mb: 1, lineHeight: 1.3, minWidth: 76
                                    }}>
                                        {item.displayName}
                                    </Typography>
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 8, textAlign: 'center' }}>
                                        {hasData ? (
                                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 3 }}>
                                                <Typography sx={{ color: '#00ffff', fontSize: 22, fontWeight: 'bold', lineHeight: 1 }}>
                                                    {item.kW}
                                                </Typography>
                                                <Typography sx={{ color: '#aaa', fontSize: 11 }}>kW</Typography>
                                            </div>
                                        ) : (
                                            <Typography sx={{ color: '#ff4d4d', fontSize: 12, fontWeight: 600, lineHeight: 1, mt: 1 }}>
                                                No Data
                                            </Typography>
                                        )}
                                    </div>
                                    {item.pFvalue !== null && (
                                        <div style={{ textAlign: 'center', marginTop: 8 }}>
                                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 3 }}>
                                                <Typography sx={{ color: '#ddf900', fontSize: 16, fontWeight: 'bold', lineHeight: 1 }}>
                                                    {item.pFvalue}
                                                </Typography>
                                                <Typography sx={{ color: '#aaa', fontSize: 11 }}>PF</Typography>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    )
}
