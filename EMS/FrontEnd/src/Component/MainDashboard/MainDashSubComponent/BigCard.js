import { Box } from '@mui/system'
import React, { useState, useEffect } from 'react'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Grid, Stack, styled } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AirlineSeatLegroomExtraIcon from '@mui/icons-material/AirlineSeatLegroomExtra';
import AlignVerticalTopIcon from '@mui/icons-material/AlignVerticalTop';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import AppBlockingIcon from '@mui/icons-material/AppBlocking';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import Paper from '@mui/material/Paper';
import { ProgressBar } from './ProgressBar';
import '../MainDashSubComponent/BigCard.css'
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { throttle } from 'lodash';
import { showMachine, showDashboardMachine } from '../../../Actions';

const BigCard = (props) => {
    const { machineList, currentDate } = props;
    // console.log("machineListID", machineList)
    // console.log("machineList BigCard", currentDate);

    const [intervalFlag, setIntervalFlag] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoSwitchTimeout, setAutoSwitchTimeout] = useState(null);
    const [isAutoSwitchingNext, setIsAutoSwitchingNext] = useState(true);
    const cardsPerPage = 8;
    const totalPages = Math.ceil(machineList.length / cardsPerPage);

    const handleNext = () => {
        if (currentIndex < totalPages - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0); // Loop back to the first page
        }
        clearTimeout(autoSwitchTimeout);
        setIsAutoSwitchingNext(true);
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            setCurrentIndex(totalPages - 1); // Go to the last page when on the first page and clicking "Previous"
        }
        clearTimeout(autoSwitchTimeout);
        setIsAutoSwitchingNext(false);
    };

    const autoSwitchToNextPage = () => {
        if (isAutoSwitchingNext) {
            handleNext(); // Switch to "Next" page
        } else {
            handlePrev(); // Switch to "Previous" page
        }
    };

    useEffect(() => {
        props.showDashboardMachine()

        // Set up a timer to automatically switch pages every 10 seconds
        const timer = setInterval(autoSwitchToNextPage, 10000);
        // Store the timer ID in state
        setAutoSwitchTimeout(timer);

        // INTERVAL TO FETCH MACHINE DATA
        const fetchData = () => {
            if (intervalFlag) {
                setIntervalFlag(false)
                props.showDashboardMachine(handleDashboardDataSucess, handleDashboardDataException)
            }
        };
        const throttledFetchData = throttle(fetchData, 5000);
        const intervalId = setInterval(throttledFetchData, 5000); // 50 milliseconds

        // Clear the timer AND Fetch Interval when the component unmounts
        return () => {
            clearInterval(timer);
            clearInterval(intervalId);
        };
    }, [currentIndex, isAutoSwitchingNext]);

    const handleDashboardDataSucess = () => {
        setIntervalFlag(true);
    }
    const handleDashboardDataException = () => {
    }

    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        // padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));

    const renderCards = () => {
        const startIndex = currentIndex * cardsPerPage;
        const endIndex = Math.min(startIndex + cardsPerPage, machineList.length);

        return machineList.slice(startIndex, endIndex).map((card, index) => (
            <Grid item key={index} marginTop={2} lg={3} md={6} sm={6} xs={12} xl={3}>
                <Item>
                    <Link
                        to="/MainCardInnerPage"
                        state={{ machine_id: card.id, currentDate: currentDate, machine_Name: card.machine_name, machineCardData: card }}
                        className="link">
                        {/* <Paper sx={{ backgroundColor: 'primary.main', color: 'white', padding: 1, borderRadius: 0 }}> */}
                        <div style={{ border: '1.5px solid #00FFFF' }} >
                            <Paper sx={{ backgroundColor: '#f7f7f7', color: '#212529', padding: 1, borderRadius: 0 }}>
                                {card.machine_name}
                            </Paper>
                            <Card sx={{ borderRadius: 0, backgroundColor: '#5d5d5d', padding: '3px' }}>
                                <CardContent>
                                    <Grid container >
                                        <Grid container justifyContent={'space-between'} alignItems={'center'}>
                                            <Grid item  >
                                                <Typography sx={{ fontSize: 20, fontWeight: 'bold' }} color="#dbd4d0" gutterBottom >
                                                    ACTUAL
                                                </Typography>
                                                {/* <span style={{ fontSize: 35, fontWeight: 'bold', color: '#00ffff', display: "flex" }}  >
                                                0
                                            </span><span style={{ fontWeight: 'bold', color: '#00ffff' }}>{card.unitName}</span> */}
                                                <Stack direction={'row'} spacing={1} style={{ display: 'flex', alignItems: 'baseline' }}>
                                                    <Typography sx={{ fontSize: 35, fontWeight: 'bold', }} color="#00ffff" >
                                                        {card.actual}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 9, fontWeight: 'bold' }} color="#00ffff" >
                                                        {card.unit}

                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                            <Grid item style={{marginBottom: '-5PX'}}>
                                                <Typography sx={{ fontSize: 20, fontWeight: 'bold', marginBottom: '-11PX' }} color="#dbd4d0" gutterBottom>OEE</Typography>
                                                <ProgressBar
                                                    value={card.oee}
                                                />
                                            </Grid>
                                        </Grid>
                                        <Grid container justifyContent={'space-between'}>
                                            <Grid item>
                                                <Typography gutterBottom fontWeight={'bold'} sx={{ display: 'flex', }}>
                                                    <SettingsSuggestIcon fontSize='medium' style={{ color: '#dbd4d0' }} /><Typography fontWeight={'bold'} style={{ marginTop: '2.5px', color: '#dbd4d0' }}>PLANNED</Typography>
                                                </Typography>
                                                <Stack direction={'row'} spacing={1} style={{ display: 'flex', alignItems: 'baseline' }}>
                                                    <Typography sx={{ fontSize: 25, fontWeight: 'bold', }} color="#00ffff" >
                                                        {card.planned === null ? card.max_capacity : card.planned}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 'bold' }} color="#00ffff" >
                                                        {/* {card.unitName}  */}
                                                        {card.unit}
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                            <Grid item>
                                                <Typography gutterBottom fontWeight={'bold'} sx={{ display: 'flex', }}>
                                                    <TrendingUpIcon fontSize='medium' style={{ color: '#dbd4d0' }} /><Typography fontWeight={'bold'} style={{ marginTop: '2.5px', color: '#dbd4d0' }}>CAPACITY</Typography>
                                                </Typography>
                                                <Stack direction={'row'} spacing={1} style={{ display: 'flex', alignItems: 'baseline' }}>
                                                    <Typography sx={{ fontSize: 25, fontWeight: 'bold' }} color="#00ffff" >
                                                        {card.max_capacity}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 'bold' }} color="#00ffff" >
                                                        {/* {card.unitName} */}
                                                        {card.unit}
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </CardContent>

                            </Card>
                        </div>
                    </Link>
                </Item>
            </Grid>
        ));
    };

    return (
        <>
            <Grid container spacing={2} justifyContent="center" alignItems="center">
                {renderCards()}
            </Grid>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Button variant="contained" onClick={handlePrev} disabled={currentIndex === 0} style={{ marginLeft: '7px' }}>Previous</Button>
                <Button variant="contained" onClick={handleNext} disabled={currentIndex >= Math.floor(machineList.length / 8)} style={{ marginLeft: '7px' }}>Next</Button>
            </div>
        </>
    )
}
// export default BigCard;
const mapStateToProps = ({ config }) => {
    const { machineList, machineLoader } = config;
    return { machineList, machineLoader }
}
export default connect(mapStateToProps, { showMachine, showDashboardMachine })(BigCard);
