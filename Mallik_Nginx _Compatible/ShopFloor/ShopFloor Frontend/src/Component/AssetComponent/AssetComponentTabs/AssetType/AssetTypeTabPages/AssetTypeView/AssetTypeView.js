import {
    Box,
    Button,
    CardActions,
    CardContent,
    Grid,
    TextField,
    Typography,
} from "@mui/material";

import React from "react";
import { Card } from "react-bootstrap";

import { DataGrid } from "@mui/x-data-grid";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SensorsIcon from "@mui/icons-material/Sensors";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

const AssetTypeView = () => {
    const [data, setData] = React.useState([]);
    const [filteredData, setFilteredData] = React.useState([]);
    const [searchText, setSearchText] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(5);

    const rows = [
        {
            id: 1,
            Department: "Maintenance",
            AssetType: "IT ASSETS",
        },
        {
            id: 2,
            Department: "Punching",
            AssetType: "IT",
        },
        {
            id: 3,
            Department: "Planning and Scheduling",
            AssetType: "Planning_asset",
        },
    ];

    const columns = [
        { field: "id", headerName: "Serial No", width: 100, flex: 1 }, // Default width for all screen sizes
        {
            field: "Department",
            headerName: "Department",
            flex: 1, // Automatically adjust width based on screen size
        },
        {
            field: "AssetType",
            headerName: "Asset Type",
            flex: 1, // Automatically adjust width based on screen size
        },
    ];

    React.useEffect(() => {
        // Filter data based on search text
        const filtered = rows.filter((item) =>
            Object.values(item).some(
                (value) =>
                    value !== null &&
                    value !== undefined &&
                    value.toString().toLowerCase().includes(searchText.toLowerCase())
            )
        );
        setFilteredData(filtered);
    }, [data, searchText]);

    const handleSearch = () => {
        // Perform search when the search button is clicked
        // You can also debounce this function for better performance
        setFilteredData(
            data.filter((item) =>
                Object.values(item).some((value) =>
                    value.toString().toLowerCase().includes(searchText.toLowerCase())
                )
            )
        );
    };


    return (
        <Box margin={2}>
            <Card
                sx={{
                    maxWidth: { xs: "70%", lg: "100%", md: "100%", sm: "100%" },
                    margin: 0,
                }}
            >
                {/* <Typography
                    variant="h4"
                    color="text.secondary"
                    style={{ backgroundColor: "#d3d3d3" }}
                    gutterBottom
                > */}
                <Typography variant="h7" component="div" sx={{ flexGrow: 1, backgroundColor: '#f7f7fc', padding: 2.5, color: '#000000', borderRadius: '5px 5px 0 0' }} >
                    View Asset Type
                </Typography>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8} lg={12} sm={12}>
                            <TextField
                                label="Search"
                                variant="outlined"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={12} lg={12} sm={12}>
                            <div
                                style={{
                                    width: "100%", // Set a fixed width here for larger screens

                                    height: "400px", // Set the desired height for the DataGrid container
                                    overflowX: "auto",
                                    overflowY: "auto",
                                }}
                            >
                                <DataGrid
                                    rows={filteredData}
                                    columns={columns}
                                    page={page}
                                    pageSize={pageSize}
                                    onPageChange={(params) => setPage(params.page)}
                                />
                            </div>
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: "center" }}>
                    <Button size="large" variant="contained">
                        Add
                    </Button>
                </CardActions>
            </Card>
        </Box>
    );
};

export default AssetTypeView;
