import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Autocomplete, Checkbox, FormControl, Grid, InputLabel, MenuItem,
    Select, TextField, Typography, Button, Card, CardContent, Box,
    CircularProgress, LinearProgress
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import {
    GetSearchedItems, GetWipStockLedgerReport, GetMainLocation, GetItemGroup
} from '../../../ApiService/LoginPageService';

// ---------- constants ----------
const ICON = <CheckBoxOutlineBlankIcon fontSize="small" />;
const CHECKED_ICON = <CheckBoxIcon fontSize="small" />;

const TABLE_COLUMNS = [
    { key: 'location', label: 'Location' },
    { key: 'itemGroup', label: 'Item Group' },
    { key: 'itemCode', label: 'Item Code' },
    { key: 'itemName', label: 'Item Name' },
    { key: 'uom', label: 'UOM' },
    { key: 'docType', label: 'Doc Type' },
    { key: 'docNo', label: 'Doc No' },
    { key: 'date', label: 'Doc Date' },
    { key: 'grnNo', label: 'Grn No' },
    { key: 'inward', label: 'Inward' },
    { key: 'issue', label: 'Issue' },
    { key: 'balQty', label: 'Closing Balance' },
];

const GROUP_COLUMN_KEYS = ['location', 'itemGroup', 'itemCode', 'itemName', 'uom'];

const cellStyle = { whiteSpace: 'nowrap' };

// simple debounce helper (no lodash dependency)
const debounce = (fn, delay) => {
    let timer;
    const debounced = (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
};

// ---------- date helpers ----------
const formatDate = (dateInput) => {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getCurrentFinancialYearRange = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const isAfterApril = today.getMonth() >= 3; // April = index 3

    const from = isAfterApril ? `${currentYear}-04-01` : `${currentYear - 1}-04-01`;
    const to = formatDate(today);

    return { from, to };
};

// ---------- presentational sub-components ----------

const ReportFilters = ({
    fromDate, toDate, onFromDateChange, onToDateChange,
    itemOptions, onItemSearchInput, onItemSelectionChange,
    locationOptions, selectedLocation, onLocationChange,
    itemGroupOptions, selectedItemGroup, onItemGroupChange,
    loading, onViewClick,
}) => (
    <Grid container spacing={2} padding={1} style={{ zoom: '80%' }}>
        <Grid item xs={12} sm={12} md={4}>
            <TextField
                fullWidth
                id="from-date"
                label="From Date"
                variant="outlined"
                type="date"
                value={fromDate}
                onChange={onFromDateChange}
                InputLabelProps={{ shrink: true, style: { color: '#000000', fontWeight: 'bold' } }}
            />
        </Grid>

        <Grid item xs={12} sm={12} md={4}>
            <TextField
                fullWidth
                id="to-date"
                label="To Date"
                variant="outlined"
                type="date"
                value={toDate}
                onChange={onToDateChange}
                InputLabelProps={{ shrink: true, style: { color: '#000000', fontWeight: 'bold' } }}
            />
        </Grid>

        <Grid item xs={12} sm={12} md={4}>
            <Autocomplete
                multiple
                id="item-search-autocomplete"
                options={itemOptions}
                disableCloseOnSelect
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.id}>
                        <Checkbox
                            icon={ICON}
                            checkedIcon={CHECKED_ICON}
                            style={{ marginRight: 8 }}
                            checked={selected}
                        />
                        {option.label}
                    </li>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search Items"
                        onChange={(e) => onItemSearchInput(e.target.value)}
                    />
                )}
                onChange={(event, value) => onItemSelectionChange(value)}
                sx={{
                    '& .MuiAutocomplete-inputRoot': {
                        flexWrap: 'wrap',
                        maxHeight: '120px',
                        overflowY: 'auto',
                    },
                }}
            />
        </Grid>

        <Grid item xs={12} sm={12} md={4}>
            <FormControl fullWidth>
                <InputLabel id="location-label">Selected Location</InputLabel>
                <Select
                    labelId="location-label"
                    value={selectedLocation}
                    onChange={onLocationChange}
                    label="Selected Location"
                >
                    {locationOptions.map((loc) => (
                        <MenuItem key={loc.id} value={loc?.id}>{loc?.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>

        <Grid item xs={12} sm={12} md={4}>
            <FormControl fullWidth>
                <InputLabel id="item-group-label">Selected Item Group</InputLabel>
                <Select
                    labelId="item-group-label"
                    value={selectedItemGroup}
                    onChange={onItemGroupChange}
                    label="Selected Item Group"
                >
                    {itemGroupOptions.map((grp) => (
                        <MenuItem key={grp.id} value={grp?.id}>{grp?.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>

        <Grid item xs={12} sm={12} md={3} style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Button
                disabled={loading}
                variant="contained"
                style={{ backgroundColor: '#002d68', width: '150px' }}
                onClick={() => onViewClick(1)}
            >
                {loading ? <CircularProgress size={24} style={{ color: 'white' }} /> : 'View Report'}
            </Button>
        </Grid>
    </Grid>
);

const LedgerTableHeader = () => (
    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9', zIndex: 1 }}>
        <tr>
            {TABLE_COLUMNS.map((col) => (
                <th key={col.key} style={cellStyle}>{col.label}</th>
            ))}
        </tr>
    </thead>
);

const LedgerTableBody = ({ data }) => (
    <tbody>
        {data.map((item, itemIndex) => {
            const rowSpanCount = item.stkDtl.length;
            return item.stkDtl.map((stkItem, stkIndex) => {
                const isTotalRow = stkItem.row === 'total';
                return (
                    <tr
                        key={stkItem.id ?? `${itemIndex}-${stkIndex}`}
                        style={{
                            backgroundColor: isTotalRow ? '#4A4947' : undefined,
                            color: isTotalRow ? '#ffffff' : undefined,
                        }}
                    >
                        {stkIndex === 0 && GROUP_COLUMN_KEYS.map((key) => (
                            <td key={key} rowSpan={rowSpanCount} style={cellStyle}>
                                {item[key]}
                            </td>
                        ))}
                        <td style={cellStyle}>{stkItem.docType}</td>
                        <td style={cellStyle}>{stkItem.docNo}</td>
                        <td style={cellStyle}>{stkItem.date}</td>
                        <td style={cellStyle}>{stkItem.grnNo}</td>
                        <td style={cellStyle}>{stkItem.inward}</td>
                        <td style={cellStyle}>{stkItem.issue !== null ? stkItem.issue : ''}</td>
                        <td style={cellStyle}>{stkItem.balQty}</td>
                    </tr>
                );
            });
        })}
    </tbody>
);

const LedgerTable = ({ data, height }) => (
    <Box
        sx={{
            height,
            backgroundColor: 'white',
            border: '1px solid black',
            width: '100%',
            overflowY: 'scroll',
            overflowX: 'scroll',
            '&::-webkit-scrollbar': { width: '12px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'black', borderRadius: '10px' },
            '&::-webkit-scrollbar-track': { backgroundColor: 'lightgrey' },
            scrollbarColor: '#f9f9fb lightgrey',
            scrollbarWidth: 'thin',
        }}
    >
        <table id="customers" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <LedgerTableHeader />
            <LedgerTableBody data={data} />
        </table>
    </Box>
);

const PaginationControls = ({ page, totalPages, loading, onPrevious, onNext }) => (
    <Grid container justifyContent="flex-end" style={{ marginTop: '15px' }}>
        <Button
            variant="contained"
            disabled={page === 1 || loading}
            onClick={onPrevious}
            style={{ marginRight: '10px' }}
        >
            Previous
        </Button>

        <Typography style={{ fontWeight: 'bold', margin: '0 10px' }}>
            Page {page} of {totalPages}
        </Typography>

        <Button
            variant="contained"
            disabled={page === totalPages || loading}
            onClick={onNext}
            style={{ marginLeft: '10px' }}
        >
            Next
        </Button>
    </Grid>
);

// ---------- main component ----------

const WipStockLedgerReport = () => {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedItemGroup, setSelectedItemGroup] = useState('');
    const [itemList, setItemList] = useState([]);
    const [selectedItemIds, setSelectedItemIds] = useState([]);
    const [locationLists, setLocationLists] = useState([]);
    const [itemGroupLists, setItemGroupLists] = useState([]);
    const [ledgerReportData, setLedgerReportData] = useState([]);
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);
    const [loading, setLoading] = useState(false);

    // ---------- initial data load ----------
    useEffect(() => {
        GetSearchedItems({ code: '' }, (res) => setItemList(res?.data || []), () => { });
        GetMainLocation((res) => setLocationLists(res?.data || []), () => { });
        GetItemGroup((res) => setItemGroupLists(res?.data || []), () => { });
    }, []);

    // ---------- responsive height ----------
    useEffect(() => {
        const handleResize = () => setScreenHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ---------- initial financial-year date range ----------
    useEffect(() => {
        const { from, to } = getCurrentFinancialYearRange();
        setFromDate(from);
        setToDate(to);
    }, []);

    // ---------- item search (debounced) ----------
    const fetchItemOptions = useCallback((searchTerm) => {
        GetSearchedItems(
            { code: searchTerm },
            (res) => setItemList(res?.data || []),
            () => { }
        );
    }, []);

    const debouncedItemSearch = useMemo(
        () => debounce(fetchItemOptions, 400),
        [fetchItemOptions]
    );

    useEffect(() => () => debouncedItemSearch.cancel(), [debouncedItemSearch]);

    const handleItemSelectionChange = useCallback((value) => {
        setSelectedItemIds(value ? value.map((item) => item.id) : []);
    }, []);

    // ---------- date handlers ----------
    const handleFromDateChange = useCallback((e) => {
        setFromDate(e.target.value);
    }, []);

    const handleToDateChange = useCallback((e) => {
        setToDate(e.target.value);
    }, []);

    // ---------- report fetch ----------
    const handleViewSuccess = useCallback((dataObject, requestedPage) => {
        setTotalPages(dataObject?.totalPages || 1);
        setPage(dataObject?.page || requestedPage);
        setLedgerReportData(dataObject?.data || []);
        setLoading(false);
    }, []);

    const handleViewException = useCallback(() => {
        setLoading(false);
    }, []);

    const handleViewClick = useCallback((requestedPage = 1) => {
        setLoading(true);
        GetWipStockLedgerReport(
            {
                from: fromDate,
                to: toDate,
                items: selectedItemIds,
                locId: selectedLocation,
                itmGrpId: selectedItemGroup,
                page: requestedPage,
            },
            (dataObject) => handleViewSuccess(dataObject, requestedPage),
            handleViewException
        );
    }, [fromDate, toDate, selectedItemIds, selectedLocation, selectedItemGroup, handleViewSuccess, handleViewException]);

    const tableHeight = useMemo(() => screenHeight - 367, [screenHeight]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '10px', marginTop: '10px' }}>
                <Typography sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold' }} variant="h5">
                    WIP Stock Ledger Report
                </Typography>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                <ReportFilters
                    fromDate={fromDate}
                    toDate={toDate}
                    onFromDateChange={handleFromDateChange}
                    onToDateChange={handleToDateChange}
                    itemOptions={itemList}
                    onItemSearchInput={debouncedItemSearch}
                    onItemSelectionChange={handleItemSelectionChange}
                    locationOptions={locationLists}
                    selectedLocation={selectedLocation}
                    onLocationChange={(e) => setSelectedLocation(e.target.value)}
                    itemGroupOptions={itemGroupLists}
                    selectedItemGroup={selectedItemGroup}
                    onItemGroupChange={(e) => setSelectedItemGroup(e.target.value)}
                    loading={loading}
                    onViewClick={handleViewClick}
                />

                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} margin={1}>
                    <Card style={{
                        boxShadow: '0 10px 10px 10px rgba(0, 0, 0, 0.2)',
                        borderRadius: '10px',
                        width: '100%',
                        border: '1px solid black',
                    }}>
                        {loading && (
                            <Box sx={{ width: '100%' }}>
                                <LinearProgress />
                            </Box>
                        )}

                        <CardContent>
                            <LedgerTable data={ledgerReportData} height={tableHeight} />

                            <PaginationControls
                                page={page}
                                totalPages={totalPages}
                                loading={loading}
                                onPrevious={() => handleViewClick(page - 1)}
                                onNext={() => handleViewClick(page + 1)}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </form>
        </div>
    );
};

export default WipStockLedgerReport;