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

export default function SubAddDepartment() {
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
                    {/* <Tab
                        label={
                            <span>
                                <AddIcon /> Add
                            </span>
                        }
                        {...a11yProps(0)}
                    />
                    <Tab
                        label={
                            <span>
                                <VisibilityIcon /> View
                            </span>
                        }
                        {...a11yProps(1)}
                    /> */}
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
                    {/* <Box margin={2}>
                        <Card
                            sx={{
                                maxWidth: { xs: "70%", lg: "100%", md: "100%", sm: "100%" },
                                margin: 0,
                            }}
                        >
                            <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#f7f7fc', padding: 2.5, color: '#000000', borderRadius: '5px 5px 0 0' }} >
                                Add Department
                            </Typography>
                            <CardContent>
                                <Grid
                                    container
                                    margin={2}
                                    spacing={2}
                                    rowSpacing={{ xs: 1, sm: 2, md: 3 }}
                                    alignItems={"center"}
                                >
                                    <Grid item lg={4} md={4} sm={12} xs={12}>
                                        <Typography variant="h5" color="text.secondary">
                                            Department Name
                                        </Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} sm={10} xs={10}>
                                        <Typography variant="body2">
                                            <TextField
                                                id="outlined-basic"
                                                label="Outlined"
                                                variant="outlined"
                                                fullWidth
                                            />
                                        </Typography>
                                    </Grid>

                                    <Grid item lg={4} md={4} sm={12} xs={12}>
                                        <Typography variant="h5" color="text.secondary">
                                            Description
                                        </Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} sm={10} xs={10}>
                                        <Typography variant="body2">
                                            <TextField
                                                id="outlined-basic"
                                                label="Outlined"
                                                variant="outlined"
                                                fullWidth
                                            />
                                        </Typography>
                                    </Grid>

                                </Grid>
                            </CardContent>
                            <CardActions sx={{ direction: "flex", justifyContent: "center" }}>
                                <Button size="large" variant="contained">
                                    Add
                                </Button>
                            </CardActions>
                        </Card>
                    </Box> */}
                    <Box
                        sx={{
                            width: '100%'
                        }}
                        className='toolAddCardContainer'
                    >
                        <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#f7f7fc', padding: 2.5, color: '#000000', borderRadius: '5px 5px 0 0' }} >
                            Add Department
                        </Typography>
                        <Card sx={{ borderRadius: '0 0 5px 5px', padding: '25px', boxShadow: 'none' }} >
                            <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} >
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Typography>Department Name</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <TextField id="per-day-input" label="Department Name" variant="outlined" />
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <Typography>Description</Typography>
                                    </Grid>
                                    <Grid item lg={6} md={6} container justifyContent="center">
                                        <TextField id="per-day-input" label="Description" variant="outlined" />
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