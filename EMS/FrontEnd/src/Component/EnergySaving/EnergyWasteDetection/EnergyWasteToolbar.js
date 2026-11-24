import React from 'react';
import { Box, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

const EnergyWasteToolbar = ({ setIsAddButton, setEditData, setOpen }) => {
    return (
        <Box sx={{ mb: 1, alignItems: 'center', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mt: 2 }}>
            <Typography variant="h5" component="span">
                Energy Waste Detection
            </Typography>
            <Box sx={{ mb: 1 }} onClick={() => { setIsAddButton(true); setEditData({}); setOpen(true); }}>
                <Stack direction="row" spacing={2}>
                    <Fab variant="extended" size="medium" color="primary" aria-label="add">
                        <AddIcon sx={{ mr: 1 }} />
                        Add Waste Record
                    </Fab>
                </Stack>
            </Box>
        </Box>
    );
};

export default EnergyWasteToolbar;
