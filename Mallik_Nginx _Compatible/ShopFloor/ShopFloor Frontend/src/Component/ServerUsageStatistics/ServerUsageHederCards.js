import React, { useState, useEffect } from 'react'
import './ServerUsageStatistics.css'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import { FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material';
import { FetcserverInformationService } from '../../Services/NodeJsApiServices';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));



const ServerUsageHederCards = () => {
    const [serverStatus, setServerStatus] = useState('');



    useEffect(() => {
        fetchData(); // Fetch data initially when component mounts
        const interval = setInterval(fetchData, 60000); // Fetch data every minute (60 seconds)
        return () => clearInterval(interval); // Cleanup function to clear interval when component unmounts
    }, []);

    const fetchData = () => {
        FetcserverInformationService(handleSuccess, handleException);
    };

    const handleSuccess = (dataObject) => {
        setServerStatus(dataObject.data);
    };

    const handleException = (errorObject) => {
        // Handle errors if needed
    };
    return (
        <Box sx={{ width: '100%', padding: 1 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} lg={2} md={6}>
                    <Item style={{ height: '80px', display: 'flex', justifyContent: "center", alignItems: 'center', color: '#000000', fontWeight: 'bold' }}>
                        <AccountBalanceIcon />
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} lg={3} md={6}>
                    <Item style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: '80px' }}>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>CPU LOAD</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold', color: '#000000' }}>{serverStatus.cpuLoad}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>SET CPU LOAD</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold', color: '#000000' }}>{serverStatus.setCpuLoad}</Typography>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} lg={3} md={6}>
                    <Item style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: '80px' }}>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>SERVER LOAD</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold', color: '#000000', fontWeight: 'bold' }}>{serverStatus.serverLoad}</Typography>
                            </Grid>
                        </Grid>

                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>SET SERVER LOAD</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold', color: '#000000' }}>{serverStatus.setServerLoad}</Typography>
                            </Grid>
                        </Grid>


                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} lg={3} md={6}>
                    <Item style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: '80px' }}>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>MEMORY USAGE</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold', color: '#000000', fontWeight: 'bold' }}>{serverStatus.memoryUsage}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>SET MEMORY USAGE</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold', color: '#000000' }}>{serverStatus.setMemoryUsage}</Typography>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} lg={1} md={12}>
                    <Item style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', height: '80px' }}>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>ALERTS</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold', color: '#000000' }}>1</Typography>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
            </Grid>
        </Box>
    )
}

export default ServerUsageHederCards
