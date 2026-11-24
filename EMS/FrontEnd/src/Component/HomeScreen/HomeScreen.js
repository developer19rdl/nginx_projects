import React, { useEffect } from "react";
import SideBar from "../SideBar/SideBar";
import './HomeScreen.css'
import { MainDashboard } from "../MainDashboard/MainDashboard";
import { Outlet } from "react-router-dom";
import ApplicationStore from "../../utils/localStorageUtil";
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from "../Footer/Footer";

// Plant Overview and the Global Sites Map are each meant to fit entirely
// within one screen (no scrolling) — the copyright footer competed for the
// same tight vertical space, so it's hidden on these pages only. Every other
// page keeps the footer exactly as before (these are the routes excluded,
// not a global change).
const HIDE_FOOTER_ROUTES = ["/PlantOverview", "/PlantMap"];

const HomeScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hideFooter = HIDE_FOOTER_ROUTES.includes(location.pathname);

  // }, []);

  return (
    <div className="home-container">
      <div className="sidebar-container">
        <SideBar />
      </div>
      <div className="home-OutLet">
        <Outlet />
        {!hideFooter && <Footer/>}
      </div>
    </div>
  )
}
export default HomeScreen;
