import React, { useState } from "react";
import './PowderConsumption.css';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Button, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const PowderConsumption = () => {
    const [selectedValue, setSelectedValue] = useState('date');
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
            <div className="powder_bottomContainer">
                <div className="powder_headerContainer">
                    <span>POWDER CONSUMPTION REPORT</span>
                </div>
                <div className="powder_bottm_date_containet">
                    <div className="powder_from_date_Container">
                        <div className="powder_from_date_header">
                            <span>Date From:</span>
                        </div>
                        <div>
                            <input
                                type="date"
                                value={selectedDate || ''}
                                onChange={handleDateChange}
                                className="powder_datePicker"
                            />
                        </div>
                    </div>
                    <div className="powder_to_date_Container">
                        <div className="powder_from_date_header">
                            <span>Date To:</span>
                        </div>
                        <div>
                            <input
                                type="date"
                                value={selectedDate || ''}
                                onChange={handleDateChange}
                                className="powder_datePicker"
                            />
                        </div>
                    </div>
                    <div className="powder_button_container">
                        <Button variant="contained">Search</Button>
                    </div>
                </div>
            </div>

            <div className="energy_table_bottomContainer">
                <div className="energy_headerContainer">
                    <span>Powder Consumption/Day Report</span>
                </div>
                <div className="energy_table_sub_bottomContainer">
                    <table id="customers">
                        <tr>
                            <th></th>
                            <th colSpan={3}>Powder Consumption/Day [kg]</th>
                            <th></th>
                        </tr>
                        <tr>
                            <th>Date</th>
                            <th>Loaded[Kg]</th>
                            <th>Balance[kg]</th>
                            <th>Waste[kg]</th>
                            <th>Consumed[kg]</th>
                        </tr>
                        <tr>
                            <td>2023/09/10</td>
                            <td>1.74</td>
                            <td>82.55</td>
                            <td>136.44</td>
                            <td>75.1</td>
                        </tr>
                        <tr>
                            <td>2023/09/11</td>
                            <td>41.26</td>
                            <td>62.11</td>
                            <td>197.54</td>
                            <td>38.14</td>
                        </tr>
                        <tr>
                            <td>2023/09/12</td>
                            <td>10.14</td>
                            <td>132.85</td>
                            <td>85.02</td>
                            <td>-22.2</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>TOTAL</td>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>980.4</td>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>1689.89</td>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>2670.29</td>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>796.42</td>
                        </tr>
                        <tr>
                            <td colSpan={5} className="bottomButtonContainer">
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
export default PowderConsumption;