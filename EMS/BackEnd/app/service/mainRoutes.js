const router = require("express").Router();
const validateToken = require('../config/validateToken');
// const { EnergyMeterCronJob } = require('../controllers/CronsEnergyMeterSegregationCron.js');
const { EnergyMeterCronJobNew } = require('../controllers/CronsEnergyMeterSegregationCronNew.js');
const { segregation } = require('../controllers/CronsSensorSegregationCron.js');
const { SensorAggregateCron } = require('../controllers/CronsSensorAggregateCron.js');
// const { DeviceDisconectedStatusCron } = require('../controllers/CronsDeviceDisconectedStatusCron.js');
const { MaintainRawTableCron } = require('../controllers/CronsMaintainRawTableCron.js');
const { EnergySummaryBackupDataCron } = require('../controllers/CronsManageDataCronEnergySummaryBackupDataCron.js');
const { SenorDataSummaryData } = require('../controllers/CronsManageDataCronSenorDataSummaryData.js');


module.exports = app => {
    router.use("/alert1", require('../routes/AlertCronJobTestApi'));
    router.use("/alert", require('../routes/AlertApi'));
    router.use("/MachineStatus", require('../routes/MachineStatusApi'));
    router.use("/energy", require('../routes/EnergyRouteApi.js'));
    router.use("/report", require('../routes/ReportApi'));
    router.use("/reportSettings", require('../routes/reportSettingsApi.js'));
    router.use("/emailRecipients", require('../routes/emailRecipientsApi.js'));
    router.use("/sensorReport", require('../routes/SensorReportApi.js'));
    router.use("/environmentalReport", require('../routes/EnvironmentalReportApi.js'));
    router.use("/machineList", require('../routes/MachineApi.js'));
    router.use("/AssignShift", require('../routes/AssignShiftApi.js'));
    router.use("/companyDetails", require('../routes/CompanyDetailsApi.js'));

    // hierarchy
    router.use("/incomer", require('../routes/IncomerApi.js'));
    router.use("/plants", require('../routes/PlantApi.js'));
    router.use("/distributor", require('../routes/DistributorApi.js'));
    router.use("/feeder", require('../routes/FeederApi.js'));
    router.use("/authLogin", require('../routes/AuthApi.js'));

    // shifali
    router.use("/user", require('../routes/userApi.js'));
    router.use("/role", require('../routes/roleApi.js'));
    router.use("/assignRole", require('../routes/assignRoleApi.js'));
    router.use("/Department", require('../routes/DepartmentApi.js'));
    router.use("/Operator", require('../routes/OperatorApi.js'));
    router.use("/login", require('../routes/LoginApi.js'));
    router.use("/sensors", require('../routes/SensorsApi.js'));
    router.use("/Sensors_settongs", require('../routes/Sensors_dashboardApi.js'));
    router.use("/shifts", require('../routes/AssignshiftsApi.js'));

    // VISHNU
    router.use("/Asset", require('../routes/AmcModulesAssetAssetApi.js'));
    router.use("/Assettype", require('../routes/AmcModulesAssetAssetTypeApi'));
    router.use("/Section", require('../routes/AmcModulesAssetSectionApi'));
    router.use("/AssetGroup", require('../routes/AmcModulesAssetAssetGroupapi'));
    router.use("/MstList", require('../routes/AmcModulesAssetMstassetListSApi'));
    router.use("/Vendor", require('../routes/AmcModulesAssetVendorApi'));
    router.use("/Transfer", require('../routes/AmcModulesAssetTransferapi'));
    router.use("/AmcAdd", require('../routes/AmcModulesAMCAmcAddApi.js'));
    router.use("/Sevices", require('../routes/AmcModulesAMCSevicesApi'));
    router.use("/ServiceDueApi", require('../routes/AmcModulesAMCServiceDueApi'));
    router.use("/MainteSchd", require('../routes/AmcModulesMaintenanceScheduleMainteSchdApi.js'));
    router.use("/MainteAppro", require('../routes/AmcModulesMaintenanceScheduleMainteApproApi'));
    router.use("/Certificate", require('../routes/AmcModulesCertificateCertificateAddApi.js'));
    router.use("/Insurance", require('../routes/AmcModulesINSURANCEInsuranceApi.js'));
    router.use("/Warranty", require('../routes/AmcModulesWarrantyWarrantyApi.js'));
    router.use("/PrevMaint", require('../routes/AmcModulesPreMaintApiPreMaintainApi.js'));
    router.use("/deviceCategory", require('../routes/AmcModulesDeviceDeviceChatogoryApi.js'));
    router.use("/device", require('../routes/AmcModulesDeviceDeviceApi.js'));

    // SCADA
    router.use("/scada",           require('../routes/ScadaApi.js'));
    router.use("/scadaName",       require('../routes/ScadaNameApi.js'));
    router.use("/scadaTable",      require('../routes/ScadaTableApi.js'));
    router.use("/scadaHyperlink",  require('../routes/ScadaHyperlinkApi.js'));

    // Plant Overview — Energy/Water consumption panel manual meter picker config
    router.use("/plantConsumptionConfig", require('../routes/PlantConsumptionConfigApi.js'));

    // SCADA – Tag/Sensor list from `sensors` table filtered by deviceId + optional slaveId
    const ScadaCtrl = require('../controllers/ScadaController');
    router.post("/DevTagList", ScadaCtrl.getTagsByDevice);

    // MachineParaAllocationTab
    router.use("/DeviceCategory", require('../routes/AmcModulesMachineParaAllocationTabDeviceCategoryApi.js'));
    router.use("/SensorCategory", require('../routes/AmcModulesMachineParaAllocationTabSensorCategoryApi'));
    router.use("/AddSensor", require('../routes/AmcModulesMachineParaAllocationTabAddSensorApi'));
    router.use("/EdgeDevice", require('../routes/AmcModulesMachineParaAllocationTabEdgeDeviceApi'));
    router.use("/MachineAllocation", require('../routes/AmcModulesMachineParaAllocationTabMachineAllocationApi'));
    router.use("/MeterAllocation", require('../routes/AmcModulesMachineParaAllocationTabMeterAllocationApi'));
    router.use("/UtilityMeter", require('../routes/UtilityMeterApi'));
    router.use("/UtilityGroupMeter", require('../routes/UtilityGroupMeterApi'));
    router.use("/TagAdd", require('../routes/AmcModulesMachineParaAllocationTabTagAddApi'));

    // Configaration
    router.use("/UnitMaster", require('../routes/AmcModulesConfigarationUnitMasterApi.js'));
    router.use("/CapacityMeasure", require('../routes/AmcModulesConfigarationCapacityMeasureApi'));
    router.use("/DepartmentOperation", require('../routes/AmcModulesConfigarationDepartmentApi'));
    router.use("/Machine", require('../routes/AmcModulesConfigarationMachineApi'));
    router.use("/ScheduleEvent", require('../routes/AmcModulesConfigarationScheduleEventApi'))
    router.use("/AddEvent", require('../routes/AmcModulesConfigarationAddEventApi'))
    router.use("/AddMaxEnergy", require('../routes/AmcModulesConfigarationAddMaxEnergyApi'))
    router.use("/EnergyTariff", require('../routes/AmcModulesConfigarationEnergyTariffApi'))
    router.use("/ServerUsageThresholds", require('../routes/AmcModulesConfigarationServerUsageThresholdsApi.'))
    router.use("/AddTools", require('../routes/AmcModulesConfigarationAddToolsApi'))
    router.use("/AddSensorconfi", require('../routes/AmcModulesConfigarationAddSensorApi'))
    router.use("/Setalert", require('../routes/AmcModulesConfigarationSetalertApi'))
    router.use("/SetConsumable", require('../routes/AmcModulesConfigarationSetConsumableApi'))
    router.use("/AlertConfigaration", require('../routes/AmcModulesConfigarationAlertConfigarationApi'))
    router.use("/FailuremetricTarget", require('../routes/AmcModulesConfigarationFailuremetricTargetApi'))
    router.use("/UploadImage", require('../routes/AmcModulesConfigarationUploadImageApi'))
    router.use("/Category", require('../routes/AmcModulesProblemCategoryProblemCategoryApi.js'))
    router.use("/Natureprob", require('../routes/AmcModulesNatureOfProblemNatureOfProblemApi.js'))
    router.use("/machineController", require('../routes/AmcModulesFaultMetricReportFaultMetricReportApi.js'))
    router.use("/AlertData", require('../routes/AmcModulesAlertDataAlertDataApi.js'))

    // Meter Category & Meter Type Masters
    router.use("/MeterCategory", require('../routes/MeterCategoryApi.js'));
    router.use("/MeterTypeMaster", require('../routes/MeterTypeApi.js'));

    // Energy Saving Module
    router.use("/energySaving", require('../routes/EnergySavingApi.js'));

    //shashank
    router.use("/regions", require('../routes/regionApi.js'))
    router.use("/locations", require('../routes/locationApi.js'))
    router.use("/areas", require('../routes/areaApi.js'))
    router.use("/buildings", require('../routes/buildingApi.js'))
    router.use("/floors", require('../routes/floorApi.js'))
    router.use("/maincategory", require('../routes/categoryApi.js'))
    router.use("/subcategory", require('../routes/subCategoryApi.js'))
    router.use("/mainApi", require('../routes/searchApi.js'))
    router.use("/dashboard", require('../routes/dashboardApi.js'))

    // SMS Wallet / SMS gateway configuration
    router.use("/smsSettings", require('../routes/SmsSettingsApi.js'))
    router.use("/smsWallet", require('../routes/SmsWalletApi.js'))
    router.use("/alertRecipients", require('../routes/AlertRecipientsApi.js'))

    // SensorAggregateCron();
    // EnergyMeterCronJobNew();
    // segregation();
    // EnergySummaryBackupDataCron();
    // MaintainRawTableCron();

    app.use('/api', router);
}