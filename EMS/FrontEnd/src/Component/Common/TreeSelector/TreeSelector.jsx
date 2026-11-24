import React, { useState } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Checkbox, 
  Collapse, 
  IconButton,
  Paper,
  Typography,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Sample data structure matching the user's request
const initialTreeData = [
  {
    id: 'plant1',
    name: 'PLANT 1',
    children: []
  },
  {
    id: 'plant2',
    name: 'PLANT 2',
    children: [
      {
        id: 'incomer1',
        name: 'Incomer 1',
        children: [
          {
            id: 'dist1',
            name: 'DISTRIBUTER 1',
            children: []
          },
          {
            id: 'dist2_1',
            name: 'DISTRIBUTER 2',
            children: []
          },
          {
            id: 'dist2_2',
            name: 'DISTRIBUTER 2', // Assuming there's another branch named similarly or it was a typo in request
            children: [
              { id: 'subdist1', name: 'SUBDISTRIBUTER 1', children: [] },
              { id: 'subdist2', name: 'SUBDISTRIBUTER 2', children: [] },
            ]
          }
        ]
      },
      {
        id: 'solor',
        name: 'Solor',
        children: []
      },
      {
        id: 'green',
        name: 'Green',
        children: []
      }
    ]
  },
  {
    id: 'plant3',
    name: 'PLANT 3',
    children: []
  }
];

const TreeNode = ({ node, expanded, checked, onToggleExpand, onToggleCheck, level = 0 }) => {
  const isExpanded = expanded.includes(node.id);
  const isChecked = checked.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <React.Fragment>
      <ListItem 
        sx={{ 
          pl: level * 3, 
          py: 0,
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
        }}
        disablePadding
      >
        <Box sx={{ width: 28, display: 'flex', justifyContent: 'center' }}>
          {hasChildren ? (
            <IconButton size="small" onClick={() => onToggleExpand(node.id)}>
              {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
          ) : (
            <Box sx={{ width: 28 }} /> // Placeholder to align items without children
          )}
        </Box>
        
        <ListItemIcon sx={{ minWidth: 'auto' }}>
          <Checkbox
            edge="start"
            checked={isChecked}
            tabIndex={-1}
            disableRipple
            size="small"
            onClick={() => onToggleCheck(node.id)}
          />
        </ListItemIcon>
        
        <ListItemText 
          primary={node.name} 
          primaryTypographyProps={{ 
            variant: 'body2',
            fontWeight: hasChildren ? 500 : 400,
            sx: { cursor: 'pointer' }
          }}
          onClick={() => onToggleCheck(node.id)}
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

const TreeSelector = () => {
  // Default expanding Plant 2 and Incomer 1 based on user's layout "-" sign
  const [expanded, setExpanded] = useState(['plant2', 'incomer1', 'dist2_2']);
  const [checked, setChecked] = useState([]);

  const handleToggleExpand = (nodeId) => {
    setExpanded((prev) => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId) 
        : [...prev, nodeId]
    );
  };

  const handleToggleCheck = (nodeId) => {
    // Basic toggle - in a real app, you might want to cascade checks to children
    setChecked((prev) => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId) 
        : [...prev, nodeId]
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 2, maxWidth: 400, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ px: 2, fontWeight: 600, color: '#333' }}>
        Hierarchy Selector
      </Typography>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }} component="nav">
        {initialTreeData.map((node) => (
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
    </Paper>
  );
};

export default TreeSelector;
