import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Checkbox, FormControl, InputLabel, Select,
    MenuItem, Typography, List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import {
    DistributorShowList, MeterBuildingShowList, MetterMappingList,
    ShowFeederList, GroupMappingMeter, UnGroupMappingMeter, GroupedMetersShow,
    MeterPlantShow,
    UtilityMeterView, UtilityGroupMeterAdd, UtilityGroupMeterView, UtilityGroupMeterDelete,
} from '../../Services/NodeJsApiServices';

const MeterGrouping = ({
    open,
    setOpen,
    configSetupData,
    editsubCategorySetup,
    handleClose,
    openNotification,
    setNotification,
    isAddButton,
}) => {
    const isUtility = configSetupData?.categoryKind === 'Utility Meter';

    const [leftChecked, setLeftChecked]   = useState([]);
    const [rightChecked, setRightChecked] = useState([]);
    const [rightMeters, setRightMeters]   = useState([]);
    const [availableMeters, setAvailableMeters] = useState([]);

    /* Energy filters */
    const [buildingShow, setBuildingShow]       = useState([]);
    const [distributorShow, setDistributorShow] = useState([]);
    const [feederShow, setFeederShow]           = useState([]);
    const [buildingName, SetBuildingName]       = useState('');
    const [distributor, setDistributor]         = useState('');
    const [subDistributor, setSubDistributor]   = useState('');

    /* Utility filters */
    const [plantShow, setPlantShow]     = useState([]);
    const [plantId, setPlantId]         = useState('');
    const [utilBuildingId, setUtilBuildingId] = useState('');

    const filteredAvailable = availableMeters.filter(
        (m) => !rightMeters.some((rm) => rm.id === m.id)
    );

    const handleToggleLeft  = (id) => setLeftChecked((p)  => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
    const handleToggleRight = (id) => setRightChecked((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

    const reset = () => {
        setLeftChecked([]);
        setRightChecked([]);
        setAvailableMeters([]);
        setRightMeters([]);
        SetBuildingName('');
        setDistributor('');
        setSubDistributor('');
        setPlantId('');
        setUtilBuildingId('');
    };

    const handleDialogClose = () => { setOpen(false); reset(); };

    /* ─── load grouped meters on open ─── */
    useEffect(() => {
        setOpen(open);
        if (!open) return;

        const categoryId    = (configSetupData && (configSetupData.categoryId || configSetupData.id)) || '';
        const subCategoryId = (editsubCategorySetup && editsubCategorySetup.id) || '';

        if (isUtility) {
            MeterPlantShow((d) => setPlantShow(d?.data || []), () => {});
            MeterBuildingShowList((d) => setBuildingShow(d?.data || []), () => {});
            UtilityGroupMeterView(
                { categoryId, subCategoryId },
                (resp) => { setRightMeters(resp?.data || []); setRightChecked([]); },
                () => {}
            );
        } else {
            MeterBuildingShowList((d) => setBuildingShow(d?.data || []), () => {});
            DistributorShowList((d) => setDistributorShow(d?.data || []), () => {});
            GroupedMetersShow(
                { categoryId, subCategoryId },
                (resp) => { setRightMeters(resp?.data || []); setRightChecked([]); },
                () => {}
            );
        }
    }, [open]);

    /* ─── load available meters when energy filters change ─── */
    useEffect(() => {
        if (!open || isUtility) return;
        if (buildingName || distributor || subDistributor) {
            MetterMappingList(
                { buildingId: buildingName, distributorId: distributor, feederId: subDistributor },
                (d) => { setAvailableMeters(d?.data || []); setLeftChecked([]); },
                () => {}
            );
        }
    }, [buildingName, distributor, subDistributor]);

    /* ─── load available utility meters when utility filters change ─── */
    useEffect(() => {
        if (!open || !isUtility) return;
        if (plantId || utilBuildingId) {
            UtilityMeterView(
                (d) => {
                    const all = d?.data || [];
                    const filtered = all.filter((m) => {
                        if (plantId        && String(m.plantId)    !== String(plantId))        return false;
                        if (utilBuildingId && String(m.buildingId) !== String(utilBuildingId)) return false;
                        return true;
                    });
                    setAvailableMeters(filtered);
                    setLeftChecked([]);
                },
                () => {}
            );
        }
    }, [plantId, utilBuildingId]);

    /* ─── notifications ─── */
    const notifySuccess = (msg) => {
        setNotification && setNotification({ status: true, type: 'success', message: msg });
        setTimeout(() => { handleClose && handleClose(); }, 1200);
    };
    const notifyError = (msg) => {
        setNotification && setNotification({ status: true, type: 'error', message: msg });
        setTimeout(() => { handleClose && handleClose(); }, 1200);
    };

    /* ─── group >> ─── */
    const handleAdd = () => {
        const categoryId    = (configSetupData && (configSetupData.categoryId || configSetupData.id)) || null;
        const subCategoryId = (editsubCategorySetup && editsubCategorySetup.id) || null;

        if (isUtility) {
            const meterObj = leftChecked.map((meterId) => ({
                categoryId, subCategoryId, utilityMeterId: meterId,
            }));
            UtilityGroupMeterAdd({ meterObj }, (resp) => {
                setRightMeters(resp?.data || []);
                setLeftChecked([]);
                setAvailableMeters([]);
                setPlantId('');
                setUtilBuildingId('');
                notifySuccess(resp?.message || 'Grouped successfully');
            }, (e, msg) => notifyError(msg));
        } else {
            const meterObj = leftChecked.map((meterid) => ({
                categoryId, subCategoryId,
                buildingId: buildingName,
                distributerId: distributor,
                feederId: subDistributor,
                meterId: meterid,
            }));
            GroupMappingMeter({ meterObj }, (resp) => {
                setRightMeters(resp?.data || []);
                setLeftChecked([]);
                setAvailableMeters([]);
                SetBuildingName('');
                setDistributor('');
                setSubDistributor('');
                notifySuccess(resp?.message || 'Grouped successfully');
            }, (e, msg) => notifyError(msg));
        }
    };

    /* ─── ungroup << ─── */
    const handleRemove = () => {
        if (rightChecked.length === 0) return;
        const categoryId    = (configSetupData && (configSetupData.categoryId || configSetupData.id)) || '';
        const subCategoryId = (editsubCategorySetup && editsubCategorySetup.id) || '';

        if (isUtility) {
            UtilityGroupMeterDelete({ groupIds: rightChecked }, (resp) => {
                setRightChecked([]);
                setRightMeters([]);
                UtilityGroupMeterView({ categoryId, subCategoryId }, (g) => { setRightMeters(g?.data || []); setRightChecked([]); }, () => {});
                notifySuccess(resp?.message || 'Ungrouped successfully');
            }, () => notifyError('Ungroup failed'));
        } else {
            UnGroupMappingMeter({ meterIds: rightChecked }, (resp) => {
                setRightChecked([]);
                setRightMeters([]);
                GroupedMetersShow({ categoryId, subCategoryId }, (g) => { setRightMeters(g?.data || []); setRightChecked([]); }, () => {});
                MetterMappingList({ buildingId: buildingName, distributorId: distributor, feederId: subDistributor }, (a) => setAvailableMeters(a?.data || []), () => {});
                notifySuccess(resp?.message || 'Ungrouped successfully');
            }, () => notifyError('Ungroup failed'));
        }
    };

    return (
        <Dialog open={open} maxWidth="md" fullWidth>
            <DialogTitle>Meter Grouping</DialogTitle>
            <DialogContent>

                {/* ─── Filters ─── */}
                <Box display="flex" gap={2} mb={2} mt={1}>
                    {isUtility ? (
                        <>
                            <FormControl fullWidth>
                                <InputLabel>Plant</InputLabel>
                                <Select value={plantId} label="Plant"
                                    onChange={(e) => setPlantId(e.target.value)}>
                                    {plantShow.map((d) => (
                                        <MenuItem key={d.id} value={d.id}>{d.plantName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Building</InputLabel>
                                <Select value={utilBuildingId} label="Building"
                                    onChange={(e) => setUtilBuildingId(e.target.value)}>
                                    {buildingShow.map((d) => (
                                        <MenuItem key={d.id} value={d.id}>{d.buildingName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </>
                    ) : (
                        <>
                            <FormControl fullWidth>
                                <InputLabel>Building Name</InputLabel>
                                <Select value={buildingName} label="Building Name"
                                    onChange={(e) => { SetBuildingName(e.target.value); }}>
                                    {buildingShow.map((d) => (
                                        <MenuItem key={d.id} value={d.id}>{d.buildingName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Distributor</InputLabel>
                                <Select value={distributor} label="Distributor"
                                    onChange={(e) => {
                                        const id = e.target.value;
                                        setDistributor(id);
                                        ShowFeederList({ distributorId: id }, (d) => setFeederShow(d?.data || []), () => {});
                                    }}>
                                    {distributorShow.map((d) => (
                                        <MenuItem key={d.id} value={d.id}>{d.distributorName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Subdistributor</InputLabel>
                                <Select value={subDistributor} label="Subdistributor"
                                    onChange={(e) => setSubDistributor(e.target.value)}>
                                    {feederShow.map((d) => (
                                        <MenuItem key={d.id} value={d.id}>{d.feederName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </>
                    )}
                </Box>

                {/* ─── Transfer lists ─── */}
                <Box display="flex" gap={4} alignItems="flex-start">
                    {/* Left: Available */}
                    <Box flex={1}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontSize: 18, fontWeight: 400 }}>
                            Available Meters
                        </Typography>
                        <List dense sx={{ minHeight: 160, width: '100%' }}>
                            {filteredAvailable.map((meter) => (
                                <ListItem key={meter.id} button onClick={() => handleToggleLeft(meter.id)}>
                                    <ListItemIcon>
                                        <Checkbox edge="start" checked={leftChecked.includes(meter.id)} tabIndex={-1} disableRipple />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={isUtility
                                            ? `${meter.meterName || 'Unknown'} - ${meter.meterType} - ${meter.edgeDeviceName || ''}`
                                            : `${meter.meterName || 'Unknown'} - ${meter.slaveId} - ${meter.edgeDeviceName}`}
                                        primaryTypographyProps={{ fontSize: 16, fontWeight: 500 }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    {/* Middle buttons */}
                    <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={4}>
                        <Button variant="contained" onClick={handleAdd}    disabled={leftChecked.length === 0}>&gt;&gt;</Button>
                        <Button variant="contained" onClick={handleRemove} disabled={rightChecked.length === 0}>&lt;&lt;</Button>
                    </Box>

                    {/* Right: Grouped */}
                    <Box flex={1}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontSize: 18, fontWeight: 400 }}>
                            Grouped Meters
                        </Typography>
                        <List dense sx={{ minHeight: 160, width: '100%' }}>
                            {rightMeters.map((meter) => (
                                <ListItem key={meter.id} button onClick={() => handleToggleRight(meter.id)}>
                                    <ListItemIcon>
                                        <Checkbox edge="start" checked={rightChecked.includes(meter.id)} tabIndex={-1} disableRipple />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={isUtility
                                            ? `${meter.meterName || meter.groupedMeter || 'Unknown'} - ${meter.meterType || ''}`
                                            : `${meter.groupedMeter} - ${meter.slaveId} - ${meter.edgeDeviceName}`}
                                        primaryTypographyProps={{ fontSize: 16, fontWeight: 500 }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDialogClose} color="secondary">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default MeterGrouping;
