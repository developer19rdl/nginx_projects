import React, { useEffect, useState, } from 'react'
import { Grid, Avatar, TextField, Button, Stack, Typography, Card, CardContent, Input, FormControl, Modal, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, } from '@mui/material'
import Hidden from '@mui/material/Hidden';
import { useNavigate } from 'react-router-dom';
import MallikLogo from '../../AllImage/MallikLogo.png';
import MallikLoginPage from '../../AllImage/MallickLoginImage.jpg'
import { LoginService, UserPasswordChange } from '../../ApiService/LoginPageService';
import ApplicationStore from '../../Utility/localStorageUtil';
import NotificationBar from '../GlobleFiles/ServiceNotificationBar';

const LoginPage = () => {
    const navigate = useNavigate();
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [open, setOpen] = useState(false);
    const [passwordUserName, setPasswordUserName] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errorFlag, setErrorFlag] = useState(false);


    useEffect(() => {
        const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
        return userDetails?.accessToken ? navigate("/") : navigate("/login")
    }, []);

    const successCaseCode = [200, 201];
    const [data, setData] = useState({
        userName: '',
        password: ''
    })

    function submit(e) {
        e.preventDefault();
        LoginService({ userName: data.userName, password: data.password })
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
                    navigate("/MasterDashboard");
                }, 2000);
            }).catch((error) => {
                error?.errorObject?.then((errorResponse) => {
                    console.log(errorResponse.error ? errorResponse.error : errorResponse.message);
                    setNotification({
                        status: true,
                        type: 'error',
                        message: errorResponse.message,
                    });
                });
            });

    }

    const handleLogin = (e) => {
        const newdata = { ...data }
        newdata[e.target.id] = e.target.value
        setData(newdata)
        console.log(newdata)
    }
    const avatarStyle = { backgroundColor: '#3B3531' }
    const handleCloseNotify = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    // CHANGE PASSWORD
    const handleConfirm = () => {
        if (oldPassword !== newPassword) {
            setErrorFlag(false);
            UserPasswordChange({
                userName: passwordUserName,
                oldPassword: oldPassword,
                newPassword: newPassword
            }, hanldeCofirmSuccess, handleConfirmException)
        } else {
            setErrorFlag(true);
        }
    }

    const hanldeCofirmSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            setPasswordUserName('');
            setOldPassword('');
            setNewPassword('');
            handleClose();
            setOpen(false);
        }, 2000);
    }
    const handleConfirmException = (errorObject, errorMessage) => {
        console.log("the error ", errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
    }

    return (
        <div style={{ background: '#002D68', height: '100vh' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
                <form onSubmit={submit}>
                    <Card style={{
                        marginTop: '50px',
                        width: '80vw',
                        height: '90vh',
                        borderRadius: '25px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', // Adjust the values as needed
                        transition: 'transform 0.3s',
                        '&:hover': {
                            transform: 'scale(1.05)', // Adjust the scaling factor as needed
                        }

                    }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item style={{ height: '80vh', display: 'flex', alignItems: 'center' }} xs={12} sm={12} md={5} lg={5} xl={5} >
                                    <Grid container spacing={2} style={{ display: 'flex', flexDirection: 'column' }} >
                                        <Grid item sx={12} sm={12} md={12} lg={12} xl={12} align='center' >
                                            <img
                                                style={{
                                                    alignSelf: 'center',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    width: '200px',
                                                    height: '100px'
                                                }} src={MallikLogo} />
                                        </Grid>
                                        <Grid item sx={12} sm={12} md={12} lg={12} xl={12} align='center' >
                                            <Typography variant="h6" style={{ alignSelf: 'center', textAlign: 'center', fontWeight: 'bold' }}> Sign in to your account </Typography>
                                        </Grid>
                                        <Grid item sx={12} sm={12} md={12} lg={12} xl={12}>
                                            <FormControl fullWidth>

                                                <Input
                                                    type='userName'
                                                    id="userName"
                                                    label="userName"
                                                    variant="outlined"
                                                    placeholder='Enter Username'
                                                    required
                                                    fullWidth
                                                    name='userName'
                                                    //  value={user}
                                                    onChange={(e) =>
                                                        handleLogin(e)
                                                    }
                                                    value={data.username} />
                                            </FormControl>
                                            {/* <TextField
                                            type='email'
                                            id="email"
                                            label="Email"
                                            variant="outlined"
                                            placeholder='Enter User Email'
                                            required
                                            fullWidth
                                            name='email'
                                            //  value={user}
                                            onChange={(e) =>
                                                handleLogin(e)
                                            }
                                            value={data.username} /> */}
                                        </Grid>
                                        <Grid item sx={12} sm={12} md={12} lg={12} xl={12}>
                                            <FormControl fullWidth>
                                                <Input
                                                    id="password"
                                                    margin="normal"
                                                    label="Password"
                                                    variant="outlined"
                                                    placeholder='Enter password'
                                                    required
                                                    fullWidth
                                                    type='password'
                                                    name='password'
                                                    onChange={(e) =>
                                                        handleLogin(e)
                                                    }
                                                    value={data.password} />
                                            </FormControl>

                                            {/* <TextField
                                            id="password"
                                            margin="normal"
                                            label="Password"
                                            variant="outlined"
                                            placeholder='Enter password'
                                            required
                                            fullWidth
                                            type='password'
                                            name='password'
                                            onChange={(e) =>
                                                handleLogin(e)
                                            }
                                            value={data.password} /> */}
                                        </Grid>
                                        <Grid item sx={12} sm={12} md={12} lg={12} xl={12} >
                                            <div style={{ marginTop: '-8px', marginBottom: '7px' }}>
                                                <Typography
                                                    style={{ textAlign: 'right', cursor: 'pointer', fontFamily: 'cursive', textDecoration: 'underline' }}
                                                    onClick={() => setOpen(true)}
                                                >Change Password</Typography>
                                            </div>
                                            <Button style={{ alignSelf: 'center', textAlign: 'center', backgroundColor: '#002D68', borderRadius: '25px' }}
                                                type="submit"
                                                fullWidth
                                                variant="contained"

                                            >
                                                Sign In
                                            </Button>
                                        </Grid>
                                    </Grid>

                                </Grid>
                                <Hidden only={["sm", 'xs']}>
                                    <Grid item sx={12} sm={7} md={6} lg={7} xl={7} style={{ display: 'flex', alignItems: 'center' }}>
                                        <Card style={{
                                            backgroundColor: '#E6E7EE',
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: '80vw',
                                            height: '86vh',
                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', // Adjust the values as needed
                                            transition: 'transform 0.3s',
                                            '&:hover': {
                                                transform: 'scale(1.05)', // Adjust the scaling factor as needed
                                            }
                                        }}>

                                            <CardContent >
                                                <Stack
                                                    direction="row"
                                                    justifyContent="center"
                                                    alignItems="center"
                                                    spacing={2}

                                                >
                                                    <img src={MallikLoginPage} alt="React Logo" height="100%" width="100%" />

                                                </Stack>

                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Hidden>
                            </Grid>

                        </CardContent>
                    </Card>
                </form>
                <NotificationBar
                    handleClose={handleClose}
                    notificationContent={openNotification.message}
                    openNotification={openNotification.status}
                    type={openNotification.type}
                />

                <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        CHANGE PASSWORD
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} style={{ marginTop: '-10px' }}>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <TextField
                                    value={passwordUserName}
                                    onChange={(e) => setPasswordUserName(e.target.value)}
                                    fullWidth id="outlined-basic"
                                    label="Username" variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <TextField
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    fullWidth id="outlined-basic"
                                    label="Old Password"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <TextField
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    fullWidth id="outlined-basic"
                                    label="New Password"
                                    variant="outlined"
                                />
                                {errorFlag && <Typography style={{ color: 'red', fontSize: '13px', textAlign: 'left' }}>Your new password cannot be same as old password</Typography>}
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleConfirm} autoFocus>
                            Confirm
                        </Button>
                        <Button onClick={() => setOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    )
}

export default LoginPage