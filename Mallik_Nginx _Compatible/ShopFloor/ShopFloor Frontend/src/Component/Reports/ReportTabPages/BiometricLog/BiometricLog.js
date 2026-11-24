import React, { useState } from "react";
import './BiometricLog.css';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Button, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const BiometricLog = () => {
    const [selectedValue, setSelectedValue] = useState('Operator');
    const [selectedDate, setSelectedDate] = useState(null);
    const [age, setAge] = React.useState('');

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleSelectChange = (event) => {
        setAge(event.target.value);
    };

    return (
        <>
            <FormControl component="fieldset" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                <RadioGroup
                    aria-label="options"
                    name="options"
                    value={selectedValue}
                    onChange={handleChange}
                    sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}
                >
                    <FormControlLabel
                        value="Operator"
                        control={<Radio />}
                        label="Operator"
                    />
                    <FormControlLabel
                        value="Machine"
                        control={<Radio />}
                        label="Machine"
                    />
                </RadioGroup>
            </FormControl>
            <div className="biometric_bottomContainer">
                <div className="biometric_headerContainer">
                    <span>{selectedValue === "Operator" ? "BIOMETRIC LOG REPORT(OPERATOR)" : "BIOMETRIC LOG REPORT(MACHINE)"}</span>
                </div>
                <div className="biometric_bottm_date_containet">
                    <div className="biometric_from_date_Container">
                        <div className="biometric_from_date_header">
                            <span>Date From:</span>
                        </div>
                        <div>
                            <input
                                type="date"
                                value={selectedDate || ''}
                                onChange={handleDateChange}
                                className="biometric_datePicker"
                            />
                        </div>
                    </div>
                    <div className="biometric_to_date_Container">
                        <div className="biometric_from_date_header">
                            <span>Date To:</span>
                        </div>
                        <div>
                            <input
                                type="date"
                                value={selectedDate || ''}
                                onChange={handleDateChange}
                                className="biometric_datePicker"
                            />
                        </div>
                    </div>
                    <div className="biometric_to_date_Container">
                        <div className="biometric_from_date_header">
                            <span>Select {selectedValue === "Operator" ? "Operator" : "Machine"}:</span>
                        </div>
                        <div>
                            <Box sx={{ minWidth: 180 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Select {selectedValue === "Operator" ? "Operator" : "Machine"}</InputLabel>
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
                    <div className="biometric_button_container">
                        <Button variant="contained">Search</Button>
                    </div>
                </div>
            </div>

            <div className="energy_table_bottomContainer">
                <div className="energy_headerContainer">
                    <span>Biometric Log Report [ 443 ]</span>
                </div>
                <div className="energy_table_sub_bottomContainer">
                    <table id="customers">
                        <tr>
                            <th>Operator Name</th>
                            <th>Operator Id</th>
                            <th>Machine</th>
                            <th>Department</th>
                            <th>Login Date</th>
                            <th>Login Time</th>
                            <th>Logout Time</th>
                            <th>Total</th>
                        </tr>
                        <tr>
                            <td>Raghavendra. A.G</td>
                            <td>445</td>
                            <td>RG-35(Bending Machine)</td>
                            <td>Bending</td>
                            <td>2023-09-01</td>
                            <td>08:25:16</td>
                            <td>17:54:13</td>
                            <td>9:28:57</td>
                        </tr>
                        <tr>
                            <td>Raghavendra. A.G</td>
                            <td>445</td>
                            <td>RG-35(Bending Machine)</td>
                            <td>Bending</td>
                            <td>2023-09-01</td>
                            <td>08:25:16</td>
                            <td>17:54:13</td>
                            <td>9:28:57</td>
                        </tr>
                        <tr>
                            <td colSpan={17} className="bottomButtonContainer">
                                <Grid container spacing={2} justifyContent={'center'}>
                                    <Grid item>
                                        <Button variant="contained">Download CSV</Button>
                                    </Grid>
                                    <Grid item>
                                        <Button variant="contained">Download PDF</Button>
                                    </Grid>
                                </Grid>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </>
    )
}
export default BiometricLog;