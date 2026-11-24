import * as React from "react";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { Grid, TextField } from "@mui/material";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import ViewUser from "./ViewUser";

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        "aria-controls": `full-width-tabpanel-${index}`,
    };
}

export default function SubAddUser() {
    const theme = useTheme();
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    const [age, setAge] = React.useState("");

    const handleChange2 = (event) => {
        setAge(event.target.value);
    };

    return (
        <Box
            sx={{ bgcolor: "background.paper", width: "100%" }}
            className="MachineBoxTopContainer"
        >
            <Box
                sx={{
                    bgcolor: "#1976D2",
                    borderBottom: 1,
                    borderColor: "divider",
                    display: "flex",
                    justifyContent: "flex-start",
                }}
            >
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth" // Make tabs scrollable
                    aria-label="full width tabs example"
                    sx={{
                        "& .MuiTabs-indicator": {
                            backgroundColor: 'white', // Change to the color you want
                        },
                    }}
                >
                    {}
                    <Tab icon={<AddIcon />} iconPosition="start" style={{ color: 'white' }} label="Add" {...a11yProps(0)} />
                    <Tab icon={<VisibilityIcon />} iconPosition="start" style={{ color: 'white' }} label="View" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <SwipeableViews
                axis={theme.direction === "rtl" ? "x-reverse" : "x"}
                index={value}
                onChangeIndex={handleChangeIndex}
            >
                <TabPanel value={value} index={0} dir={theme.direction}>
                    {}
                    <Box
                        sx={{
                            width: '100%'
                        }}
                        className='toolAddCardContainer'
                    >
                        <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#5d5d5d', padding: 2.5, color: 'white', borderRadius: '5px 5px 0 0' }} >
                            Add User
                        </Typography>
                        <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
                            <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} >
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Typography>Employee ID</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <TextField id="per-day-input" label="Employee ID" variant="outlined" />
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Typography>Employee Name</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <TextField id="per-day-input" label="Employee Name" variant="outlined" />
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Typography>Department</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="demo-simple-select-label">--Department--</InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    value={age}
                                                    label="--Department--"
                                                    onChange={handleChange2}
                                                >
                                                    <MenuItem value={10}>Ten</MenuItem>
                                                    <MenuItem value={20}>Twenty</MenuItem>
                                                    <MenuItem value={30}>Thirty</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Typography>Department</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="demo-simple-select-label">--Department--</InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    value={age}
                                                    label="--Department--"
                                                    onChange={handleChange2}
                                                >
                                                    <MenuItem value={10}>Ten</MenuItem>
                                                    <MenuItem value={20}>Twenty</MenuItem>
                                                    <MenuItem value={30}>Thirty</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Typography>Mobile Number</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <TextField type="number" id="per-day-input" label="Mobile Number" variant="outlined" />
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Typography>Email ID</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <TextField id="per-day-input" label="Email ID" variant="outlined" />
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Typography>User Name</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <TextField id="per-day-input" label="User Name" variant="outlined" />
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Typography>Password</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <TextField type="password" id="per-day-input" label="Password" variant="outlined" />
                                    </Grid>
                                    <Grid item lg={12} md={12} container justifyContent="center">
                                        <Button variant="contained">Add</Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Box>
                </TabPanel>
                <TabPanel value={value} index={1} dir={theme.direction}>
                    <ViewUser />
                </TabPanel>
            </SwipeableViews>
        </Box>
    );
}
