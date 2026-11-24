import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { Grid, TextField, Typography } from '@mui/material';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ServicePatternModal = (props) => {
    const { setServicePatternDailog, servicePatternDailog, servicePattern, setServiceArrayData } = props;

    const [serviceOneFrom, setServiceOneFrom] = useState('');
    const [serviceOneTo, setServiceOneTo] = useState('');
    const [serviceOneRunHours, setServiceOneRunHours] = useState('');

    const [serviceTwoFrom, setServiceTwoFrom] = useState('');
    const [serviceTwoTo, setServiceTwoTo] = useState('');
    const [serviceTwoRunHours, setServiceTwoRunHours] = useState('');

    const [serviceThreeFrom, setServiceThreeFrom] = useState('');
    const [serviceThreeTo, setServiceThreeTo] = useState('');
    const [serviceThreeRunHours, setServiceThreeRunHours] = useState('');

    const [serviceFourFrom, setServiceFourFrom] = useState('');
    const [serviceFourTo, setServiceFourTo] = useState('');
    const [serviceFourRunHours, setServiceFourRunHours] = useState('');

    const [serviceFiveFrom, setServiceFiveFrom] = useState('');
    const [serviceFiveTo, setServiceFiveTo] = useState('');
    const [serviceFiveRunHours, setServiceFiveRunHours] = useState('');

    const handleClose = () => {
        setServicePatternDailog(false);
        setServiceOneFrom('');
        setServiceOneTo('');
        setServiceOneRunHours('');
        setServiceTwoFrom('');
        setServiceTwoTo('');
        setServiceTwoRunHours('');
        setServiceThreeFrom('');
        setServiceThreeTo('');
        setServiceThreeRunHours('');
        setServiceFourFrom('');
        setServiceFourTo('');
        setServiceFourRunHours('');
        setServiceFiveFrom('');
        setServiceFiveTo('');
        setServiceFiveRunHours('');
    };

    const handleSubmitClick = () => {
        const serviceArray = [
            {
                "service1From": serviceOneFrom ? serviceOneFrom : '',
                "service1To": serviceOneTo ? serviceOneTo : '',
                "service1RunHours": serviceOneRunHours ? serviceOneRunHours : ''
            },
            {
                "service2From": serviceTwoFrom ? serviceTwoFrom : '',
                "service2To": serviceTwoTo ? serviceTwoTo : '',
                "service2RunHours": serviceTwoRunHours ? serviceTwoRunHours : ''
            },
            {
                "service3From": serviceThreeFrom ? serviceThreeFrom : '',
                "service3To": serviceThreeTo ? serviceThreeTo : '',
                "service3RunHours": serviceThreeRunHours ? serviceThreeRunHours : ''
            },
            {
                "service4From": serviceFourFrom ? serviceFourFrom : '',
                "service4To": serviceFourTo ? serviceFourTo : '',
                "service4RunHours": serviceFourRunHours ? serviceFourRunHours : ''
            },
            {
                "service5From": serviceFiveFrom ? serviceFiveFrom : '',
                "service5To": serviceFiveTo ? serviceFiveTo : '',
                "service5RunHours": serviceFiveRunHours ? serviceFiveRunHours : ''
            }
        ]
        setServiceArrayData(serviceArray)
        setServicePatternDailog(false);
    }

    return (
        <React.Fragment>
            <Dialog
                sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '100%' } }}
                open={servicePatternDailog}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                // aria-describedby="alert-dialog-slide-description"
                maxWidth="lg"
            >
                <DialogTitle>Service Pattern</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {servicePattern === 'Service 1' || servicePattern === 'Service 2' || servicePattern === 'Service 3' || servicePattern === 'Service 4' || servicePattern === 'Service 5' ?
                            <Grid container paddingTop={1} spacing={2}>
                                <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} alignItems={'center'} justifyContent={'center'}>
                                    <TextField
                                        fullWidth
                                        label="1 Service From"
                                        placeholder='Service From'
                                        variant="outlined"
                                        required
                                        type='date'
                                        value={serviceOneFrom}
                                        onChange={(e) => setServiceOneFrom(e.target.value)}
                                        InputLabelProps={
                                            {
                                                shrink: true
                                            }
                                        } />
                                </Grid>
                                <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} alignItems={'center'} justifyContent={'center'}>
                                    <TextField
                                        fullWidth
                                        label="1 Service To"
                                        placeholder='Service To'
                                        variant="outlined"
                                        required
                                        type='date'
                                        value={serviceOneTo}
                                        onChange={(e) => setServiceOneTo(e.target.value)}
                                        InputLabelProps={
                                            {
                                                shrink: true
                                            }
                                        } />
                                </Grid>
                                <Grid item xs={12} sm={12} md={1.5} lg={1.5} xl={1.5} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                                    <Typography>OR</Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} alignItems={'center'} justifyContent={'center'}>
                                    <TextField
                                        fullWidth
                                        label="Run Hours"
                                        placeholder='Run Hours'
                                        variant="outlined"
                                        required
                                        value={serviceOneRunHours}
                                        onChange={(e) => setServiceOneRunHours(e.target.value)}
                                    />
                                </Grid>
                            </Grid> : null}
                        {servicePattern === 'Service 2' || servicePattern === 'Service 3' || servicePattern === 'Service 4' || servicePattern === 'Service 5' ?
                            <Grid container paddingTop={1} spacing={2} marginTop={1}>
                                <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} alignItems={'center'} justifyContent={'center'}>
                                    <TextField
                                        fullWidth
                                        label="2 Service From"
                                        placeholder='Service From'
                                        variant="outlined"
                                        required
                                        type='date'
                                        value={serviceTwoFrom}
                                        onChange={(e) => setServiceTwoFrom(e.target.value)}
                                        InputLabelProps={
                                            {
                                                shrink: true
                                            }
                                        } />
                                </Grid>
                                <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} alignItems={'center'} justifyContent={'center'}>
                                    <TextField
                                        fullWidth
                                        label="2 Service To"
                                        placeholder='Service To'
                                        variant="outlined"
                                        required
                                        type='date'
                                        value={serviceTwoTo}
                                        onChange={(e) => setServiceTwoTo(e.target.value)}
                                        InputLabelProps={
                                            {
                                                shrink: true
                                            }
                                        } />
                                </Grid>
                                <Grid item xs={12} sm={12} md={1.5} lg={1.5} xl={1.5} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                                    <Typography>OR</Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} alignItems={'center'} justifyContent={'center'}>
                                    <TextField
                                        fullWidth
                                        label="Run Hours"
                                        placeholder='Run Hours'
                                        variant="outlined"
                                        required
                                        value={serviceTwoRunHours}
                                        onChange={(e) => setServiceTwoRunHours(e.target.value)}
                                    />
                                </Grid>
                            </Grid> : null}
                        {servicePattern === 'Service 3' || servicePattern === 'Service 4' || servicePattern === 'Service 5' ?
                            <Grid container paddingTop={1} spacing={2} marginTop={1}>
                                <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} alignItems={'center'} justifyContent={'center'}>
                                    <TextField
                                        fullWidth
                                        label="3 Service From"
                                        placeholder='Service From'
                                        variant="outlined"
                                        required
                                        type='date'
                                        value={serviceThreeFrom}
                                        onChange={(e) => setServiceThreeFrom(e.target.value)}
                                        InputLabelProps={
                                            {
                                                shrink: true
                                            }
                                        } />
                                </Grid>
                                <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} alignItems={'center'} justifyContent={'center'}>
                                    <TextField
                                        fullWidth
                                        label="3 Service To"
                                        placeholder='Service To'
                                        variant="outlined"
                                        required
                                        type='date'
                                        value={serviceThreeTo}
                                        onChange={(e) => setServiceThreeTo(e.target.value)}
                                        InputLabelProps={
                                            {
                                                shrink: true
                                            }
                                        } />
                                </Grid>
                                <Grid item xs={12} sm={12} md={1.5} lg={1.5} xl={1.5} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                                    <Typography>OR</Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} alignItems={'center'} justifyContent={'center'}>
                                    <TextField
                                        fullWidth
                                        label="Run Hours"
                                        placeholder='Run Hours'
                                        variant="outlined"
                                        required
                                        value={serviceThreeRunHours}
                                        onChange={(e) => setServiceThreeRunHours(e.target.value)}
                                    />
                                </Grid>
                            </Grid> : null}
                        {servicePattern === 'Service 4' || servicePattern === 'Service 5' ?
                            <Grid container paddingTop={1} spacing={2} marginTop={1}>
                                <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} alignItems={'center'} justifyContent={'center'}>
                                    <TextField
                                        fullWidth
                                        label="4 Service From"
                                        placeholder='Service From'
                                        variant="outlined"
                                        required
                                        type='date'
                                        value={serviceFourFrom}
                                        onChange={(e) => setServiceFourFrom(e.target.value)}
                                        InputLabelProps={
                                            {
                                                shrink: true
                                            }
                                        } />
                                </Grid>
                                <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} alignItems={'center'} justifyContent={'center'}>
                                    <TextField
                                        fullWidth
                                        label="4 Service To"
                                        placeholder='Service To'
                                        variant="outlined"
                                        required
                                        type='date'
                                        value={serviceFourTo}
                                        onChange={(e) => setServiceFourTo(e.target.value)}
                                        InputLabelProps={
                                            {
                                                shrink: true
                                            }
                                        } />
                                </Grid>
                                <Grid item xs={12} sm={12} md={1.5} lg={1.5} xl={1.5} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                                    <Typography>OR</Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} alignItems={'center'} justifyContent={'center'}>
                                    <TextField
                                        fullWidth
                                        label="Run Hours"
                                        placeholder='Run Hours'
                                        variant="outlined"
                                        required
                                        value={serviceFourRunHours}
                                        onChange={(e) => setServiceFourRunHours(e.target.value)}
                                    />
                                </Grid>
                            </Grid> : null}
                        {servicePattern === 'Service 5' ?
                            <Grid container paddingTop={1} spacing={2} marginTop={1}>
                                <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} alignItems={'center'} justifyContent={'center'}>
                                    <TextField
                                        fullWidth
                                        label="5 Service From"
                                        placeholder='Service From'
                                        variant="outlined"
                                        required
                                        type='date'
                                        value={serviceFiveFrom}
                                        onChange={(e) => setServiceFiveFrom(e.target.value)}
                                        InputLabelProps={
                                            {
                                                shrink: true
                                            }
                                        } />
                                </Grid>
                                <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} alignItems={'center'} justifyContent={'center'}>
                                    <TextField
                                        fullWidth
                                        label="5 Service To"
                                        placeholder='Service To'
                                        variant="outlined"
                                        required
                                        type='date'
                                        value={serviceFiveTo}
                                        onChange={(e) => setServiceFiveTo(e.target.value)}
                                        InputLabelProps={
                                            {
                                                shrink: true
                                            }
                                        } />
                                </Grid>
                                <Grid item xs={12} sm={12} md={1.5} lg={1.5} xl={1.5} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                                    <Typography>OR</Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} alignItems={'center'} justifyContent={'center'}>
                                    <TextField
                                        fullWidth
                                        label="Run Hours"
                                        placeholder='Run Hours'
                                        variant="outlined"
                                        required
                                        value={serviceFiveRunHours}
                                        onChange={(e) => setServiceFiveRunHours(e.target.value)}
                                    />
                                </Grid>
                            </Grid> : null}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSubmitClick}>Submit</Button>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment >
    );
}
export default ServicePatternModal;
