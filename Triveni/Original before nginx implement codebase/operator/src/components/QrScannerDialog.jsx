import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

/**
 * Camera-based QR scanner popup. Grabs frames from the device camera (rear-facing preferred,
 * since this is meant for scanning a physical coil label) onto a hidden canvas and runs jsQR on
 * each frame until something decodes, then calls onScan(text) and closes itself. Fully releases
 * the camera stream on close/unmount either way - never leaves the camera running in the
 * background.
 */
export default function QrScannerDialog({ open, onClose, onScan }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    setError('');

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        tick();
      } catch (err) {
        setError('Could not access the camera - check permissions and try again.');
      }
    }

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data) {
          onScan(code.data);
          return; // stop the loop - the effect cleanup below tears down the camera
        }
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    start();

    return () => {
      cancelled = true;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open, onScan]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Scan Coil QR Code</DialogTitle>
      <DialogContent>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'black',
              }}
            >
              <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <Box
                sx={{
                  position: 'absolute',
                  inset: '15%',
                  border: '3px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  boxShadow: '0 0 0 2000px rgba(0,0,0,0.35)',
                  pointerEvents: 'none',
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              Point the camera at the coil's QR code label.
            </Typography>
          </>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
