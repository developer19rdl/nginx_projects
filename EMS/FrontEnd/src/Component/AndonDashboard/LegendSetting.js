import React, { useMemo, useState } from 'react';
import { Box, Grid, TextField, Typography, Button, Card, CardContent } from '@mui/material';
import NotificationBar from '../../Utility/NotificationBar';


const DEFAULTS = {
  MAINTENANCE: { label: 'MAINTENANCE', color: '#d32f2f' },
  STORES: { label: 'STORES', color: '#f9a825' },
  LOGISTICS: { label: 'LOGISTICS', color: '#ef6c00' },
  SAFETY: { label: 'SAFETY', color: '#0d47a1' },
  OK: { label: 'OK', color: '#2e7d32' },
  NA: { label: 'NA', color: '#9e9e9e' },
};

const LegendSetting = ({ value, onSave }) => {
  const initial = useMemo(() => ({ ...(value || DEFAULTS) }), [value]);
  const [form, setForm] = useState(initial);

  const handleChangeLabel = (key, v) => setForm((p) => ({ ...p, [key]: { ...p[key], label: v } }));
  const handleChangeColor = (key, v) => setForm((p) => ({ ...p, [key]: { ...p[key], color: v } }));

  const handleSave = () => {
    if (onSave) onSave(form);
    
  };
     const [openNotification, setNotification] = useState({
          status: false,
          type: 'error',
          message: '',
      });
  
    const handleClose = () => {
      setNotification({
          status: false,
          type: '',
          message: '',
      });
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Status Legend Settings
      </Typography>

      <Grid container spacing={2}>
        {Object.keys(DEFAULTS).map((key) => (
          <Grid key={key} item xs={12} md={6}>
            {/* <Card> */}
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 24, height: 23, bgcolor: form[key]?.color || DEFAULTS[key].color, borderRadius: 0.5, border: '1px solid #ccc' }} />
                  <Typography variant="body2" sx={{ minWidth: 110 }}>{key.charAt(0) + key.slice(1).toLowerCase()}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1}}>
                  <TextField
                    size="small"
                    label="Display Name"
                    value={form[key]?.label || ''}
                    onChange={(e) => handleChangeLabel(key, e.target.value)}
                    fullWidth
                  />
                  <TextField
                    size="small"
                    type="color"
                    label="Color"
                    value={form[key]?.color || DEFAULTS[key].color}
                    onChange={(e) => handleChangeColor(key, e.target.value)}
                    sx={{ width: 100 }}
                  />
                </Box>
              </CardContent>
            {/* </Card> */}
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </Box>
      <NotificationBar
                          handleClose={handleClose}
                          notificationContent={openNotification.message}
                          openNotification={openNotification.status}
                          type={openNotification.type}
                      />
    </Box>
    
  );
};

export default LegendSetting;
