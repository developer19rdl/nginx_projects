import { Box, Button, ButtonGroup, FormControl, FormControlLabel, FormLabel, Grid, LinearProgress, Radio, RadioGroup, Tooltip, Typography, Dialog, TextField,DialogTitle,DialogContent,DialogActions } from '@mui/material';
import React, { useEffect, useState, useRef } from 'react'
import { AssignShiftOTData, GetAssignShiftTableData, getMachinesAll, ShiftOtAdd } from '../../../Services/NodeJsApiServices';
  import {
            Tabs, Tab,   InputLabel, MenuItem,  Select, Stack,  styled,
        } from '@mui/material';
        
        
const AssignShiftOT = () => {
    const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
    const [assignShiftTableData, setAssignShiftTableData] = useState([])
    const [height, setHeight] = useState(window.innerHeight);
    const [loader, setLoader] = useState(false);
       const [machinesAll, setMachinesAll] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedCell, setSelectedCell] = useState({
            operatorName: "",
            operatorId: "",
            date: "",
            shift: "",
            cellIndex: ""   
        });

    const [selectedMachine, setSelectedMachine] = useState("");

        const [otValue, setOTValue] = useState("");
        const [otReason, setOTReason] = useState("");

      

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
const handleLast7DaysClick = () => {
    setLoader(true);

    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    setDateRange({
        startDate: lastWeek,
        endDate: today,
    });

    AssignShiftOTData(
        {
            startDate: formatDate(lastWeek),
            endDate: formatDate(today),
        },
        handleSuccess,
        handleException
    );
};


 const handleTodayClick = () => {
    setLoader(true);

    const today = new Date();
    const formatted = formatDate(today); // your existing formatter

   setDateRange({
    startDate: today,
    endDate: today
});

    AssignShiftOTData(
        {
            startDate: formatted,
            endDate: formatted
        },
        handleSuccess,
        handleException
    );
};

    const handleSuccess = (dataObject) => {
        setLoader(false)
        setAssignShiftTableData(dataObject.data);
    }
    const handleException = () => {
        setLoader(false)
    }

   
    const firstObject = assignShiftTableData.length > 0 ? assignShiftTableData[1] : null;
    // Get the first (and possibly only) key of the first object
    const machineName = firstObject ? Object.keys(firstObject)[0] : null;
    // Use bracket notation to dynamically access the property
    const allDates = machineName && firstObject ? Object.keys(firstObject[machineName]) : [];
    console.log("allDates",allDates);


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

    const splitOperator = (str) => {
    const [name, id] = str.split(" _ ").map(s => s.trim());
    return { operatorName: name, operatorId: id };
 };

 const convertToISO = (raw) => {
    if (!raw) return "";
    const parts = raw.split("-");
    if (parts.length !== 3) return raw; // safety fallback

    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm}-${dd}`;
};

    const handleCellClick = (operatorFull, rawDate, shiftNumber, cellIndex) => {
        // console.log("Clicked cell:", machine, date, shift, index);
    const { operatorName, operatorId } = splitOperator(operatorFull);

    // Convert DD-MM-YYYY → YYYY-MM-DD (for DB)
    const scheduleDate = convertToISO(rawDate);
   
        setSelectedCell({
        operatorName: operatorName,
        operatorId: operatorId,
        date: scheduleDate,
        shift: shiftNumber,
        cellIndex: cellIndex
    });

    getMachinesAll ( (dataObject) => {
        setMachinesAll(dataObject?.data || []);
    }, () => {});   
    setOTValue("");
    setOTReason("");
    setOpenModal(true);
};


const handleOTSubmit = () => {
   setLoader(true);

    const finalReason = otValue === "yes" ? otReason : "";

    ShiftOtAdd( {
        scheduleDate: selectedCell.date,
        shiftNumber: selectedCell.shift,
        operatorId: selectedCell.operatorId,
        operatorName: selectedCell.operatorName,
        otNeeded: otValue,
        otReason: finalReason,
        machineId: selectedMachine  
    }, ShiftOtAddhandleSuccess,ShiftOtAddhandleException
    );
};
    const ShiftOtAddhandleSuccess = (dataObject) => {
        setLoader(false)
        // setAssignShiftTableData(dataObject.data);
      
        // Refresh the table data after successful OT assignment
        AssignShiftOTData(
            {
                startDate: formatDate(dateRange.startDate),
                endDate: formatDate(dateRange.endDate),
            },
            handleSuccess,
            handleException
        );
          setOpenModal(false);
    }


    const ShiftOtAddhandleException = () => {
        setLoader(false)
    }


    return (
        <>
            <div>
             
             <Grid container>
                {loader && (
                    <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                    </Box>
                )}

                <Grid item style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <ButtonGroup variant="contained" aria-label="Basic button group">
                        <Button style={{ backgroundColor: '#000000' }} onClick={handleTodayClick}>
                            Today
                        </Button>
                        <Button style={{ backgroundColor: '#000000' }} onClick={handleLast7DaysClick}>
                            Last 7 Days
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
            </div>

            
            <Grid container height={height - 220} overflow="auto">
             
                {allDates.length > 0 && (
                    <Grid item xs={12} overflow="auto" ref={containerRef} style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                        <table id="customers">
                            <thead>
                                <tr>
                                    <th style={{ borderColor: '#000000', whiteSpace: 'nowrap' }} rowSpan={2}>
                                                Operator Name
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
                                            <th style={{ borderColor: '#000000', padding: '5px' }}>1st</th>
                                            <th style={{ borderColor: '#000000', padding: '5px' }}>2nd</th>
                                            <th style={{ borderColor: '#000000', padding: '5px' }}>3rd</th>
                                            <th style={{ borderColor: '#000000', padding: 'px' }}>4th</th>
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
                                                        style={{ backgroundColor: value, cursor: "pointer" }}
                                                        onClick={() =>
                                                            handleCellClick(
                                                              
                                                               row[0],
                                                                allDates[Math.floor(cellIndex / 4)],
                                                                [1, 2, 3, 4][cellIndex % 4],
                                                                absoluteIndex
                                                            )
                                                        }
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
    <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth >
        <DialogTitle>Assign OT</DialogTitle>

        <DialogContent>

            {/* DATE + SHIFT INFO */}
            <Box sx={{ mb: 2, p: 1, backgroundColor: "#f5f5f5", borderRadius: "6px" }}>
                <Typography variant="body1">
                    <strong>Date :</strong> {selectedCell.date}
                </Typography>
                <Typography variant="body1">
                    <strong>Shift :</strong> {selectedCell.shift}
                </Typography>
            </Box>

            {/* LABEL */}
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                Assign OT
            </Typography>
            
            Select machine:

              <FormControl fullWidth>
                {/* <InputLabel id="demo-simple-select-label">Machine</InputLabel> */}
                <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                // label="Section"
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value) }
                size="small"
                >
                {machinesAll?.map((data, index) => (
                    <MenuItem value={data.id} key={index}>
                    {data.machine_name}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
                    
            {/* OT Needed Yes / No */}
            <FormControl component="fieldset" fullWidth>
                <RadioGroup
                    value={otValue}
                    onChange={(e) => setOTValue(e.target.value)}
                    row
                >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no"  control={<Radio />} label="No" />
                </RadioGroup>
            </FormControl>

            {/* Show reason only when OT = Yes */}
            {otValue === "yes" && (
                <TextField
                    label="OT Reason"
                    value={otReason}
                    onChange={(e) => setOTReason(e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    margin="normal"
                />
            )}

        </DialogContent>

        <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button
                onClick={handleOTSubmit}
                variant="contained"
                style={{ backgroundColor: "black" }}
            >
                Submit
            </Button>
        </DialogActions>
    </Dialog>
        </>
    )
}

export default AssignShiftOT;