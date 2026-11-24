import React from 'react'
import { Box, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

const MstrNatureTools = (props) => {
  return (
    <Box
      sx={{
        mb: '10px',
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}>
      <Typography
        sx={{ m: 1 }}
        variant="h5">
        Nature of Problem List
      </Typography>
      <Box
        sx={{ m: 1 }}
        onClick={() => {
          props.setIsAddButton(true);
          props.setOpen(true);
          props.setEditNature('');
        }}>
        <Stack direction="row" spacing={2}>
          <Fab 
             sx={{
                backgroundColor: "#051622", color: "#ffff",
                "&:hover": {
                  backgroundColor: "#183b52", // Change to your desired hover color
                },
              }}
            variant="extended" size="medium"  aria-label="add">
            <AddIcon sx={{ mr: 1 }} />
            Add Nature of Problem
          </Fab>
        </Stack>
      </Box>
    </Box>
  )
}

export default MstrNatureTools
