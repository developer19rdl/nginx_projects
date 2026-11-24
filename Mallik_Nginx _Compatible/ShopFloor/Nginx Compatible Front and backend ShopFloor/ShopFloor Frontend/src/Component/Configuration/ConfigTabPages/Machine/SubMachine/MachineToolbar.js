import React from 'react';
import { Box, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import  Button  from '@mui/material/Button';

const MachineToolbar = (props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        backgroundColor: '#f8f8ff',
        padding: '15px',
        border: '1px solid #e0e0e0'
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        fontFamily="Roboto Slab"
      >
        Machine
      </Typography>

      <Stack direction="row" spacing={2}>
        {/* DOWNLOAD EXCEL */}
        <Fab
          variant="extended"
          size="medium"
          onClick={props.handleDownloadExcel}
          sx={{
            backgroundColor: "#051622",
            color: "#fff",
            "&:hover": { backgroundColor: "#183b52" },
          }}
        >
          Download Master List
        </Fab>

        {/* ADD MACHINE */}
        <Fab
          variant="extended"
          size="medium"
          onClick={() => {
            props.setIsAddButton(true);
            props.setEditConfigSetup([]);
            props.setOpen(true);
          }}
          sx={{
            backgroundColor: "#051622",
            color: "#fff",
            "&:hover": { backgroundColor: "#183b52" },
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          Add Machine
        </Fab>
      </Stack>
    </Box>
  );
};

export default MachineToolbar;
