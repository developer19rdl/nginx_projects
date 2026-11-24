import React, { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Signin from "../Signin/Signin";
import HomePage from "../../Pages/HomePage/HomePage";
import { EnergyMonitoring } from "../EnergyMonitoring/EnergyMonitoring";
import { MainDashboard } from "../MainDashboard/MainDashboard";
import Reports from "../Reports/Reports";
import Configuration from "../Configuration/Configuration";
import CorrelationDataAnalytics from "../CorrelationDataAnalytics/CorrelationDataAnalytics";
import ServerUsageStatistics from "../ServerUsageStatistics/ServerUsageStatistics";
import PreventiveMaintenance from "../PreventiveMaintenance/PreventiveMaintenance";
import HealthDashboardComponent from "../HealthDashboard/HealthDashboardComponent ";
import UserComponent from "../UserComponent/UserComponent";
import LoadSchedule from "../LoadSchedule/LoadSchedule";
import { MachineDashboard } from "../MainDashboard/Energy_Machine_Dashboard/Energy_Machine_Dashboard/MachineDashboard";
import MaintenanceStatus from "../MaintenanceStatus/MaintenanceStatus";
import Renewal from "../Renewal/Renewal";
import MaintenanceApproval from "../MaintenanceApproval/MaintenanceApproval";
import MaintenanceSchedule from "../MaintenanceSchedule/MaintenanceSchedule";
import Certificate from "../Certificate/Certificate";
import AMCComponent from "../AMC/AMCComponent";
import AssetComponent from "../AssetComponent/AssetComponent";
import HealthDashboardInsideCard from "../HealthDashboard/HealthDashboardInsideCard/HealthDashboardInsideCard";
import MainCardInnerPage from "../MainDashboard/MainCardInnerPage/MainCardInnerPage";
import MachineParaAllocationTab from "../MachineParameterAllocation/MachineParaAllocationTab";
import { connect } from 'react-redux';
import { getCompanyDetails } from '../../Actions';
import MaintenanceMsterTab from "../MaintenanceMaster/MaintenanceMsterTab";
import EnergyInsideKEB from "../EnergyMonitoring/EnergyInsideKEB/EnergyInsideKEB";
import EnergyInsideGenerator from "../EnergyMonitoring/EnergyInsideGenerator/EnergyInsideGenerator";
import EnergyMonitoringTab from "../EnergyMonitoring/EnergyMonitoringTab";
import EMS_Dashboard from "../EMS_Dashboard/EMS_Dashboard";
import HVAS_Dashboard from "../HVAS_Dashboard/HVAS_Dashboard";
import AndonScreen from "../AndonDashboard/AndonScreen";
import TreeDashboard from "../TreeDashboard/TreeDashboard";
import IoTDashboard from "../IoTDashboard/IoTDashboard";
import MeterActiveStatus from "../MainDashboard/MeterActiveStatus";
import EnergySavingPage from "../EnergySaving/EnergySavingPage";
import EnergyAnomalyDetection from "../EnergyAnomalyDetection/EnergyAnomalyDetection";
import UtilityDashboard from "../UtilityDashboard/UtilityDashboard";
import ScadaView from "../ScadaView/ScadaView";
import PlantOverview from "../PlantOverview/PlantOverview";
import PlantMapLanding from "../PlantMapLanding/PlantMapLanding";
import TemperatureDashboard from "../SensorDashboard/TemperatureDashboard";
import HumidityDashboard from "../SensorDashboard/HumidityDashboard";
import CO2Dashboard from "../SensorDashboard/CO2Dashboard";
import PressureDashboard from "../SensorDashboard/PressureDashboard";
import SmsWallet from "../SmsWallet/SmsWallet";
import AlertRecipients from "../AlertRecipients/AlertRecipients";


const Routers = (props) => {

    // const navigate = useNavigate();
    const navigate = useNavigate();

    useEffect(() => {
        const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
        // return userDetails?.access_token ? navigate("/Main_Dashboard") : navigate("/Sign_in");
        return !userDetails?.accessToken && navigate("/Sign_in");
    }, []);


    return (
        <Routes>
            <Route exact path="/Sign_in" element={<Signin />} />
            <Route path="/" element={<HomePage />} >
                {/* <Route path="/Main_Dashboard" element={<MainDashboard />} /> */}
                <Route path="/MainCardInnerPage" element={<MainCardInnerPage />} />
                <Route path="/Energy_monitoring" element={<EnergyMonitoring />} />
                <Route path="/EnergyMonitoringTab" element={<EnergyMonitoringTab />} />
                <Route path="/MeterActiveStatus" element={<MeterActiveStatus />} />
                <Route path="/EnergyInsideKEB" element={<EnergyInsideKEB />} />
                <Route path="/EnergyInsideGenerator" element={<EnergyInsideGenerator />} />
                <Route path="/MachineParaAllocationTab" element={<MachineParaAllocationTab />} />
                <Route path="/Reports" element={<Reports />} />
                <Route path="/Configuration" element={<Configuration />} />
                <Route path="/health_dashboard" element={<HealthDashboardComponent />} />
                <Route path="/HealthDashboardInsideCard" element={<HealthDashboardInsideCard />} />
                <Route path="/User" element={<UserComponent />} />
                <Route path="/CorrelationDataAnalytics" element={<CorrelationDataAnalytics />} />
                <Route path="/ServerUsageStatistics" element={<ServerUsageStatistics />} />
                <Route path="/LoadSchedule" element={<LoadSchedule />} />
                <Route path="/PreventiveMaintenance" element={<PreventiveMaintenance />} />
                <Route path="/MaintenanceStatus" element={<MaintenanceStatus />} />
                <Route path="/Renewal" element={<MachineParaAllocationTab />} />
                <Route path="/MaintenanceApproval" element={<MaintenanceApproval />} />
                <Route path="/MaintenanceSchedule" element={<MaintenanceSchedule />} />
                <Route path="/Certificate" element={<Certificate />} />
                <Route path="/AMCComponent" element={<AMCComponent />} />
                <Route path="/AssetComponent" element={<AssetComponent />} />
                <Route path="/MaintenanceMsterTab" element={<MaintenanceMsterTab />} />
                <Route path="/EMS_Dashboard" element={<EMS_Dashboard />} />
                <Route path="/HVAS_Dashboard" element={<HVAS_Dashboard />} />
                <Route path="/AndonScreen" element={<AndonScreen />} />
                <Route path="/TreeDashboard" element={<TreeDashboard />} />
                <Route path="/IoTDashboard" element={<IoTDashboard />} />
                <Route path="/EnergySaving" element={<EnergySavingPage />} />
                {/* <Route path="/EnergyAnomalyDetection" element={<EnergyAnomalyDetection />} /> */}
                <Route path="/utility_dashboard" element={<UtilityDashboard />} />
                <Route path="/TemperatureDashboard" element={<TemperatureDashboard />} />
                <Route path="/HumidityDashboard" element={<HumidityDashboard />} />
                <Route path="/CO2Dashboard" element={<CO2Dashboard />} />
                <Route path="/PressureDashboard" element={<PressureDashboard />} />
                <Route path="/SmsWallet" element={<SmsWallet />} />
                <Route path="/AlertRecipients" element={<AlertRecipients />} />
                {/* <Route path="/ScadaView" element={<ScadaView />} /> */}
                {/* <Route path="/PlantOverview" element={<PlantOverview />} /> */}
                {/* <Route path="/PlantMap" element={<PlantMapLanding />} /> */}
                {/* <Route path="/" element={<Navigate to="/health_dashboard" replace />} /> */}
                <Route path="/" element={<Navigate to="/IoTDashboard" replace />} />
            </Route>
        </Routes>
    )
}
// export default Routers;
const mapStateToProps = ({ }) => {
    // const { capacityMeasureList, departmentList } = config;
    return {};
};

export default connect(mapStateToProps, { getCompanyDetails })(Routers);
