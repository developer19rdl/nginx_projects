// import React, { useState } from 'react'
// import Box from '@mui/material/Box';
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import Typography from '@mui/material/Typography';
// import { AppBar, Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Toolbar } from '@mui/material';
// import './SetAlertAddPage.css'
// import SetAlertAddSensor from './SetAlertRadioTabs/SetAlertAddSensor/SetAlertAddSensor';
// import SetAlertAddConsumable from './SetAlertRadioTabs/SetAlertAddConsumable/SetAlertAddConsumable';
// import { useEffect } from 'react';
// // import { SetalertMachineView } from '../../../../../../services/LoginServiceNod';
// // import { ROOT_CYCLE } from '../../../../../Cycle';

// const SetAlertAddPage = () => {
//     const [selectedTabRadioValue, setSelectedTabRadioValue] = useState('sensor');

//     const handleTabRadioChange = (event) => {
      
//         setSelectedTabRadioValue(event.target.value);


//     };



//     return (
//         <>
//             <FormControl component="fieldset" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '25px' }}>
//                 <RadioGroup
//                     aria-label="options"
//                     name="options"
//                     value={selectedTabRadioValue}
//                     onChange={handleTabRadioChange}
//                     sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}
//                 >
//                     <FormControlLabel
//                         value="sensor"
//                         control={<Radio />}
//                         label="Sensor"
//                     />
//                     <FormControlLabel
//                         value="consumable"
//                         control={<Radio />}
//                         label="Consumable"
//                     />
//                 </RadioGroup>
//             </FormControl>
//             {
//                 selectedTabRadioValue === "sensor" ?
//                     <SetAlertAddSensor  selectedTabRadioValue={selectedTabRadioValue} setSelectedTabRadioValue={setSelectedTabRadioValue}/>
//                     :
//                     <SetAlertAddConsumable  selectedTabRadioValue={selectedTabRadioValue} setSelectedTabRadioValue={setSelectedTabRadioValue}/>
//             }
//         </>
//     )
// }
// export default SetAlertAddPage;

