import React, { useState, useEffect } from 'react'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Grid, TextField, List, ListItem, ListItemText, makeStyles } from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import '../MainDashSubComponent/SmallCard.css'
import SettingsIcon from '@mui/icons-material/Settings';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import DiscFullIcon from '@mui/icons-material/DiscFull';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { connect } from 'react-redux';
import noImage from '../../../Assets/Images/noImage.png'
import costumerLogo from '../../../IMAGES/customerLogo.jpg'
import logo from '../../../Assets/Images/logo (2).png'
import { styled } from '@mui/material/styles';

import { FetchDisconnectedStatusService, FetchMachinesStatusService, GetCompanyDetails } from '../../../Services/NodeJsApiServices.js';


const SmallCard = (props) => {
    const { setCurrentDate, currentDate } = props;
    const [companyDetails, setCompanyDetails] = useState('');

    // GET DATE
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-based, so add 1 and pad with '0' if needed
    const day = String(today.getDate()).padStart(2, '0'); // Pad with '0' if needed
    const formattedDate = `${month}/${day}/${year}`;

    // GET TIME
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0'); // Get hours and pad with '0' if needed
    const minutes = String(now.getMinutes()).padStart(2, '0'); // Get minutes and pad with '0' if needed
    const seconds = String(now.getSeconds()).padStart(2, '0'); // Get seconds and pad with '0' if needed
    const currentTimeWithSeconds = `${hours}:${minutes}:${seconds}`;


    const [machineStatus, setMachineStatus] = useState({
        downTime: 0,
        idle: 0,
        downMachineList: ["ff"],
        idleMachineList: []
    });
    const [disconnectStatus, setDisConetcedStatus] = useState({
        // disconnectedDevices: 0,
        disconnectedDevices:[],
        disconnectedDeviceCount:0
    });

    // useEffect(() => {
    //     fetchData(); // Fetch data initially when component mounts
    //     const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds (adjust as needed)
    //     return () => clearInterval(interval); // Cleanup function to clear interval when component unmounts
    // }, []);

    useEffect(() => {
        GetCompanyDetails(handleCompanyDetailsSuccess, handleCompanyDetailsException)
    }, [])

    const handleCompanyDetailsSuccess = (dataObject) => {
        setCompanyDetails(dataObject.data);
    }
    const handleCompanyDetailsException = () => {
    }

    useEffect(() => {
        fetchData(); // Fetch data initially when component mounts
        const interval = setInterval(fetchData, 60000); // Fetch data every minute (60 seconds)
        return () => clearInterval(interval); // Cleanup function to clear interval when component unmounts
    }, []);

    const fetchData = () => {
        FetchMachinesStatusService(handleSuccess, handleException);
        FetchDisconnectedStatusService(handleDiscSuccess,handleDiscExcetion);
    };

    const handleDiscSuccess = (dataObject) => {
        setDisConetcedStatus(dataObject.data);
    };

    const handleDiscExcetion = (errorObject) => {
        // Handle errors if needed
    };

    const handleSuccess = (dataObject) => {
        setMachineStatus(dataObject.data);

    };

    const handleException = (errorObject) => {
        // Handle errors if needed
    };

    const CustomWidthTooltip = styled(({ className, ...props }) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))({
        [`& .${tooltipClasses.tooltip}`]: {
            maxWidth: 500,
            backgroundColor: 'rgba(0, 0, 0, 0.9)', // Black with 50% opacity
            padding: '0px', // Adjust the padding as needed
        },
        [`& .MuiTooltip-arrow`]: {
            color: 'rgba(0, 0, 0, 0.9)', // Change the arrow color to red (adjust as needed)
        },
        [`& .MuiTypography-body1`]: {
            fontSize: '0.8rem',  // Adjust the font size as needed
        },
        [`& .MuiList-root, & .MuiListItem-root`]: {
            padding: 0, // Remove padding from List and ListItem
            margin: 3, // Remove margin from List and ListItem
        },
    });

    const DownList = (
        <List>
            {machineStatus.downMachineList.map((machine, index) => (
                <ListItem key={index}>
                    <ListItemText primary={machine} />
                </ListItem>
            ))}
        </List>
    );

    const IdleList = (
        <List>
            {machineStatus.idleMachineList.map((machine, index) => (
                <ListItem key={index}>
                    <ListItemText sx={{ fontSize: 8 }} primary={machine} />
                </ListItem>
            ))}
        </List>
    );

    const DiscList = (
        <List>
            {disconnectStatus.disconnectedDevices?.length > 0 && 
                disconnectStatus.disconnectedDevices.map((machine, index) => (
                    <ListItem key={index}>
                        <ListItemText sx={{ fontSize: 8 }} primary={machine} />
                    </ListItem>
                ))
            }
        </List>
    );
    


    return (
        <Grid container spacing={2}>
            <Grid item md={6} xs={12} sm={12} lg={2}>
                <Card style={{ height: '123px', backgroundColor: "#5D5D5D", border: '1px solid #00FFFF' }}>
                    <CardContent>
                        <Grid container spacing={7} >
                            <Grid item lg={6} md={6} sm={6} xs={6}>
                                <Typography sx={{ fontSize: 16, fontWeight: 'bold', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} color="White" gutterBottom>
                                    RUNNING
                                </Typography>
                            </Grid>

                            <Grid item lg={6} md={6} sm={6} xs={6}>
                                <Typography style={{ textAlign: 'end' }}>
                                    <SettingsIcon fontSize='large' style={{ color: "#00FF00" }} />
                                </Typography>
                            </Grid>
                        </Grid>

                        <div style={{ display: 'flex', justifyContent: 'center', }}>
                            <Typography color="#00ffff" fontSize={35} fontWeight='bold'>
                                {machineStatus.running}
                            </Typography>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            {/* <Grid item md={2} xs={10} sm={6}> */}
            <Grid item md={6} xs={12} sm={12} lg={2}>
                <CustomWidthTooltip arrow title={DownList}
                    slotProps={{
                        popper: {
                            modifiers: [
                                {
                                    name: 'offset',
                                    options: {
                                        offset: [0, -10],
                                    },
                                },
                            ],
                        },
                    }}
                >
                    <Card
                        style={{ height: '123px', backgroundColor: "#5D5D5D", border: '1px solid #00FFFF' }}

                    >
                        <CardContent>
                            <Grid container spacing={2} di>
                                <Grid item lg={6} md={6} sm={6} xs={6} >
                                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} color="white" gutterBottom>
                                        DOWN
                                    </Typography>
                                </Grid>

                                <Grid item lg={6} md={6} sm={6} xs={6}>
                                    <Typography style={{ textAlign: 'end' }}>
                                        <ReportProblemIcon fontSize='large' style={{ color: "red" }} />
                                    </Typography>
                                </Grid>
                            </Grid>

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Typography color="#00ffff" fontSize={35} fontWeight='bold'>
                                    {machineStatus.downTime}
                                </Typography>
                            </div>
                        </CardContent>
                    </Card>
                </CustomWidthTooltip>
            </Grid>
            <Grid item md={6} xs={12} sm={12} lg={2}>
                <CustomWidthTooltip arrow title={IdleList}
                    slotProps={{
                        popper: {
                            modifiers: [
                                {
                                    name: 'offset',
                                    options: {
                                        offset: [0, -10],
                                    },
                                },
                            ],
                        },
                    }}
                >
                    <Card
                        style={{ height: '123px', backgroundColor: "#5D5D5D", border: '1px solid #00FFFF' }}

                    >
                        <CardContent>
                            <Grid container spacing={2} di>
                                <Grid item lg={6} md={6} sm={6} xs={6}>
                                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} color="white" gutterBottom>
                                        IDLE
                                    </Typography>
                                </Grid>

                                <Grid item lg={6} md={6} sm={6} xs={6}>
                                    <Typography style={{ textAlign: 'end' }}>
                                        <DiscFullIcon fontSize='large' style={{ color: "#ffa500" }} />
                                    </Typography>
                                </Grid>
                            </Grid>

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Typography color="#00ffff" fontSize={35} fontWeight='bold'>
                                    {machineStatus.idle}
                                </Typography>
                            </div>


                        </CardContent>
                    </Card>
                </CustomWidthTooltip>
            </Grid>
            <Grid item md={6} xs={12} sm={12} lg={2}>
            <CustomWidthTooltip arrow title={DiscList}
                    slotProps={{
                        popper: {
                            modifiers: [
                                {
                                    name: 'offset',
                                    options: {
                                        offset: [0, -10],
                                    },
                                },
                            ],
                        },
                    }}
                >
                <Card style={{ height: '123px', backgroundColor: "#5D5D5D", border: '1px solid #00FFFF' }}>
                    <CardContent>
                        <Grid container spacing={8} di>
                            <Grid item lg={6} md={6} sm={6} xs={6}>
                                <Typography sx={{ fontSize: 15, fontWeight: 'bold', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} color="white" gutterBottom>
                                    DISCONNECTED
                                </Typography>
                            </Grid>

                            <Grid item lg={6} md={6} sm={6} xs={6}>
                                <Typography style={{ textAlign: 'end' }}>
                                    <NotificationsActiveIcon fontSize='large' style={{ color: "#ffff00" }} />
                                </Typography>
                            </Grid>
                        </Grid>

                        <div style={{ display: 'flex', justifyContent: 'center', }}>
                            <Typography color="#00ffff" fontSize={35} fontWeight='bold'>
                               {disconnectStatus.disconnectedDeviceCount}
                            </Typography>
                        </div>
                    </CardContent>

                </Card>
                </CustomWidthTooltip>
            </Grid>
            <Grid item md={6} xs={12} sm={12} lg={2}>
                <Card style={{ height: '123px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: "#5D5D5D", border: '1px solid #00FFFF' }}>
                    <CardContent>
                        <TextField
                            fullWidth
                            type="date"
                            variant="outlined"
                            required
                            value={currentDate}
                            onChange={(e) => {
                                setCurrentDate(e.target.value);
                            }}
                            autoComplete="off"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                style: { color: 'white', borderColor: 'white' },
                                // max: currentDateValidator()
                            }}
                            style={{
                                width: '100%', // Adjust the width as needed
                                height: '18px',
                                // color: 'white', // Change text color to white
                                // backgroundColor: 'white', // Adjust the height as needed
                            }}
                        />
                        {/* <Typography variant="h5" component="div">
                        </Typography> */}

                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '38px' }}>
                            <Typography color="white" fontWeight='bold'>
                                {formattedDate}
                            </Typography>
                            <Typography color="white" fontWeight='bold'>
                                {currentTimeWithSeconds}
                            </Typography>
                        </div>

                    </CardContent>
                    {}

                </Card>
            </Grid>
            <Grid item md={6} xs={12} sm={12} lg={2}>
                <Card style={{ height: '123px', backgroundColor: "#5D5D5D", border: '1px solid #00FFFF' }}>
                    <CardContent>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70px', backgroundColor: '#ffffff' }}>
                            {/* <img src={companyDetails ? `${process.env.REACT_APP_API_URL}${companyDetails.customerLogo}` : noImage} alt="Company Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} /> */}
                            <img src={companyDetails ? `${process.env.REACT_APP_IMAGE_URL}${companyDetails.customerLogo}` : noImage} alt="Company Logo" style={{ maxWidth: '100%', maxHeight: '100%', width: '100px' }} />
                            {/* <img src={costumerLogo} alt="Company Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} /> //frontend */}

                        </div>
                        <div style={{ textAlign: 'center', marginTop: '10px' }}> {/* Center the typography */}
                            <Typography color="#00ffff" fontSize={13} fontWeight='bold'>
                                {companyDetails ? companyDetails.companyName : "Company Name"}
                            </Typography>
                        </div>
                    </CardContent>
                </Card>
            </Grid>


        </Grid >
    )
}
// export default SmallCard;
const mapStateToProps = ({ config }) => {
    const { } = config;
    return {};
};

export default connect(mapStateToProps, { })(SmallCard);
