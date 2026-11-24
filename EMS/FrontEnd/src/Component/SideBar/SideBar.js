import React, { useEffect, useState } from "react";
import "./SideBar.css";
import { Link, useLocation } from "react-router-dom";
import ApplicationStore from "../../utils/localStorageUtil";
import { hasAccess } from "../../utils/roleConfig";
import { AssignRoleByRoleNameService } from "../../Services/NodeJsApiServices";

const SideBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const stored = ApplicationStore().getStorage('userDetails');
  const userRole = stored?.userDetails?.userRole || 'Manager';

  // Dynamic, DB-backed module access for this role. Stays null (→ falls back
  // to the static ROLE_PERMISSIONS map in roleConfig.js) until the fetch
  // resolves, so the sidebar never blanks out while loading or on API failure.
  const [dynamicModules, setDynamicModules] = useState(null);

  useEffect(() => {
    AssignRoleByRoleNameService(
      userRole,
      (res) => setDynamicModules(Array.isArray(res?.data) ? res.data : null),
      () => setDynamicModules(null)
    );
  }, [userRole]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <>
      <div class="area"></div>
      <nav class="main-menu">
        <ul className="scrollable">

          {/* {hasAccess(userRole, 'PlantMap', dynamicModules) && (
            <Link to="/PlantMap" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/PlantMap" ? "active" : ""}`}>
                <a href="#">
                  <i className="fa fa-map-marker fa-2x"></i>
                  <span className="nav-text">Global Sites Map</span>
                </a>
              </li>
            </Link>
          )} */}

           {/* {hasAccess(userRole, 'PlantOverview', dynamicModules) && (
            <Link to="/PlantOverview" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/PlantOverview" ? "active" : ""}`}>
                <a href="#">
                  <i className="fa fa-sitemap fa-2x"></i>
                  <span className="nav-text">INDIA Plant Overview</span>
                </a>
              </li>
            </Link>
          )}  */}

          {/* EMS Dashboard hidden — navigates via Plant Map → IoT Dashboard
          {hasAccess(userRole, 'EMS_Dashboard', dynamicModules) && (
            <Link to="/EMS_Dashboard" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/EMS_Dashboard" ? "active" : ""}`}>
                <a href="#">
                  <i class="fa fa-tachometer fa-2x"></i>
                  <span class="nav-text">EMS Dashboard</span>
                </a>
              </li>
            </Link>
          )} */}

          {hasAccess(userRole, 'IoTDashboard', dynamicModules) && (
            <Link to="/IoTDashboard" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/IoTDashboard" ? "active" : ""}`}>
                <a href="#">
                  <i class="fa fa-bolt fa-2x"></i>
                  <span class="nav-text">Energy</span>
                </a>
              </li>
            </Link>
          )}

   

        

          {hasAccess(userRole, 'TemperatureDashboard', dynamicModules) && (
            <Link to="/TemperatureDashboard" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/TemperatureDashboard" ? "active" : ""}`}>
                <a href="#">
                  {/* This project's bundled Font Awesome is 4.0.3, which has no
                      thermometer glyph (confirmed against the actual CDN file) —
                      an inline SVG instead, kept inside the same "fa" wrapper so
                      it still inherits the shared table-cell sizing/centering and
                      the hover/active color (via currentColor) as every other icon.
                      display:inline-block overrides Tailwind's preflight
                      (svg { display: block }), which otherwise breaks the "fa"
                      wrapper's text-align:center centering. */}
                  <i className="fa">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z" />
                    </svg>
                  </i>
                  <span className="nav-text">Temperature</span>
                </a>
              </li>
            </Link>
          )}

          {hasAccess(userRole, 'HumidityDashboard', dynamicModules) && (
            <Link to="/HumidityDashboard" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/HumidityDashboard" ? "active" : ""}`}>
                <a href="#">
                  <i className="fa fa-tint fa-2x"></i>
                  <span className="nav-text">Humidity</span>
                </a>
              </li>
            </Link>
          )}

          {hasAccess(userRole, 'CO2Dashboard', dynamicModules) && (
            <Link to="/CO2Dashboard" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/CO2Dashboard" ? "active" : ""}`}>
                <a href="#">
                  <i className="fa fa-cloud fa-2x"></i>
                  <span className="nav-text">Air Quality</span>
                </a>
              </li>
            </Link>
          )}

          {hasAccess(userRole, 'PressureDashboard', dynamicModules) && (
            <Link to="/PressureDashboard" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/PressureDashboard" ? "active" : ""}`}>
                <a href="#">
                  <i className="fa fa-tachometer fa-2x"></i>
                  <span className="nav-text">Air Pressure</span>
                </a>
              </li>
            </Link>
          )}

  {/* {hasAccess(userRole, 'utility_dashboard', dynamicModules) && (
            <Link to="/utility_dashboard" className="sideBarLinkStyle">
              <li className={`${location.pathname === "/utility_dashboard" ? "active" : ""}`} style={{ marginTop: '20px' }}>
                <a href="#">
                  <i className="fa fa-tint fa-2x"></i>
                  <span className="nav-text">Water</span>
                </a>
              </li>
            </Link>
          )} */}

                  {/* {hasAccess(userRole, 'ScadaView', dynamicModules) && (
            <Link to="/ScadaView" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/ScadaView" ? "active" : ""}`}>
                <a href="#">
                  <i className="fa fa-desktop fa-2x"></i>
                  <span className="nav-text">SCADA Dashboard</span>
                </a>
              </li>
            </Link>
          )} */}

          {hasAccess(userRole, 'health_dashboard', dynamicModules) && (
            <Link to="/health_dashboard" className="sideBarLinkStyle">
              <li className={`${location.pathname === "/health_dashboard" ? "active" : ""}`} style={{ marginTop: '20px' }}>
                <a href="#">
                  <i className="fa fa-medkit fa-2x"></i>
                  <span className="nav-text">Health Dashboard</span>
                </a>
              </li>
            </Link>
          )}

          {hasAccess(userRole, 'MeterActiveStatus', dynamicModules) && (
            <Link to="/MeterActiveStatus" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/MeterActiveStatus" ? "active" : ""}`}>
                <a href="#">
                  <i className="fa fa-tachometer fa-2x"></i>
                  <span className="nav-text">METER STATUS</span>
                </a>
              </li>
            </Link>
          )}

          {hasAccess(userRole, 'MachineParaAllocationTab', dynamicModules) && (
            <Link to="/MachineParaAllocationTab" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/MachineParaAllocationTab" ? "active" : ""}`}>
                <a href="#">
                  <i class="fa fa-cogs fa-2x"></i>
                  <span class="nav-text">Device Management</span>
                </a>
              </li>
            </Link>
          )}

          {hasAccess(userRole, 'Reports', dynamicModules) && (
            <Link to="/Reports" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/Reports" ? "active" : ""}`}>
                <a href="#">
                  <i class="fa fa-file-o fa-2x"></i>
                  <span class="nav-text">Reports</span>
                </a>
              </li>
            </Link>
          )}

          {hasAccess(userRole, 'Configuration', dynamicModules) && (
            <Link to="/Configuration" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/Configuration" ? "active" : ""}`}>
                <a href="#">
                  <i class="fa fa-cog fa-2x"></i>
                  <span class="nav-text">Configuration</span>
                </a>
              </li>
            </Link>
          )}

          {/* {hasAccess(userRole, 'SmsWallet', dynamicModules) && (
            <Link to="/SmsWallet" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/SmsWallet" ? "active" : ""}`}>
                <a href="#">
                  <i className="fa fa-comment fa-2x"></i>
                  <span className="nav-text">SMS Wallet</span>
                </a>
              </li>
            </Link>
          )} */}

          {/* {hasAccess(userRole, 'AlertRecipients', dynamicModules) && (
            <Link to="/AlertRecipients" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/AlertRecipients" ? "active" : ""}`}>
                <a href="#">
                  <i className="fa fa-bell fa-2x"></i>
                  <span className="nav-text">Alert Recipients</span>
                </a>
              </li>
            </Link>
          )} */}

          {hasAccess(userRole, 'User', dynamicModules) && (
            <Link to="/User" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/User" ? "active" : ""}`}>
                <a href="#">
                  <i class="fa fa-user fa-2x"></i>
                  <span class="nav-text">User</span>
                </a>
              </li>
            </Link>
          )}

          {/* {hasAccess(userRole, 'EnergySaving', dynamicModules) && (
            <Link to="/EnergySaving" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/EnergySaving" ? "active" : ""}`}>
                <a href="#">
                  <i className="fa fa-bolt fa-2x"></i>
                  <span className="nav-text">Energy Saving</span>
                </a>
              </li>
            </Link>
          )} */}

          {/* {hasAccess(userRole, 'EnergyAnomalyDetection', dynamicModules) && (
            <Link to="/EnergyAnomalyDetection" className="sideBarLinkStyle">
              <li className={`has-subnav ${location.pathname === "/EnergyAnomalyDetection" ? "active" : ""}`}>
                <a href="#">
                  <i className="fa fa-exclamation-triangle fa-2x"></i>
                  <span className="nav-text">Anomaly Detection</span>
                </a>
              </li>
            </Link>
          )} */}

         

          {hasAccess(userRole, 'Maintenance', dynamicModules) && (
            <li
              className="has-subnav"
              onMouseEnter={toggleDropdown}
              onMouseLeave={toggleDropdown}
            >
              {}
              {isDropdownOpen && (
                <ul className="dropdown-menus">
                  <Link to="/PreventiveMaintenance" className="sideBarLinkStyle">
                    <li className={`${location.pathname === "/PreventiveMaintenance" ? "active" : ""}`}>
                      <a href="#">
                        <i className="fa fa-desktop fa-2x"></i>
                        <span className="nav-text">Preventive Maintenance</span>
                      </a>
                    </li>
                  </Link>
                  <Link to="/AssetComponent">
                    <li className={`${location.pathname === "/AssetComponent" ? "active" : ""}`}>
                      <a href="#">
                        <i className="fa fa-cogs fa-2x"></i>
                        <span class="nav-text">Asset</span>
                      </a>
                    </li>
                  </Link>
                  <Link to="/AMCComponent">
                    <li className={`${location.pathname === "/AMCComponent" ? "active" : ""}`}>
                      <a href="#">
                        <i className="fa fa-certificate fa-2x"></i>
                        <span class="nav-text">AMC</span>
                      </a>
                    </li>
                  </Link>
                  <Link to="/MaintenanceSchedule">
                    <li className={`${location.pathname === "/MaintenanceSchedule" ? "active" : ""}`}>
                      <a href="#">
                        <i className="fa fa-calendar-o fa-2x"></i>
                        <span class="nav-text">Maintenance Schedule</span>
                      </a>
                    </li>
                  </Link>
                  <Link to="/MaintenanceApproval" className="sideBarLinkStyle">
                    <li className={`${location.pathname === "/MaintenanceApproval" ? "active" : ""}`}>
                      <a href="#">
                        <i className="fa fa-check-circle fa-2x"></i>
                        <span class="nav-text">Maintenance Approval</span>
                      </a>
                    </li>
                  </Link>
                  <Link to="/MaintenanceStatus" className="sideBarLinkStyle">
                    <li className={`${location.pathname === "/MaintenanceStatus" ? "active" : ""}`}>
                      <a href="#">
                        <i className="fa fa-wrench fa-2x"></i>
                        <span class="nav-text">Maintenance Status</span>
                      </a>
                    </li>
                  </Link>
                  <Link to="/Renewal" className="sideBarLinkStyle">
                    <li className={`${location.pathname === "/Renewal" ? "active" : ""}`}>
                      <a href="#">
                        <i className="fa fa-check fa-2x"></i>
                        <span class="nav-text">MachineParaAllocationTab</span>
                      </a>
                    </li>
                  </Link>
                  <Link to="/MaintenanceMsterTab" className="sideBarLinkStyle">
                    <li className={`${location.pathname === "/MaintenanceMsterTab" ? "active" : ""}`}>
                      <a href="#">
                        <i className="fa fa-check fa-2x"></i>
                        <span class="nav-text">MaintenanceMsterTab</span>
                      </a>
                    </li>
                  </Link>
                </ul>
              )}
            </li>
          )}

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

        </ul>
      </nav>
    </>
  );
};

export default SideBar;
