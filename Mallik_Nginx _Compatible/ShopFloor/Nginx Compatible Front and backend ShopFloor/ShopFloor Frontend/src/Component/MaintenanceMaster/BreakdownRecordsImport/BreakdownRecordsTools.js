import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import UploadIcon from '@mui/icons-material/Upload'
import { BreakdownDetailsTemplate } from '../../../Services/DownloadCsvReportsService'
import { ImportBreakdownDetails } from '../../../Services/FileUploadService'
// import { ImportBreakdownDetails } from '../../../Services/LoginPageService'

const BreakdownRecordsTools = (props) => {
    const { setUploadLoader, setRefreshData } = props;

  const handleImportSuccess = (dataObject) => {
    console.log('Import successful:', dataObject)
    // Handle success (e.g., show notification, refresh data)
  } 
  const handleImportError = (errorStatus, errorMessage) => {
    console.error('Import failed:', errorMessage)
    // Handle error (e.g., show error notification)
  } 

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        backgroundColor: '#f8f8ff',
        padding: '15px',
        border: '1px solid #e0e0e0'
      }}
    >
      <Typography sx={{ m: 1 }} variant="h5">
        Breakdown Upload List
      </Typography>

      <Box>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#051622', mr: 2 }}
          endIcon={<FileDownloadIcon />}
          onClick={BreakdownDetailsTemplate}
        >
          Export
        </Button>

        {/* Import Button */}
                <Button
                    variant="contained"
                    style={{ backgroundColor: '#051622', marginRight: '15px' }}
                    endIcon={<UploadIcon />}
                    component="label"
                    htmlFor="import"
                >
                    Import
                </Button>
                <input
                  id="import"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0];

                      setUploadLoader(true);

                      ImportBreakdownDetails(
                        file, // ✅ send FILE directly
                        handleImportSuccess,
                        handleImportError
                      );

                      e.target.value = ""; // reset input
                    }
                  }}
                />
      </Box>
    </Box>
  )
}

export default BreakdownRecordsTools
