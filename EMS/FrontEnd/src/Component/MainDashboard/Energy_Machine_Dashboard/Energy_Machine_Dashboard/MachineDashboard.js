import React from 'react'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box, Grid, TextField } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import DiscFullIcon from '@mui/icons-material/DiscFull';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DeleteIcon from '@mui/icons-material/Delete';

import logo from '../../../../Assets/Images/logo (2).png'

import machine from '../../../../Assets/Images/mg.png'

import '../Energy_Machine_Dashboard/MachineDashboard.css'
import CancelIcon from '@mui/icons-material/Cancel';
export const MachineDashboard = () => {
    return (
        <Box margin={2}>
            <Grid container>
                <Grid item lg={12} >
                    <Grid container spacing={2}>
                        <Grid item md={2} xs={12} sm={12} lg={2}>
                            <Card style={{ height: '123px' }}>
                                <CardContent>
                                    <Grid container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }} direction={'column'}>
                                        <Grid item lg={6} md={6} sm={6} xs={6}>
                                            <div >
                                                <img src={machine} alt="Image Description" style={{ maxWidth: '100%', height: '50px', maxHeight: '100%', backgroundColor: '#949494' }} />
                                            </div>
                                        </Grid>
                                        <Grid item lg={6} md={6} sm={6} xs={6}>
                                            <div style={{ textAlign: 'center', paddingBottom: '8%', paddingTop: '2%' }}> {/* Center the typography */}
                                                <Typography color="text.secondary" fontSize={20} fontWeight='bold'>
                                                    Punching Machine
                                                </Typography>
                                            </div>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item md={7} xs={12} sm={12} lg={4}>
                            <Card style={{ height: '123px' }}>
                                <CardContent>
                                    <Grid container direction={'row'} spacing={5} justifyContent="center" alignItems="center">
                                        <Grid item md={4} xs={12} sm={12} lg={4}>
                                            <Grid container direction={'column'} justifyContent="center" alignItems="center">
                                                <Grid item>
                                                    <Typography variant="button" gutterBottom fontWeight={'bold'} fontSize={17}>
                                                        ACTUAL
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Grid container alignItems="center" spacing={1}>
                                                        <Grid item>
                                                            <Typography sx={{ fontSize: 30, fontWeight: 'bold' }} color="text.secondary" gutterBottom>
                                                                92
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item md={4} xs={12} sm={12} lg={4}>
                                            <Grid container direction={'column'} justifyContent="center" alignItems="center" >
                                                <Grid item>
                                                    <Typography variant="button" gutterBottom fontWeight={'bold'} fontSize={17}>
                                                        PLANNED
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Grid container alignItems="center" spacing={1}>
                                                        <Grid item>
                                                            <Typography sx={{ fontSize: 30, fontWeight: 'bold' }} color="text.secondary" gutterBottom>
                                                                150
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item md={4} xs={12} sm={12} lg={4}>
                                            <Grid container direction={'column'} justifyContent="center" alignItems="center">
                                                <Grid item>
                                                    <Typography variant="button" gutterBottom fontWeight={'bold'} fontSize={17}>
                                                        CAPACITY
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Grid container alignItems="center" spacing={1}>
                                                        <Grid item>
                                                            <Typography sx={{ fontSize: 30, fontWeight: 'bold' }} color="text.secondary" gutterBottom>
                                                                240
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item md={3} xs={12} sm={12} lg={2}>
                            <Card style={{ height: '123px' }}>
                                <CardContent>
                                    <Grid container spacing={7} alignItems="center">
                                        <Grid item lg={6} md={6} sm={6} xs={6}>
                                            <Grid container direction={'column'} alignItems="center">
                                                <Grid item>
                                                    <Typography sx={{ fontSize: 17, fontWeight: 'bold' }} color="text.secondary" gutterBottom>
                                                        SCRAP
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                        <Typography color="text.secondary" fontSize={30} fontWeight='bold'>
                                                            13
                                                        </Typography>
                                                    </div>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item lg={6} md={6} sm={6} xs={6}>
                                            <DeleteIcon style={{ fontSize: 50 }} />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item md={6} xs={12} sm={12} lg={2}>
                            <Card style={{ height: '123px' }}>
                                <CardContent>
                                    <Grid container spacing={7} alignItems="center">
                                        <Grid item lg={6} md={6} sm={6} xs={6}>
                                            <Grid container direction={'column'} alignItems="center">
                                                <Grid item>
                                                    <Typography sx={{ fontSize: 17, fontWeight: 'bold' }} color="text.secondary" gutterBottom>
                                                        REJECT
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                        <Typography color="text.secondary" fontSize={30} fontWeight='bold'>
                                                            13
                                                        </Typography>
                                                    </div>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item lg={6} md={6} sm={6} xs={6}>
                                            <CancelIcon style={{ fontSize: 50 }} />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item md={6} xs={12} sm={12} lg={2}>
                            <Card style={{ height: '123px' }}>
                                <CardContent>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50px' }}>
                                        <img src={logo} alt="Image Description" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                    </div>
                                    <div style={{ textAlign: 'center', paddingBottom: '13%', marginTop: '1%' }}> {/* Center the typography */}
                                        <Typography color="text.secondary" fontSize={16} fontWeight='bold'>
                                            Kewaunee 4.0
                                        </Typography>
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid >
                </Grid>
            </Grid>
        </Box>
    )
}
