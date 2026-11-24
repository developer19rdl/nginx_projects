import React, { useState } from 'react';
import { Box, Button, Grid, Paper, TextField, Typography, LinearProgress } from '@mui/material';
import { UploadCompanyVideo } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../UploadLogo/NotificationBar';

// Company-wide "Award Winning / Highlights" video — shown on Plant Overview's
// home screen (the "Awards & Plant Highlights Videos" panel). Same Paper/Grid
// layout as Upload Logo, but multipart upload (FormData) instead of base64 —
// a video is far too large for a JSON body — and a <video> preview instead
// of <img>. One shared video for the whole install, same "most recent wins"
// convention as the company logo.
const UploadVideo = () => {
    const [file, setFile] = useState(null);
    const [companyName, setCompanyName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [openNotification, setNotification] = useState({ status: false, type: 'error', message: '' });

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.size > 150 * 1024 * 1024) {
            alert('Video must be under 150 MB.');
            return;
        }
        setFile(selectedFile || null);
    };

    const handleClose = () => setNotification({ status: false, type: '', message: '' });

    const clearData = () => {
        setFile(null);
        setCompanyName('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file) return;
        const formData = new FormData();
        formData.append('video', file);
        if (companyName) formData.append('companyName', companyName);

        setUploading(true);
        UploadCompanyVideo(
            formData,
            (dataObject) => {
                setUploading(false);
                setNotification({ status: true, type: 'success', message: dataObject?.message || 'Video uploaded successfully' });
                setTimeout(() => { clearData(); handleClose(); }, 2000);
            },
            (errorMessage) => {
                setUploading(false);
                setNotification({ status: true, type: 'error', message: typeof errorMessage === 'string' ? errorMessage : 'Video upload failed' });
                setTimeout(() => { handleClose(); }, 2000);
            }
        );
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <Paper
                            style={{
                                backgroundColor: '#ffffff', padding: '20px', textAlign: 'center',
                                color: '#fff', height: '300px', display: 'flex',
                                justifyContent: 'center', alignItems: 'center',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', flexDirection: 'column',
                            }}
                        >
                            <TextField
                                value={companyName}
                                id="video-company-name"
                                label="Title (optional)"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => setCompanyName(e.target.value)}
                                autoComplete="off"
                                style={{ marginBottom: '20px' }}
                            />
                            <TextField
                                type="file"
                                id="video-file-input"
                                variant="outlined"
                                fullWidth
                                onChange={handleFileChange}
                                autoComplete="off"
                                required
                                InputProps={{ inputProps: { accept: 'video/mp4,video/webm,video/ogg,video/quicktime' } }}
                            />
                            <label htmlFor="video-file-input" style={{ cursor: 'pointer' }}>
                                <Typography variant="body2" color="secondary">
                                    Upload an MP4/WebM/MOV video (up to 150 MB)
                                </Typography>
                            </label>
                            {uploading && <LinearProgress sx={{ width: '100%', mt: 2 }} />}
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <Paper
                            style={{
                                backgroundColor: '#000000', padding: '20px', textAlign: 'center',
                                color: '#fff', height: '300px', display: 'flex',
                                justifyContent: 'center', alignItems: 'center',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            {file ? (
                                <video
                                    src={URL.createObjectURL(file)}
                                    controls
                                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                                />
                            ) : (
                                <Typography variant="body2" sx={{ color: '#888' }}>No video selected</Typography>
                            )}
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button variant="contained" size="large" type="submit" disabled={!file || uploading}>
                            {uploading ? 'Uploading…' : 'Upload'}
                        </Button>
                    </Grid>

                    <NotificationBar
                        handleClose={handleClose}
                        notificationContent={openNotification.message}
                        openNotification={openNotification.status}
                        type={openNotification.type}
                    />
                </Grid>
            </form>
        </Box>
    );
};

export default UploadVideo;
