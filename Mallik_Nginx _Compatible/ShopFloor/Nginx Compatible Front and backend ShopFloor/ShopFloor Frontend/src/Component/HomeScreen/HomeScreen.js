import React, { useEffect } from "react";
import SideBar from "../SideBar/SideBar";
import './HomeScreen.css'
import { MainDashboard } from "../MainDashboard/MainDashboard";
import { Outlet } from "react-router-dom";
import ApplicationStore from "../../utils/localStorageUtil";
import { useNavigate } from 'react-router-dom';
import Footer from "../Footer/Footer";

const HomeScreen = () => {
  const navigate = useNavigate();
  // useEffect(() => {
  //   const { access_token } = ApplicationStore().getStorage('userDetails');
  //   console.log("access_token", access_token);
  //   if (access_token) {
  //     navigate('/Main_Dashboard');
  //   } else {
  //     navigate('/Sign_in');
  //   }

  // }, []);

  return (
    <div className="home-container">
      <div className="sidebar-container">
        <SideBar />
      </div>
      <div className="home-OutLet">
        <Outlet />
        <Footer/>
      </div>
    </div>
  )
}
export default HomeScreen;