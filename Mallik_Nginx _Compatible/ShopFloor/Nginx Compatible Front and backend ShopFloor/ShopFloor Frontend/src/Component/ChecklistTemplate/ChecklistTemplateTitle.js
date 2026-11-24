import React, { useState } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

const ChecklistTemplateTitle = (props) => {
    const [file, setFile] = useState(null);

    return (
        <Box
            // sx={{
            //     mb: '10px',
            //     alignItems: 'center',
            //     display: 'flex',
            //     justifyContent: 'space-between',
            //     flexWrap: 'wrap',
            //     marginLeft: '10px',
            //     marginRight: '10px',
            //     marginTop: '10px'
            // }}

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
                // sx={{ m: 1, fontFamily: 'Roboto Slab', fontWeight: 'bold' }}
                // variant="h5"
                sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}
                variant="h5"
                component="span"
                fontFamily={'Roboto Slab'}
            >
                CheckList Template
            </Typography>
            <Box
                sx={{ m: 1 }}
            >
                <Grid container alignItems={'center'} spacing={2}>

                    {/* <Grid item>
                        <div>
                            <Button
                                variant="contained"
                                // color="primary"
                                component="label"
                                sx={{ marginRight: '16px', backgroundColor: '#002D68', height: '40px', borderRadius: '20px' }}
                            >
                                Download Template
                            </Button>

                            <Button
                                variant="contained"
                                // color="primary"
                                component="label"
                                htmlFor="upload-photo"
                                sx={{ backgroundColor: '#002D68', height: '40px', borderRadius: '20px' }}
                            >
                                Upload File
                            </Button>
                            <input
                                id="upload-photo"
                                type="file"
                                style={{ display: 'none' }}
                                // onChange={(e) => setFile(e.target.files[0])}
                            />
                        </div>
                    </Grid> */}
                    <Grid item>
                        <Stack
                            direction="row"
                            spacing={2}

                        >
                            <Fab
                                // style={{ width: '100%', background: '#002D68', color: 'white' }}
                                sx={{
                                    backgroundColor: "#051622", color: "#ffff",
                                    "&:hover": {
                                        backgroundColor: "#183b52", // Change to your desired hover color
                                    },
                                }}
                                onClick={() => {
                                    props.setIsAddButton(true);
                                    props.setEditData([]);
                                    props.setOpen(true);
                                }}
                                variant="extended" size="medium" color="primary" aria-label="add">
                                <AddIcon sx={{ mr: 1 }} />
                                Add Template
                            </Fab>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    )
}

export default ChecklistTemplateTitle