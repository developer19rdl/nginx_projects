import Alerts from "../Reports/ReportTabPages/Alerts/Alerts";
import BiometricLog from "../Reports/ReportTabPages/BiometricLog/BiometricLog";
import Energy from "../Reports/ReportTabPages/Energy/Energy";
import BuildingEnergy from "../Reports/ReportTabPages/Energy/BuildingEnergy";
import EnergyHeatMap from "../Reports/ReportTabPages/Energy/EnergyHeatMap";
import FaultMetric from "../Reports/ReportTabPages/FaultMetric/FaultMetric";
import Gas from "../Reports/ReportTabPages/Gas/Gas";
import Water from "../Reports/ReportTabPages/Water/Water";
import GeneratorUsage from "../Reports/ReportTabPages/GeneratorUsage/GeneratorUsage";
import SensorReport from "../Reports/ReportTabPages/SensorReport/SensorReport";
import EnvironmentalReport from "../Reports/ReportTabPages/EnvironmentalReport/EnvironmentalReport";
import OperatorLog from "../Reports/ReportTabPages/OperatorLog/OperatorLog";
import PowderConsumption from "../Reports/ReportTabPages/PowderConsumption/PowderConsumption";
import Scrap from "../Reports/ReportTabPages/Scrap/Scrap";
import AddSensors from "../Configuration/ConfigTabPages/AddSensors/AddSensors";
import AlertConfig from "../Configuration/ConfigTabPages/AlertConfig/AlertConfig";
// import Consumable from "../Configuration/ConfigTabPages/Consumable/Consumable";
import ConfigEnergy from "../Configuration/ConfigTabPages/Energy/Energy";
// import FailureMetricTarget from "../Configuration/ConfigTabPages/FailureMetricTarget/FailureMetricTarget";
import UnitMaster from "../Configuration/ConfigTabPages/UnitMaster/UnitMaster";
import CapacityMeasureType from "../Configuration/ConfigTabPages/CapacityMeasureType/CapacityMeasureType";
import Department from "../Configuration/ConfigTabPages/Department/Department";
import Machine from "../Configuration/ConfigTabPages/Machine/Machine";
import Server from "../Configuration/ConfigTabPages/Server/Server";
import SetAlert from "../Configuration/ConfigTabPages/SetAlert/SetAlert";
import Tools from "../Configuration/ConfigTabPages/Tools/Tools";
import Add from "../Configuration/ConfigTabPages/Machine/MachineTabPages/Add/Add";
import View from "../Configuration/ConfigTabPages/Machine/MachineTabPages/View/View";
import ToolsAdd from "../Configuration/ConfigTabPages/Tools/ToolsTabPages/ToolsAdd/ToolsAdd";
import ToolsView from "../Configuration/ConfigTabPages/Tools/ToolsTabPages/ToolsView/ToolsView";
import AddSensorsPage from "../Configuration/ConfigTabPages/AddSensors/AddSensorsTabPages/AddSensorsPage/AddSensorsPage";
import SensorToMachinePage from "../Configuration/ConfigTabPages/AddSensors/AddSensorsTabPages/SensorToMachinePage/SensorToMachinePage";
import ViewSensorsPage from "../Configuration/ConfigTabPages/AddSensors/AddSensorsTabPages/ViewSensorsPage/ViewSensorsPage";
import SetAlertAddPage from "../Configuration/ConfigTabPages/SetAlert/SetAlertTabPages/SetAlertAddPage/SetAlertAddPage";
import SetAlertViewPage from "../Configuration/ConfigTabPages/SetAlert/SetAlertTabPages/SetAlertViewPage/SetAlertViewPage";
import SetAlertAddConsumable from "../Configuration/ConfigTabPages/SetAlert/SetAlertTabPages/SetAlertAddPage/SetAlertRadioTabs/SetAlertAddConsumable/SetAlertAddConsumable";
import SetAlertAddSensor from "../Configuration/ConfigTabPages/SetAlert/SetAlertTabPages/SetAlertAddPage/SetAlertRadioTabs/SetAlertAddSensor/SetAlertAddSensor";
// import ConsumableAddPage from "../Configuration/ConfigTabPages/Consumable/ConsumableTabPages/ConsumableAddPage/ConsumableAddPage";
// import ConsumableViewPage from "../Configuration/ConfigTabPages/Consumable/ConsumableTabPages/ConsumableViewPage/ConsumableViewPage";
import AlertConfigAdd from "../Configuration/ConfigTabPages/AlertConfig/AlertConfigTabPages/AlertConfigAdd/AlertConfigAdd";
import AlertConfigView from "../Configuration/ConfigTabPages/AlertConfig/AlertConfigTabPages/AlertConfigView/AlertConfigView";
// import FailureMetricTargetAdd from "../Configuration/ConfigTabPages/FailureMetricTarget/FailureMetricTargetTabs/FailureMetricTargetAdd/FailureMetricTargetAdd";
// import FailureMetricTargetView from "../Configuration/ConfigTabPages/FailureMetricTarget/FailureMetricTargetTabs/FailureMetricTargetView/FailureMetricTargetView";
import AnalyticsEnergy from "../CorrelationDataAnalytics/DataAnalyticsTab/AnalyticsEnergy/AnalyticsEnergy";
import Compressor from "../CorrelationDataAnalytics/DataAnalyticsTab/Compressor/Compressor";
import DemandActual from "../CorrelationDataAnalytics/DataAnalyticsTab/DemandActual/DemandActual";
import ForCasting from "../CorrelationDataAnalytics/DataAnalyticsTab/ForCasting/ForCasting";
import AnalyticsScrap from "../CorrelationDataAnalytics/DataAnalyticsTab/AnalyticsScrap/AnalyticsScrap";
import Approved from "../MaintenanceStatus/MaintenanceStatusTabPages/Approved/Approved";
import Closed from "../MaintenanceStatus/MaintenanceStatusTabPages/Closed/Closed";
import Pending from "../MaintenanceStatus/MaintenanceStatusTabPages/Pending/Pending";
import Rejected from "../MaintenanceStatus/MaintenanceStatusTabPages/Rejected/Rejected";
import AMCRenewal from "../Renewal/RenewalTabPages/AMCRenewal/AMCRenewal";
import CertificateRenewal from "../Renewal/RenewalTabPages/CertificateRenewal/CertificateRenewal";
import MaintenanceHeaderCard from "../MaintenanceApproval/MaintenanceApprovalDivider/MaintenanceHeaderCard/MaintenanceHeaderCard";
import AMCDues from "../MaintenanceApproval/MaintenanceApprovalDivider/MaintenanceBottomTable/AMCDues";
import CertificationDues from "../MaintenanceApproval/MaintenanceApprovalDivider/MaintenanceBottomTable/CertificationDues";
import MaintenanceSchedule from "../MaintenanceApproval/MaintenanceApprovalDivider/MaintenanceBottomTable/MaintenanceSchedule";
import WarrantyDues from "../MaintenanceApproval/MaintenanceApprovalDivider/MaintenanceBottomTable/WarrantyDues";
import StepOne from "../MaintenanceSchedule/MaintenanceScheduleSteps/StepOne/StepOne";
import StepTwo from "../MaintenanceSchedule/MaintenanceScheduleSteps/StepTwo/StepTwo";
import StepThree from "../MaintenanceSchedule/MaintenanceScheduleSteps/StepThree/StepThree";
import StepFour from "../MaintenanceSchedule/MaintenanceScheduleSteps/StepFour/StepFour";
import AddCertificate from "../Certificate/CertificateTabs/AddCertificate/AddCertificate";
import ViewCertificate from "../Certificate/CertificateTabs/ViewCertificate/ViewCertificate";
import Inspection from "../Certificate/CertificateTabs/Inspection/Inspection";
import InspectionDue from "../Certificate/CertificateTabs/InspectionDue/InspectionDue";
import AddAMC from "../AMC/AMCComponentTabs/AddAMC/AddAMC";
import ViewAMC from "../AMC/AMCComponentTabs/ViewAMC/ViewAMC";
import Service from "../AMC/AMCComponentTabs/Service/Service";
import ServiceDue from "../AMC/AMCComponentTabs/ServiceDue/ServiceDue";
import AddAsset from "../AssetComponent/AssetComponentTabs/AddAsset/AddAsset";
import AddVendor from "../AssetComponent/AssetComponentTabs/AddVendor/AddVendor";
import AssetGroup from "../AssetComponent/AssetComponentTabs/AssetGroup/AssetGroup";
import AssetType from "../AssetComponent/AssetComponentTabs/AssetType/AssetType";
import MasterAssetList from "../AssetComponent/AssetComponentTabs/MasterAssetList/MasterAssetList";
import TransferAsset from "../AssetComponent/AssetComponentTabs/TransferAsset/TransferAsset";
import AssetAdd from "../AssetComponent/AssetComponentTabs/AddAsset/AddAssetTabPages/AssetAdd/AssetAdd";
import AssetView from "../AssetComponent/AssetComponentTabs/AddAsset/AddAssetTabPages/AssetView/AssetView";
import AssetTypeAdd from "../AssetComponent/AssetComponentTabs/AssetType/AssetTypeTabPages/AssetTypeAdd/AssetTypeAdd";
import AssetTypeView from "../AssetComponent/AssetComponentTabs/AssetType/AssetTypeTabPages/AssetTypeView/AssetTypeView";
import AssetGroupAdd from "../AssetComponent/AssetComponentTabs/AssetGroup/AssetGroupTabs/AssetGroupAdd/AssetGroupAdd";
import AssetGroupView from "../AssetComponent/AssetComponentTabs/AssetGroup/AssetGroupTabs/AssetGroupView/AssetGroupView";
import VendorAdd from "../AssetComponent/AssetComponentTabs/AddVendor/AddVendorTabs/VendorAdd/VendorAdd";
import VendorView from "../AssetComponent/AssetComponentTabs/AddVendor/AddVendorTabs/VendorView/VendorView";
import ScheduleEvent from "../Configuration/ConfigTabPages/ScheduleEvent/ScheduleEvent";
import CreateEvent from "../Configuration/ConfigTabPages/CreateEvent/CreateEvent";
import UploadLogo from "../Configuration/ConfigTabPages/UploadLogo/UploadLogo";

export const ROOT_CYCLE = {
    ALERT_CYCLE: Alerts,
    BIOMETRIC_LOG_CYCLE: BiometricLog,
    ENERGY_CYCLE: Energy,
    Energy_BUILDING_WISE_CYCLE: BuildingEnergy,
    ENERGY_HEAT_MAP_CYCLE: EnergyHeatMap,
    FAULT_METRIC_CYCLE: FaultMetric,
    GAS_CYCLE: Gas,
    WATER_CYCLE: Water,
    GENERATOR_USAGE_CYCLE: GeneratorUsage,
    SENSOR_REPORT_CYCLE: SensorReport,
    ENVIRONMENTAL_REPORT_CYCLE: EnvironmentalReport,
    OPERATOR_LOG_CYCLE: OperatorLog,
    POWDER_CONSUMPTION_CYCLE: PowderConsumption,
    SCRAP_CYCLE: Scrap,
    ADD_SENSORS_CYCLE: AddSensors,
    ALERT_CONFIG_CYCLE: AlertConfig,
    // CONSUMABLE_CYCLE: Consumable,
    CONFIG_ENERGY_CYCLE: ConfigEnergy,
    // FAILURE_METRIC_TARGET_CYCLE: FailureMetricTarget,
    UNIT_MASTER_CYCLE: UnitMaster,
    CAPACITY_MEASURE_TYPE_CYCLE: CapacityMeasureType,
    DEPARTMENT_ADD_CYCLE: Department,
    MACHINE_CYCLE: Machine,
    SERVER_CYCLE: Server,
    SET_ALERT_CYCLE: SetAlert,
    TOOLS_CYCLE: Tools,
    ADD_CYCLE: Add,
    VIEW_CYCLE: View,
    TOOLS_ADD_CYCLE: ToolsAdd,
    TOOLS_VIEW_CYCLE: ToolsView,
    CONFIG_ADD_SERNSORS_CYCLE: AddSensorsPage,
    CONFIG_SENSOR_TO_MACHINE_CYCLE: SensorToMachinePage,
    CONFIG_VIEW_SERNSORS_CYCLE: ViewSensorsPage,
    CONFIG_SET_ALERT_ADD_CYCLE: SetAlertAddPage,
    CONFIG_SET_ALERT_VIEW_CYCLE: SetAlertViewPage,
    CONFIG_SET_ALERT_ADD_SENSOR_CYCLE: SetAlertAddSensor,
    CONFIG_SET_ALERT_ADD_CONSUMABLE_CYCLE: SetAlertAddConsumable,
    // CONFIG_CONSUMABLE_ADD_CYCLE: ConsumableAddPage,
    // CONFIG_CONSUMABLE_VIEW_CYCLE: ConsumableViewPage,
    CONFIG_ALERT_CONFIG_ADD_CYCLE: AlertConfigAdd,
    CONFIG_ALERT_CONFIG_VIEW_CYCLE: AlertConfigView,
    // CONFIG_FAILURE_METRIC_TARGET_ADD_CYCLE: FailureMetricTargetAdd,
    // CONFIG_FAILURE_METRIC_TARGET_VIEW_CYCLE: FailureMetricTargetView,
    CORRELATION_DATA_ANALYTICS_ENERGY_CYCLE: AnalyticsEnergy,
    CORRELATION_DATA_COMPRESSOR_CYCLE: Compressor,
    CORRELATION_DATA_DEMAND_ACTUAL_CYCLE: DemandActual,
    CORRELATION_DATA_FOR_CASTING_CYCLE: ForCasting,
    CORRELATION_DATA_ANALYTICS_SCRAP_CYCLE: AnalyticsScrap,
    MAINTENANCE_STATUS_APPROVED_CYCLE: Approved,
    MAINTENANCE_STATUS_CLOSED_CYCLE: Closed,
    MAINTENANCE_STATUS_PENDING_CYCLE: Pending,
    MAINTENANCE_STATUS_REJECTED_CYCLE: Rejected,
    RENEWAL_AMC_RENEWAL_CYCLE: AMCRenewal,
    RENEWAL_AMC_CERTIFICATE_CYCLE: CertificateRenewal,
    MAINTENANCE_APPROVAL_HEADER_CARD_CYCLE: MaintenanceHeaderCard,
    MAINTENANCE_APPROVAL_MAINTENANCE_SCHEDULE_CYCLE: MaintenanceSchedule,
    MAINTENANCE_APPROVAL_AMC_DUES_CYCLE: AMCDues,
    MAINTENANCE_APPROVAL_CERTIFICATION_DUES_CYCLE: CertificationDues,
    MAINTENANCE_APPROVAL_WARRANTY_DUES_CYCLE: WarrantyDues,
    MAINTENANCE_SCHEDULE_STEP_ONE_CYCLE: StepOne,
    MAINTENANCE_SCHEDULE_STEP_TWO_CYCLE: StepTwo,
    MAINTENANCE_SCHEDULE_STEP_THREE_CYCLE: StepThree,
    MAINTENANCE_SCHEDULE_STEP_FOUR_CYCLE: StepFour,
    CERTIFICATE_ADD_CERTIFICATE_CYCLE: AddCertificate,
    CERTIFICATE_VIEW_CERTIFICATE_CYCLE: ViewCertificate,
    CERTIFICATE_INSPECTION_CYCLE: Inspection,
    CERTIFICATE_INSPECTION_DUE_CYCLE: InspectionDue,
    AMC_ADD_AMC_CYCLE: AddAMC,
    AMC_VIEW_AMC_CYCLE: ViewAMC,
    AMC_SERVICE_AMC_CYCLE: Service,
    AMC_SERVICE_DUE_AMC_CYCLE: ServiceDue,
    ASSET_ADD_ASSET_CYCLE: AddAsset,
    ASSET_ADD_VENDOR_CYCLE: AddVendor,
    ASSET_ASSET_GROUP_CYCLE: AssetGroup,
    ASSET_ASSET_TYPE_CYCLE: AssetType,
    ASSET_MASTER_ASSET_LIST_CYCLE: MasterAssetList,
    ASSET_TRANSFER_ASSET_CYCLE: TransferAsset,
    ASSET_TAB_ASSET_ADD_CYCLE: AssetAdd,
    ASSET_TAB_ASSET_VIEW_CYCLE: AssetView,
    ASSET_TYPE_TAB_ASSET_TYPE_ADD_CYCLE: AssetTypeAdd,
    ASSET_TYPE_TAB_ASSET_TYPE_VIEW_CYCLE: AssetTypeView,
    ASSET_GROUP_ASSET_GROUP_ADD_CYCLE: AssetGroupAdd,
    ASSET_GROUP_ASSET_GROUP_VIEW_CYCLE: AssetGroupView,
    VENDOR_ADD_VENDOR_CYCLE: VendorAdd,
    VENDOR_VIEW_VENDOR_CYCLE: VendorView,
    SCHEDULE_EVENT_CYCLE: ScheduleEvent,
    CREATE_EVENT_CYCLE: CreateEvent,
    UPLOAD_LOGO_CYCLE: UploadLogo
}