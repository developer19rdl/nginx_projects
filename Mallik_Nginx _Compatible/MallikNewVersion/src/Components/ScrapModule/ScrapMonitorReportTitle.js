import React from 'react';
import { Box, Typography } from '@mui/material';
import ApplicationStore from '../../Utility/localStorageUtil';

const ScrapMonitorReportTitle = (props) => {
    const storageData = ApplicationStore().getStorage('userDetails');
    const userDetails = storageData?.userDetails || {};
    const userPermission = userDetails?.groupRights?.filter((data) => data?.menu?.toLowerCase() === "scrapmonitorreport");

    return (
        <Box
            sx={{
                mb: '15px',
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                marginLeft: '10px',
                marginRight: '10px'
            }}
        >
            <Typography
                sx={{ m: 1, fontFamily: 'Roboto Slab', fontWeight: 'bold', color: '#002D68' }}
                variant="h5"
            >
                Scrap Monitoring Report
            </Typography>
        </Box>
    );
};

export default ScrapMonitorReportTitle;
