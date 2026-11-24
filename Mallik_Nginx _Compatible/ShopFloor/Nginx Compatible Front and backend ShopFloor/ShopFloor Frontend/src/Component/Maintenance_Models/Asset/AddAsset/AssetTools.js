import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { DownloadAssetTemplate } from '../../../../Services/DownloadCsvReportsService';
import { AssetUpload } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../Notification/NotificationBar';

const AssetTools = (props) => {
  const { setRefreshData } = props;
  const [openNotification, setNotification] = useState({
    status: false,
    type: 'error',
    message: '',
  });

  const DownloadTemplateSuccess = (dataObject) => {
    setNotification({
      status: true,
      type: "success",
      message: 'Download Success',
    });
    setTimeout(() => {
      handleClose();
    }, 2000);
  }

  
  const DownloadTemplateException = (errorObject, errorMessage) => {
    setNotification({
      status: true,
      type: "error",
      message: errorMessage,
    });
  }

  const AssetImportSuccess = (dataObject) => {
    setRefreshData(oldValue => !oldValue);
    setNotification({
      status: true,
      type: "success",
      message: dataObject.message,
    });
    setTimeout(() => {
      handleClose();
    }, 2000);
  }
  const AssetImportException = (errorObject, errorMessage) => {
    setNotification({
      status: true,
      type: "error",
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
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        backgroundColor: '#f8f8ff',
        padding: '15px',
        border: '1px solid #e0e0e0'
      }}>
      <Typography
         sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}
        variant="h5">
        Asset List
      </Typography>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Button
          variant="contained"
          // color="primary"
          component="label"
          sx={{
            marginRight: '16px', backgroundColor: '#051622', height: '40px', borderRadius: '20px', marginTop: '8px',
            "&:hover": {
              backgroundColor: "#183b52", // Change to your desired hover color
            },
          }}
          onClick={() => {
            DownloadAssetTemplate(DownloadTemplateSuccess, DownloadTemplateException);
          }}

        // onClick={handleDownloadClick}
        >
          Download Template
        </Button>
        {/* <ExcelTemplateDownloader /> */}

        <input
          id="upload-photo"
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              const reader = new FileReader();
              reader.onload = () => {
                if (reader.readyState === 2) {
                  // setFile(reader.result);
                  AssetUpload(
                    { file: reader.result },
                    AssetImportSuccess,
                    AssetImportException
                  );
                }
              };
              reader.readAsDataURL(e.target.files[0]);
            }
          }}
        />

        <Button
          variant="contained"
          component="label"
          htmlFor="upload-photo"
          sx={{
            backgroundColor: '#051622', height: '40px', borderRadius: '20px', marginTop: '8px',
            "&:hover": {
              backgroundColor: "#183b52", // Change to your desired hover color
            },
          }}
        >
          Upload Asset
        </Button>
        <Box
          sx={{ m: 1 }}
          onClick={() => {
            props.setIsAddButton(true);
            props.setOpen(true);
            props.setEditAsset('');
          }}>
          <Stack direction="row" spacing={2}>
            <Fab
              sx={{
                backgroundColor: "#051622", color: "#ffff",
                "&:hover": {
                  backgroundColor: "#183b52", // Change to your desired hover color
                },
              }}
              variant="extended" size="medium" aria-label="add">
              <AddIcon sx={{ mr: 1 }} />
              Add Asset
            </Fab>
          </Stack>
        </Box>
      </div>
      <NotificationBar
        handleClose={handleClose}
        notificationContent={openNotification.message}
        openNotification={openNotification.status}
        type={openNotification.type}
      />
    </Box>
  )
}

export default AssetTools
