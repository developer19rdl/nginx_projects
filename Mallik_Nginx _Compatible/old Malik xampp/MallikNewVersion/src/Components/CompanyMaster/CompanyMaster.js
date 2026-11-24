import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Grid, TextField } from '@mui/material';
import MallikLogo from '../../AllImage/MallikLogo.png';
import { Padding } from '@mui/icons-material';
import UploadIcon from '@mui/icons-material/Upload';
import NotificationBar from '../GlobleFiles/ServiceNotificationBar';
import { GetCompanyDetails, updateCompanyDetails } from '../../ApiService/LoginPageService';
import NoImage from '../../AllImage/No-Image.png'
import { useModuleLocks } from '../context/ModuleLockContext';

const CompanyMaster = () => {
  const moduleLocks = useModuleLocks();
  const isModuleLocked =
    moduleLocks.find(m => m.moduleName === "Company Master")?.lockStatus === "locked";
  const [imageBase64, setImageBase64] = useState(null);
  const [imageBase64Show, setImageBase64Show] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    email: '',
    telNo: '',
    mobileNo: '',
    website: '',
    gstNo: '',
    cinNo: '',
    panNo: '',
    iecNo: '',
    adCode: '',
    note: '',
  });
  const [cardHeight, setCardHeight] = useState(window.innerHeight);
  const [isEdit, setIsEdit] = useState(false);
  const [openNotification, setNotification] = useState({
    status: false,
    type: 'error',
    message: '',
  });
  const [refresher, setRefresher] = useState(false);
  const baseUrl = process.env.REACT_APP_API_URL;
  const urlParts = baseUrl.split('api/');

  useEffect(() => {
    const handleResize = () => {
      setCardHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    GetCompanyDetails(handleGetSuccess, handleGetException)
  }, [refresher])

  const handleGetSuccess = (dataObject) => {
    setFormData({
      companyName: dataObject?.data?.companyName || '',
      address: dataObject?.data?.address || '',
      email: dataObject?.data?.email || '',
      telNo: dataObject?.data?.telNo || '',
      mobileNo: dataObject?.data?.mobNo || '',
      website: dataObject?.data?.website || '',
      gstNo: dataObject?.data?.gstNo || '',
      cinNo: dataObject?.data?.cinNo || '',
      panNo: dataObject?.data?.panNo || '',
      iecNo: dataObject?.data?.iecNo || '',
      adCode: dataObject?.data?.adCode || '',
      note: dataObject?.data?.note || '',
    });

    setImageBase64Show(dataObject?.data?.image);
  };
  const handleGetException = (errorObject, errorMessage) => {
    setNotification({
      status: true,
      type: 'error',
      message: errorMessage,
    });
  }


  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImageBase64(reader.result);
        setImageBase64Show(reader.result);
      };

      reader.readAsDataURL(file);
    }
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    const finalImage = imageBase64
      ? imageBase64                 // newly uploaded image (Base64)
      : imageBase64Show && !imageBase64Show.startsWith('data:')
        ? imageBase64Show
        : '';

    updateCompanyDetails(
      {
        companyName: formData.companyName,
        image: finalImage,
        address: formData.address,
        email: formData.email,
        telNo: formData.telNo,
        mobNo: formData.mobileNo,
        website: formData.website,
        gstNo: formData.gstNo,
        cinNo: formData.cinNo,
        panNo: formData.panNo,
        iecNo: formData.iecNo,
        adCode: formData.adCode,
        note: formData.note,
      },
      handleUpdateSuccess,
      handleUpdateException
    );
  };

  const handleUpdateSuccess = (dataObject) => {
    setNotification({
      status: true,
      type: 'success',
      message: dataObject.message,
    });
    setTimeout(() => {
      handleClose();
      setRefresher(!refresher);
      setIsEdit(false)
      setImageBase64Show(null);
    }, 2000);
  }

  const handleUpdateException = (errorObject, errorMessage) => {
    setNotification({
      status: true,
      type: 'error',
      message: errorMessage,
    });
  }

  const handleClose = () => {
    setNotification({
      status: false,
      type: '',
      message: '',
    });
  };

  return (
    <form style={{ display: 'flex', justifyContent: 'center', height: '100%', padding: '20px 0' }} onSubmit={handleSubmit}>
      <Box sx={{ width: { xs: '100%', md: '80%', lg: '70%' }, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Card
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 2,
            borderRadius: 2
          }}
        >
          <CardContent sx={{ flexGrow: 1, overflow: 'auto', p: 1.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, mb: 0 }}>
                <Box sx={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: '#fafafa'
                }}>
                  <img
                    src={
                      imageBase64
                        ? imageBase64
                        : imageBase64Show
                          ? `${urlParts[0]}${imageBase64Show}`
                          : NoImage
                    }
                    alt="Logo"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    onError={(e) => { e.target.src = NoImage; }}
                  />
                </Box>
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  startIcon={<UploadIcon />}
                  sx={{ textTransform: 'none' }}
                  disabled={!isEdit || isModuleLocked}
                >
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </Button>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  size="small"
                  fullWidth
                  required
                  label="Company Name"
                  variant="outlined"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  disabled={!isEdit}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  size="small"
                  fullWidth
                  required
                  label="Address"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEdit}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  size="small"
                  fullWidth
                  required
                  type='email'
                  label="Email ID"
                  variant="outlined"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEdit}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  size="small"
                  fullWidth
                  required
                  type='number'
                  label="Tel No"
                  variant="outlined"
                  value={formData.telNo}
                  onChange={(e) => setFormData({ ...formData, telNo: e.target.value })}
                  disabled={!isEdit}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  size="small"
                  fullWidth
                  required
                  type='number'
                  label="Mobile No"
                  variant="outlined"
                  value={formData.mobileNo}
                  onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                  disabled={!isEdit}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  size="small"
                  fullWidth
                  required
                  label="Website"
                  variant="outlined"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  disabled={!isEdit}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  size="small"
                  fullWidth
                  required
                  label="Gst No"
                  variant="outlined"
                  value={formData.gstNo}
                  onChange={(e) => setFormData({ ...formData, gstNo: e.target.value })}
                  disabled={!isEdit}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  size="small"
                  fullWidth
                  required
                  label="CIN No"
                  variant="outlined"
                  value={formData.cinNo}
                  onChange={(e) => setFormData({ ...formData, cinNo: e.target.value })}
                  disabled={!isEdit}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  size="small"
                  fullWidth
                  required
                  label="Pan No"
                  variant="outlined"
                  value={formData.panNo}
                  onChange={(e) => setFormData({ ...formData, panNo: e.target.value })}
                  disabled={!isEdit}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  size="small"
                  fullWidth
                  required
                  label="IEC No"
                  variant="outlined"
                  value={formData.iecNo}
                  onChange={(e) => setFormData({ ...formData, iecNo: e.target.value })}
                  disabled={!isEdit}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  size="small"
                  fullWidth
                  required
                  label="AD Code"
                  variant="outlined"
                  value={formData.adCode}
                  onChange={(e) => setFormData({ ...formData, adCode: e.target.value })}
                  disabled={!isEdit}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <TextField
                  size="small"
                  fullWidth
                  label="Exp/Packing Note"
                  multiline
                  rows={4}
                  variant="outlined"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  disabled={!isEdit}
                />
              </Grid>

            </Grid>
          </CardContent>
          <CardActions
            sx={{
              p: 2,
              borderTop: '1px solid #e0e0e0',
              bgcolor: '#f5f5f5',
              justifyContent: 'flex-end',
              gap: 1,
            }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={() => setIsEdit(true)}
              disabled={isModuleLocked || isEdit}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Edit
            </Button>

            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={!isEdit || isModuleLocked}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Update
            </Button>
          </CardActions>
        </Card>
      </Box>
      <NotificationBar
        handleClose={handleClose}
        notificationContent={openNotification.message}
        openNotification={openNotification.status}
        type={openNotification.type}
      />
    </form>
  )
}

export default CompanyMaster