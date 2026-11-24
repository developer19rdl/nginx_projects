import React, { useState, useEffect, useCallback, useRef } from 'react';
import IoTNavbar from './IoTNavbar';
import IoTSidebar from './IoTSidebar';
import IoTEnergyChart from './IoTEnergyChart';
import IoTGaugeCard from './IoTGaugeCard';
import IoTIncomerCard from './IoTIncomerCard';
import IoTSummaryCard from './IoTSummaryCard';
import MeterDetailModal       from './MeterDetailModal';
import IoTSensorModal          from './IoTSensorModal';
import MeterDashboardModal     from './MeterDashboardModal';
import EnergyInsideKEBModal    from './EnergyInsideKEBModal';
import RefreshIcon from '@mui/icons-material/Refresh';
import ApartmentIcon from '@mui/icons-material/Apartment';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BoltIcon from '@mui/icons-material/Bolt';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import BusinessIcon from '@mui/icons-material/Business';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import LabelIcon from '@mui/icons-material/Label';
import {
  GetDashboardTree,
  GetIoTLiveData,
  GetEnergyDataListService,
} from '../../Services/NodeJsApiServices';
import { CategoryCard, IncomerCard, DistributorCard, FeederCard, MachineCard, IncomerMeterCard } from './IoTChildCards';

// ─── Node type config ──────────────────────────────────────────────────────────
const NODE_CENTER = {
  plant:        { icon: ApartmentIcon,   color: '#f97316', label: 'Plant Overview' },
  category:     { icon: AccountTreeIcon, color: '#10b981', label: 'Category'       },
  incomer:      { icon: FlashOnIcon,     color: '#fbbf24', label: 'Incomer'        },
  distributor:  { icon: AccountTreeIcon, color: '#22d3ee', label: 'Distributor'    },
  feeder:       { icon: BoltIcon,        color: '#a78bfa', label: 'Feeder'         },
  cat_root:     { icon: AccountTreeIcon, color: '#06b6d4', label: 'Categories'    },
  cat_building: { icon: BusinessIcon,    color: '#6366f1', label: 'Building'      },
  cat_floor:    { icon: ViewQuiltIcon,   color: '#f43f5e', label: 'Floor'         },
  cat_item:     { icon: LabelIcon,       color: '#f59e0b', label: 'Category'      },
  cat_sub:      { icon: LabelIcon,       color: '#84cc16', label: 'Sub-Category'  },
};

const CHILD_TITLE = {
  plant:        'Categories',
  category:     'Devices',
  incomer:      'Distributors',
  distributor:  'Feeders',
  feeder:       'Devices',
  cat_root:     'Buildings',
  cat_building: 'Floors',
  cat_floor:    'Categories',
  cat_item:     'Sub-Categories',
  cat_sub:      'Meters',
};

const TYPE_ORDER = ['plant', 'category', 'incomer', 'distributor', 'feeder',
                    'cat_root', 'cat_building', 'cat_floor', 'cat_item', 'cat_sub'];

// ─── Section divider ──────────────────────────────────────────────────────────
const SectionDivider = ({ title, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
    <h3 style={{
      color: '#9ca3af', fontWeight: 700, fontSize: 11,
      textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0, margin: 0,
    }}>
      {title}
    </h3>
    <div style={{ flex: 1, height: 1, background: '#4b4b4b' }} />
    <span style={{ color: '#6b7280', fontSize: 11, flexShrink: 0 }}>
      {count} items
    </span>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const IoTDashboard = () => {
  const [selectedNode, setSelectedNode]         = useState(null);
  const [activeNodeType, setActiveNodeType]     = useState('plant');
  const [activeNodeName, setActiveNodeName]     = useState('Overview');
  const [breadcrumb, setBreadcrumb]             = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [nodeData, setNodeData]                 = useState(null);
  const [incomerData, setIncomerData]           = useState(null);   // EB / incomer live params
  const [incomerMeterId, setIncomerMeterId]     = useState(null);   // null = default fixed incomer
  const [isRefreshing, setIsRefreshing]         = useState(false);
  const [lastUpdated, setLastUpdated]           = useState(null);
  const [meterModal,     setMeterModal]     = useState({ open: false, meterId: null, meterName: '' });
  const [sensorModal,    setSensorModal]    = useState({ open: false, nodeType: null, nodeId: null, nodeName: '' });
  const [meterDashModal, setMeterDashModal] = useState({ open: false, meterId: null, meterName: '' });
  const [ebModalOpen,    setEbModalOpen]    = useState(false);

  const activeRef = useRef({ type: 'plant', id: null });

  // ── Fetch incomer live params (Voltage, Current, pF, Hz, kWh) ──────────────
  // meterId: null = default fixed "Electric board (incomer)" meter; otherwise
  // the specific incomer meter currently selected in the tree.
  const fetchIncomerData = useCallback((meterId = null) => {
    activeRef.current.incomerMeterId = meterId;
    setIncomerMeterId(meterId);
    GetEnergyDataListService(
      (res) => {
        if (res?.data) setIncomerData(res.data);
      },
      () => {},
      meterId
    );
  }, []);

  // ── Fetch selected node's IoT data ─────────────────────────────────────────
  const fetchNodeData = useCallback((type, id, selectedCategory, plantId) => {
    if (!id) return;
    setIsRefreshing(true);
    activeRef.current = { type, id, selectedCategory, plantId };
    GetIoTLiveData(
      { type, id, selectedCategory, plantId },
      (res) => {
        if (res?.data) {
          setNodeData(res.data);
          setLastUpdated(new Date().toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          }));
        }
        setIsRefreshing(false);
      },
      () => { setIsRefreshing(false); }
    );
  }, []);

  // Auto-select first plant on mount + initial EB data
  useEffect(() => {
    fetchIncomerData();
    GetDashboardTree(
      { type: 'root' },
      (res) => {
        const plants = res?.data || [];
        if (plants.length > 0) {
          const first = plants[0];
          setActiveNodeType(first.type);
          setActiveNodeName(first.name);
          setBreadcrumb([{ id: first.id, name: first.name, type: first.type }]);
          setSelectedNode(`${first.type}-${first.id}`);
          fetchNodeData(first.type, first.id);
        }
      },
      () => {}
    );
  }, [fetchNodeData, fetchIncomerData]);

  // Auto-refresh every 30 s (node data + incomer params)
  useEffect(() => {
    const timer = setInterval(() => {
      const { type, id, selectedCategory, plantId, incomerMeterId: currentIncomerMeterId } = activeRef.current;
      if (id) fetchNodeData(type, id, selectedCategory, plantId);
      fetchIncomerData(currentIncomerMeterId);
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchNodeData, fetchIncomerData]);

  const handleNodeSelect = useCallback((node) => {
    setSelectedNode(`${node.type}-${node.id}`);
    setActiveNodeType(node.type);
    setActiveNodeName(node.name);

    const depth = TYPE_ORDER.indexOf(node.type);
    setBreadcrumb(prev => [
      ...prev.slice(0, Math.max(0, depth)),
      { id: node.id, name: node.name, type: node.type },
    ]);

    let apiId, apiSelectedCat, apiPlantId;
    if (node.type === 'category') {
      apiId          = node.parentId;
      apiSelectedCat = node.id;
    } else if (node.type === 'cat_root') {
      // cat_root parentId = plantId
      apiId = node.parentId;
    } else if (node.type === 'cat_building' || node.type === 'cat_floor') {
      apiId      = node.id;
      apiPlantId = node.plantId;
    } else if (node.type === 'cat_item' || node.type === 'cat_sub') {
      apiId = node.id;
    } else {
      apiId          = node.id;
      apiSelectedCat = node.selectedCategory || activeRef.current.selectedCategory;
    }

    fetchNodeData(node.type, apiId, apiSelectedCat, apiPlantId);

    // Electric Board card / Energy Dashboard modal only switch to a specific
    // meter when a single incomer leaf (not the "Incomer" group, plant, or
    // any other node type) is selected — otherwise they keep showing the
    // default fixed incomer, as before.
    const isIncomerMeter = node.type === 'meter' && apiSelectedCat === 'Incomer';
    fetchIncomerData(isIncomerMeter ? apiId : null);
  }, [fetchNodeData, fetchIncomerData]);

  const handleChildCardClick = useCallback((child) => {
    if (child.type === 'meter') {
      // Meter clicks open the full meter dashboard (4-card layout)
      setMeterDashModal({ open: true, meterId: child.id, meterName: child.name });
      return;
    }
    handleNodeSelect(child);
  }, [handleNodeSelect]);

  const handleRefresh = useCallback(() => {
    const { type, id, selectedCategory, plantId, incomerMeterId: currentIncomerMeterId } = activeRef.current;
    if (id) fetchNodeData(type, id, selectedCategory, plantId);
    fetchIncomerData(currentIncomerMeterId);
  }, [fetchNodeData, fetchIncomerData]);

  // Graph-icon click: meters → MeterDashboardModal; other nodes → IoTSensorModal
  const handleGraphClick = useCallback((child) => {
    if (child.type === 'meter') {
      setMeterDashModal({ open: true, meterId: child.id, meterName: child.name });
    } else {
      setSensorModal({ open: true, nodeType: child.type, nodeId: child.id, nodeName: child.name });
    }
  }, []);

  const renderChildCards = () => {
    const children = nodeData?.children || [];
    if (!children.length)
      return <p style={{ color: '#6b7280', fontSize: 13, padding: '16px 0' }}>No child devices found.</p>;

    const graph = (c) => () => handleGraphClick(c);
    const click = (c) => () => handleChildCardClick(c);

    if (activeNodeType === 'plant')
      return children.map(c => <CategoryCard    key={c.id} {...c} onClick={click(c)} onGraphClick={graph(c)} />);
    if (activeNodeType === 'category')
      return children.map(c =>
        c.type === 'meter'
          ? <IncomerMeterCard key={c.id} {...c} onClick={click(c)} onGraphClick={graph(c)} />
          : <DistributorCard  key={c.id} {...c} onClick={click(c)} onGraphClick={graph(c)} />
      );
    if (activeNodeType === 'incomer')
      return children.map(c => <DistributorCard key={c.id} {...c} onClick={click(c)} onGraphClick={graph(c)} />);
    if (activeNodeType === 'distributor')
      return children.map(c => <FeederCard      key={c.id} {...c} onClick={click(c)} onGraphClick={graph(c)} />);
    if (activeNodeType === 'cat_root' || activeNodeType === 'cat_building' || activeNodeType === 'cat_floor')
      return children.map(c => <CategoryCard key={c.id} {...c} onClick={click(c)} onGraphClick={graph(c)} />);
    if (activeNodeType === 'cat_item')
      return children.map(c =>
        c.type === 'cat_sub'
          ? <CategoryCard key={c.id} {...c} onClick={click(c)} onGraphClick={graph(c)} />
          : <MachineCard  key={c.id} {...c} onClick={click(c)} onGraphClick={graph(c)} />
      );
    return children.map(c => <MachineCard key={c.id} {...c} onClick={click(c)} onGraphClick={graph(c)} />);
  };

  const centerCfg  = NODE_CENTER[activeNodeType] || NODE_CENTER.plant;
  const CenterIcon = centerCfg.icon;

  return (
    <div style={{
      display: 'flex', height: '100vh',
      background: '#2e2e2e',
      fontFamily: "'Inter','Roboto',sans-serif",
      overflow: 'hidden',
    }}>
      <IoTSidebar
        selected={selectedNode}
        onSelect={handleNodeSelect}
        collapsed={sidebarCollapsed}
      />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <IoTNavbar
          breadcrumb={breadcrumb}
          onMenuToggle={() => setSidebarCollapsed(v => !v)}
        />

        <main style={{
          flex: 1, overflowY: 'auto',
          padding: '14px 24px 14px 20px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>

          {/* ── Title bar ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* <div>
              <p style={{
                color: '#6b7280', fontSize: 10,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                fontWeight: 700, marginBottom: 2,
              }}>
                {activeNodeType} analytics
              </p>
              <h2 style={{ color: '#f3f4f6', fontSize: 20, fontWeight: 800, lineHeight: 1, margin: 0 }}>
                {activeNodeName}
              </h2>
            </div> */}
             <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              backgroundColor: isRefreshing ? '#f59e0b' : '#22c55e',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 500 }}>
              {isRefreshing
                ? 'Loading data...'
                : lastUpdated ? `Last updated: ${lastUpdated}` : 'Connecting...'}
            </span>
          </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {nodeData?.alertCount > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: '#2d1515', border: '1px solid #7f1d1d',
                  borderRadius: 20, padding: '4px 11px',
                }}>
                  <NotificationsActiveIcon style={{ fontSize: 13, color: '#ef4444' }} />
                  <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 700 }}>
                    {nodeData.alertCount} Alert{nodeData.alertCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: '#404040', border: '1px solid #555',
                  borderRadius: 8, padding: '7px 14px',
                  cursor: isRefreshing ? 'default' : 'pointer',
                  color: '#d1d5db', fontSize: 12, fontWeight: 700,
                }}>
                <RefreshIcon style={{
                  fontSize: 15,
                  animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
                }} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* ── Live indicator ── */}
         
          {/* ── TOP ROW: Electric Board | Gauge | Summary ── */}
          {nodeData && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr) minmax(0, 1fr)',
              gap: 12,
              minHeight: 210,
              // This row is a flex child of <main> (flex-direction:column). An explicit
              // minHeight (unlike the keyword "auto") disables the browser's automatic
              // content-based shrink protection, so at in-between viewport heights
              // flexbox was allowed to squeeze this row down to 210px even though its
              // tallest card needs more — the excess content then overflowed past the
              // card's rounded edge into the charts row below. flexShrink:0 stops that;
              // any real overflow is handled by <main>'s own overflowY:auto instead.
              flexShrink: 0,
            }}>
              {/* LEFT — Electric Board / Incomer live params */}
              <IoTIncomerCard
                data={incomerData}
                isLive={!isRefreshing && !!incomerData}
                label={incomerMeterId ? `Electric Board — ${activeNodeName}` : 'Electric Board'}
                onClick={() => setEbModalOpen(true)}
              />

              {/* CENTER — Gauge */}
              <IoTGaugeCard
                power={nodeData.power}
                energyToday={nodeData.energyToday}
                energyMonth={nodeData.energyMonth}
              />

              {/* RIGHT — Energy Summary */}
              <IoTSummaryCard
                nodeData={nodeData}
                nodeName={activeNodeName}
                nodeType={activeNodeType}
              />
            </div>
          )}

          {/* ── BOTTOM ROW: Energy/Day | Center Node Card | Energy/Hr ── */}
          {nodeData && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 120px minmax(0, 1fr)',
              gap: 12,
              height: 132,
              // Same flex-shrink trap as the row above — pin this row's height so it
              // can't get squeezed at in-between viewport heights.
              flexShrink: 0,
            }}>
              <IoTEnergyChart title="Energy/Day" data={nodeData.dailyData  || []} />

              {/* Center node card */}
              <div style={{
                backgroundColor: '#525252',
                borderRadius: 10,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}>
                <CenterIcon style={{ fontSize: 32, color: centerCfg.color }} />
                <p style={{
                  color: '#e5e7eb', fontWeight: 700, fontSize: 10,
                  textAlign: 'center', maxWidth: 110,
                  lineHeight: 1.3, margin: 0, letterSpacing: '0.02em',
                }}>
                  {activeNodeName === 'Overview' ? centerCfg.label : activeNodeName}
                </p>
              </div>

              <IoTEnergyChart title="Energy/Hr" data={nodeData.hourlyData || []} />
            </div>
          )}

          {/* ── Child Cards ── */}
          {nodeData && (
            <div>
              <SectionDivider
                title={
                  activeNodeType === 'category'
                    ? (activeRef.current.selectedCategory === 'Incomer' ? 'Incomer Meters' : 'Distributors')
                    : (CHILD_TITLE[activeNodeType] || 'Devices')
                }
                count={(nodeData.children || []).length}
              />

              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fill, minmax(${
                  (nodeData.children || []).length > 0 && nodeData.children.every(c => c.type === 'meter') ? 300 : 210
                }px, 1fr))`,
                gap: 12,
              }}>
                {renderChildCards()}
              </div>
            </div>
          )}

          {/* ── Loading/empty state ── */}
          {!nodeData && !isRefreshing && (
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              padding: '60px 0', color: '#6b7280', flexDirection: 'column', gap: 10,
            }}>
              <ApartmentIcon style={{ fontSize: 48, color: '#4b5563' }} />
              <p style={{ fontSize: 14, fontWeight: 500 }}>
                Select a node from the tree to view energy data
              </p>
            </div>
          )}

          {!nodeData && isRefreshing && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{
                width: 36, height: 36,
                border: '3px solid #3a3a3a',
                borderTopColor: '#22d3ee',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          )}

          <div style={{ height: 6 }} />
        </main>
      </div>

      <MeterDetailModal
        open={meterModal.open}
        meterId={meterModal.meterId}
        meterName={meterModal.meterName}
        onClose={() => setMeterModal({ open: false, meterId: null, meterName: '' })}
      />

      <IoTSensorModal
        open={sensorModal.open}
        nodeType={sensorModal.nodeType}
        nodeId={sensorModal.nodeId}
        nodeName={sensorModal.nodeName}
        onClose={() => setSensorModal({ open: false, nodeType: null, nodeId: null, nodeName: '' })}
      />

      <MeterDashboardModal
        open={meterDashModal.open}
        meterId={meterDashModal.meterId}
        meterName={meterDashModal.meterName}
        onClose={() => setMeterDashModal({ open: false, meterId: null, meterName: '' })}
      />

      <EnergyInsideKEBModal
        open={ebModalOpen}
        onClose={() => setEbModalOpen(false)}
        meterId={incomerMeterId}
        meterName={incomerMeterId ? activeNodeName : null}
      />

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>
    </div>
  );
};

export default IoTDashboard;
