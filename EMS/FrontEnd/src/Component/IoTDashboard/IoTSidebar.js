import React, { useState, useEffect, useCallback, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import IoTTreeNode, { nodeKey } from './IoTTreeNode';
import { GetDashboardTree } from '../../Services/NodeJsApiServices';

// Types that have children loaded from the API
const HAS_CHILDREN = new Set(['plant', 'category', 'distributor', 'cat_root', 'cat_building', 'cat_floor', 'cat_item']);

const IoTSidebar = ({ selected, onSelect, collapsed }) => {
  const [roots, setRoots]             = useState([]);
  const [childrenMap, setChildrenMap] = useState({});
  const [loadingSet, setLoadingSet]   = useState(new Set());
  const [expanded, setExpanded]       = useState(new Set());
  const [search, setSearch]           = useState('');
  const [rootLoading, setRootLoading] = useState(true);
  const [rootError, setRootError]     = useState(false);

  // Ref mirrors — let callbacks read latest values without listing state in deps
  const childrenMapRef = useRef({});
  const loadingSetRef  = useRef(new Set());

  // Load root plants on mount
  useEffect(() => {
    setRootLoading(true);
    GetDashboardTree(
      { type: 'root' },
      (res) => {
        setRoots(res?.data || []);
        setRootLoading(false);
      },
      () => {
        setRootError(true);
        setRootLoading(false);
      }
    );
  }, []);

  const loadChildren = useCallback((node) => {
    if (!HAS_CHILDREN.has(node.type)) return;

    const key = nodeKey(node);

    setLoadingSet(prev => {
      const next = new Set([...prev, key]);
      loadingSetRef.current = next;
      return next;
    });

    // Build API params based on node type
    let apiParams;
    if (node.type === 'category') {
      apiParams = { type: 'category', id: node.parentId, selectedCategory: node.id };
    } else if (node.type === 'cat_root') {
      // cat_root node: parentId = plantId
      apiParams = { type: 'cat_root', id: node.parentId };
    } else if (node.type === 'cat_building') {
      apiParams = { type: 'cat_building', id: node.id, plantId: node.plantId };
    } else if (node.type === 'cat_floor') {
      apiParams = { type: 'cat_floor', id: node.id, plantId: node.plantId };
    } else if (node.type === 'cat_item') {
      // id = categoryId (from DB), no plantId needed
      apiParams = { type: 'cat_item', id: node.id };
    } else {
      apiParams = { type: node.type, id: node.id };
    }

    GetDashboardTree(
      apiParams,
      (res) => {
        let children = res?.data || [];
        // Tag distributor children (Outgoing path) with selectedCategory
        if (node.type === 'category' && node.id === 'Outgoing') {
          children = children.map(c => ({ ...c, selectedCategory: 'Outgoing' }));
        }
        setChildrenMap(prev => {
          const next = { ...prev, [key]: children };
          childrenMapRef.current = next;
          return next;
        });
        setLoadingSet(prev => {
          const s = new Set(prev); s.delete(key);
          loadingSetRef.current = s;
          return s;
        });
      },
      () => {
        setLoadingSet(prev => {
          const s = new Set(prev); s.delete(key);
          loadingSetRef.current = s;
          return s;
        });
      }
    );
  }, []);

  const handleToggle = useCallback((node) => {
    if (!node.hasChildren) return;

    const key = nodeKey(node);
    const alreadyLoaded = key in childrenMapRef.current;
    if (!alreadyLoaded && !loadingSetRef.current.has(key)) {
      loadChildren(node);
    }

    setExpanded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, [loadChildren]);

  const handleSelect = useCallback((node) => {
    onSelect(node);
  }, [onSelect]);

  return (
    <div
      style={{
        width: collapsed ? 0 : 288,
        minWidth: collapsed ? 0 : 288,
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
        flexShrink: 0,
        background: '#ffffff',
        borderRight: '1px solid #f3f4f6',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '20px 16px 12px',
        borderBottom: '1px solid #f3f4f6',
        flexShrink: 0,
      }}>
        <h2 style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#6b7280',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          margin: 0,
          whiteSpace: 'nowrap',
        }}>
          System Structure
        </h2>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 12px 8px', flexShrink: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          padding: '6px 10px',
        }}>
          <SearchIcon style={{ fontSize: 14, color: '#9ca3af', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search in tree..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 13,
              color: '#374151',
              width: '100%',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                color: '#9ca3af', fontSize: 12, lineHeight: 1, padding: 0 }}
            >✕</button>
          )}
        </div>
      </div>

      {/* Tree scroll area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 12px' }}>
        {rootLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8,
            padding: '16px 8px', color: '#9ca3af' }}>
            <svg style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span style={{ fontSize: 13 }}>Loading...</span>
          </div>
        )}

        {rootError && (
          <div style={{ padding: '16px 8px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#f87171', fontWeight: 500, margin: 0 }}>
              Failed to load tree
            </p>
            <button
              style={{ marginTop: 6, fontSize: 12, color: '#3b82f6',
                background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => {
                setRootError(false);
                setRootLoading(true);
                GetDashboardTree(
                  { type: 'root' },
                  (res) => { setRoots(res?.data || []); setRootLoading(false); },
                  () => { setRootError(true); setRootLoading(false); }
                );
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!rootLoading && !rootError && roots.length === 0 && (
          <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '16px 8px' }}>
            No data found
          </p>
        )}

        {roots.map(node => (
          <IoTTreeNode
            key={nodeKey(node)}
            node={node}
            level={0}
            childrenMap={childrenMap}
            loadingSet={loadingSet}
            expanded={expanded}
            selected={selected}
            onToggle={handleToggle}
            onSelect={handleSelect}
            searchText={search}
          />
        ))}
      </div>
    </div>
  );
};

export default IoTSidebar;
