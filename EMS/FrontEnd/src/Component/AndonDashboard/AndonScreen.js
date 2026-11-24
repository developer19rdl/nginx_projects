

// // // ✅ Legend item
// // const LegendItem = ({ color, label }) => (
// //   <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
// //     <Box sx={{ width: 22, height: 22, bgcolor: color, borderRadius: 0.5, mr: 1 }} />
// //     <Typography variant="subtitle2" color="#fff">{label}</Typography>
// //   </Box>
// // )


// //   // 🔸 Simulate API call
// //   useEffect(() => {
// //     const labels = Array.from({ length: 15 }, (_, i) => `Label ${i + 1}`)
// //     const statuses = Object.keys(statusColors)


// //     setData(response)
// //     setHeaderLabels(labels)
// //   }, [])

// //   const totalRows = data.length || 1


// //         <Tooltip title="Settings">
// //           <IconButton color="inherit" size="large" onClick={() => setOpenSettings(true)}>
// //             <SettingsIcon htmlColor="#fff" />
// //           </IconButton>
// //         </Tooltip>
// //       </Box>







// // const MAX_MACHINES_PER_ROW = 15 // 👈 maximum machines per line



// // const AndonScreen = () => {
// //   const [openSettings, setOpenSettings] = useState(false)
// //   const [data, setData] = useState([])
// //   const [headerLabels, setHeaderLabels] = useState([])

// //   useEffect(() => {
// //     const labels = Array.from({ length: 36 }, (_, i) => `M${i + 1}`) // 👈 try more than 15 to test wrapping
// //     const statuses = Object.keys(statusColors)
// //     const rowsCount = 2

// //     const response = Array.from({ length: rowsCount }, (_, rowIndex) => ({
// //       cellName: `LINE - ${rowIndex + 1}`,
// //       labels,
// //       status: Array.from({ length: labels.length }, () =>
// //         statuses[Math.floor(Math.random() * statuses.length)]
// //       ),
// //     }))

// //     setData(response)
// //     setHeaderLabels(labels.slice(0, MAX_MACHINES_PER_ROW)) // only first 15 for header
// //   }, [])


// //         <Tooltip title="Settings">
// //           <IconButton color="inherit" size="large" onClick={() => setOpenSettings(true)}>
// //             <SettingsIcon htmlColor="#fff" />
// //           </IconButton>
// //         </Tooltip>
// //       </Box>








// const MAX_MACHINES_PER_ROW = 13 // 👈 maximum machines per line



// const AndonScreen = () => {
//   const [openSettings, setOpenSettings] = useState(false)
//   const [data, setData] = useState([])
//   const [headerLabels, setHeaderLabels] = useState([])

//   useEffect(() => {
//     const labels = Array.from({ length: 34 }, (_, i) => `M${i + 1}`) // 👈 test with >15 and leftover
//     const statuses = Object.keys(statusColors)
//     const rowsCount = 2

//     const response = Array.from({ length: rowsCount }, (_, rowIndex) => ({
//       cellName: `LINE - ${rowIndex + 1}`,
//       labels,
//       status: Array.from({ length: labels.length }, () =>
//         statuses[Math.floor(Math.random() * statuses.length)]
//       ),
//     }))

//     setData(response)
//     setHeaderLabels(labels.slice(0, MAX_MACHINES_PER_ROW)) // only first 15 for header
//   }, [])


//         <Tooltip title="Settings">
//           <IconButton color="inherit" size="large" onClick={() => setOpenSettings(true)}>
//             <SettingsIcon htmlColor="#fff" />
//           </IconButton>
//         </Tooltip>
//       </Box>



//           return chunks.map((chunk, chunkIndex) => {
//             const placeholders = MAX_MACHINES_PER_ROW - chunk.labels.length





// export default AndonScreen

import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Divider,
  Chip,
  Tabs,
  Tab,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import TittleSetting from './Tittle Setting'
import LegendSetting from './LegendSetting'

// ✅ Default legend config (label + color)
const DEFAULT_LEGEND = {
  MAINTENANCE: { label: 'MAINTENANCE', color: '#d32f2f' },
  STORES: { label: 'STORES', color: '#f9a825' },
  LOGISTICS: { label: 'LOGISTICS', color: '#ef6c00' },
  SAFETY: { label: 'SAFETY', color: '#0d47a1' },
  OK: { label: 'OK', color: '#2e7d32' },
  NA: { label: 'NA', color: '#9e9e9e' },
}
const LEGEND_ORDER = ['MAINTENANCE', 'STORES', 'LOGISTICS', 'SAFETY', 'OK', 'NA']

const MAX_MACHINES_PER_ROW = 15

// ✅ Legend Item
const LegendItem = ({ color, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
    <Box sx={{ width: 22, height: 22, bgcolor: color, borderRadius: 0.5, mr: 1 }} />
    <Typography variant="subtitle2" color="#fff">
      {label}
    </Typography>
  </Box>
)

// ✅ Box Cell
const BoxCell = ({ status, legend }) => (
  <Box
    sx={{
      bgcolor: (legend?.[status]?.color) || '#2e7d32',
      minHeight: 60,
      width: '100%',
      borderRadius: 1,
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      px: 1,
    }}
    title={status}
  />
)

// ✅ Custom Tab Panel
function CustomTabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`}>
      {value === index && (
        <Box sx={{ p: 2 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

const AndonScreen = () => {
  const [openSettings, setOpenSettings] = useState(false)
  const [data, setData] = useState([])
  const [headerLabels, setHeaderLabels] = useState([])
  const [tabValue, setTabValue] = useState(0)
  const [selectedConfig, setSelectedConfig] = useState({ groupId: '', lines: [] })
  const [legendConfig, setLegendConfig] = useState(DEFAULT_LEGEND)

  const handleTabChange = (event, newValue) => setTabValue(newValue)

  // Build screen rows from selection, else keep demo
  useEffect(() => {
    if (selectedConfig?.lines && selectedConfig.lines.length > 0) {
      // Build exactly 6 rows: selected first, remaining as placeholders
      const rows = []
      const TOTAL_LINES = 6
      for (let i = 0; i < TOTAL_LINES; i += 1) {
        if (i < selectedConfig.lines.length) {
          const ln = selectedConfig.lines[i]
          const labels = Array.from({ length: ln.machineCount }, (_, idx) => `M${idx + 1}`)
          const status = labels.map(() => 'OK')
          rows.push({ cellName: `${ln.name}`, labels, status })
        } else {
          // Placeholder line
          const labels = [] // no machines selected for this line
          const status = []
          rows.push({ cellName: `Line ${i + 1}`, labels, status })
        }
      }
      setData(rows)
      const firstLabels = rows[0]?.labels || []
      setHeaderLabels(firstLabels.slice(0, MAX_MACHINES_PER_ROW))
      return
    }

    // Fallback demo when no selection yet (also 6 lines)
    const rows = Array.from({ length: 6 }, (_, rowIndex) => {
      const labels = Array.from({ length: 10 }, (_, i) => `M${i + 1}`)
      const statuses = Object.keys(legendConfig)
      const status = labels.map(() => statuses[Math.floor(Math.random() * statuses.length)])
      return { cellName: `LINE - ${rowIndex + 1}`, labels, status }
    })
    setData(rows)
    setHeaderLabels(rows[0].labels.slice(0, MAX_MACHINES_PER_ROW))
  }, [selectedConfig, legendConfig])

  return (
    <Box
      sx={{
        bgcolor: '#f4f5f7',
        height: '100vh',
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 🔸 Top legend bar */}
      <Box
        sx={{
          bgcolor: '#424242',
          borderRadius: 1,
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          {LEGEND_ORDER.map((key) => (
            <LegendItem key={key} color={legendConfig[key]?.color} label={legendConfig[key]?.label || key} />
          ))}
        </Box>

        <Tooltip title="Settings">
          <IconButton color="inherit" size="large" onClick={() => setOpenSettings(true)}>
            <SettingsIcon htmlColor="#fff" />
          </IconButton>
        </Tooltip>
      </Box>

      

      {/* 🔸 Rows */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', }}>
        {data.map((row, rowIndex) => {
          const chunks = []
          for (let i = 0; i < row.labels.length; i += MAX_MACHINES_PER_ROW) {
            chunks.push({
              labels: row.labels.slice(i, i + MAX_MACHINES_PER_ROW),
              status: row.status.slice(i, i + MAX_MACHINES_PER_ROW),
            })
          }

          return chunks.map((chunk, chunkIndex) => (
            <Box
              key={`row-${rowIndex}-chunk-${chunkIndex}`}
              sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
            >
              {chunkIndex === 0 ? (
                <Box
                  sx={{
                    bgcolor: '#545b62',
                    color: '#24e0ff',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2,
                    minWidth: 150,
                    fontWeight: 600,
                    minHeight: 60,
                    marginTop: '20px'
                  }}
                >
                  {row.cellName}
                </Box>
              ) : (
                <Box sx={{ minWidth: 150 }} />
              )}

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${MAX_MACHINES_PER_ROW}, 1fr)`,
                  gap: 2,
                  flex: 1,
                }}
              >
                {chunk.status.map((status, colIndex) => (
                  <Box key={`row-${rowIndex}-col-${colIndex}-chunk-${chunkIndex}`} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Label above the box */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#333',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        mb: 0.5,
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth:'100%',
                      }}
                    >
                      {chunk.labels[colIndex]}
                    </Typography>
                    {/* Status box below the label */}
                    <BoxCell
                      status={status}
                      legend={legendConfig}
                    />
                  </Box>
                ))}
                {/* Fill remaining cells with grey placeholders */}
                {Array.from({ length: Math.max(0, MAX_MACHINES_PER_ROW - chunk.labels.length) }).map((_, i) => (
                  <Box key={`ph-${rowIndex}-${chunkIndex}-${i}`} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Empty label space for placeholder */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'transparent',
                        fontSize: '0.75rem',
                        mb: 0.5,
                        minHeight: '16px',
                      }}
                    >
                      -
                    </Typography>
                    {/* Grey placeholder box */}
                    <BoxCell status={'NA'} legend={legendConfig} />
                  </Box>
                ))}
              </Box>
            </Box>
          ))
        })}
      </Box>

      {/* ⚙️ Settings Dialog with Tabs */}
      <Dialog
        sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '100%' } }}
        open={openSettings} onClose={() => setOpenSettings(false)} fullWidth maxWidth="lg">
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Andon Settings</Typography>
          </Box>
        </DialogTitle>
        <Divider />

        <DialogContent dividers>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="settings tabs"
              sx={{ minHeight: 32 }}
              TabIndicatorProps={{ sx: { height: 2 } }}
            >
              <Tab label="Machine Configure" sx={{ minHeight: 30, py: 0.5, px: 1.5, fontSize: 12 }} />
              {/* <Tab label="Server Port Database" sx={{ minHeight: 30, py: 0.5, px: 1.5, fontSize: 12 }} /> */}
              <Tab label="Name Setting" sx={{ minHeight: 30, py: 0.5, px: 1.5, fontSize: 12 }} />
            </Tabs>
          </Box>

          <CustomTabPanel value={tabValue} index={0}>
            <TittleSetting onSelectionChange={setSelectedConfig} />
          </CustomTabPanel>
          {/* <CustomTabPanel value={tabValue} index={1}>
            🌐 Configure server and database settings.
          </CustomTabPanel> */}
          <CustomTabPanel value={tabValue} index={1}>
            <LegendSetting value={legendConfig} onSave={setLegendConfig} />
          </CustomTabPanel>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenSettings(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AndonScreen
