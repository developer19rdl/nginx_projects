import React, { useEffect, useState, } from 'react'
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';

// Shared login / dashboard hero photo. Swap this file in place to change it.
import LenovoBuilding from '../../Assets/Images/mallik.jpg'
import MallikLogo from '../../Assets/Images/mallik_logo.png'
import { IconButton, InputAdornment } from "@mui/material";
import {
    Visibility,
    VisibilityOff,
    PersonOutline,
    LockOutlined,
    DeviceThermostat,
    BoltOutlined,
    BarChartOutlined,
    PrecisionManufacturingOutlined,
} from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { LoginService } from "../../Services/LoginPageService";
import ApplicationStore from "../../utils/localStorageUtil";
import NotificationBar from "../Notification/NotificationBar";

// Equipment, Safety & Security, Water and ESD Module removed per request (icon + text both).
const FEATURES = [
    { Icon: DeviceThermostat, title: 'ENVIRONMENT', sub: 'Temperature • Humidity • CO₂' },
    { Icon: BoltOutlined, title: 'ENERGY', sub: 'EB Power • DG Power Consumption' },
    { Icon: PrecisionManufacturingOutlined, title: 'PRODUCTION LINE', sub: 'Line Status • UPPH Output' },
    { Icon: BarChartOutlined, title: 'ANALYTICS', sub: 'Dashboards • Reports Trends' },
];

// Mallik logo image. `height` is any CSS length; width follows the image's aspect ratio.
// Wrapped in a white rounded box so it stays legible on the dark photo overlay.
const BrandLogo = ({ height = '34px', className = '' }) => (
    <span
        className={className}
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            borderRadius: '6px',
            padding: `calc(${height} * 0.12) calc(${height} * 0.2)`,
        }}
    >
        <img
            src={MallikLogo}
            alt="Mallik logo"
            draggable={false}
            style={{ height: height, width: 'auto', display: 'block' }}
        />
    </span>
);

const Signin = () => {
    const navigate = useNavigate();

    const [email, setUserEmail] = useState("");
    const [password, setUserPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const successCaseCode = [200, 201];
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: 'Login Successful',
    });

    useEffect(() => {
        const { accessToken } = ApplicationStore().getStorage('userDetails');
        console.log("accessToken", accessToken);
        if (accessToken) {
            navigate('/IoTDashboard');
        } else {
            navigate('/Sign_in');
        }

    }, []);

    function submit(e) {
        e.preventDefault();
        LoginService({ email: email, password: password, })
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
        <div
            className="relative overflow-hidden"
            style={{ width: '100%', height: '100vh' }}
        >

            {/* full-bleed background photo */}
            <img
                src={LenovoBuilding}
                alt="Facility"
                draggable={false}
                className="absolute inset-0"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                }}
            />
            {/* readability gradient over the left side, photo stays bright on the right */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'linear-gradient(90deg, rgba(2,15,33,0.74) 0%, rgba(2,15,33,0.42) 30%, rgba(2,15,33,0.12) 55%, rgba(0,0,0,0) 78%)',
                }}
            />

            <div className="relative z-10 flex h-full w-full items-center justify-between">

                {/* LEFT : brand / features, sitting directly on the photo */}
                <div
                    className="hidden h-full flex-1 flex-col justify-center overflow-hidden text-white lg:flex"
                    style={{ padding: '5vh clamp(2rem, 5vw, 5rem)' }}
                >
                    <BrandLogo
                        height="clamp(48px, 7vh, 64px)"
                        className="self-start"
                    />

                    <h1
                        className="font-extrabold leading-none"
                        style={{ fontSize: 'clamp(2.25rem, 7.5vh, 3.75rem)', marginTop: 'clamp(1rem, 3.5vh, 2rem)' }}
                    >
                        IoT<br />
                        <span style={{ color: '#3AA0E8' }}>PLATFORM</span>
                    </h1>

                    <p
                        className="font-semibold text-sky-200"
                        style={{
                            fontSize: 'clamp(0.68rem, 1.6vh, 0.875rem)',
                            letterSpacing: '0.22em',
                            marginTop: 'clamp(0.75rem, 2.2vh, 1.25rem)',
                        }}
                    >
                        CONNECT&nbsp;&nbsp;&bull;&nbsp;&nbsp;MONITOR&nbsp;&nbsp;&bull;&nbsp;&nbsp;ANALYZE&nbsp;&nbsp;&bull;&nbsp;&nbsp;OPTIMIZE
                    </p>

                    <p
                        className="text-slate-100"
                        style={{
                            fontSize: 'clamp(0.85rem, 1.9vh, 1.05rem)',
                            lineHeight: 1.5,
                            maxWidth: '30rem',
                            marginTop: 'clamp(0.85rem, 2.4vh, 1.5rem)',
                        }}
                    >
                        Real-time monitoring and intelligent insights for a smarter, safer and sustainable factory.
                    </p>

                    <div
                        className="grid grid-cols-2"
                        style={{
                            maxWidth: '34rem',
                            marginTop: 'clamp(1.5rem, 4.5vh, 2.75rem)',
                            columnGap: 'clamp(1rem, 2vw, 1.75rem)',
                            rowGap: 'clamp(1rem, 3.2vh, 2rem)',
                        }}
                    >
                        {FEATURES.map(({ Icon, title, sub, hideText }) => (
                            <div key={title} className="flex flex-col items-center text-center">
                                <span
                                    className="flex items-center justify-center rounded-full"
                                    style={{
                                        width: 'clamp(40px, 6.2vh, 56px)',
                                        height: 'clamp(40px, 6.2vh, 56px)',
                                        border: '2px solid #3AA0E8',
                                        background: 'transparent',
                                        boxShadow: '0 0 0 6px rgba(58,160,232,0.14)',
                                    }}
                                >
                                    <Icon style={{ color: '#EAF4FF', fontSize: 'clamp(18px, 3vh, 26px)' }} />
                                </span>
                                {!hideText && (
                                    <>
                                        <span
                                            className="font-bold tracking-wide"
                                            style={{ fontSize: 'clamp(0.62rem, 1.45vh, 0.75rem)', marginTop: 'clamp(0.4rem, 1.2vh, 0.75rem)' }}
                                        >
                                            {title}
                                        </span>
                                        <span
                                            className="leading-tight text-slate-200"
                                            style={{ fontSize: 'clamp(0.56rem, 1.2vh, 0.7rem)', marginTop: '0.25rem' }}
                                        >
                                            {sub}
                                        </span>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT : floating sign-in card (5vh top / 5vh bottom margin, never clipped) */}
                <div
                    className="flex w-full shrink-0 justify-center px-4 lg:w-auto lg:justify-end"
                    style={{ paddingRight: 'clamp(1rem, 5vw, 5rem)' }}
                >
                    <div
                        className="relative w-full overflow-y-auto rounded-3xl bg-white shadow-2xl"
                        style={{
                            width: '480px',
                            maxWidth: '94vw',
                            maxHeight: '90vh',
                            padding: 'clamp(32px, 5.5vh, 52px) clamp(32px, 3.5vw, 48px)',
                        }}
                    >

                        <div
                            className="flex flex-col items-center"
                            style={{ marginBottom: 'clamp(1rem, 3vh, 1.75rem)' }}
                        >
                            <BrandLogo height="clamp(56px, 8vh, 76px)" />
                            <span
                                className="font-semibold"
                                style={{
                                    marginTop: 'clamp(0.5rem, 1.4vh, 0.75rem)',
                                    fontSize: 'clamp(0.8rem, 1.9vh, 0.95rem)',
                                    letterSpacing: '0.16em',
                                }}
                            >
                                <span style={{ color: '#0d3b66' }}>IoT</span>
                                <span style={{ color: '#0696e0' }}>&nbsp;PLATFORM</span>
                            </span>
                        </div>

                        <h2
                            className="text-center font-bold text-gray-900"
                            style={{ fontSize: 'clamp(1.55rem, 3.8vh, 2.1rem)' }}
                        >
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-center text-gray-500" style={{ fontSize: 'clamp(0.85rem, 1.9vh, 0.95rem)' }}>
                            Welcome back! Please enter your details.
                        </p>

                        <form
                            onSubmit={submit}
                            style={{ marginTop: 'clamp(1.4rem, 3.8vh, 2.25rem)', display: 'grid', gap: 'clamp(1rem, 2.9vh, 1.45rem)' }}
                        >
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Username
                                </label>
                                <TextField
                                    fullWidth
                                    size="medium"
                                    placeholder="Enter your username"
                                    value={email}
                                    required
                                    autoComplete="off"
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    InputProps={{
                                        sx: { borderRadius: '10px' },
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonOutline style={{ fontSize: 22, color: '#9ca3af' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <TextField
                                    fullWidth
                                    size="medium"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    required
                                    onChange={(e) => setUserPassword(e.target.value)}
                                    InputProps={{
                                        sx: { borderRadius: '10px' },
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlined style={{ fontSize: 22, color: '#9ca3af' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword((s) => !s)}
                                                    edge="end"
                                                    size="small"
                                                    tabIndex={-1}
                                                >
                                                    {showPassword
                                                        ? <VisibilityOff style={{ fontSize: 22 }} />
                                                        : <Visibility style={{ fontSize: 22 }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </div>

                            <div className="flex items-center text-sm">
                                <label className="flex items-center gap-2 text-gray-600">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                                    Remember me
                                </label>
                            </div>

                            <LoadingButton
                                type="submit"
                                loading={loading}
                                loadingPosition="end"
                                variant="contained"
                                fullWidth
                                startIcon={<LockOutlined />}
                                style={{
                                    backgroundColor: 'rgb(6,151,224)',
                                    padding: '15px 0',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    letterSpacing: '0.06em',
                                }}
                            >
                                SIGN IN
                            </LoadingButton>
                        </form>

                        <p
                            className="text-right text-gray-400"
                            style={{ marginTop: 'clamp(0.75rem, 2vh, 1.25rem)', fontSize: '11px' }}
                        >
                            RDL Technologies Pvt Ltd
                        </p>
                    </div>
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
