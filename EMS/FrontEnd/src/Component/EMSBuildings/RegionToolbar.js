import { Box, Fab, Grid, Stack, Typography } from "@mui/material";
import NotificationBar from "../Notification/NotificationBar";
import AddIcon from '@mui/icons-material/Add';
import { useState } from "react";

export function RegionToolbar(props) {

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });


    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };


    return (
        <Box
            sx={{
                // mb: '0px',
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                backgroundColor: '#f8f8ff',
                padding: '15px',
                border: '1px solid #e0e0e0'
            }}
        >
            <Typography
                sx={{ m: 0 }}
                variant="h5"
                component="span"
                fontFamily={'Roboto Slab'}
            >
                Region Management
            </Typography>
            <Box
            // sx={{ m: 1 }}
            >
                <Grid container alignItems={'center'} spacing={2}>



                    <Grid item>
                        <Stack direction="row" spacing={2}
                            onClick={() => {
                                props.setIsAddButton(true);
                                props.setEditData([]);
                                props.setOpen(true);
                            }}>
                            <Fab
                                style={{ background: '#051622', color: 'white' }}
                                variant="extended" size="medium" color="primary" aria-label="add">
                                <AddIcon sx={{ mr: 1 }} />
                                Add Region
                            </Fab>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Box>
    )
}

