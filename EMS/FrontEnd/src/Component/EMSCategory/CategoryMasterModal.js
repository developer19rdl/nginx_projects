
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControl,
    MenuItem,
    Dialog,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import NotificationBar from '../../Utility/NotificationBar';
import {
    CategoryAdd, CategoryUpdate, SubCategoryAdd, SubCategoryUpdate,
    CategoryShowList, MeterBuildingShowList, FloorShowList,
    BuildingFloorShowList, MeterPlantShow,
} from '../../Services/NodeJsApiServices';


const CategoryMasterModal = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData } = props;
    const [typeName, setTypeName] = useState('main');
    const [categoryKind, setCategoryKind] = useState('Energy Meter');

    const [subCategory, setSubCategory] = useState('');
    const [mainList, setMainList] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [buildingId, setBuildingId] = useState('');
    const [plantId, setPlantId] = useState('');
    const [plantList, setPlantList] = useState([]);
    const [floorId, setFloorId] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [subcategoryName, setSubCategoryName] = useState('');
    const [subCategoryDescription, setSubCategoryDescription] = useState('');

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        setOpen(open);
        loaderData();
        CategoryShowList(handleMainSuccess, handleMainException);
        if (open) {
            MeterBuildingShowList(handleBuildingSuccess, handleBuildingException);
            MeterPlantShow(handlePlantSuccess, handlePlantException);
        }
    }, [configSetupData, open]);

    const handlePlantSuccess = (dataObject) => setPlantList(dataObject?.data || []);
    const handlePlantException = () => {};
    const handleFloorSuccess = (dataObject) => setFloors(dataObject?.data || []);
    const handleFloorException = () => {};
    const handleMainSuccess = (dataObject) => setMainList(dataObject?.data || []);
    const handleMainException = () => {};
    const handleBuildingSuccess = (dataObject) => setBuildings(dataObject?.data || []);
    const handleBuildingException = () => {};

    const loaderData = () => {
        setCategoryName('');
        setDescription('');
        setSortOrder('');
        setSelectedCategory('');
        setSubCategoryName('');
        setSubCategoryDescription('');
        setPlantId('');
        setBuildingId('');
        setFloorId('');
        setFloors([]);
        setCategoryKind('Energy Meter');

        if (!isAddButton && configSetupData && configSetupData.id) {
            setCategoryName(configSetupData.categoryName || '');
            setDescription(configSetupData.categoryDesc || '');
            setSortOrder(configSetupData.sortOrder ?? '');
            setSelectedCategory(configSetupData.parentCategoryId || '');
            setSubCategoryName(configSetupData.subCategoryName || '');
            setSubCategoryDescription(configSetupData.subCategoryDesc || '');
            setTypeName(configSetupData.typeName || 'main');
            setPlantId(configSetupData.plantId || '');
            setBuildingId(configSetupData.buildingId || '');
            setFloorId(configSetupData.floorId || '');
            setCategoryKind(configSetupData.categoryKind || 'Energy Meter');
            if (configSetupData.buildingId) {
                BuildingFloorShowList(
                    { buildingId: configSetupData.buildingId },
                    handleFloorSuccess,
                    handleFloorException
                );
            }
        } else {
            setTypeName('main');
        }
    };

    const ClearData = () => {
        setOpen(false);
        setCategoryName('');
        setDescription('');
        setSortOrder('');
        setSelectedCategory('');
        setSubCategoryName('');
        setSubCategoryDescription('');
        setPlantId('');
        setBuildingId('');
        setFloorId('');
        setFloors([]);
        setTypeName('main');
        setCategoryKind('Energy Meter');
        setRefreshData(oldvalue => !oldvalue);
    };

    const handleClose = () => {
        setNotification({ status: false, type: '', message: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (typeName === 'main') {
            const payload = {
                plantId,
                buildingId,
                floorId,
                categoryName,
                categoryDesc: description,
                categoryKind,
                sortOrder: sortOrder === '' ? null : sortOrder,
            };
            const service = isAddButton ? CategoryAdd : CategoryUpdate;
            const data = isAddButton ? payload : { id: props?.configSetupData?.id, ...payload };
            service(data, handleApiSuccess, handleApiException);
        } else {
            const payload = {
                plantId,
                buildingId,
                floorId,
                categoryId: selectedCategory,
                subCategoryName: subcategoryName,
                subCategoryDesc: subCategoryDescription,
                categoryKind,
            };
            const service = isAddButton ? SubCategoryAdd : SubCategoryUpdate;
            const data = isAddButton ? payload : { id: props?.configSetupData?.id, ...payload };
            service(data, handleApiSuccess, handleApiException);
        }
    };

    const handleApiSuccess = (dataObject) => {
        setNotification({ status: true, type: 'success', message: dataObject?.message || 'Saved successfully' });
        setRefreshData && setRefreshData((prev) => !prev);
        setTimeout(() => {
            handleClose();
            setOpen(false);
        }, 1200);
    };

    const handleApiException = (status, message) => {
        setNotification({ status: true, type: 'error', message: message || 'Request failed' });
    };

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '100%' } }}
            open={open}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle>{isAddButton ? 'Add Category' : 'Edit Category'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} paddingTop={1}>

                        {/* ─── Energy / Utility Toggle ─── */}
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                            <ToggleButtonGroup
                                value={categoryKind}
                                exclusive
                                onChange={(e, val) => { if (val) setCategoryKind(val); }}
                                size="small"
                                sx={{
                                    '& .MuiToggleButton-root.Mui-selected': {
                                        backgroundColor: '#0e2d5d',
                                        color: '#fff',
                                        '&:hover': { backgroundColor: '#0e2d5d' },
                                    },
                                }}
                            >
                                <ToggleButton value="Energy Meter" sx={{ px: 3, fontWeight: 600 }}>
                                    Energy Meter
                                </ToggleButton>
                                <ToggleButton value="Utility Meter" sx={{ px: 3, fontWeight: 600 }}>
                                    Utility Meter
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Grid>

                        {/* Plant */}
                        <Grid item xs={6}>
                            <TextField
                                select label="Plant" variant="outlined" fullWidth size="small"
                                value={plantId}
                                onChange={(e) => setPlantId(e.target.value)}
                            >
                                {plantList.map((data) => (
                                    <MenuItem key={data.id} value={data.id}>
                                        {data.plantName || data.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Building */}
                        <Grid item xs={6}>
                            <TextField
                                select label="Building" variant="outlined" fullWidth size="small"
                                value={buildingId}
                                onChange={(e) => {
                                    setBuildingId(e.target.value);
                                    BuildingFloorShowList({ buildingId: e.target.value }, handleFloorSuccess, handleFloorException);
                                }}
                            >
                                {buildings.map((data) => (
                                    <MenuItem key={data.id} value={data.id}>
                                        {data.buildingName || data.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Floor */}
                        <Grid item xs={6}>
                            <TextField
                                select label="Floor" variant="outlined" fullWidth size="small"
                                value={floorId || ''}
                                onChange={(e) => setFloorId(e.target.value)}
                            >
                                {floors.length > 0 ? (
                                    floors.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.floorName}</MenuItem>
                                    ))
                                ) : (
                                    <MenuItem value="NA">NA</MenuItem>
                                )}
                            </TextField>
                        </Grid>

                        {/* Type */}
                        <Grid item xs={6}>
                            <TextField
                                select label="Type" variant="outlined" fullWidth size="small"
                                value={typeName}
                                onChange={(e) => setTypeName(e.target.value)}
                            >
                                <MenuItem value="main">Main</MenuItem>
                                <MenuItem value="sub">Sub</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Main fields */}
                        {typeName === 'main' && (
                            <>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Category Name" variant="outlined" fullWidth required size="small"
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Description" variant="outlined" fullWidth size="small"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Display Order" type="number" variant="outlined" fullWidth size="small"
                                        placeholder="e.g. 1, 2, 3... (blank = alphabetical)"
                                        helperText="Controls this category's position in the tree/floor list. Leave blank to sort alphabetically."
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        inputProps={{ min: 1 }}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Sub fields */}
                        {typeName === 'sub' && (
                            <>
                                <Grid item xs={6}>
                                    <TextField
                                        select label="Category Name" variant="outlined" fullWidth size="small" required
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        {mainList.map((cat) => (
                                            <MenuItem key={cat.id} value={cat.id}>{cat.categoryName}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="SubCategory Name" variant="outlined" fullWidth size="small" required
                                        value={subcategoryName}
                                        onChange={(e) => setSubCategoryName(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="SubCategory Description" variant="outlined" fullWidth size="small"
                                        value={subCategoryDescription}
                                        onChange={(e) => setSubCategoryDescription(e.target.value)}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ margin: '10px' }}>
                    <Button onClick={ClearData} size="large">Cancel</Button>
                    <Button type="submit" size="large">{isAddButton ? 'Add' : 'Update'}</Button>
                </DialogActions>
            </form>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Dialog>
    );
};

export default CategoryMasterModal;
