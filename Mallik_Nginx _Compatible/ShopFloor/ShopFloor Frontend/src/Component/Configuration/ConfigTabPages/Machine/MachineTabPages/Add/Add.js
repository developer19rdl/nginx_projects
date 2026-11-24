import React from 'react'
import './Add.css';
import { Grid, Typography, FormControl, TextField, Button } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const Add = () => {
  const [age, setAge] = React.useState('');

  const handleSelectChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <div className='add_container'>
      <div className='add_subcontainer'>
        <span className='add_headerText'>Add Max Capacity</span>
      </div>
      <div>
        <div className='add_bottomContainer'>
          <div className='add_bottomSubContainer'>
            <div className='add_fieldHeader'>
              <Typography>Select Machine</Typography>
            </div>
            <div className='add_field'>
              <Box width={{ lg: "222px", md: '222px' ,xs:'178px', sm:'222px'}}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">--Select Machine--</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={age}
                    label="Age"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </div>
          </div>
        </div>
        <div className='add_bottomContainer'>
          <div className='add_bottomSubContainer'>
            <div className='add_fieldHeader'>
              <Typography>Max Capacity</Typography>
            </div>
            <div className='add_field'>
              <Box width={{ lg: "222px", md: '222px' ,xs:'178px', sm:'222px'}}>
                <TextField id="outlined-basic" label="Max Capacity" variant="outlined" />
              </Box>
            </div>
          </div>
        </div>
        <div className='add_bottomContainer'>
          <div className='add_bottomSubContainer'>
            <div className='add_fieldHeader'>
              <Typography>Loading Time</Typography>
            </div>
            <div className='add_field'>
              <Box width={{ lg: "222px", md: '222px' ,xs:'178px', sm:'222px'}}>
                <TextField type='number' id="outlined-basic" label="Seconds" variant="outlined" />
              </Box>
            </div>
          </div>
        </div>
        <div className='add_bottomContainer'>
          <div className='add_bottomSubContainer'>
            <div className='add_fieldHeader'>
              <Typography>Unloading Time</Typography>
            </div>
            <div className='add_field'>
              <Box width={{ lg: "222px", md: '222px' ,xs:'178px', sm:'222px'}}>
                <TextField type='number' id="outlined-basic" label="Seconds" variant="outlined" />
              </Box>
            </div>
          </div>
        </div>
        <div className='add_bottomContainer'>
          <div className='add_bottomSubContainer'>
            <div className='add_fieldHeader'>
              <Typography>Max. Production/Hour</Typography>
            </div>
            <div className='add_field'>
              <Box  width={{ lg: "222px", md: '222px' ,xs:'178px', sm:'222px'}}>
                <TextField type='number' id="outlined-basic" label="Max. Production/Hour" variant="outlined" />
              </Box>
            </div>
          </div>
        </div>
        <Grid container width={'100%'} justifyContent={'center'} marginBottom={4}>
          <Grid item>
            <Button variant="contained">Add</Button>
          </Grid>
        </Grid>
      </div>
    </div>
  )
}
export default Add;
