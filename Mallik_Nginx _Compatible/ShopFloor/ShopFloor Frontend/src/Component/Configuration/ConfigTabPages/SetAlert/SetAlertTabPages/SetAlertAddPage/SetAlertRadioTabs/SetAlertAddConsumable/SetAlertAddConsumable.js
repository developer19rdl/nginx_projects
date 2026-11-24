// import React, { useEffect, useState } from 'react'
// import Box from '@mui/material/Box';
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import Typography from '@mui/material/Typography';
// import { AppBar, Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Toolbar } from '@mui/material';
// import './SetAlertAddConsumable.css'
// import { Setalert, SetalertMachineView, selectcounsuName } from '../../../../../../../../Services/NodeJsApiServices';
// // import { SetConsumable, Setalert, SetalertMachineView, selectcounsuName } from '../../../../../../../../services/LoginServiceNod';

// const SetAlertAddConsumable = ({selectedTabRadioValue}) => {
//     const [age, setAge] = useState('');
//     const [Ctype, setCtype] = useState('');
//     const [CName, setCName] = useState('');
//     const [fromdate, setfromdate] = useState('');
//     const [todate, settodate] = useState('');
//     const [runHr, setrunHr] = useState('');





//     const [selectedRadioValue, setSelectedRadioValue] = useState('');
//     const[machineNamelist,setmachineNamelist]=useState([])
//     const[consunamelist,setconsunamelist]=useState([])

//     const[machine,setmachine]=useState('')
//     const [refreshData, setRefreshData] = useState(false);

//    useEffect(()=>{
//     SetalertMachineView(handelSucess,handelException)
//    },[refreshData])



   
//    const  handelSucess=(dataObject)=>{

//     setmachineNamelist(dataObject.data)
   
//   }


  
//   const  handelException=(dataObject)=>{

    
//   }

//     const handleSelectChange = (event) => {
//         setmachine(event.target.value);
//         selectcounsuName({id:event.target.value},handelselectConsu,handelexceptionConsu)
//     };



//     const handleSelectChangeCName = (event) => {
//         setCName(event.target.value);
//     };

    
//     const handleSelectChangeCtype = (event) => {
//         setCtype(event.target.value);
//     };

    
//     const handelselectConsu=(dataObject)=>{
//         setconsunamelist(dataObject.data)
//     }

//     const handelexceptionConsu=()=>{
        
//     }


//     const handelsubmit =()=>{
//         Setalert({AlertType:selectedTabRadioValue,
//             SelectMachine:machine,
//             SensorCModule:"",
//             Units:"",
//             FilterType:"",
//             min:"",
//             max:"",
//             AlertMessage:"",
//             ConsumName:CName,
//             ConsumType:Ctype,
//             DateFrom:fromdate,
//             Dateto:todate,
//             RunHours:runHr
//         },handelsubmitdata,hamdelexceptionData)

//       }
//       const handelsubmitdata=(dataObject)=>{

//         // setrows(dataObject.data)
//       }

//       const hamdelexceptionData=()=>{
        
//       }

    

//     return (
//         <Box
//             sx={{
//                 width: '100%'
//             }}
//             className='toolAddCardContainer'
//         >
//             <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#f7f7fc', padding: 2.5, color: '#000000', borderRadius: '5px 5px 0 0' }} >
//                 Set Consumable Threshhold
//             </Typography>
//             <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
//                 <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
//                     <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} >
//                         <Grid item lg={6} md={6} container justifyContent="center">
//                             <Typography>Select Machine</Typography>
//                         </Grid>
//                         <Grid item lg={6} md={6} container justifyContent="center">
//                             <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
//                                 <FormControl fullWidth>
//                                     <InputLabel id="demo-simple-select-label">--Select Machine--</InputLabel>
//                                     <Select
//                                         labelId="demo-simple-select-label"
//                                         id="demo-simple-select"
//                                         value={machine}
//                                         label="Age"
//                                         onChange={handleSelectChange}
//                                     >{
//                                         machineNamelist.map((data)=>(
//                                             <MenuItem key={data.id} value={data.id} >{data.machine_name}</MenuItem>
//                                         ))              
//                                     }
                                     
//                                     </Select>
//                                 </FormControl>
//                             </Box>
//                         </Grid>
//                         <Grid item lg={6} md={6} container justifyContent="center">
//                             <Typography>Consumable Name</Typography>
//                         </Grid>
//                         <Grid item lg={6} md={6} container justifyContent="center">
//                             <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
//                                 <FormControl fullWidth>
//                                     <InputLabel id="demo-simple-select-label">--Select Consumable Name--</InputLabel>
//                                     <Select
//                                         labelId="demo-simple-select-label"
//                                         id="demo-simple-select"
//                                         value={CName}
//                                         label="Age"
//                                         onChange={handleSelectChangeCName}
//                                     >{
//                                         consunamelist.map((data)=>(
//                                             <MenuItem key={data.id} value={data.id} >{data.ConsumableName}</MenuItem>
//                                         ))              
//                                     }
//                                     </Select>
//                                 </FormControl>
//                             </Box>
//                         </Grid>
//                         <Grid item lg={6} md={6} container justifyContent="center">
//                             <Typography>Consumable Type</Typography>
//                         </Grid>
//                         <Grid item lg={6} md={6} container justifyContent="center">
//                             <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
//                                 <FormControl fullWidth>
//                                     <InputLabel id="demo-simple-select-label">--Select Consumable Type--</InputLabel>
//                                     <Select
//                                         labelId="demo-simple-select-label"
//                                         id="demo-simple-select"
//                                         value={Ctype}
//                                         label="Age"
//                                         onChange={handleSelectChangeCtype}
//                                     >
//                                        {
//                                         consunamelist.map((data)=>(
//                                             <MenuItem key={data.id} value={data.id} >{data.ConsumableType}</MenuItem>
//                                         ))              
//                                     }
//                                     </Select>
//                                 </FormControl>
//                             </Box>
//                         </Grid>
//                         <Grid item lg={6} md={6} container justifyContent="center">
//                             <Typography>Date From</Typography>
//                         </Grid>
//                         <Grid item lg={6} md={6} container justifyContent="center">
//                             <TextField type='date' id="per-day-input" variant="outlined" sx={{ width: { lg: "222px", md: '222px', xs: '178px', sm: '222px' } }} 
//                             value={fromdate}
//                             onChange={(e)=>{
//                                 setfromdate(e.target.value)
//                             }}
//                               />
//                         </Grid>
//                         <Grid item lg={6} md={6} container justifyContent="center">
//                             <Typography>Date To</Typography>
//                         </Grid>
//                         <Grid item lg={6} md={6} container justifyContent="center">
//                             <TextField type='date' id="per-day-input" variant="outlined" sx={{ width: { lg: "222px", md: '222px', xs: '178px', sm: '222px' } }} 
//                             value={todate}
//                             onChange={(e)=>{
//                                 settodate(e.target.value)
//                             }}/>
//                         </Grid>
//                         <Grid item lg={6} md={6} container justifyContent="center">
//                             <Typography>Run Hours</Typography>
//                         </Grid>
//                         <Grid item lg={6} md={6} container justifyContent="center">
//                             <TextField type='number' id="per-day-input" label="Run Hours" variant="outlined"   value={runHr} onChange={(e)=>{
//                                 setrunHr(e.target.value)
//                             }}/>
//                         </Grid>
//                         <Grid item lg={12} md={12} container justifyContent="center">
//                             <Button variant="contained" onClick={handelsubmit}>Add</Button>
//                         </Grid>
//                     </Grid>
//                 </CardContent>
//             </Card>
//         </Box>
//     )
// }
// export default SetAlertAddConsumable;
