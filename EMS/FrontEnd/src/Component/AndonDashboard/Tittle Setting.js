import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';

// NOTE: This component currently uses local sample data.
// Replace the sample loaders with API calls as needed.

const GROUPS = [
  { id: 'plant-a', name: 'Plant A' },
  { id: 'plant-b', name: 'Plant B' },
];

const LINES_BY_GROUP = {
  'plant-a': [
    { id: 'A-L1', name: 'Line 1' },
    { id: 'A-L2', name: 'Line 2' },
    { id: 'A-L3', name: 'Line 3' },
    { id: 'A-L4', name: 'Line 4' },
    { id: 'A-L5', name: 'Line 5' },
    { id: 'A-L6', name: 'Line 6' },
  ],
  'plant-b': [
    { id: 'B-L1', name: 'Line 1' },
    { id: 'B-L2', name: 'Line 2' },
    { id: 'B-L3', name: 'Line 3' },
  ],
};

// Simulated machine counts per line (replace with backend data)
const MACHINES_COUNT = {
  'A-L1': 5,
  'A-L2': 8,
  'A-L3': 4,
  'A-L4': 10,
  'A-L5': 6,
  'A-L6': 3,
  'B-L1': 7,
  'B-L2': 2,
  'B-L3': 9,
};

const MultipleSelectProps = {
  multiple: true,
  input: <OutlinedInput label="Select Lines" />,
  renderValue: (selected) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {selected.map((value) => (
        <Chip key={value} size="small" label={value} />
      ))}
    </Box>
  ),
};

const TittleSetting = ({ onSelectionChange }) => {
  const [groupId, setGroupId] = useState('');
  const [selectedLines, setSelectedLines] = useState([]); // store line names for display

  // Load lines when group changes
  const lines = useMemo(() => (groupId ? LINES_BY_GROUP[groupId] || [] : []), [groupId]);

  // Build machine boxes for selected lines
  const machineBoxes = useMemo(() => {
    const byName = new Map(lines.map((l) => [l.name, l.id]));
    const boxes = [];
    selectedLines.forEach((lineName) => {
      const lineId = byName.get(lineName);
      const count = MACHINES_COUNT[lineId] || 0;
      for (let i = 1; i <= count; i += 1) {
        boxes.push({ id: `${lineId}-M${i}`, lineName, machine: `M${i}` });
      }
    });
    return boxes;
  }, [lines, selectedLines]);

  // Reset lines selection if group changes
  useEffect(() => {
    setSelectedLines([]);
  }, [groupId]);

  // Notify parent when selection changes
  useEffect(() => {
    if (!onSelectionChange) return;
    const byName = new Map(lines.map((l) => [l.name, l.id]));
    const detail = selectedLines.map((name) => ({
      id: byName.get(name),
      name,
      machineCount: MACHINES_COUNT[byName.get(name)] || 0,
    }));
    onSelectionChange({ groupId, lines: detail });
  }, [groupId, selectedLines, lines, onSelectionChange]);

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Andon Layout Settings
      </Typography>

      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="group-label">Group (Plant)</InputLabel>
            <Select
              labelId="group-label"
              label="Group (Plant)"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              {GROUPS.map((g) => (
                <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small" disabled={!groupId}>
            <InputLabel id="line-label">Select Lines</InputLabel>
            <Select
              labelId="line-label"
              label="Select Lines"
              value={selectedLines}
              onChange={(e) => setSelectedLines(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              multiple
              input={<OutlinedInput label="Select Lines" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((name) => (
                    <Chip key={name} size="small" label={name} />
                  ))}
                </Box>
              )}
            >
              {lines.map((line) => (
                <MenuItem key={line.id} value={line.name}>
                  <Checkbox checked={selectedLines.indexOf(line.name) > -1} />
                  <ListItemText primary={line.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />
      {/* <Typography variant="body2" color="text.secondary">
        Use the dropdowns above to configure. The Andon dashboard will show 6 lines, with unselected lines as grey placeholders.
      </Typography> */}
    </Box>
  );
};

export default TittleSetting;
