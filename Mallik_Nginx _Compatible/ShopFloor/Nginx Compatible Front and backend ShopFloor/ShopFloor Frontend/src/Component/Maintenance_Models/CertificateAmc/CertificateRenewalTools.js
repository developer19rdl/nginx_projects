import React from 'react'
import { Box, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

const CertificateRenewalTools = (props) => {
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
        AMC List
      </Typography>
      
    </Box>
  )
}

export default CertificateRenewalTools
