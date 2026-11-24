import React, { useState, useEffect, useCallback, useRef } from 'react';
import SensorTreeNode, { nodeKey } from './SensorTreeNode';
import { GetDashboardTree } from '../../Services/NodeJsApiServices';

// Category/sub-category tree for the Temperature/Humidity/CO2 sensor dashboards.
// Adapted from IoTDashboard/IoTSidebar.js: same tree chain (Plant → Building →
// Floor → Category → Sub-Category) reusing the same IoTTreeNode renderer, but
// a plant expands straight into cat_root (buildings) instead of the Energy
// Dashboard's Incomer/Outgoing hop, and every call passes meterKind='Utility
// Meter' + sensorTypes so the backend only returns branches that actually have
// a matching meter grouped somewhere under them.
const HAS_CHILDREN = new Set(['plant', 'cat_building', 'cat_floor', 'cat_item']);

const DEFAULT_PALETTE = {
  paperBg: '#ffffff', border: '#f3f4f6', text: '#374151', subtext: '#6b7280',
  inputBg: '#f9fafb', inputBorder: '#e5e7eb',
};

const SensorTreeSidebar = ({ title, sensorTypes, selected, onSelect, collapsed, palette }) => {
  const p = palette || DEFAULT_PALETTE;
  const [roots, setRoots]             = useState([]);
  const [childrenMap, setChildrenMap] = useState({});
  const [loadingSet, setLoadingSet]   = useState(new Set());
  const [expanded, setExpanded]       = useState(new Set());
  const [rootLoading, setRootLoading] = useState(true);
  const [rootError, setRootError]     = useState(false);

  const childrenMapRef = useRef({});
  const loadingSetRef  = useRef(new Set());
  const autoSelectedRef = useRef(false);
  const sensorTypesStr = (sensorTypes || []).join(',');

  useEffect(() => {
    setRootLoading(true);
    GetDashboardTree(
      { type: 'root' },
      (res) => { setRoots(res?.data || []); setRootLoading(false); },
      () => { setRootError(true); setRootLoading(false); }
    );
  }, []);

  // Records a node as expanded (with its already-fetched children) so the
  // tree renders it open, mirroring what a manual click would do.
  const expandWithChildren = useCallback((node, children) => {
    const key = nodeKey(node);
    setChildrenMap(prev => {
      const next = { ...prev, [key]: children };
      childrenMapRef.current = next;
      return next;
    });
    setExpanded(prev => new Set([...prev, key]));
  }, []);

  // Default view shouldn't be an empty "select a node" screen — walk down
  // the first plant → building → floor chain and select the FLOOR (not a
  // single line under it), so the dashboard opens on the "all lines on this
  // floor" overview (SensorNodeDetail.js's isFloorOverview) rather than one
  // category buried three levels down. The floor's own children are still
  // fetched/expanded so the tree is ready for the user to drill into a
  // specific line right away.
  useEffect(() => {
    if (rootLoading || rootError || roots.length === 0 || autoSelectedRef.current) return;
    autoSelectedRef.current = true;

    const plant = roots[0];
    GetDashboardTree(
      { type: 'cat_root', id: plant.id, meterKind: 'Utility Meter', sensorTypes: sensorTypesStr },
      (res1) => {
        const buildings = res1?.data || [];
        expandWithChildren(plant, buildings);
        if (buildings.length === 0) return;
        const building = buildings[0];

        GetDashboardTree(
          { type: 'cat_building', id: building.id, plantId: building.plantId, meterKind: 'Utility Meter', sensorTypes: sensorTypesStr },
          (res2) => {
            const floors = res2?.data || [];
            expandWithChildren(building, floors);
            if (floors.length === 0) return;
            const floor = floors[0];

            GetDashboardTree(
              { type: 'cat_floor', id: floor.id, plantId: floor.plantId, meterKind: 'Utility Meter', sensorTypes: sensorTypesStr },
              (res3) => {
                expandWithChildren(floor, res3?.data || []);
                onSelect(floor);
              },
              () => onSelect(floor)
            );
          },
          () => {}
        );
      },
      () => {}
    );
  }, [rootLoading, rootError, roots, sensorTypesStr, expandWithChildren, onSelect]);

  const loadChildren = useCallback((node) => {
    if (!HAS_CHILDREN.has(node.type)) return;

    const key = nodeKey(node);
    setLoadingSet(prev => {
      const next = new Set([...prev, key]);
      loadingSetRef.current = next;
      return next;
    });

    let apiParams;
    if (node.type === 'plant') {
      apiParams = { type: 'cat_root', id: node.id, meterKind: 'Utility Meter', sensorTypes: sensorTypesStr };
    } else if (node.type === 'cat_building') {
      apiParams = { type: 'cat_building', id: node.id, plantId: node.plantId, meterKind: 'Utility Meter', sensorTypes: sensorTypesStr };
    } else if (node.type === 'cat_floor') {
      apiParams = { type: 'cat_floor', id: node.id, plantId: node.plantId, meterKind: 'Utility Meter', sensorTypes: sensorTypesStr };
    } else if (node.type === 'cat_item') {
      apiParams = { type: 'cat_item', id: node.id, meterKind: 'Utility Meter', sensorTypes: sensorTypesStr };
    } else {
      apiParams = { type: node.type, id: node.id };
    }

    GetDashboardTree(
      apiParams,
      (res) => {
        const children = res?.data || [];
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
  }, [sensorTypesStr]);

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

  const handleSelect = useCallback((node) => { onSelect(node); }, [onSelect]);

  return (
    <div
      style={{
        width: collapsed ? 0 : 288,
        minWidth: collapsed ? 0 : 288,
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
        flexShrink: 0,
        background: p.paperBg,
        borderRight: `1px solid ${p.border}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${p.border}`, flexShrink: 0 }}>
        <h2 style={{
          fontSize: 10, fontWeight: 700, color: p.subtext, letterSpacing: '0.1em',
          textTransform: 'uppercase', margin: 0, whiteSpace: 'nowrap',
        }}>
          {title || 'Category / Sub-Category'}
        </h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px 8px' }}>
        {rootLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 8px', color: p.subtext }}>
            <svg style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span style={{ fontSize: 13 }}>Loading...</span>
          </div>
        )}

        {rootError && (
          <div style={{ padding: '16px 8px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#f87171', fontWeight: 500, margin: 0 }}>Failed to load tree</p>
            <button
              style={{ marginTop: 6, fontSize: 12, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
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
          <p style={{ fontSize: 13, color: p.subtext, textAlign: 'center', padding: '16px 8px' }}>No data found</p>
        )}

        {roots.map(node => (
          <SensorTreeNode
            key={nodeKey(node)}
            node={node}
            level={0}
            childrenMap={childrenMap}
            loadingSet={loadingSet}
            expanded={expanded}
            selected={selected}
            onToggle={handleToggle}
            onSelect={handleSelect}
            palette={p}
          />
        ))}
      </div>
    </div>
  );
};

export default SensorTreeSidebar;
