import React, { useState } from "react";
import './Gas.css'
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Button, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

const data = [
    {
        "name": "Page A",
        "uv": 4000,
        "pv": 2400,
        "amt": 2400
    },
    {
        "name": "Page B",
        "uv": 3000,
        "pv": 1398,
        "amt": 2210
    },
    {
        "name": "Page C",
        "uv": 2000,
        "pv": 9800,
        "amt": 2290
    },
    {
        "name": "Page D",
        "uv": 2780,
        "pv": 3908,
        "amt": 2000
    },
    {
        "name": "Page E",
        "uv": 1890,
        "pv": 4800,
        "amt": 2181
    },
    {
        "name": "Page F",
        "uv": 2390,
        "pv": 3800,
        "amt": 2500
    },
    {
        "name": "Page G",
        "uv": 3490,
        "pv": 4300,
        "amt": 2100
    }
]

const Gas = () => {
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
            <div className="gas_bottomContainer">
                <div className="gas_headerContainer">
                    <span>GAS CONSUMPTION REPORT</span>
                </div>
                <div className="gas_bottm_date_containet">
                    <div className="gas_from_date_Container">
                        <div className="gas_from_date_header">
                            <span>Date From:</span>
                        </div>
                        <div>
                            <input
                                type="date"
                                value={selectedDate || ''}
                                onChange={handleDateChange}
                                className="gas_datePicker"
                            />
                        </div>
                    </div>
                    <div className="gas_to_date_Container">
                        <div className="gas_from_date_header">
                            <span>Date To:</span>
                        </div>
                        <div>
                            <input
                                type="date"
                                value={selectedDate || ''}
                                onChange={handleDateChange}
                                className="gas_datePicker"
                            />
                        </div>
                    </div>
                    <div className="gas_button_container">
                        <Button variant="contained">Search</Button>
                    </div>
                </div>

                <div className="gas_lineChartContainer">
                    <LineChart width={730} height={250} data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }} className="gas_linechartCom">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="pv" stroke="#8884d8" />
                        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                    </LineChart>
                </div>

            </div>

            <div className="energy_table_bottomContainer">
                <div className="energy_headerContainer">
                    <span>Gas Consumption/Day Report [ ]</span>
                </div>
                <div className="energy_table_sub_bottomContainer">
                    <table id="customers">
                        <tr>
                            <th></th>
                            <th colSpan={2}>Gas Consumption/Day [kg]</th>
                            <th></th>
                        </tr>
                        <tr>
                            <th>Date</th>
                            <th>Pretreatment Machine</th>
                            <th>Powder Coating Machine</th>
                            <th>Total</th>
                        </tr>
                        <tr>
                            <td>2023/09/10</td>
                            <td>1.74</td>
                            <td>82.55</td>
                            <td>136.44</td>
                        </tr>
                        <tr>
                            <td>2023/09/11</td>
                            <td>41.26</td>
                            <td>62.11</td>
                            <td>197.54</td>
                        </tr>
                        <tr>
                            <td>2023/09/12</td>
                            <td>10.14</td>
                            <td>132.85</td>
                            <td>85.02</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>TOTAL</td>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>980.4</td>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>1689.89</td>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>2670.29</td>
                        </tr>
                        <tr>
                            <td colSpan={4} className="bottomButtonContainer">
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
export default Gas;