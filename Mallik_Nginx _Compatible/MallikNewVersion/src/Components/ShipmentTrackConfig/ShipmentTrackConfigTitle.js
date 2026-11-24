import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import ApplicationStore from '../../Utility/localStorageUtil';

const ShipmentTrackConfigTitle = (props) => {
    const { userDetails } = ApplicationStore()?.getStorage('userDetails') || {};

    // Normalize role checking
    const isAdmin =
        userDetails?.role?.toLowerCase() === "admin" || userDetails?.isSuperUser === true;

    const userPermission = userDetails?.groupRights?.filter((data) => data?.menu?.toLowerCase() === "dispatchmaster");
    const canAdd = isAdmin || (userPermission && userPermission[0]?.addData === 1);

    return (
        <Box
            sx={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                marginBottom: '9px'
            }}
        >
            <Typography
                sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold' }}
                variant="h5"
            >
                Shipment Tracking Email Config Overview
            </Typography>
            <Box>
                <Grid item>
                    <Stack direction="row" spacing={2}>
                        <Fab
                            style={{
                                width: '100%',
                                background: canAdd ? '#002D68' : 'gray',
                                color: 'white'
                            }}
                            disabled={!canAdd}
                            onClick={() => {
                                props.setIsAddButton(true);
                                props.setEditData([]);
                                props.setOpen(true);
                            }}
                            variant="extended"
                            size="medium"
                            color="primary"
                            aria-label="add"
                        >
                            <AddIcon sx={{ mr: 1 }} />
                            Add Shipment Config
                        </Fab>
                    </Stack>
                </Grid>
            </Box>
        </Box>
    );
};

export default ShipmentTrackConfigTitle;
