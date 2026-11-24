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
import Checklist from "../ChecklistModule/ChecklistModule";
import AssignSchedule from "../LoadSchedule/SubLoadSchedule/AssignSchedule";
import OEE_Dashboard from "../OEE Dashboard/OEE_Dashboard";
import FailureMetricTargetList from "../Configuration/ConfigTabPages/FailureMetricTarget/FailureMetricTargetList";
import FaultMetric from "../Reports/MaintenanceReport/FaultMetric";
import Energy from "../Reports/ReportTabPages/Energy/Energy";
import GeneratorUsage from "../Reports/ReportTabPages/GeneratorUsage/GeneratorUsage";
import ConfigurationEnergy from "../Configuration/ConfigurationEnergy";
import OpenBalanceSettings from "../Configuration/ConfigTabPages/Energy/OpenBalanceSettings";
import PowerFailureLogs from "../PowerFailureLogs";
import { Alert } from "react-bootstrap";
import Alerts from "../Reports/ReportTabPages/Alerts/Alerts";
import MeterActiveStatus from "../MainDashboard/MeterActiveStatus";
import EnergySave from "../EnergySave";
import OtVerification from "../OtVerification";
import PerformanceMetrics from "../Reports/ReportTabPages/PerformanceMetrics/PerformanceMetrics";

const Routers = (props) => {
    const navigate = useNavigate();
    useEffect(() => {
        const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
        // console.log("llllllllllllllllllllllll", userDetails)
        // return userDetails?.access_token ? navigate("/Main_Dashboard") : navigate("/Sign_in");
        return !userDetails?.accessToken && navigate("/Sign_in");
    }, []);

    return (
        <Routes>
             <Route exact path="/Sign_in" element={<Signin />} />
              <Route path="/" element={<HomePage />} >
                <Route path="/Main_Dashboard" element={<MainDashboard />} />
                {/* <Route path="/OtVerification" element={<OtVerification />} /> */}
                <Route path="/PowerFailureLogs" element={<PowerFailureLogs />} />
                <Route path="/MainCardInnerPage" element={<MainCardInnerPage />} />
                <Route path="/Energy_monitoring" element={<EnergyMonitoring />} />
                <Route path="/MeterActiveStatus" element={<MeterActiveStatus />} />
                <Route path="/correctiveAction" element={<EnergySave />} />
                <Route path="/EnergyReports" element={<Energy />} />
                <Route path="/PerformanceMetrics" element={<PerformanceMetrics />} />           
                <Route path="/GeneratorUsage" element={<GeneratorUsage />} />
                <Route path="/EnergyInsideKEB" element={<EnergyInsideKEB />} />
                <Route path="/EnergyInsideGenerator" element={<EnergyInsideGenerator />} />
                <Route path="/OpenBalanceSettings" element={<OpenBalanceSettings />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/MachineParaAllocationTab" element={<MachineParaAllocationTab />} />
                <Route path="/Reports" element={<Reports />} />
                <Route path="/Configuration" element={<Configuration />} />
                <Route path="/ConfigurationEnergy" element={<ConfigurationEnergy />} />
                <Route path="/health_dashboard" element={<HealthDashboardComponent />} />
                <Route path="/HealthDashboardInsideCard" element={<HealthDashboardInsideCard />} />
                <Route path="/User" element={<UserComponent />} />
                {/* <Route path="/CorrelationDataAnalytics" element={<CorrelationDataAnalytics />} /> */}
                <Route path="/ServerUsageStatistics" element={<ServerUsageStatistics />} />
                <Route path="/LoadSchedule" element={<LoadSchedule />} />
                <Route path="/AssignShedule" element={<AssignSchedule />} />
                <Route path="/PreventiveMaintenance" element={<PreventiveMaintenance />} />
                <Route path="/MaintenanceStatus" element={<MaintenanceStatus />} />
                <Route path="/Renewal" element={<MachineParaAllocationTab />} />
                <Route path="/MaintenanceApproval" element={<MaintenanceApproval />} />
                <Route path="/MaintenanceSchedule" element={<MaintenanceSchedule />} />
                <Route path="/Certificate" element={<Certificate />} />
                <Route path="/AMCComponent" element={<AMCComponent />} />
                <Route path="/AssetComponent" element={<AssetComponent />} />
                <Route path="/Checklist" element={<Checklist />} />
                <Route path="/MaintenanceMsterTab" element={<MaintenanceMsterTab />} />
                <Route path="/OEE_Dashboard" element={<OEE_Dashboard />} />
                <Route path="/FailureMetricTargetList" element={<FailureMetricTargetList />} />
                <Route path="/FaultMetric" element={<FaultMetric />} />
                <Route path="/" element={<Navigate to="/Main_Dashboard" replace />} />
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