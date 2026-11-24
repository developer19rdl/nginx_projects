import React from 'react'
import { Box, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

const MstrProblemTools = (props) => {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        backgroundColor: '#f8f8ff',
        padding: '15px',
        border: '1px solid #e0e0e0'
      }}>
      <Typography
        sx={{ m: 1 }}
        variant="h5">
        Problem Category List
      </Typography>
      <Box
        sx={{ m: 1 }}
        onClick={() => {
          props.setIsAddButton(true);
          props.setOpen(true);
          props.setEditProblem('');
        }}>
        <Stack direction="row" spacing={2}>
          <Fab
            sx={{
              backgroundColor: "#051622", color: "#ffff",
              "&:hover": {
                backgroundColor: "#183b52", // Change to your desired hover color
              },
            }}
            variant="extended" size="medium" aria-label="add">
            <AddIcon sx={{ mr: 1 }} />
            Add Problem Category
          </Fab>
        </Stack>
      </Box>
    </Box>
  )
}

export default MstrProblemTools
