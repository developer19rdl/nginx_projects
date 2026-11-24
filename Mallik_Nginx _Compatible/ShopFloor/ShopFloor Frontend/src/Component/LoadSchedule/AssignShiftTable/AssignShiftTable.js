import { Box, Button, ButtonGroup, FormControl, FormControlLabel, FormLabel, Grid, LinearProgress, Radio, RadioGroup, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useState, useRef } from 'react'
import { GetAssignShiftTableData } from '../../../Services/NodeJsApiServices';

const AssignShiftTable = () => {
    const [selectedRadio, setSelectedRadio] = useState('month')
    const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
    const [assignShiftTableData, setAssignShiftTableData] = useState([])
    const [height, setHeight] = useState(window.innerHeight);
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setHeight(window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const formatDate = (date) => {
        // return date.toISOString().split('T')[0];
        // Adjust for timezone offset
        const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return adjustedDate.toISOString().split('T')[0];
    };

    const handleMonthClick = (type) => {
        setLoader(true)
        const today = new Date();
        let startDate, endDate;

        switch (type) {
            case 'previous':
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                endDate = new Date(today.getFullYear(), today.getMonth(), 0); // last day of previous month
                break;
            case 'current':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // last day of current month
                break;
            case 'next':
                startDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0); // last day of next month
                break;
            default:
                startDate = endDate = today;
        }

        console.log("startDatestartDatestartDate", startDate)
        console.log("endDateendDateendDateendDate", endDate)
        setDateRange({ startDate, endDate });
        GetAssignShiftTableData({
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
        }, handleSuccess, handleException)
    };

    /*
    const handleWeekClick = (type) => {
        setLoader(true)
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when today is a Sunday
        let startOfWeek = new Date(today.setDate(diff));
        let endOfWeek = new Date(startOfWeek);

        switch (type) {
            case 'previous':
                startOfWeek.setDate(startOfWeek.getDate() - 7);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                break;
            case 'current':
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                break;
            case 'next':
                startOfWeek.setDate(startOfWeek.getDate() + 7);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                break;
            default:
                startOfWeek = endOfWeek = today;
        }

        setDateRange({ startOfWeek, endOfWeek });
        GetAssignShiftTableData({
            startDate: formatDate(startOfWeek),
            endDate: formatDate(endOfWeek)
        }, handleSuccess, handleException)
    };
*/

const handleWeekClick = (type) => {
    setLoader(true);
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when today is a Sunday

    const baseDate = new Date(today.setDate(diff)); // Monday of the current week
    let startOfWeek = new Date(baseDate);
    let endOfWeek = new Date(baseDate);

    switch (type) {
        case 'previous':
            startOfWeek.setDate(baseDate.getDate() - 7);
            endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            break;
        case 'current':
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            break;
        case 'next':
            startOfWeek.setDate(baseDate.getDate() + 7);
            endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            break;
        default:
            startOfWeek = endOfWeek = today;
    }

    setDateRange({ startOfWeek, endOfWeek });

    GetAssignShiftTableData({
        startDate: formatDate(startOfWeek),
        endDate: formatDate(endOfWeek)
    }, handleSuccess, handleException);
};




    const handleSuccess = (dataObject) => {
        setLoader(false)
        setAssignShiftTableData(dataObject.data);
    }
    const handleException = () => {
        setLoader(false)
    }

    // useEffect(() => {
    //     // Simulate an API call or data fetch
    //     // setAssignShiftTableData(fetchedData);

    //     // Ensure there's data before accessing it
    //     if (assignShiftTableData.length > 0) {
    //         const firstObject = assignShiftTableData[0];

    //         if (firstObject) {
    //             // Get the first (and possibly only) key of the first object
    //             const machineName = Object.keys(firstObject)[0];

    //             if (machineName) {
    //                 // Access the dates of the machine
    //                 const datesArray = Object.keys(firstObject[machineName]);
    //                 console.log(datesArray);
    //             } else {
    //                 console.log("Machine name is undefined");
    //             }
    //         } else {
    //             console.log("First object is undefined");
    //         }
    //     } else {
    //         console.log("assignShiftTableData is empty");
    //     }
    // }, [assignShiftTableData]);

    const firstObject = assignShiftTableData.length > 0 ? assignShiftTableData[0] : null;
    // Get the first (and possibly only) key of the first object
    const machineName = firstObject ? Object.keys(firstObject)[0] : null;
    // Use bracket notation to dynamically access the property
    const allDates = machineName && firstObject ? Object.keys(firstObject[machineName]) : [];
    console.log(allDates);


    // const result = [];

    // // Iterate through each machine object in the array
    // for (const machineData of assignShiftTableData) {
    //     for (const [machine, shiftsByDate] of Object.entries(machineData)) {
    //         // Iterate through each date for the current machine
    //         for (const [date, shifts] of Object.entries(shiftsByDate)) {
    //             // Extract shift values
    //             const shiftValues = [
    //                 shifts["Shift 1"],
    //                 shifts["Shift 2"],
    //                 shifts["Shift 3"],
    //                 shifts["Shift 4"]
    //             ];
    //             // Push the machine name, date, and shift values to the result array
    //             result.push([machine, date, ...shiftValues]);
    //         }
    //     }
    // }

    // console.log(result);

    // Function to transform the API response
    function transformApiResponse(response) {
        const result = [];
        response.forEach(item => {
            for (const [machine, shifts] of Object.entries(item)) {
                const flattenedShifts = [];
                for (const shiftDates of Object.values(shifts)) {
                    flattenedShifts.push(...Object.values(shiftDates));
                }
                result.push([machine, ...flattenedShifts]);
            }
        });
        return result;
    }

    // Transform the API response
    const transformedArray = transformApiResponse(assignShiftTableData);

    ////////////////////////////////////////ON CLICK SCROLL CODE///////////////////////////////////////////////
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef(null);  // Reference to the scrolling container
    const cellRefs = useRef([]);        // Reference to individual cells

    const getTotalCells = () => {
        return transformedArray.length * allDates.length * 4; // Each date has 4 cells
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => Math.min(prevIndex + 10, getTotalCells() - 1));
    };

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => Math.max(prevIndex - 10, 0));
    };

    useEffect(() => {
        if (cellRefs.current[currentIndex]) {
            // Manually scroll the container to the cell
            const cell = cellRefs.current[currentIndex];
            const container = containerRef.current;

            const containerRect = container.getBoundingClientRect();
            const cellRect = cell.getBoundingClientRect();

            const offsetLeft = cellRect.left - containerRect.left;
            const offsetTop = cellRect.top - containerRect.top;

            container.scrollBy({
                top: offsetTop,
                left: offsetLeft,
                behavior: 'smooth',
            });
        }
    }, [currentIndex]);

    return (
        <>
            <div>
                <Grid container>
                    {loader && <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                    </Box>}
                    <Grid item style={{ marginTop: '15px' }}>
                        <FormControl>
                            <RadioGroup
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                                value={selectedRadio}
                                onChange={(e) => setSelectedRadio(e.target.value)}
                            >
                                <FormControlLabel value="month" control={
                                    <Radio
                                        sx={{
                                            color: '#686D76', // unselected color
                                            '&.Mui-checked': {
                                                color: '#000000', // selected color
                                            }
                                        }}
                                    />
                                } label="Month" />
                                <FormControlLabel value="week" control={
                                    <Radio
                                        sx={{
                                            color: '#686D76', // unselected color
                                            '&.Mui-checked': {
                                                color: '#000000', // selected color
                                            }
                                        }}
                                    />
                                } label="Week" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item style={{ marginTop: '15px', marginBottom: '15px' }} >
                        {selectedRadio === 'month' ?
                            <ButtonGroup variant="contained" aria-label="Basic button group">
                                <Button style={{ backgroundColor: '#000000' }} onClick={() => handleMonthClick('previous')}>Previous Month</Button>
                                <Button style={{ backgroundColor: '#000000' }} onClick={() => handleMonthClick('current')}>Current Month</Button>
                                <Button style={{ backgroundColor: '#000000' }} onClick={() => handleMonthClick('next')}>Next Month</Button>
                            </ButtonGroup>
                            :
                            <ButtonGroup variant="contained" aria-label="Basic button group">
                                <Button style={{ backgroundColor: '#000000' }} onClick={() => handleWeekClick('previous')}>Previous Week</Button>
                                <Button style={{ backgroundColor: '#000000' }} onClick={() => handleWeekClick('current')}>Current Week</Button>
                                <Button style={{ backgroundColor: '#000000' }} onClick={() => handleWeekClick('next')}>Next Week</Button>
                            </ButtonGroup>
                        }
                    </Grid>
                    <Grid item style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Button style={{ backgroundColor: '#000000', marginRight: '10px', color: '#ffffff' }} onClick={handlePrevious} disabled={currentIndex === 0}>
                            Previous
                        </Button>
                        <Button variant="contained" style={{ backgroundColor: '#000000', color: '#ffffff' }} onClick={handleNext} disabled={currentIndex + 10 >= getTotalCells()}>
                            Next
                        </Button>
                    </Grid>
                </Grid>
            </div>

            {/* <Grid container height={height - 220} overflow={'auto'}>
                {
                    allDates.length > 0 &&
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} overflow={'auto'}>
                        <table id="customers">
                            <tr>
                                <th style={{ borderColor: '#000000', whiteSpace: 'nowrap' }} rowSpan={2}>Machine Name</th>
                                {allDates && allDates.map((item, key) => (
                                    <th colSpan={4} key={key} style={{ borderColor: '#000000' }}>{item}</th>))}
                            </tr>
                            <tr>
                                {allDates && allDates.map((item, key) => (
                                    <>
                                        <th style={{ borderColor: '#000000', padding: '10px' }}>1st</th>
                                        <th style={{ borderColor: '#000000', padding: '10px' }}>2nd</th>
                                        <th style={{ borderColor: '#000000', padding: '10px' }}>3rd</th>
                                        <th style={{ borderColor: '#000000', padding: '10px' }}>4th</th>
                                    </>
                                ))}
                            </tr>

                            {transformedArray && transformedArray.map((item, key) => (
                                <tr key={key}>
                                    <td style={{ color: '#000000', whiteSpace: 'nowrap' }}>{item[0]}</td>
                                    {item.map((value, index) => (
                                        index !== 0 && (
                                            <Tooltip
                                                placement="top"
                                                arrow
                                                followCursor
                                                title={
                                                    <Typography sx={{ fontSize: '15px' }}>
                                                        {item[0]}
                                                    </Typography>
                                                }
                                            >
                                                <td key={index} style={{ backgroundColor: value }}></td>
                                            </Tooltip>
                                        )
                                    ))}
                                </tr>
                            ))}
                        </table>
                    </Grid>
                }
            </Grid> */}

            <Grid container height={height - 220} overflow="auto">
                {/* <Grid item xs={12}>
                    <Button onClick={handlePrevious} disabled={currentIndex === 0}>
                        Previous
                    </Button>
                    <Button onClick={handleNext} disabled={currentIndex >= getTotalCells() - 1}>
                        Next
                    </Button>
                </Grid> */}
                {allDates.length > 0 && (
                    <Grid item xs={12} overflow="auto" ref={containerRef} style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                        <table id="customers">
                            <thead>
                                <tr>
                                    <th style={{ borderColor: '#000000', whiteSpace: 'nowrap' }} rowSpan={2}>
                                        Machine Name
                                    </th>
                                    {allDates.map((item, key) => (
                                        <th colSpan={4} key={key} style={{ borderColor: '#000000' }}>
                                            {item}
                                        </th>
                                    ))}
                                </tr>
                                <tr>
                                    {allDates.map((_, key) => (
                                        <React.Fragment key={key}>
                                            <th style={{ borderColor: '#000000', padding: '10px' }}>1st</th>
                                            <th style={{ borderColor: '#000000', padding: '10px' }}>2nd</th>
                                            <th style={{ borderColor: '#000000', padding: '10px' }}>3rd</th>
                                            <th style={{ borderColor: '#000000', padding: '10px' }}>4th</th>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {transformedArray &&
                                    transformedArray.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            <td style={{ color: '#000000', whiteSpace: 'nowrap' }}>{row[0]}</td>
                                            {row.slice(1).map((value, cellIndex) => {
                                                const absoluteIndex = rowIndex * allDates.length * 4 + cellIndex;
                                                return (
                                                    <Tooltip
                                                        key={cellIndex}
                                                        placement="top"
                                                        arrow
                                                        followCursor
                                                        title={
                                                            <Typography sx={{ fontSize: '15px' }}>
                                                                {row[0]}
                                                            </Typography>
                                                        }
                                                    >
                                                        <td
                                                            ref={(el) => (cellRefs.current[absoluteIndex] = el)}
                                                            style={{ backgroundColor: value }}
                                                        ></td>
                                                    </Tooltip>
                                                );
                                            })}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </Grid>
                )}
            </Grid>
        </>
    )
}

export default AssignShiftTable;