import { Box } from '@mui/system'
import React, { useState, useEffect } from 'react'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Grid, styled } from '@mui/material';
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
// import { ProgressBar } from './ProgressBar';
// import '../MainDashSubComponent/BigCard.css'
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Link } from 'react-router-dom';
import './HealthBigCard.css'
// ***********************************
import machine from '../../../Assets/Images/machh4.png'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { ProgressBar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import mg from '../../../Assets/Images/mg.png';
import mech1 from '../../../Assets/Images/mech1.png';
import ppp from '../../../Assets/Images/ppp.png';
import poww from '../../../Assets/Images/poww.png';
import weld from '../../../Assets/Images/weld.png';
import { HealthDashboardMachineList } from '../../../Services/NodeJsApiServices';


export const HealthBigCard = () => {

    const cardData = [
        {
            icon: machine,
            text: 'Shearing Machine',
        },
        {
            icon: mg,
            text: 'Punching Machine',
        },
        {
            icon: mech1,
            text: 'Bending Machine(RG-35)',
        },
        {
            icon: mech1,
            text: 'Bending Machine(RG-80)',
        },
        {
            icon: mech1,
            text: 'Bending Machine(RG-100)',
        },
        {
            icon: ppp,
            text: 'Pretreatment Machine',
        },
        {
            icon: poww,
            text: 'Powder Coating Machine',
        },

        {
            icon: weld,
            text: 'Spot Welding Machine 1',
        },

        {
            icon: weld,
            text: 'Spot Welding Machine 2',
        },

        {
            icon: weld,
            text: 'Spot Welding Machine 3',
        },

        {
            icon: weld,
            text: 'Overhead Spot Welding Machine 1',
        },

        {
            icon: weld,
            text: 'Overhead Spot Welding Machine 2',
        },
    ];

    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        // padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));

    const [machineList, setMachineList] = useState([]);
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
        HealthDashboardMachineList(getMachineListSuccess, getMachineListException);

        // Set up a timer to automatically switch pages every 10 seconds
        const timer = setInterval(autoSwitchToNextPage, 10000);
        // Store the timer ID in state
        setAutoSwitchTimeout(timer);

        return () => {
            clearInterval(timer);
        };

    }, [currentIndex, isAutoSwitchingNext])

    const getMachineListSuccess = (dataObject) => {
        setMachineList(dataObject?.data || [])
    }
    const getMachineListException = () => { }

    const renderCards = () => {

        const startIndex = currentIndex * cardsPerPage;
        const endIndex = Math.min(startIndex + cardsPerPage, machineList.length);

        return machineList.slice(startIndex, endIndex).map((card, index) => (
            <Grid item key={index} lg={3} md={6} sm={6} xs={12} xl={3}>
                {/* <Item style={{ display: 'flex', flexDirection: 'column' }}>
                    <Paper sx={{ backgroundColor: '#212121', color: 'white', padding: 1, borderRadius: 0 }}>
                        {card.text}
                    </Paper>
                    <Card sx={{ backgroundColor: '#828282', backgroundColor: '#828282', borderRadius: 0 }} className='healthBigCardContainer'>
                        <CardContent>
                            <Grid container style={{ direction: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                <Grid item lg={6}>
                                    <img src={card.icon} alt="Word of the Day" style={{ width: '130px', height: '130px' }} />
                                </Grid>
                                <Grid item>
                                    <Grid container direction={'column'} style={{ direction: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                        <Grid item>
                                            <Typography sx={{ fontSize: 20, fontWeight: 'bold' }} color="text.secondary" gutterBottom>
                                                <NotificationsActiveIcon fontSize='large' /> ALERTS
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography sx={{ fontSize: 30, fontWeight: 'bold' }} color="text.secondary" gutterBottom>
                                                128
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography sx={{ fontSize: 20, fontWeight: 'bold' }} color="text.secondary" gutterBottom>
                                                HEALTH
                                            </Typography>
                                        </Grid>
                                        <Grid item >
                                            <ProgressBar striped now={50} label={`Good`} variant="success" animated className="custom-progress-bar" />
                                        </Grid>
                                    </Grid>

                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Item> */}
                <Link to={`/HealthDashboardInsideCard?machineName=${card.machineName}&&machineId=${card.id}&&machineImage=${`${process.env.REACT_APP_IMAGE_URL}${card.machineImage}`}`} className="link" >
                    <Paper sx={{ backgroundColor: '#5D5D5D', color: 'white', padding: 1, borderRadius: 0, textAlign: 'center', fontWeight: 'bold' }}>
                        {card.machineName.toUpperCase()}
                    </Paper>
                    {/* <Card sx={{ backgroundColor: '#828282', borderRadius: 0, paddingBottom: '30px' }}> */}
                    <Card sx={{ backgroundColor: '#ffffff', borderRadius: 0, paddingBottom: '30px' }}>
                        <CardContent>
                            <Grid container style={{ direction: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                <Grid item lg={6}>
                                    <img src={`${process.env.REACT_APP_IMAGE_URL}${card.machineImage}`} alt="No image available" style={{ width: '120px', height: '120px' }} className='imageStyle' />
                                </Grid>
                                <Grid item>
                                    <Grid container direction={'column'} style={{ direction: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                        <Grid item>
                                            <Typography sx={{ fontSize: 20, fontWeight: 'bold' }} color="text.secondary" gutterBottom>
                                                <NotificationsActiveIcon fontSize='large' /> ALERTS
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography sx={{ fontSize: 30, fontWeight: 'bold' }} color="text.secondary" gutterBottom>
                                                {card.alertsCount}
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography sx={{ fontSize: 20, fontWeight: 'bold' }} color="text.secondary" gutterBottom>
                                                HEALTH
                                            </Typography>
                                        </Grid>
                                        <Grid item >
                                            <ProgressBar
                                                striped now={card.machineHealthStatus}
                                                // label={`Good`}
                                                label={
                                                    card.machineHealthStatus > 70
                                                        ? "Good"
                                                        : card.machineHealthStatus > 50
                                                            ? "Average"
                                                            : card.machineHealthStatus > 40
                                                                ? "Low"
                                                                : "Bad"
                                                }
                                                // variant="success"
                                                variant={
                                                    card.machineHealthStatus > 70
                                                        ? "success"
                                                        : card.machineHealthStatus > 50
                                                            ? "warning"
                                                            : card.machineHealthStatus > 40
                                                                ? "info"
                                                                : "danger"
                                                }
                                                animated
                                                className="custom-progress-bar"
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Link>
                {/* ... CardActions/Button ... */}
            </Grid>
        ));
    };




    return (
        // <Box marginTop={"20px"}>
        <Box marginTop={"18px"}>
            <Grid container spacing={2} /*justifyContent="center" alignItems="center"*/  >
                {renderCards()}
            </Grid>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Button variant="contained" onClick={handlePrev} disabled={currentIndex === 0} style={{ marginLeft: '7px' }}>Previous</Button>
                <Button variant="contained" onClick={handleNext} disabled={currentIndex >= Math.floor(machineList.length / 8)} style={{ marginLeft: '7px' }}>Next</Button>
            </div>
        </Box>
    )
}