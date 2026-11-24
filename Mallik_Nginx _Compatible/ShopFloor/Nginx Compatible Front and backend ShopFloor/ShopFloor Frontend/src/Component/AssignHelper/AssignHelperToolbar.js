

import { Box, Fab, Stack, Typography } from '@mui/material'
import React from 'react'
import AddIcon from '@mui/icons-material/Add';
const AssignHelperToolbar = (props) => {
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
                sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}
                variant="h5"
                component="span"
                fontFamily={'Roboto Slab'}
            >
                Assign Helper
            </Typography>
            <Box
                sx={{ m: 1 }}
                onClick={() => {
                    props.setIsAddButton(true);
                    props.setEditHelper([]);
                    props.setOpen(true);
                }}
            >
                <Stack direction="row" spacing={2}>
                    <Fab variant="extended"
                        size="medium"
                        color="primary"
                        aria-label="add"
                        sx={{
                            backgroundColor: "#051622", color: "#ffff",
                            "&:hover": {
                                backgroundColor: "#183b52", // Change to your desired hover color
                            },
                        }}>
                        <AddIcon sx={{ mr: 1 }} />
                        Add Assign Helper
                    </Fab>
                </Stack>

            </Box>
        </Box>
    )
}

export default AssignHelperToolbar