import React, { useState } from "react";
import './Scrap.css';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Button } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const Scrap = () => {
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
            <div className="scrap_bottomContainer">
                <div className="scrap_headerContainer">
                    <span>WASTAGE REPORT</span>
                </div>
                <div className="scrap_bottm_date_containet">
                    <div className="scrap_from_date_Container">
                        <div className="scrap_from_date_header">
                            <span>Date From:</span>
                        </div>
                        <div>
                            <input
                                type="date"
                                value={selectedDate || ''}
                                onChange={handleDateChange}
                                className="scrap_datePicker"
                            />
                        </div>
                    </div>
                    <div className="scrap_to_date_Container">
                        <div className="scrap_from_date_header">
                            <span>Date To:</span>
                        </div>
                        <div>
                            <input
                                type="date"
                                value={selectedDate || ''}
                                onChange={handleDateChange}
                                className="scrap_datePicker"
                            />
                        </div>
                    </div>
                    <div className="scrap_to_date_Container">
                        <div className="scrap_from_date_header">
                            <span>Machine:</span>
                        </div>
                        <div>
                            <Box sx={{ minWidth: 180 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Machine</InputLabel>
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
                    <div className="scrap_button_container">
                        <Button variant="contained">Search</Button>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Scrap;