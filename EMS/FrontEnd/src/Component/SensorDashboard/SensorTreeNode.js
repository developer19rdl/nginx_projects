import React, { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BusinessIcon from '@mui/icons-material/Business';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import LabelIcon from '@mui/icons-material/Label';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { nodeKey } from '../IoTDashboard/IoTTreeNode';

export { nodeKey };

// Palette-aware fork of IoTDashboard/IoTTreeNode.js, scoped to the sensor
// dashboards so their dark-mode toggle can actually recolor the tree rows —
// the original uses hardcoded Tailwind gray/blue classes that don't flip with
// a runtime dark-mode flag, and it's shared with the Energy Dashboard so it's
// left untouched. Same node types/behavior, inline styles instead.
const TYPE_ICON = {
  plant:        <ApartmentIcon  style={{ fontSize: 15 }} />,
  cat_building: <BusinessIcon   style={{ fontSize: 15 }} />,
  cat_floor:    <ViewQuiltIcon  style={{ fontSize: 15 }} />,
  cat_item:     <LabelIcon      style={{ fontSize: 15 }} />,
  cat_sub:      <LabelIcon      style={{ fontSize: 15 }} />,
};

const TYPE_COLOR = {
  plant:        { color: '#6366f1', bg: '#eef2ff' },
  cat_building: { color: '#6366f1', bg: '#eef2ff' },
  cat_floor:    { color: '#f43f5e', bg: '#fff1f2' },
  cat_item:     { color: '#f59e0b', bg: '#fffbeb' },
  cat_sub:      { color: '#84cc16', bg: '#f7fee7' },
};

const INDENT = 18;

const SensorTreeNode = ({
  node, level, childrenMap, loadingSet,
  expanded, selected, onToggle, onSelect, palette,
}) => {
  const key        = nodeKey(node);
  const isExpanded = expanded.has(key);
  const isSelected = selected === key;
  const isLoading  = loadingSet.has(key);
  const children   = childrenMap[key] || [];
  const [hover, setHover] = useState(false);

  const { color, bg } = TYPE_COLOR[node.type] || TYPE_COLOR.cat_item;
  const icon = TYPE_ICON[node.type] || <AccountTreeIcon style={{ fontSize: 15 }} />;

  const handleClick = () => {
    onSelect(node);
    if (node.hasChildren) onToggle(node);
  };

  const rowBg = isSelected ? `${color}1c` : (hover ? palette.hoverBg : 'transparent');

  return (
    <div>
      <div
        onClick={handleClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10,
          cursor: 'pointer', userSelect: 'none', transition: 'background-color 0.12s',
          backgroundColor: rowBg,
          padding: `5px 6px 5px ${level * INDENT + 4}px`,
        }}
      >
        <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {node.hasChildren ? (
            isLoading ? (
              <svg style={{ width: 13, height: 13, animation: 'spin 1s linear infinite', color: palette.subtext }}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : isExpanded ? (
              <ExpandMoreIcon style={{ fontSize: 18, color: palette.subtext }} />
            ) : (
              <ChevronRightIcon style={{ fontSize: 18, color: palette.subtext }} />
            )
          ) : (
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: palette.subtext, display: 'block', opacity: 0.5 }} />
          )}
        </span>

        <span style={{
          width: 22, height: 22, borderRadius: 8, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0, backgroundColor: bg, color,
        }}>
          {icon}
        </span>

        <span style={{
          fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
          fontWeight: isSelected ? 600 : 500,
          color: isSelected ? color : palette.text,
        }}>
          {node.name}
        </span>
      </div>

      {isExpanded && children.length > 0 && (
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: level * INDENT + 13, top: 0, bottom: 4,
            borderLeft: `1px dashed ${palette.border}`,
          }} />
          {children.map(child => (
            <SensorTreeNode
              key={nodeKey(child)}
              node={child}
              level={level + 1}
              childrenMap={childrenMap}
              loadingSet={loadingSet}
              expanded={expanded}
              selected={selected}
              onToggle={onToggle}
              onSelect={onSelect}
              palette={palette}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(SensorTreeNode);
