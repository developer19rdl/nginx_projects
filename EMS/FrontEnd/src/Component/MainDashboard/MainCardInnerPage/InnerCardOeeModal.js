import React, { useEffect, useState } from 'react';
import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, RadioGroup, FormControlLabel, Radio, FormControl, InputLabel, MenuItem, Select, Box
} from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import { Chart } from "react-google-charts";
import '../MainDashboard.css'

const departmentList = [
    { id: 1, name: 'one' },
    { id: 2, name: 'two' },
    { id: 3, name: 'three' }
]

export const data = [
    ["Task", "Hours per Day"],
    ["Utilization", 36.3],
    ["Performance", 27.4],
    ["Quality", 36.3],
];

export const data1 = [
    ["Task", "Hours per Day"],
    ["Tool setting time", 61.5],
    ["Non availability of Compressed air", 22.9],
    ["Non availability of programming", 13.8],
    ["Non availability of Fork lift operator", 1.8],
];

export const options = {
    title: "OEE PARAMETER CONTRIBUTION",
    is3D: true,
};

export const options1 = {
    title: "MAJOR DOWNTIME(in minutes) CONTRIBUTORS",
    is3D: true,
};

const InnerCardOeeModal = (props) => {
    const { open, setModalVisible } = props;
    const [selectedRadio, setSelectedRadio] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectDateFrom, setSelectDateFrom] = useState(null)
    const [selectDateTo, setSelectDateTo] = useState(null)
    const [machineAssemblyLine, setMachineAssemblyLine] = useState('')

    const handleRadioChange = (event) => {
        setSelectedRadio(event.target.value);
        // Set specific dates for each radio button
        switch (event.target.value) {
            case 'Today':
                setSelectedDate(new Date());
                break;
            case 'Yesterday':
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setSelectedDate(yesterday);
                break;
            case 'This week':
                // Set the start date of the current week
                const thisWeekStartDate = new Date();
                thisWeekStartDate.setDate(thisWeekStartDate.getDate() - thisWeekStartDate.getDay());
                setSelectedDate(thisWeekStartDate);
                break;
            case 'Last week':
                // Set the start date of the previous week
                const lastWeekStartDate = new Date();
                lastWeekStartDate.setDate(lastWeekStartDate.getDate() - lastWeekStartDate.getDay() - 7);
                setSelectedDate(lastWeekStartDate);
                break;
            case 'This month':
                // Set the start date of the current month
                const thisMonthStartDate = new Date();
                thisMonthStartDate.setDate(1);
                setSelectedDate(thisMonthStartDate);
                break;
            case 'Last month':
                // Set the start date of the previous month
                const lastMonthStartDate = new Date();
                lastMonthStartDate.setMonth(lastMonthStartDate.getMonth() - 1);
                lastMonthStartDate.setDate(1);
                setSelectedDate(lastMonthStartDate);
                break;
            default:
                setSelectedDate(null); // For 'Custom' or other cases where a specific date isn't predefined
        }
    };

    return (
        <Dialog
            fullWidth
            maxWidth="xl"
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '95%' } }}
            open={open}
        >
            <>
                <DialogTitle style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}>
                    OEE Report
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2} alignItems={'center'} style={{ marginTop: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)', padding: '20px', borderRadius: '10px' }}>
                        <Grid item xs={12}>
                            <RadioGroup
                                aria-label="options"
                                name="options"
                                value={selectedRadio}
                                onChange={handleRadioChange}
                                sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}
                            >
                                <FormControlLabel
                                    value="Today"
                                    control={<Radio />}
                                    label="Today"
                                />
                                <FormControlLabel
                                    value="Yesterday"
                                    control={<Radio />}
                                    label="Yesterday"
                                />
                                <FormControlLabel
                                    value="This week"
                                    control={<Radio />}
                                    label="This week"
                                />
                                <FormControlLabel
                                    value="Last week"
                                    control={<Radio />}
                                    label="Last week"
                                />
                                <FormControlLabel
                                    value="This month"
                                    control={<Radio />}
                                    label="This month"
                                />
                                <FormControlLabel
                                    value="Last month"
                                    control={<Radio />}
                                    label="Last month"
                                />
                                <FormControlLabel
                                    value="Custom"
                                    control={<Radio />}
                                    label="Custom"
                                />
                            </RadioGroup>
                        </Grid>

                        {/* <Grid item xs={12} sm={12} md={4} lg={4}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">
                                    --Select Machine--
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={machineAssemblyLine}
                                    label="--Select Machine--"
                                    onChange={(e) => {
                                        setMachineAssemblyLine(e.target.value);
                                        console.log('setDepartment', e.target.value);
                                    }}
                                >
                                    {departmentList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid> */}

                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            <TextField
                                value={selectedDate ? selectedDate.toISOString().slice(0, 10) : selectDateFrom}
                                type='date'
                                // margin="dense"
                                id="outlined-basic"
                                label="From Date"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setSelectDateFrom(e.target.value); }}
                                autoComplete="off"
                                required
                                InputLabelProps={{
                                    shrink: true, style: { fontFamily: 'customfont', fontSize: '17px', fontWeight: 'bold' }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            <TextField
                                value={selectedDate ? selectedDate.toISOString().slice(0, 10) : selectDateTo}
                                type='date'
                                // margin="dense"
                                id="outlined-basic"
                                label="To Date"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setSelectDateTo(e.target.value); }}
                                autoComplete="off"
                                required
                                InputLabelProps={{
                                    shrink: true, style: { fontFamily: 'customfont', fontSize: '17px', fontWeight: 'bold' }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={12} md={12} lg={12} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                            <Button variant="contained">Search</Button>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} alignItems={'center'} style={{ marginTop: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)', padding: '20px', borderRadius: '10px' }}>
                        <Grid item xs={6}>
                            <Chart
                                chartType="PieChart"
                                data={data}
                                options={options}
                                width={"100%"}
                                height={"400px"}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Chart
                                chartType="PieChart"
                                data={data1}
                                options={options1}
                                width={"100%"}
                                height={"400px"}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                            <Button variant="contained">VIEW OEE REPORT</Button>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} alignItems={'center'} style={{ marginTop: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)', padding: '20px', borderRadius: '10px' }}>
                        <Grid item xs={12} sm={12} md={12} lg={12} className='oeeCardTableGridContainer'>
                            <table id="customers">
                                <tr>
                                    <th>Date</th>
                                    <th colSpan={3}>11-Sep</th>
                                    <th colSpan={3}>12-Sep</th>
                                    <th colSpan={3}>13-Sep</th>
                                    <th colSpan={3}>14-Sep</th>
                                    <th rowSpan={1}></th>
                                </tr>
                                <tr>
                                    <th></th>
                                    <th>1st</th>
                                    <th>2nd</th>
                                    <th>3rd</th>
                                    <th>1st</th>
                                    <th>2nd</th>
                                    <th>3rd</th>
                                    <th>1st</th>
                                    <th>2nd</th>
                                    <th>3rd</th>
                                    <th>1st</th>
                                    <th>2nd</th>
                                    <th>3rd</th>
                                    <th>Total</th>
                                </tr>
                                <tr>
                                    <th>Utilization Factor</th>
                                    <th colSpan={12}></th>
                                    <th></th>
                                </tr>
                                <tr>
                                    <td>Major Maintance</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                </tr>
                                <tr>
                                    <td>Unavailable spare parts</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
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
                        </Grid>
                    </Grid>

                </DialogContent>

                <DialogActions sx={{ /*margin: '10px',*/ boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}>
                    <Button
                        size="large"
                        autoFocus
                        onClick={() => {
                            setModalVisible(!open);
                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </>
        </Dialog >
    )
}
export default InnerCardOeeModal;
