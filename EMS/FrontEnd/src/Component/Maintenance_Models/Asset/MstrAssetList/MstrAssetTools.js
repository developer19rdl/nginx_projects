import React from 'react'
import { Box, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

const MstrAssetTools = (props) => {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        backgroundColor: '#f8f8ff',
        padding: '15px',
        border: '1px solid #e0e0e0',
        marginBottom: '20px'
      }}>
      <Typography
        sx={{ m: 1 }}
        variant="h5">
        Asset View
      </Typography>
      {}
    </Box>
  )
}

export default MstrAssetTools
