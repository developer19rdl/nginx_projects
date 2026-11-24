import React from 'react';
import { Box, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

const MeterCategoryToolbar = (props) => {
    return (
        <Box
            sx={{
                mb: '0px',
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                backgroundColor: '#f8f8ff',
                padding: '15px',
                border: '1px solid #e0e0e0'
            }}
        >
            <Typography sx={{ m: 0 }} variant="h5" component="span" fontFamily={'Roboto Slab'}>
                Meter Category List
            </Typography>
            <Box
                onClick={() => {
                    props.setIsAddButton(true);
                    props.setEditData({});
                    props.setOpen(true);
                }}
            >
                <Stack direction="row" spacing={2}>
                    <Fab
                        variant="extended"
                        size="medium"
                        color="primary"
                        aria-label="add"
                        sx={{
                            backgroundColor: '#0e2d5d', color: '#ffff',
                            '&:hover': { backgroundColor: '#183b52' },
                        }}
                    >
                        <AddIcon sx={{ mr: 1 }} />
                        Add Category
                    </Fab>
                </Stack>
            </Box>
        </Box>
    );
};

export default MeterCategoryToolbar;
