import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Stack } from '@mui/material';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import { GetMeterDataListService, GetMainIncomerDistSubDist } from '../../../Services/NodeJsApiServices';
import { DistrubuterGuage } from './DistrubuterGuage';
import { updateFeederId } from '../../../Actions';
import { connect } from 'react-redux';

const CARD_BG     = '#2d2d3d';
const CARD_SHADOW = '0 4px 16px rgba(0,0,0,0.4)';

const DistCardHeader = ({ label }) => (
    <div style={{
        backgroundColor: '#1e2235',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 36, borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
        <Typography sx={{ color: '#e0e0e0', fontSize: 13, fontWeight: 600 }}>{label}</Typography>
    </div>
);

const DistCard = ({ item, onClick }) => (
    <Card
        sx={{
            backgroundColor: CARD_BG,
            borderLeft: '4px solid rgba(0,255,255,0.5)',
            boxShadow: CARD_SHADOW,
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: '0 6px 22px rgba(0,255,255,0.2)' },
        }}
        onClick={onClick}
    >
        <DistCardHeader label={item.displayName} />
        <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: 173 }}>
                    <Stack mt={1} direction="row" spacing={1} alignItems="baseline">
                        <Typography sx={{ fontSize: 20, fontWeight: 'bold', color: '#00ffff' }}>{item.Voltage}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: 'white' }}>V</Typography>
                    </Stack>
                    <Stack mt={1} direction="row" spacing={1} alignItems="baseline">
                        <Typography sx={{ fontSize: 20, fontWeight: 'bold', color: '#ddf900' }}>{item.pF}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: '#00ffff' }}>pF</Typography>
                    </Stack>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography sx={{ color: '#00ffff', fontWeight: 'bold', fontSize: '1.5rem' }}>{item.kWhDay}</Typography>
                        <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>kWh/Day</Typography>
                    </div>
                </div>

                <div style={{ marginTop: -70 }}>
                    <DistrubuterGuage value={item.kW} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: 173 }}>
                    <Stack mt={1} direction="row" spacing={1} alignItems="baseline">
                        <Typography sx={{ fontSize: 20, fontWeight: 'bold', color: '#00ffff' }}>{item.Current}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: 'white' }}>A</Typography>
                    </Stack>
                    <Stack mt={1} direction="row" spacing={1} alignItems="baseline">
                        <Typography sx={{ fontSize: 20, fontWeight: 'bold', color: '#ddf900' }}>{item.Frequency}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: '#00ffff' }}>Hz</Typography>
                    </Stack>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography sx={{ color: '#00ffff', fontWeight: 'bold', fontSize: '1.5rem' }}>{item.kWhMonth}</Typography>
                        <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>kWh/Month</Typography>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

const DistRow = ({ data, onCardClick }) => {
    if (!data || !data.length) return null;
    return (
        <Grid container spacing={1.5} justifyContent="center" flexWrap="wrap" style={{ marginTop: 10 }}>
            {data.map((item, key) => (
                <Grid item key={key}>
                    <DistCard item={item} onClick={() => onCardClick(item)} />
                </Grid>
            ))}
        </Grid>
    );
};

const Down3EnergyCard = (props) => {
    const { tabList, tabPanelName, setValue, plantId } = props;
    const [meterDataList, setMeterDataList] = useState([]);
    const [intervalFlag, setIntervalFlag] = useState(true);
    const [lineOneData, setLineOneData] = useState([]);
    const [lineTwoData, setLineTwoData] = useState([]);
    const [lineThreeData, setLineThreeData] = useState([]);
    const [lineFourData, setLineFourData] = useState([]);
    const [apiInProgress, setApiInProgress] = useState(false);
    const [idFeeder, setIdFeeder] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (!apiInProgress && intervalFlag) {
                setApiInProgress(true);
                setIntervalFlag(false);
                try {
                    if (tabPanelName === 'incomer') {
                        await Promise.all([GetMainIncomerDistSubDist(handleSuccess, handleException)]);
                    } else {
                        GetMeterDataListService({ plantId, feederId: props.feederId }, handleSuccess, handleException);
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

    const handleSuccess = (dataObject) => {
        if (tabPanelName === 'incomer') {
            setLineOneData(dataObject.dashDisplayNo1 || []);
            setLineTwoData(dataObject.dashDisplayNo2 || []);
            setLineThreeData(dataObject.dashDisplayNo3 || []);
            setLineFourData(dataObject.dashDisplayNo4 || []);
        } else {
            setMeterDataList(dataObject.data || []);
        }
        checkIfApisComplete();
    };

    const handleException = () => setApiInProgress(false);

    const handleDistributerClick = (item) => {
        props.updateFeederId(item.feederId);
        const cardIndex = tabList.findIndex((t) => t.id === item.plantId);
        setValue(cardIndex + 1);
    };

    const handleLine1Click = (item) => {
        props.updateFeederId(undefined);
        const cardIndex = tabList.findIndex((t) => t.id === item.plantId);
        setValue(cardIndex + 1);
    };

    return (
        <Box style={{ zoom: tabPanelName === 'incomer' ? '80%' : '100%' }}>

            {/* LINE 1 — Distributors */}
            <DistRow data={lineOneData} onCardClick={handleLine1Click} />

            {/* LINE 2 — Sub-distributors */}
            {lineTwoData && (
                <Grid container spacing={1.5} justifyContent="center" flexWrap="wrap" style={{ marginTop: 10 }}>
                    {lineTwoData.map((item, key) => (
                        <Grid item key={key}>
                            <DistCard
                                item={item}
                                onClick={() => {
                                    setIdFeeder(item.feederId);
                                    handleDistributerClick(item);
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* LINE 3 */}
            <DistRow data={lineThreeData} onCardClick={handleLine1Click} />

            {/* LINE 4 */}
            <DistRow data={lineFourData} onCardClick={handleLine1Click} />

            {/* PLANT METER CARDS */}
            {meterDataList && meterDataList.length > 0 && (
                <Grid container spacing={1.5} justifyContent="center" flexWrap="wrap" style={{ marginTop: -35 }}>
                    {meterDataList.map((item, key) => {
                        const hasData    = item.kW !== null;
                        const accentColor = hasData ? '#00ffff' : '#ff4d4d';
                        return (
                            <Grid item xs={12} sm={6} md={2} lg={1} xl={1} key={key}>
                                <Card sx={{
                                    minWidth: 100, minHeight: 150,
                                    backgroundColor: CARD_BG,
                                    borderLeft: `3px solid ${accentColor}`,
                                    boxShadow: CARD_SHADOW,
                                }}>
                                    <CardContent>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Typography sx={{ color: '#ddd', fontWeight: 'bold', fontSize: 12, minWidth: 80, textAlign: 'center' }}>
                                                {item.displayName}
                                            </Typography>

                                            <Stack mt={1} direction="row" spacing={1} alignItems="baseline"
                                                style={{ marginTop: hasData ? undefined : 12.5 }}>
                                                <Typography sx={{
                                                    mb: 1.5, fontWeight: 'bold',
                                                    color: hasData ? '#00FFFF' : '#ff5f6d',
                                                    fontSize: hasData ? '1.5rem' : '15.5px',
                                                    marginTop: hasData ? 0 : 15,
                                                }}>
                                                    {hasData ? item.kW : 'No Data'}
                                                </Typography>
                                                {hasData && (
                                                    <Typography sx={{ mb: 1, color: '#fff', fontWeight: 'bold', fontSize: 15 }}>kW</Typography>
                                                )}
                                            </Stack>

                                            <Stack mt={1} direction="row" spacing={1} alignItems="baseline">
                                                <Typography sx={{
                                                    mb: 1.5, fontWeight: 'bold',
                                                    color: item.pFvalue !== null ? '#ddf900' : '#ff5f6d',
                                                    fontSize: item.pFvalue !== null ? '1.0rem' : '15.5px',
                                                    marginTop: item.pFvalue !== null ? 0 : 15,
                                                }}>
                                                    {item.pFvalue === null ? '-' : item.pFvalue}
                                                </Typography>
                                                {item.pFvalue !== null && (
                                                    <Typography sx={{ mb: 1.5, color: '#fff', fontWeight: 'bold', fontSize: 14 }}>PF</Typography>
                                                )}
                                            </Stack>

                                            <Stack mt={1} direction="row" spacing={1} alignItems="baseline">
                                                <Typography sx={{ mb: 1.5, color: '#bbb', fontWeight: 'bold', fontSize: 14 }}>
                                                    {item.valueSetKW === null ? '-' : item.valueSetKW}
                                                </Typography>
                                                {item.valueSetKW !== null && (
                                                    <Typography sx={{
                                                        mb: 1.5, fontWeight: 'bold',
                                                        color: item.pFvalue !== null ? '#ddf900' : '#fff',
                                                        fontSize: item.pFvalue !== null ? '1.0rem' : 14,
                                                        marginTop: item.pFvalue !== null ? 0 : 15,
                                                    }}>
                                                        SkW
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
};

const mapStateToProps = ({ MainDashboardReducer }) => {
    const { feederId } = MainDashboardReducer;
    return { feederId };
};
export default connect(mapStateToProps, { updateFeederId })(Down3EnergyCard);
