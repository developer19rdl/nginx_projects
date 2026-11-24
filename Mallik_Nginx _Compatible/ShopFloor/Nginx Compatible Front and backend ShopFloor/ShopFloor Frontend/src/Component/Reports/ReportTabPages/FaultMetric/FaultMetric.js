import React, { useState } from "react";
import './FaultMetric.css';
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

const FaultMetric = () => {
    const [selectedValue, setSelectedValue] = useState('date');
    const [selectedRadio, setSelectedRadio] = useState('MTTF');
    const [selectedDate, setSelectedDate] = useState(null);
    const [age, setAge] = React.useState('');

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };
    const handleRdioChange = (event) => {
        setSelectedRadio(event.target.value);
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
                        value="date"
                        control={<Radio 
                            sx={{
                                color: '#686D76', // unselected color
                                '&.Mui-checked': {
                                    color: '#000000', // selected color
                                }
                            }}
        
                        />}
                        label="Date"
                    />
                    <FormControlLabel
                        value="Machine"
                        control={<Radio 
                            sx={{
                                color: '#686D76', // unselected color
                                '&.Mui-checked': {
                                    color: '#000000', // selected color
                                }
                            }}
        
                        />}
                        label="Machine"
                    />
                </RadioGroup>
            </FormControl>
            <div className="faultMetric_bottomContainer">
                <div className="faultMetric_headerContainer">
                    <span>{selectedValue === "date" ? "MACHINE DOWNTIME AND OCCURENCE DETAILS" : "MACHINE FAULT METRIC REPORT"}</span>
                </div>
                <div className="faultMetric_bottm_date_containet">
                    {selectedValue === "date" && < div className="faultMetric_radio_Container">
                        <RadioGroup
                            aria-label="options"
                            name="options"
                            value={selectedRadio}
                            onChange={setSelectedRadio}
                            sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}
                        >
                            <FormControlLabel
                                value="MTTF"
                                control={<Radio 
                                    sx={{
                                        color: '#686D76', // unselected color
                                        '&.Mui-checked': {
                                            color: '#000000', // selected color
                                        }
                                    }}
                
                                />}
                                label="MTTF"
                            />
                            <FormControlLabel
                                value="MTBF"
                                control={<Radio 
                                    sx={{
                                        color: '#686D76', // unselected color
                                        '&.Mui-checked': {
                                            color: '#000000', // selected color
                                        }
                                    }}
                
                                />}
                                label="MTBF"
                            />
                            <FormControlLabel
                                value="MTTR"
                                control={<Radio 
                                    sx={{
                                        color: '#686D76', // unselected color
                                        '&.Mui-checked': {
                                            color: '#000000', // selected color
                                        }
                                    }}
                
                                />}
                                label="MTTR"
                            />
                        </RadioGroup>
                    </div>}
                    <div className="faultMetric_to_date_Container">
                        <div className="faultMetric_from_date_header">
                            <span>Year:</span>
                        </div>
                        <div>
                            <Box sx={{ minWidth: 180 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Year</InputLabel>
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
                    <div className="faultMetric_to_date_Container">
                        <div className="faultMetric_from_date_header">
                            <span>Month:</span>
                        </div>
                        <div>
                            <Box sx={{ minWidth: 180 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Month</InputLabel>
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
                    <div className="faultMetric_to_date_Container">
                        <div className="faultMetric_from_date_header">
                            <span>Machine Name:</span>
                        </div>
                        <div>
                            <Box sx={{ minWidth: 180 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Machine Name</InputLabel>
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
                    <div className="faultMetric_button_container">
                        <Button variant="contained">Search</Button>
                    </div>
                </div>

                {selectedValue === "Machine" && <div className="gas_lineChartContainer">
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
                </div>}

            </div >

            <div className="energy_table_bottomContainer">
                <div className="energy_headerContainer">
                    <span>MACHINE DOWNTIME AND OCCURENCE DETAILS</span>
                </div>
                <div className="energy_table_sub_bottomContainer">
                    {selectedValue === "date" ?
                        <table id="customers">
                            <tr>
                                <th>Machine Name</th>
                                <th>1</th>
                                <th>2</th>
                                <th>3</th>
                                <th>4</th>
                                <th>5</th>
                                <th>6</th>
                                <th>7</th>
                                <th>8</th>
                                <th>9</th>
                                <th>10</th>
                                <th>11</th>
                                <th>12</th>
                                <th>13</th>
                                <th>14</th>
                                <th>15</th>
                                <th>16</th>
                                <th>17</th>
                                <th>18</th>
                                <th>19</th>
                                <th>20</th>
                                <th>21</th>
                                <th>22</th>
                                <th>23</th>
                                <th>24</th>
                                <th>25</th>
                                <th>26</th>
                                <th>27</th>
                                <th>28</th>
                                <th>29</th>
                                <th>30</th>
                                <th>31</th>
                                <th>TOTAL</th>
                                <th>Occurence</th>
                                <th>MTTR</th>
                                <th>MTTR Target</th>
                                <th>MTBF</th>
                                <th>MTBF Target</th>
                                <th>MTTF</th>
                                <th>MTTF Target</th>
                            </tr>
                            <tr>
                                <td>Shearing Machine</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0</td>
                                <td>00:00</td>
                                <td>00:20:00</td>
                                <td>00:00</td>
                                <td>18:20:00</td>
                                <td>00:00</td>
                                <td>15:20:00</td>
                            </tr>
                        </table>
                        :
                        <table id="customers">
                            <tr>
                                <th>Date</th>
                                <th>Down Time[H:m:s]</th>
                            </tr>
                            <tr>
                                <td>2023/09/10</td>
                                <td>0:00</td>
                            </tr>
                            <tr>
                                <td>2023/09/11</td>
                                <td>0:00</td>
                            </tr>
                            <tr>
                                <td>2023/09/12</td>
                                <td>0:00</td>
                            </tr>
                        </table>}
                </div>
            </div>
        </>
    )
}
export default FaultMetric;