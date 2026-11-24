import React from 'react';
import { Box, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

const ToolsToolbar = (props) => {
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
            <Typography
                sx={{ m: 0 }}
                variant="h5"
                component="span"
                fontFamily={'Roboto Slab'}
            >
                Tool List
            </Typography>
            {/* {props.userAccess.add && ( */}
            <Box
                // sx={{ mb: 1 }}
                onClick={() => {
                    props.setIsAddButton(true);
                    props.setEditConfigSetup([]);
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
                            backgroundColor: "#051622", color: "#ffff",
                            "&:hover": {
                                backgroundColor: "#183b52", // Change to your desired hover color
                            },
                        }}
                    >
                        <AddIcon sx={{ mr: 1 }} />
                        Add Tools
                    </Fab>
                </Stack>
            </Box>
            {/* )} */}
        </Box>
    );
}
export default ToolsToolbar;