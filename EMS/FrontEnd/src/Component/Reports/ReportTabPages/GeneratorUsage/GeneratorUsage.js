import React, { useState } from "react";
import './GeneratorUsage.css'
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Button, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const GeneratorUsage = () => {
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
            <div className="generator_bottomContainer">
                <div className="generator_headerContainer">
                    <span>GENEARATOR USAGE REPORT</span>
                </div>
                <div className="generator_bottm_date_containet">
                    <div className="generator_from_date_Container">
                        <div className="generator_from_date_header">
                            <span>Date From:</span>
                        </div>
                        <div>
                            <input
                                type="date"
                                value={selectedDate || ''}
                                onChange={handleDateChange}
                                className="generator_datePicker"
                            />
                        </div>
                    </div>
                    <div className="generator_to_date_Container">
                        <div className="generator_from_date_header">
                            <span>Date To:</span>
                        </div>
                        <div>
                            <input
                                type="date"
                                value={selectedDate || ''}
                                onChange={handleDateChange}
                                className="generator_datePicker"
                            />
                        </div>
                    </div>
                    <div className="generator_button_container">
                        <Button variant="contained">Search</Button>
                    </div>
                </div>
            </div>

            <div className="energy_table_bottomContainer">
                <div className="energy_headerContainer">
                    <span>Generator Usage Report</span>
                </div>
                <div className="energy_table_sub_bottomContainer">
                    <table id="customers">
                        <tr>
                            <th>Date</th>
                            <th>Initial[Ltr]</th>
                            <th>Suction[Ltr]</th>
                            <th>Return[Ltr]</th>
                            <th>Consumption[Ltr]</th>
                            <th>Top-up[Ltr]</th>
                            <th>Balance[Ltr]</th>
                            <th>Running Mins</th>
                            <th>Unit Consumption[kwh/Day]</th>
                        </tr>
                        <tr>
                            <td>2023-09-01</td>
                            <td>309.23</td>
                            <td>82.55</td>
                            <td>14.65</td>
                            <td>136.44</td>
                            <td>29.88</td>
                            <td>0</td>
                            <td>0.58</td>
                            <td>8.14</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }} colSpan={3}>TOTAL</td>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>980.4</td>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>1689.89</td>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>2670.29</td>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }}></td>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>162.68</td>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>246.39</td>
                        </tr>
                        <tr>
                            <td colSpan={9} className="bottomButtonContainer">
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
export default GeneratorUsage;