import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent,
  IconButton, Grid, Typography, Divider, Box, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BoltIcon from '@mui/icons-material/Bolt';
import { GetMeterDetail } from '../../Services/NodeJsApiServices';

// ─── Single metric tile ───────────────────────────────────────────────────────
const Metric = ({ label, value, unit, color = '#22d3ee' }) => (
  <Box sx={{ textAlign: 'center', py: 1.5, px: 1,
    background: 'rgba(255,255,255,0.04)', borderRadius: 1.5 }}>
    <Typography sx={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase',
      letterSpacing: '0.08em', mb: 0.5 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>
      {value ?? '—'}
    </Typography>
    <Typography sx={{ fontSize: 9, color: '#4b5563', mt: 0.5 }}>{unit}</Typography>
  </Box>
);

// ─── Component ────────────────────────────────────────────────────────────────
const MeterDetailModal = ({ open, meterId, meterName, onClose }) => {
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !meterId) return;
    setLoading(true);
    setDetail(null);
    GetMeterDetail(
      { meterId },
      (res) => { setDetail(res?.data || null); setLoading(false); },
      ()      => { setLoading(false); }
    );
  }, [open, meterId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#3a3a4a',
          color: '#f3f4f6',
          borderRadius: 2,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }
      }}
    >
      {/* ── Header ── */}
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderBottom: '1px solid #555', pb: 1.5, pt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: 1.5,
            background: 'rgba(167,139,250,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center' }}>
            <BoltIcon sx={{ fontSize: 18, color: '#a78bfa' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase',
              letterSpacing: '0.08em', lineHeight: 1 }}>
              METER
            </Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#f3f4f6', lineHeight: 1.2 }}>
              {detail?.name || meterName || '—'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#6b7280' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, pb: 3 }}>
        {/* ── Loading ── */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress size={32} sx={{ color: '#22d3ee' }} />
          </Box>
        )}

        {/* ── Detail ── */}
        {!loading && detail && (
          <>
            {/* Live Parameters */}
            <Typography sx={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase',
              letterSpacing: '0.08em', mb: 1.5 }}>
              Live Parameters
            </Typography>
            <Grid container spacing={1} sx={{ mb: 2.5 }}>
              <Grid item xs={3}>
                <Metric label="kW"        value={detail.kW}        unit="kilowatts"    color="#22d3ee" />
              </Grid>
              <Grid item xs={3}>
                <Metric label="PF"        value={detail.pF}        unit="power factor"  color="#a3e635" />
              </Grid>
              <Grid item xs={3}>
                <Metric label="Voltage"   value={detail.voltage}   unit="volts (L-L)"   color="#fbbf24" />
              </Grid>
              <Grid item xs={3}>
                <Metric label="Frequency" value={detail.frequency} unit="Hz"             color="#f97316" />
              </Grid>
            </Grid>

            <Divider sx={{ borderColor: '#4b5563', mb: 2.5 }} />

            {/* Energy Consumption */}
            <Typography sx={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase',
              letterSpacing: '0.08em', mb: 1.5 }}>
              Energy Consumption
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Metric label="kWh / Hour"  value={detail.kWhHour}  unit="this hour"   color="#22d3ee" />
              </Grid>
              <Grid item xs={4}>
                <Metric label="kWh / Day"   value={detail.kWhDay}   unit="today"       color="#22d3ee" />
              </Grid>
              <Grid item xs={4}>
                <Metric label="kWh / Month" value={detail.kWhMonth} unit="this month"  color="#a3e635" />
              </Grid>
            </Grid>
          </>
        )}

        {/* ── Error / empty ── */}
        {!loading && !detail && (
          <Box sx={{ textAlign: 'center', py: 4, color: '#6b7280' }}>
            <Typography sx={{ fontSize: 13 }}>Could not load meter data</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MeterDetailModal;
