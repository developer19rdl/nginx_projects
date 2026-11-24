import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Checkbox, 
  Collapse, 
  IconButton,
  Grid,
  Card,
  CardContent,
  Divider,
  Fade
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SpeedIcon from '@mui/icons-material/Speed';
import BoltIcon from '@mui/icons-material/Bolt';
import OpacityIcon from '@mui/icons-material/Opacity';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

// Sample tree data matching your hierarchy
const treeData = [
  { id: 'plant1', name: 'PLANT 1', children: [] },
  {
    id: 'plant2',
    name: 'PLANT 2',
    children: [
      {
        id: 'incomer1',
        name: 'Incomer 1',
        children: [
          { id: 'dist1', name: 'DISTRIBUTER 1', children: [] },
          { id: 'dist2_1', name: 'DISTRIBUTER 2', children: [] },
          {
            id: 'dist2_2',
            name: 'DISTRIBUTER 3',
            children: [
              { id: 'subdist1', name: 'SUBDISTRIBUTER 1', children: [] },
              { id: 'subdist2', name: 'SUBDISTRIBUTER 2', children: [] },
            ]
          }
        ]
      },
      { id: 'solor', name: 'Solor', children: [] },
      { id: 'green', name: 'Green', children: [] }
    ]
  },
  { id: 'plant3', name: 'PLANT 3', children: [] }
];

// Reusable Tree Node Component with Premium Styling
const TreeNode = ({ node, expanded, checked, onToggleExpand, onToggleCheck, level = 0 }) => {
  const isExpanded = expanded.includes(node.id);
  const isChecked = checked.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <React.Fragment>
      <ListItem 
        sx={{ 
          pl: level * 3 + 1, 
          py: 0.5,
          my: 0.2,
          borderRadius: 2,
          transition: 'all 0.2s',
          backgroundColor: isChecked ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
          '&:hover': { 
            backgroundColor: isChecked ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
            transform: 'translateX(4px)'
          }
        }}
        disablePadding
      >
        <Box sx={{ width: 28, display: 'flex', justifyContent: 'center' }}>
          {hasChildren && (
            <IconButton size="small" onClick={() => onToggleExpand(node.id)} sx={{ color: '#555' }}>
              {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
          )}
        </Box>
        
        <ListItemIcon sx={{ minWidth: 36 }}>
          <Checkbox
            edge="start"
            checked={isChecked}
            tabIndex={-1}
            disableRipple
            size="small"
            onClick={() => onToggleCheck(node, isChecked)}
            sx={{
              color: '#999',
              '&.Mui-checked': { color: '#1976d2' }
            }}
          />
        </ListItemIcon>
        
        <ListItemText 
          primary={node.name} 
          primaryTypographyProps={{ 
            variant: 'body2',
            fontWeight: isChecked ? 600 : (hasChildren ? 500 : 400),
            color: isChecked ? '#1976d2' : '#333',
            sx: { cursor: 'pointer', fontFamily: "'Inter', 'Roboto', sans-serif" }
          }}
          onClick={() => onToggleCheck(node, isChecked)}
        />
      </ListItem>
      
      {hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {node.children.map((child) => (
              <TreeNode 
                key={child.id} 
                node={child} 
                expanded={expanded} 
                checked={checked} 
                onToggleExpand={onToggleExpand} 
                onToggleCheck={onToggleCheck}
                level={level + 1} 
              />
            ))}
          </List>
        </Collapse>
      )}
    </React.Fragment>
  );
};

// Main Dashboard Component
const TreeDashboard = () => {
  const [expanded, setExpanded] = useState(['plant2', 'incomer1', 'dist2_2']);
  const [checked, setChecked] = useState(['subdist1']);
  const [selectedNodeData, setSelectedNodeData] = useState(null);

  const handleToggleExpand = (nodeId) => {
    setExpanded((prev) => 
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
  };

  const handleToggleCheck = (node, isChecked) => {
    // Basic logic: Toggle current node. You can add cascading logic here.
    setChecked((prev) => 
      isChecked ? prev.filter(id => id !== node.id) : [...prev, node.id]
    );
    // Update right side display based on last selected
    if (!isChecked) {
      setSelectedNodeData(node);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', backgroundColor: '#f0f4f8', p: 3, display: 'flex', gap: 3 }}>
      
      {/* LEFT SIDE - Tree Selector */}
      <Paper 
        elevation={0} 
        sx={{ 
          width: 350, 
          height: '100%', 
          borderRadius: 4, 
          overflow: 'hidden',
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
          backgroundColor: '#ffffff'
        }}
      >
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          color: 'white'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            FACILITY STRUCTURE
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Select nodes to view metrics
          </Typography>
        </Box>
        
        <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
          <List sx={{ width: '100%' }} component="nav">
            {treeData.map((node) => (
              <TreeNode 
                key={node.id} 
                node={node} 
                expanded={expanded} 
                checked={checked} 
                onToggleExpand={handleToggleExpand} 
                onToggleCheck={handleToggleCheck}
              />
            ))}
          </List>
        </Box>
      </Paper>

      {/* RIGHT SIDE - Display Content */}
      <Box sx={{ flexGrow: 1, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            borderRadius: 4, 
            background: 'linear-gradient(120deg, #ffffff 0%, #fcfdfd 100%)',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e', mb: 1 }}>
              {selectedNodeData ? selectedNodeData.name.toUpperCase() : 'OVERVIEW DASHBOARD'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {selectedNodeData ? `Viewing real-time metrics for ${selectedNodeData.name}` : 'Select a facility node from the tree structure on the left'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#00e676' }}>
              98.4%
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#9e9e9e', textTransform: 'uppercase' }}>
              Efficiency Score
            </Typography>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {[
            { title: 'Energy Consumption', value: '1,245 kWh', icon: <BoltIcon sx={{ fontSize: 40, color: '#ff9100' }}/>, trend: '+2.4%' },
            { title: 'Operational Speed', value: '14,500 RPM', icon: <SpeedIcon sx={{ fontSize: 40, color: '#00b0ff' }}/>, trend: '-0.8%' },
            { title: 'Machine Status', value: 'Active', icon: <PrecisionManufacturingIcon sx={{ fontSize: 40, color: '#00e676' }}/>, trend: 'Stable' },
            { title: 'Cooling Level', value: '42 °C', icon: <OpacityIcon sx={{ fontSize: 40, color: '#651fff' }}/>, trend: 'Optimal' },
          ].map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Fade in={true} timeout={500 + (index * 200)}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 4, 
                    boxShadow: '0 8px 24px -8px rgba(0,0,0,0.06)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 32px -8px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 3, 
                        backgroundColor: 'rgba(0,0,0,0.03)' 
                      }}>
                        {card.icon}
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          color: card.trend.includes('+') ? '#ff1744' : (card.trend.includes('-') ? '#00e676' : '#9e9e9e')
                        }}
                      >
                        {card.trend}
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#2c3e50', mb: 0.5 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#7f8c8d' }}>
                      {card.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        <Paper 
          elevation={0}
          sx={{ 
            flexGrow: 1, 
            borderRadius: 4, 
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Placeholder for a Graph or Chart */}
          <Box sx={{ textAlign: 'center', color: '#b0bec5' }}>
            <SpeedIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Interactive Analytics View</Typography>
            <Typography variant="body2">Select nodes in the tree selector to populate data charts here</Typography>
          </Box>
        </Paper>

      </Box>
    </Box>
  );
};

export default TreeDashboard;
