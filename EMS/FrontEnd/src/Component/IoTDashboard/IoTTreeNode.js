import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ApartmentIcon from '@mui/icons-material/Apartment';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BoltIcon from '@mui/icons-material/Bolt';
import LayersIcon from '@mui/icons-material/Layers';
import BusinessIcon from '@mui/icons-material/Business';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import LabelIcon from '@mui/icons-material/Label';

const TYPE_ICON = {
  plant:        <ApartmentIcon  style={{ fontSize: 15 }} />,
  category:     <LayersIcon     style={{ fontSize: 15 }} />,
  incomer:      <FlashOnIcon    style={{ fontSize: 15 }} />,
  distributor:  <AccountTreeIcon style={{ fontSize: 15 }} />,
  feeder:       <BoltIcon       style={{ fontSize: 15 }} />,
  cat_root:     <AccountTreeIcon style={{ fontSize: 15 }} />,
  cat_building: <BusinessIcon   style={{ fontSize: 15 }} />,
  cat_floor:    <ViewQuiltIcon  style={{ fontSize: 15 }} />,
  cat_item:     <LabelIcon      style={{ fontSize: 15 }} />,
  cat_sub:      <LabelIcon      style={{ fontSize: 15 }} />,
};

const TYPE_COLOR = {
  plant:        { color: '#6366f1', bg: '#eef2ff' },
  category:     { color: '#10b981', bg: '#f0fdf4' },
  incomer:      { color: '#f97316', bg: '#fff7ed' },
  distributor:  { color: '#3b82f6', bg: '#eff6ff' },
  feeder:       { color: '#8b5cf6', bg: '#f5f3ff' },
  cat_root:     { color: '#06b6d4', bg: '#ecfeff' },
  cat_building: { color: '#6366f1', bg: '#eef2ff' },
  cat_floor:    { color: '#f43f5e', bg: '#fff1f2' },
  cat_item:     { color: '#f59e0b', bg: '#fffbeb' },
  cat_sub:      { color: '#84cc16', bg: '#f7fee7' },
};

const INDENT = 20;

// Composite key includes parentId so nodes with the same type+id but different
// parents (e.g. "Incomer" category under North Plant vs South Plant) never share
// the same cache slot.
export const nodeKey = (node) =>
  node.parentId != null
    ? `${node.type}-${node.id}-${node.parentId}`
    : `${node.type}-${node.id}`;

const IoTTreeNode = ({
  node, level, childrenMap, loadingSet,
  expanded, selected, onToggle, onSelect, searchText,
}) => {
  const key        = nodeKey(node);
  const isExpanded = expanded.has(key);
  const isSelected = selected === key;
  const isLoading  = loadingSet.has(key);
  const children   = childrenMap[key] || [];

  const { color, bg } = TYPE_COLOR[node.type] || TYPE_COLOR.feeder;
  const icon = TYPE_ICON[node.type] || TYPE_ICON.feeder;

  if (searchText) {
    const nameMatch  = node.name.toLowerCase().includes(searchText.toLowerCase());
    const childMatch = children.some(c => c.name.toLowerCase().includes(searchText.toLowerCase()));
    if (!nameMatch && !childMatch) return null;
  }

  // Single click: select + expand/collapse
  const handleClick = () => {
    onSelect(node);
    if (node.hasChildren) onToggle(node);
  };

  return (
    <div>
      {/* Clickable row */}
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 rounded-xl cursor-pointer select-none
          transition-colors duration-150
          ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
        style={{ paddingLeft: `${level * INDENT + 4}px`, padding: `6px 6px 6px ${level * INDENT + 4}px` }}
      >
        {/* Arrow / spinner / dot */}
        <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          {node.hasChildren ? (
            isLoading ? (
              <svg className="animate-spin text-gray-400" width="13" height="13"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : isExpanded ? (
              <ExpandMoreIcon style={{ fontSize: 18, color: '#9ca3af' }} />
            ) : (
              <ChevronRightIcon style={{ fontSize: 18, color: '#9ca3af' }} />
            )
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 block" />
          )}
        </span>

        {/* Type icon */}
        <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: bg, color }}>
          {icon}
        </span>

        {/* Name */}
        <span className={`text-sm truncate flex-1
          ${isSelected ? 'font-semibold text-blue-600' : 'font-medium text-gray-700'}`}>
          {node.name}
        </span>
      </div>

      {/* Children */}
      {isExpanded && children.length > 0 && (
        <div className="relative">
          <div className="absolute border-l border-dashed border-gray-200"
            style={{ left: `${level * INDENT + 14}px`, top: 0, bottom: 4 }} />
          {children.map(child => (
            <IoTTreeNode
              key={nodeKey(child)}
              node={child}
              level={level + 1}
              childrenMap={childrenMap}
              loadingSet={loadingSet}
              expanded={expanded}
              selected={selected}
              onToggle={onToggle}
              onSelect={onSelect}
              searchText={searchText}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// No custom comparator — the previous arePropsEqual was checking only the current
// node's own key in `expanded`, which caused intermediate ancestor nodes to skip
// re-renders and never pass the updated `expanded` Set down to their children.
// Stable onToggle/onSelect (from useCallback) already prevent the callback-change
// re-render cascade. The remaining re-renders (when expanded/childrenMap change)
// are correct and necessary so all levels see the updated state.
export default React.memo(IoTTreeNode);
