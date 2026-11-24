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

const ViewUser = () => {
    const [data, setData] = React.useState([]);
    const [filteredData, setFilteredData] = React.useState([]);
    const [searchText, setSearchText] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(5);

    const rows = [
        {
            id: 1,
            lastName: "Snow",
            firstName: "Jon",
            Department: "BCA",
            Designation: "BCA",
            Username: "vishnu",
        },
        {
            id: 2,
            lastName: "Lannister",
            firstName: "Cersei",
            Department: "BCA",
            Designation: "BCA",
            Username: "vishnu",
        },
        {
            id: 3,
            lastName: "Lannister",
            firstName: "Jaime",
            Department: "BCA",
            Designation: "BCA",
            Username: "vishnu",
        },
        {
            id: 4,
            lastName: "Stark",
            firstName: "Arya",
            Department: "mca",
            Designation: "BCA",
            Username: "vishnu",
        },
        {
            id: 5,
            lastName: "Targaryen",
            firstName: "Daenerys",
            Department: null,
            Designation: "BCA",
            Username: "vishnu",
        },
        {
            id: 6,
            lastName: "Melisandre",
            firstName: null,
            Department: "mca",
            Designation: "BCA",
            Username: "vishnu",
        },
        {
            id: 7,
            lastName: "Clifford",
            firstName: "Ferrara",
            Department: "bba",
            Designation: "BCA",
            Username: "vishnu",
        },
        {
            id: 8,
            lastName: "Frances",
            firstName: "Rossini",
            Department: "bba",
            Designation: "BCA",
            Username: "vishnu",
        },
        {
            id: 9,
            lastName: "Roxie",
            firstName: "Harvey",
            Department: "mca",
            Designation: "BCA",
            Username: "vishnu",
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

    const columns = [
        { field: "id", headerName: "Serial No", width: 100 }, // Default width for all screen sizes
        {
            field: "firstName",
            headerName: "Employee ID",
            flex: 1, // Automatically adjust width based on screen size
        },
        {
            field: "lastName",
            headerName: "Employee Name",
            flex: 1, // Automatically adjust width based on screen size
        },
        {
            field: "Department",
            headerName: "Department",
            width: 150, // Default width for all screen sizes
        },
        {
            field: "Designation",
            headerName: "Designation",
            width: 150, // Default width for all screen sizes
        },
        {
            field: "Username",
            headerName: "Username",
            width: 150, // Default width for all screen sizes
        },
        {
            field: "fullName",
            headerName: "Full name",
            description: "This column has a value getter and is not sortable.",
            sortable: false,
            flex: 1, // Automatically adjust width based on screen size
            valueGetter: (params) =>
                `${params.row.firstName || ""} ${params.row.lastName || ""}`,
        },
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            minWidth: 160, // Default minimum width for all screen sizes
            flex: 1, // Automatically adjust width based on screen size
            align: "center",
            cellClassName: "actions",
            disableClickEventBubbling: true,
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,
                <SensorsData selectedRow={params.row} />,
            ],
        },
    ];

    function EditData(props) {
        return (
            <EditIcon
                style={{ cursor: "pointer" }}
            //   onClick={(event) => {
            //     event.stopPropagation();
            //     setIsAddButton(false);
            //     setEditDevice(props.selectedRow);
            //     setOpen(true);
            //   }}
            />
        );
    }
    /* eslint-disable-next-line */
    function DeleteData(props) {
        return (
            <DeleteIcon
            //   onClick={() => {
            //     setDeleteId(props.selectedRow.id);
            //     setDeleteDailogOpen(true);
            //   }}
            />
        );
    }
    /* eslint-disable-next-line */
    function SensorsData(props) {
        return (
            <SensorsIcon
                style={{ cursor: "pointer" }}
            // onClick={(event) => {
            //   event.stopPropagation();
            //   setEditDevice(props.selectedRow);
            //   fetchSensorList(props.selectedRow.id);
            //   setDeviceId(props.selectedRow.id);
            // }}
            />
        );
    }

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
                    View User
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

export default ViewUser;