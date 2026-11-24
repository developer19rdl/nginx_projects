import React, { useEffect, useState, } from 'react'
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
// import './Signin.css'
import UIUX_11 from '../../Assets/Images/UIUX_11.jpg'
import { useNavigate } from 'react-router-dom';
import AQI from '../../IMAGES/AQI.jpeg'
import energy from '../../IMAGES/energy.png'

import logo1 from '../../IMAGES/logo1.png'
// import LoadingButton from "@mui/lab/LoadingButton";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { LoginService } from "../../Services/LoginPageService";
import ApplicationStore from "../../utils/localStorageUtil";
import NotificationBar from "../Notification/NotificationBar";

const Signin = () => {
    const navigate = useNavigate();

    const [email, setUserEmail] = useState("");
    const [password, setUserPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const successCaseCode = [200, 201];
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: 'Login Successful',
    });

    // const handleSignInClick = () => {
    //     navigate('/Main_Dashboard');
    // };
    ////useEffect call

    // useEffect(() => {
    //     const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
    //     return userDetails?.access_token ? navigate("/Main_Dashboard") : navigate("/Sign_in");
    // }, []);

    ///////////

    // OLD_CODE
    // useEffect(() => {
    //     const { access_token } = ApplicationStore().getStorage('userDetails');
    //     console.log("access_token", access_token);
    //     if (access_token) {
    //         navigate('/Main_Dashboard');
    //     } else {
    //         navigate('/Sign_in');
    //     }

    // }, []);

    useEffect(() => {
        const { accessToken } = ApplicationStore().getStorage('userDetails');
        console.log("accessToken", accessToken);
        if (accessToken) {
            navigate('/Main_Dashboard');
        } else {
            navigate('/Sign_in');
        }

    }, []);

    function submit(e) {
        e.preventDefault();
        LoginService({ userName: email, password: password, })
            .then((response) => {
                if (successCaseCode.indexOf(response.status) > -1) {
                    console.log('Login Succesfull..!');
                    setNotification({
                        status: true,
                        type: 'success',
                        message: 'Login Succesfull..!',
                    });

                    return response.json();
                }
                throw {
                    errorStatus: response.status,
                    errorObject: response.json(),
                };
            }).then((data) => {
                ApplicationStore().setStorage('userDetails', data);
                setTimeout(() => {
                    console.log('1111111111111111')
                    navigate("/");
                }, 2000);
            }).catch((error) => {
                error?.errorObject?.then((errorResponse) => {
                    console.log(errorResponse.error ? errorResponse.error : errorResponse.message);
                    setNotification({
                        status: true,
                        type: 'error',
                        message: errorResponse.message
                    });
                    setTimeout(() => {
                        handleClose();
                    }, 2000);
                });
            });

    };


    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };
    return (
        <div className="grid grid-flow-row-dense h-screen w-full grid-cols-1 gap-y-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 items-center ">

            <div className="flex items-center justify-center hidden sm:block w-full bg-white">
                <div className="w-full space-y-0">
                    <img
                        className="Loginimg object-cover flex item-right hidden sm:block h-screen"
                        alt="login Page Wallpaper"
                        src={energy}
                        // src={customerImage != null && customerImage != '' ? customerImage : loginPageWallpaper}
                        // src={loginPageWallpaper}
                        style={{ filter: "brightness(60%)", objectFit: 'cover' }}
                    />
                </div>
                <div className="absolute bottom-5 left-auto right-auto px-5 text-left text-5xl text-white font-bold leading-tight">
                </div>
            </div>
            <div className="min-h-full flex items-center justify-center lg:px-1 ml-auto mr-auto w-full bg-white h-full">
                <div className=" w-full space-y-0">
                    <div className="left-1 top-3">
                        <img
                            className="mx-auto h-12"
                            src={logo1}
                            // src={DynamicLogo != null && DynamicLogo != '' ? DynamicLogo : Logo1}
                            alt="Workflow"
                        />
                    </div>
                    <h1 className="text-center text-2xl py-3">
                        Welcome to <span style={{ color: "#033882" }}>{"Mallik Engineering"} </span>{" "}
                    </h1>
                    <h2 className="text-center text-sm font-sans font-bold text-gray-900 py-1 ">
                        Sign in to your account
                    </h2>

                    <form
                        className=" w-10/12 ml-auto mr-auto mt-2 space-y-6"
                        onSubmit={submit}
                    >
                        <div className=" -space-y-px-0">
                            <div className="mb-2 py-4">
                                <TextField
                                    id="standard-size-small"
                                    label="Username"
                                    type="text"
                                    value={email}
                                    size="small"
                                    defaultValue="Small"
                                    variant="standard"
                                    // placeholder="Email address"
                                    className=" mt-2 flex-none appearance-none rounded-none relative block w-full py-2 border-hidden
                                    border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none
                                    focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                                    required
                                    // onBlur={() => validateForNullValue(email, "email")}
                                    onChange={(e) => {
                                        setUserEmail(e.target.value);
                                    }}
                                    InputLabelProps={{
                                        style: { fontFamily: "customfont" },
                                    }}
                                    autoComplete="off"
                                // error={errorObject?.emailId?.errorStatus}
                                // helperText={errorObject?.emailId?.helperText}
                                />
                            </div>
                            <div className="mt-2">
                                <TextField
                                    id="standard-basic"
                                    label="Password"
                                    type='password'
                                    value={password}
                                    variant="standard"
                                    className=" mt-2 flex-none appearance-none rounded-none relative block w-full py-2 border-hidden
                                    border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none
                                    focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                                    required

                                    onChange={(e) => {
                                        setUserPassword(e.target.value);
                                    }}
                                    InputLabelProps={{
                                        style: { fontFamily: "customfont" },
                                    }}

                                />
                            </div>
                        </div>

                        <div>
                            <LoadingButton
                                type="submit"
                                loading={loading}
                                loadingPosition="end"
                                variant="contained"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent
                                            text-sm font-medium rounded-md text-black bg-white-500 hover:bg-red-100 focus:outline
                                            focus:ring-2 focus:ring-offset-2 focus:ring-red-100 outline outline-offset-2 outline-2
                                            outline-red-500"
                                style={{
                                    backgroundColor: "rgb(6,151,224)",
                                    padding: "13px 0",
                                    borderRadius: "50px",
                                    color: "white",
                                }}
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3"></span>
                                Sign in
                            </LoadingButton>
                            {/* <p className='py-4 text-xs'>Don't have an account? <span className='px-2 font-bold'> <a href='#'>Sign up for free</a></span></p> */}
                        </div>
                    </form>
                </div>
            </div>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </div>
    )
}
export default Signin;