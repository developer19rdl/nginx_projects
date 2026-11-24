import React, { useState, useEffect } from "react";
import "./SideBar.css";
import EngineeringIcon from "@mui/icons-material/Engineering";
// import { Link } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ApplicationStore from "../../utils/localStorageUtil";
import ElectricMeterIcon from '@mui/icons-material/ElectricMeter';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GasMeterIcon from '@mui/icons-material/GasMeter';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SettingsPowerIcon from '@mui/icons-material/SettingsPower';
import DashboardIcon from '@mui/icons-material/Dashboard';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
const SideBar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isEnegryDropdownOpen, setIsEnergyDropdownOpen] = useState(false);
    const [isProductionDropdownOpen, setIsProductionDropdownOpen] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const location = useLocation();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

    const toggleEnergyDropdown = () => {
        setIsEnergyDropdownOpen(!isEnegryDropdownOpen);
    }

      const toggleProductionDropdown = () => {
        setIsProductionDropdownOpen(!isProductionDropdownOpen);
    }

    useEffect(() => {
        const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
        setPermissions(userDetails?.userDetails?.accessibleModules)
        // console.log("nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn", userDetails.userDetails.accessibleModules)
    }, [])

  return (
    <>
      <div className="area"></div>
      <nav className="main-menu">
        <ul className="scrollable">
          {permissions.includes("Main Dashboard") && (
            <li
                className="has-subnav"
                onMouseEnter={toggleProductionDropdown}
                onMouseLeave={toggleProductionDropdown}
              >
              <a href="#" onClick={(e) => e.preventDefault()}>
                <DashboardIcon style={{ fontSize: 28, marginLeft: 15, marginRight: 10,marginBottom:5,marginTop:5 }} />
                <span className="nav-text">{isProductionDropdownOpen ? "Hide" : "PRODUCTION AND OEE"}</span>
                  <i className={`fa fa-chevron-${isProductionDropdownOpen ? "up" : "down"} fa-2x`} />
              </a>

              {isProductionDropdownOpen && (
                   <ul className="dropdown-menus">
                        <Link to="/Main_Dashboard" className="sideBarLinkStyle">
                          {/* <li class="has-subnav" > */}
                          <li
                            className={`${
                              location.pathname === "/Main_Dashboard" ? "active" : ""
                            }`}
                          >
                            <a href="#">
                              <i class="fa fa-home fa-2x"></i>
                              <span class="nav-text">PRODUCTION KPI </span>
                            </a>
                          </li>
                        </Link>
                      {/* )} */}

                      {/* {permissions.includes("Health Dashboard") && ( */}
                        <Link to="/OEE_Dashboard" className="sideBarLinkStyle">
                          <li
                            className={`${
                              location.pathname === "/OEE_Dashboard" ? "active" : ""
                            }`}
                          >
                            <a href="#">
                            <i className="fa fa-tachometer fa-2x"></i>
                              <span className="nav-text">OEE Dashboard</span>
                            </a>
                          </li>
                        </Link>
                          {permissions.includes("reports") && (
                          <Link to="/Reports" className="sideBarLinkStyle">
                            {/* <li class="has-subnav"> */}
                            <li
                              className={`${
                                location.pathname === "/Reports" ? "active" : ""
                              }`}
                            >
                              <a href="#">
                                <i class="fa fa-file-o fa-2x"></i>
                                <span class="nav-text">Reports</span>
                              </a>
                            </li>
                          </Link>
                         )}
                              {permissions.includes("Assign Shift") && (
                                <Link to={"/LoadSchedule"} className="sideBarLinkStyle">
                                  <li
                                    className={`${
                                      location.pathname === "/LoadSchedule" ? "active" : ""
                                    }`}
                                  >
                                    <a href="#">
                                      <i class="fa fa-list fa-2x"></i>
                                      <span class="nav-text">
                                        {/* Load Schedule */}
                                        Assign Shift
                                      </span>
                                    </a>
                                  </li>
                                </Link>
                              )}

                            {/* {permissions.includes("Assign OT") && ( */}
                            <Link to={"/AssignShedule"} className="sideBarLinkStyle">
                              <li
                                className={`${
                                  location.pathname === "/AssignShedule" ? "active" : ""
                                }`}
                              >
                                <a href="#">
                                  <i style={{ marginLeft: 16 }}>
                                    {" "}
                                    <EngineeringIcon fontSize="large" />
                                  </i>
                                  <span class="nav-text" style={{ marginLeft: 5 }}>
                                    {/* Load Schedule */}
                                    Assign OT
                                  </span>
                                </a>
                              </li>
                            </Link>
                            {/* )} */}     
              </ul>
              )}
           </li>
          )}  
      <li
        className="has-subnav"
        onMouseEnter={toggleEnergyDropdown}
        onMouseLeave={toggleEnergyDropdown}
      >
  <a href="#" onClick={(e) => e.preventDefault()}>
    <OfflineBoltIcon style={{ fontSize: 28, marginLeft: 15, marginRight: 10,marginBottom:5,marginTop:5 }} />
  
    <span className="nav-text">{isEnegryDropdownOpen ? "Hide" : "ENERGY"}</span>
      {/* <i className={`fa fa-chevron-${isEnegryDropdownOpen ? "up" : "down"} fa-2x`} /> */}
      <i  className={`fa fa-chevron-${isEnegryDropdownOpen ? "up" : "down"} fa-2x chevron-thin`}
        />

  </a>

  {isEnegryDropdownOpen && (
    <ul className="dropdown-menus">

      <Link to="/Energy_monitoring" className="sideBarLinkStyle">
        <li className={location.pathname === "/Energy_monitoring" ? "active" : ""}>
          <a href="#">
            <i className="fa fa-bolt fa-2x"></i>
            <span className="nav-text">Energy Dashboard</span>
          </a>
        </li>
      </Link>

      <Link to="/MeterActiveStatus" className="sideBarLinkStyle">
        <li className={location.pathname === "/MeterActiveStatus" ? "active" : ""}>
          <a href="#">
            <ElectricMeterIcon style={{ fontSize: 28, marginLeft: 20, marginRight: 13,marginBottom:5,marginTop:5 }} />
            <span className="nav-text">METER STATUS</span>
          </a>
        </li>
      </Link>

      <Link to="/health_dashboard" className="sideBarLinkStyle">
        <li className={location.pathname === "/health_dashboard" ? "active" : ""}>
          <a href="#">
          <MonitorWeightIcon style={{ fontSize: 28, marginLeft: 20, marginRight: 13, marginBottom:5,marginTop:5 }} />
            {/* <i className="fa fa-medkit fa-2x"></i> */}
            <span className="nav-text">Health Dashboard</span>
          </a>
        </li>
      </Link>

      <Link to="/alerts" className="sideBarLinkStyle">
        <li className={location.pathname === "/alerts" ? "active" : ""}>
          <a href="#">
            <i className="fa fa-bell fa-2x"></i>
            <span className="nav-text">Alerts</span>
          </a>
        </li>
      </Link>

      <Link to="/EnergyReports" className="sideBarLinkStyle">
        <li className={location.pathname === "/EnergyReports" ? "active" : ""}>
          <a href="#">
            <AssessmentIcon style={{ fontSize: 28, marginLeft: 15, marginRight: 10,marginBottom:5,marginTop:5 }} />
            <span className="nav-text">Energy Report</span>
          </a>
        </li>
      </Link>

      <Link to="/PerformanceMetrics" className="sideBarLinkStyle">
        <li className={location.pathname === "/PerformanceMetrics" ? "active" : ""}>
          <a href="#">
            <AutoGraphIcon style={{ fontSize: 28, marginLeft: 15, marginRight: 10,marginBottom:5,marginTop:5 }} />
            <span className="nav-text">Performance Metrics</span>
          </a>
        </li>
      </Link>

      <Link to="/GeneratorUsage" className="sideBarLinkStyle">
        <li className={location.pathname === "/GeneratorUsage" ? "active" : ""}>
          <a href="#">
            <GasMeterIcon style={{ fontSize: 28, marginLeft: 15, marginRight: 10 ,marginBottom:5,marginTop:5}} />
            <span className="nav-text">Generator Report</span>
          </a>
        </li>
      </Link>

      <Link to="/PowerFailureLogs" className="sideBarLinkStyle">
        <li className={location.pathname === "/PowerFailureLogs" ? "active" : ""}>
          <a href="#">
            <PowerOffIcon style={{ fontSize: 28, marginLeft: 15, marginRight: 10,marginBottom:5,marginTop:5 }} />
            <span className="nav-text">Power Failure Logs</span>
          </a>
        </li>
      </Link>

      <Link to="/OpenBalanceSettings" className="sideBarLinkStyle">
        <li className={location.pathname === "/OpenBalanceSettings" ? "active" : ""}>
          <a href="#">
            <EditNoteIcon style={{ fontSize: 28, marginLeft: 15, marginRight: 10,marginBottom:5,marginTop:5 }} />
            <span className="nav-text">Opening Balance Settings</span>
          </a>
        </li>
      </Link>

      <Link to="/ConfigurationEnergy" className="sideBarLinkStyle">
        <li className={location.pathname === "/ConfigurationEnergy" ? "active" : ""}>
          <a href="#">
            <SettingsPowerIcon style={{ fontSize: 28, marginLeft: 15, marginRight: 10,marginBottom:5,marginTop:5 }} />
            <span className="nav-text">Energy Settings</span>
          </a>
        </li>
      </Link>

      {/* <Link to="/correctiveAction" className="sideBarLinkStyle">
        <li className={location.pathname === "/correctiveAction" ? "active" : ""}>
          <a href="#">
            <i className="fa fa-leaf"></i>
            <span className="nav-text">Corrective Action</span>
          </a>
        </li>
      </Link> */}

    </ul>
  )}
</li>


            {permissions.includes("Machine Parameter Allocation") && (
              <Link to="/MachineParaAllocationTab" className="sideBarLinkStyle">
                {/* <li class="has-subnav"> */}
                <li
                  className={`has-subnav ${
                    location.pathname === "/MachineParaAllocationTab"
                      ? "active"
                      : ""
                  }`}
                >
                  <a href="#">
                    <i class="fa fa-cogs fa-2x"></i>
                    <span class="nav-text">Machine Parameter Allocation</span>
                  </a>
                </li>
              </Link>
          )}
     
        

          {permissions.includes("configuration") && (
            <Link to="/Configuration" className="sideBarLinkStyle">
              {/* <li class="has-subnav"> */}
              <li
                className={`has-subnav ${
                  location.pathname === "/Configuration" ? "active" : ""
                }`}
              >
                <a href="#">
                  <i class="fa fa-cog fa-2x"></i>
                  <span class="nav-text">Configuration</span>
                </a>
              </li>
            </Link>
          )}

          {permissions.includes("user") && (
            <Link to="/User" className="sideBarLinkStyle">
              {/* <li class="has-subnav"> */}
              <li
                className={`has-subnav ${
                  location.pathname === "/User" ? "active" : ""
                }`}
              >
                <a href="#">
                  <i class="fa fa-user fa-2x"></i>
                  <span class="nav-text">User</span>
                </a>
              </li>
            </Link>
          )}
          <Link to="/Checklist" className="sideBarLinkStyle">
            {/* <li class="has-subnav"> */}
            <li
              className={`has-subnav ${
                location.pathname === "/Checklist" ? "active" : ""
              }`}
            >
              <a href="#">
                <i class="fa fa-check-square fa-2x"></i>
                <span class="nav-text">Checklist</span>
              </a>
            </li>
          </Link>
          {/* <li class="has-subnav">
                        <a href="#">
                            <i class="fa fa-chevron-down fa-2x"></i>
                            <span class="nav-text">
                                ---Select---
                            </span>
                        </a>
                        <ul class="dropdown-menu">
                            <Link to="/PreventiveMaintenance">
                                <li>
                                    <a href="#">
                                        <i class="fa fa-info-circle fa-2x">
                                        </i>
                                        <span class="nav-text">PreventiveMaintenance</span>
                                    </a>
                                </li>
                            </Link>
                            <li>
                                <a href="#">
                                    <i class="fa fa-info-circle fa-2x">
                                    </i>
                                    <span class="nav-text">PreventiveMaintenance</span>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <i class="fa fa-info-circle fa-2x">
                                    </i>
                                    <span class="nav-text">PreventiveMaintenance</span>
                                </a>
                            </li>
                        </ul>
                    </li> */}

          {/* {permissions.includes("Maintenance") && ( */}
          <li
            className="has-subnav"
            onMouseEnter={toggleDropdown}
            onMouseLeave={toggleDropdown}
          >
            <a href="#" onClick={(event) => event.preventDefault()}>
              <i
                className={`fa fa-chevron-${
                  isDropdownOpen ? "up" : "down"
                } fa-2x`}
              ></i>
              <span className="nav-text">
                {isDropdownOpen ? "Hide" : "Show more"}
              </span>
            </a>
            {isDropdownOpen && (
              <ul className="dropdown-menus">
                {permissions.includes("Preventive Maintenance") && (
                  <Link
                    to="/PreventiveMaintenance"
                    className="sideBarLinkStyle"
                  >
                    {/* <li> */}
                    <li
                      className={`${
                        location.pathname === "/PreventiveMaintenance"
                          ? "active"
                          : ""
                      }`}
                    >
                      <a href="#">
                        {/* <i className="fa fa-info-circle fa-2x"></i> */}
                        <i className="fa fa-desktop fa-2x"></i>
                        <span className="nav-text">Maintenance</span>
                      </a>
                    </li>
                  </Link>
                )}
                {permissions.includes("Asset") && (
                  <Link to="/AssetComponent" className="sideBarLinkStyle">
                    <li
                      className={`${
                        location.pathname === "/AssetComponent" ? "active" : ""
                      }`}
                    >
                      <a href="#">
                        {/* <i class="fa fa-info-circle fa-2x"></i> */}
                        <i className="fa fa-cogs fa-2x"></i>
                        <span class="nav-text">Asset</span>
                      </a>
                    </li>
                  </Link>
                )}
                {permissions.includes("AMC") && (
                  <Link to="/AMCComponent" className="sideBarLinkStyle">
                    <li
                      className={`${
                        location.pathname === "/AMCComponent" ? "active" : ""
                      }`}
                    >
                      <a href="#">
                        {/* <i class="fa fa-info-circle fa-2x">
                                            </i> */}
                        <i className="fa fa-certificate fa-2x"></i>
                        <span class="nav-text">AMC</span>
                      </a>
                    </li>
                  </Link>
                )}
                {permissions.includes("Failure Metric Target") && (
                  <Link to="/FailureMetricTargetList" className="sideBarLinkStyle">
                    <li
                      className={`${
                        location.pathname === "/FailureMetricTargetList"
                          ? "active"
                          : ""
                      }`}
                    >
                      <a href="#">
                        <i className="fa fa-bullseye fa-2x"></i>
                        <span className="nav-text">Failure Metric Target</span>
                      </a>
                    </li>
                  </Link>
                )}

                {/* <Link to="/Certificate">
                                    <li className={`${location.pathname === '/Certificate' ? 'active' : ''}`}>
                                        <a href="#">
                                            <i className="fa fa-file fa-2x"></i>
                                            <span class="nav-text">Certificate</span>
                                        </a>
                                    </li>
                                </Link> */}
                {permissions.includes("Maintenance Schedule") && (
                  <Link to="/MaintenanceSchedule" className="sideBarLinkStyle">
                    <li
                      className={`${
                        location.pathname === "/MaintenanceSchedule"
                          ? "active"
                          : ""
                      }`}
                    >
                      <a href="#">
                        {/* <i class="fa fa-info-circle fa-2x">
                                            </i> */}
                        <i className="fa fa-calendar-o fa-2x"></i>
                        <span class="nav-text">Maintenance Schedule</span>
                      </a>
                    </li>
                  </Link>
                )}
                {permissions.includes("Maintenance Approval") && (
                  <Link to="/MaintenanceApproval" className="sideBarLinkStyle">
                    <li
                      className={`${
                        location.pathname === "/MaintenanceApproval"
                          ? "active"
                          : ""
                      }`}
                    >
                      <a href="#">
                        {/* <i class="fa fa-info-circle fa-2x">
                                            </i> */}
                        <i className="fa fa-check-circle fa-2x"></i>
                        <span class="nav-text">Maintenance Approval</span>
                      </a>
                    </li>
                  </Link>
                )}
                {permissions.includes("Maintenance Status") && (
                  <Link to="/MaintenanceStatus" className="sideBarLinkStyle">
                    <li
                      className={`${
                        location.pathname === "/MaintenanceStatus"
                          ? "active"
                          : ""
                      }`}
                    >
                      <a href="#">
                        {/* <i class="fa fa-info-circle fa-2x">
                                            </i> */}
                        <i className="fa fa-wrench fa-2x"></i>
                        <span class="nav-text">Maintenance Status</span>
                      </a>
                    </li>
                  </Link>
                )}

                {/* <Link to="/Renewal" className="sideBarLinkStyle">
                                        <li className={`${location.pathname === '/Renewal' ? 'active' : ''}`}>
                                            <a href="#">
                                                <i className="fa fa-check fa-2x"></i>
                                                <span class="nav-text">MachineParaAllocationTab</span>
                                            </a>
                                        </li>
                                    </Link> */}
                {permissions.includes("MaintenanceMsterTab") && (
                  <Link to="/MaintenanceMsterTab" className="sideBarLinkStyle">
                    <li
                      className={`${
                        location.pathname === "/MaintenanceMsterTab"
                          ? "active"
                          : ""
                      }`}
                    >
                      <a href="#">
                        {/* <i class="fa fa-info-circle fa-2x">
                                            </i> */}
                        <i className="fa fa-check fa-2x"></i>
                        <span class="nav-text">Maintenance Master Tab</span>
                      </a>
                    </li>
                  </Link>
                )}
              </ul>
            )}
          </li>
          {/* )} */}

          {/* <Link to="/CorrelationDataAnalytics" className="sideBarLinkStyle">
                        <li className={`has-subnav ${location.pathname === '/CorrelationDataAnalytics' ? 'active' : ''}`}>
                            <a href="#">
                                <i class="fa fa-info-circle fa-2x"></i>
                                <span class="nav-text">
                                    Correlation Data Analytics
                                </span>
                            </a>
                        </li>
                    </Link> */}
          {/* <Link to="/ServerUsageStatistics" className="sideBarLinkStyle">
            <li
              className={`has-subnav ${
                location.pathname === "/ServerUsageStatistics" ? "active" : ""
              }`}
            >
              <a href="#">
                <i class="fa fa-th-list fa-2x"></i>
                <span class="nav-text">Server Usage Statitics</span>
              </a>
            </li>
          </Link> */}

          {/* {permissions.includes("Maintenance") && ( */}
          <li
            class="has-subnav"
            style={{ marginBottom: "25px" }}
            onClick={() => {
              ApplicationStore().setStorage("userDetails", "");
              window.location.reload();
            }}
          >
            <a href="#">
              <i class="fa fa-power-off fa-2x"></i>
              <span class="nav-text">Logout</span>
            </a>
          </li>
          {/* )} */}
        </ul>

        {/* <ul class="logout"> */}
        {/* <ul> */}
        {/* <li class="has-subnav"> */}
        {/* <li class="has-subnav">
                        <a href="#">
                            <i class="fa fa-power-off fa-2x"></i>
                            <span class="nav-text">
                                Logout
                            </span>
                        </a>
                    </li>
                </ul> */}
      </nav>
    </>
  );
};
export default SideBar;
