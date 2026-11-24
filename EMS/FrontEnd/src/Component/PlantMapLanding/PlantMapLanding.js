import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlantMapLanding.css";
import inHouseMap from "../../IMAGES/InHouse.jpeg";
import odmCmMap from "../../IMAGES/ODM_CM.jpeg";

const VIEW_IMAGES = {
  inhouse: inHouseMap,
  odmcm: odmCmMap,
};

// Fractional (0–1) position of a small marker just above the "INDIA" label
// within the SOURCE image, not the rendered box — kept resolution-independent
// so it stays correct however the image gets cropped to fill the screen.
// Both InHouse.jpeg and ODM_CM.jpeg share the same underlying layout (only
// the highlight colors differ), so one point works for either view.
const INDIA_HOTSPOT_FRACTION = { x: 0.675, y: 0.535 };

// Fractional (0–1) box around the IN-HOUSE / ODM-CM swatch legend that's
// already drawn into the artwork itself (bottom-left, under the "Sites plan
// MP in future" note) — the interactive hover legend sits directly on top of
// it instead of floating in an arbitrary corner.
const LEGEND_BOX_FRACTION = { x: 0.05, y: 0.525, width: 0.145, height: 0.105 };

// How often the view auto-cycles between IN-HOUSE and ODM/CM when the user
// isn't actively hovering the legend.
const AUTO_TOGGLE_MS = 5000;

export default function PlantMapLanding() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const imgRef = useRef(null);
  const [hotspotPos, setHotspotPos] = useState(null);
  const [legendPos, setLegendPos] = useState(null);
  // Which map view is showing — toggled by hovering the legend below, and
  // auto-cycled every AUTO_TOGGLE_MS while the legend isn't hovered.
  // Defaults to the "in-house" (red-highlighted) view.
  const [activeView, setActiveView] = useState("inhouse");
  // Tracked in a ref (not state) so the auto-cycle interval below can be set
  // up once and just read the latest hover status on each tick, instead of
  // tearing down/restarting the timer — and drifting the 5s cadence — every
  // time the user's mouse enters or leaves the legend.
  const isLegendHoveredRef = useRef(false);

  // The image fills the screen via object-fit: cover, which crops it to the
  // container's aspect ratio. To keep the India hotspot and legend overlay
  // pixel-accurate at any window size, recompute their positions from the
  // image's natural dimensions and the rendered container size, using the
  // same math the browser uses for "cover" scaling.
  const recomputeOverlays = useCallback(() => {
    const root = rootRef.current;
    const img = imgRef.current;
    if (!root || !img || !img.naturalWidth || !img.naturalHeight) return;

    const cw = root.clientWidth;
    const ch = root.clientHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const scaledW = iw * scale;
    const scaledH = ih * scale;
    const offsetX = (cw - scaledW) / 2;
    const offsetY = (ch - scaledH) / 2;

    setHotspotPos({
      left: offsetX + INDIA_HOTSPOT_FRACTION.x * scaledW,
      top: offsetY + INDIA_HOTSPOT_FRACTION.y * scaledH,
    });

    setLegendPos({
      left: offsetX + LEGEND_BOX_FRACTION.x * scaledW,
      top: offsetY + LEGEND_BOX_FRACTION.y * scaledH,
      width: LEGEND_BOX_FRACTION.width * scaledW,
      height: LEGEND_BOX_FRACTION.height * scaledH,
    });
  }, []);

  useEffect(() => {
    recomputeOverlays();
    const root = rootRef.current;
    // ResizeObserver catches every size change of the map area itself —
    // window resizes, but also the sidebar collapsing/expanding, which
    // resizes this container without firing a window "resize" event.
    if (!root || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", recomputeOverlays);
      return () => window.removeEventListener("resize", recomputeOverlays);
    }
    const observer = new ResizeObserver(recomputeOverlays);
    observer.observe(root);
    return () => observer.disconnect();
  }, [recomputeOverlays]);

  useEffect(() => {
    const id = setInterval(() => {
      if (isLegendHoveredRef.current) return;
      setActiveView((v) => (v === "inhouse" ? "odmcm" : "inhouse"));
    }, AUTO_TOGGLE_MS);
    return () => clearInterval(id);
  }, []);

  function handleIndiaClick() {
    navigate("/PlantOverview");
  }

  return (
    <div className="pml-static-root" ref={rootRef}>
      <img
        ref={imgRef}
        src={VIEW_IMAGES[activeView]}
        alt="Lenovo Global Manufacturing Network"
        className="pml-static-image"
        onLoad={recomputeOverlays}
      />

      {legendPos && (
        <div
          className="pml-view-legend"
          style={{
            left: legendPos.left,
            top: legendPos.top,
            width: legendPos.width,
            height: legendPos.height,
          }}
          onMouseEnter={() => { isLegendHoveredRef.current = true; }}
          onMouseLeave={() => { isLegendHoveredRef.current = false; }}
        >
          <div
            className={`pml-view-legend-row ${activeView === "inhouse" ? "active" : ""}`}
            onMouseEnter={() => setActiveView("inhouse")}
            onFocus={() => setActiveView("inhouse")}
            tabIndex={0}
          >
            <span className="pml-view-label">IN-HOUSE</span>
          </div>
          <div
            className={`pml-view-legend-row ${activeView === "odmcm" ? "active" : ""}`}
            onMouseEnter={() => setActiveView("odmcm")}
            onFocus={() => setActiveView("odmcm")}
            tabIndex={0}
          >
            <span className="pml-view-label">ODM/CM</span>
          </div>
        </div>
      )}

      {hotspotPos && (
        <button
          type="button"
          className="pml-india-hotspot"
          style={{ left: hotspotPos.left, top: hotspotPos.top }}
          onClick={handleIndiaClick}
          title="India — open EMS Dashboard"
          aria-label="Open India EMS Dashboard"
        />
      )}
    </div>
  );
}

// =============================================================================
// GOOGLE MAPS VERSION — disabled per client request. The client wants a fixed
// static image (with only the India marker clickable) instead of a live map
// for this project. Kept intact below, verbatim, for a future project that
// does want the interactive Google Maps implementation — to restore it,
// remove the static-image component above and uncomment everything below
// (it depends on "@react-google-maps/api" and "../../utils/googleMapsConfig",
// both still installed/present in this repo).
// =============================================================================
/*
import { useEffect, useState, useRef, useCallback } from "react";
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from "@react-google-maps/api";
import { PlantMapDataService } from "../../Services/NodeJsApiServices";
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_SCRIPT_ID } from "../../utils/googleMapsConfig";

const INDIA_CENTER = { lat: 22.9734, lng: 78.6569 };

const STATUS_COLORS = {
  active: "#00c853",
  inactive: "#757575",
  maintenance: "#ff9800",
};

const PLANT_TYPE_ICON = {
  Manufacturing: "fa-industry",
  Assembly: "fa-cogs",
  "R&D": "fa-flask",
  Logistics: "fa-truck",
};

// Dark "Night Mode" Google Maps style, tuned to match the app's dark theme
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1a1d2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1d2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

const MAP_CONTAINER_STYLE = { height: "100%", width: "100%" };

const MAP_OPTIONS = {
  styles: DARK_MAP_STYLE,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: "greedy",
};

function plantIconUrl(status) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.active;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
      <path d="M20 0 C9 0 0 9 0 20 C0 34 20 50 20 50 C20 50 40 34 40 20 C40 9 31 0 20 0Z"
            fill="${color}"/>
      <circle cx="20" cy="20" r="10" fill="white" opacity="0.9"/>
      <circle cx="20" cy="20" r="6" fill="${color}"/>
    </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function getPlantIcon(status) {
  return {
    url: plantIconUrl(status),
    scaledSize: new window.google.maps.Size(40, 50),
    anchor: new window.google.maps.Point(20, 50),
  };
}

export default function PlantMapLandingGoogleMaps() {
  const navigate = useNavigate();
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_SCRIPT_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "",
  });

  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const mapRef = useRef(null);

  useEffect(() => {
    PlantMapDataService(handlePlantMapSuccess, handlePlantMapException);
  }, []);

  const handlePlantMapSuccess = (res) => {
    setPlants(res.status && Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  const handlePlantMapException = () => {
    setPlants([]);
    setLoading(false);
  };

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const counts = {
    total: plants.length,
    active: plants.filter((p) => p.status === "active").length,
    maintenance: plants.filter((p) => p.status === "maintenance").length,
    inactive: plants.filter((p) => p.status === "inactive").length,
  };

  const filtered = plants.filter((p) => {
    const matchSearch =
      p.locationName?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase()) ||
      p.state?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function handlePlantClick(plant) {
    setSelectedPlant(plant);
    if (mapRef.current && plant.latitude && plant.longitude) {
      mapRef.current.panTo({ lat: Number(plant.latitude), lng: Number(plant.longitude) });
      mapRef.current.setZoom(8);
    }
  }

  function handleNavigate(plant) {
    navigate("/IoTDashboard", { state: { locationId: plant.id, locationName: plant.locationName } });
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="pml-loading">
        <i className="fa fa-exclamation-triangle" style={{ fontSize: 32, color: "#ff9800" }} />
        <p>Google Maps API key missing. Set REACT_APP_GOOGLE_MAPS_API_KEY in frontend/.env and restart the app.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="pml-loading">
        <i className="fa fa-exclamation-triangle" style={{ fontSize: 32, color: "#e53935" }} />
        <p>Failed to load Google Maps. Check the API key and enabled APIs in Google Cloud Console.</p>
      </div>
    );
  }

  if (loading || !isLoaded) {
    return (
      <div className="pml-loading">
        <div className="pml-spinner" />
        <p>Loading India Plant Network…</p>
      </div>
    );
  }

  return (
    <div className="pml-root">
      <div className="pml-header">
        <div className="pml-header-left">
          <i className="fa fa-map-marker" style={{ marginRight: 10, color: "#e53935" }} />
          <span className="pml-header-title">Lenovo India — Plant Network</span>
          <span className="pml-header-sub">Jio Location-Based EMS Overview</span>
        </div>
        <div className="pml-stat-chips">
          <span className="pml-chip pml-chip-total">{counts.total} Total</span>
          <span className="pml-chip pml-chip-active">{counts.active} Active</span>
          <span className="pml-chip pml-chip-maint">{counts.maintenance} Maintenance</span>
          <span className="pml-chip pml-chip-inactive">{counts.inactive} Inactive</span>
        </div>
      </div>

      <div className="pml-body">
        <div className="pml-sidebar">
          <div className="pml-search-row">
            <i className="fa fa-search pml-search-icon" />
            <input
              className="pml-search"
              placeholder="Search plant / city / state…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="pml-filter-row">
            {["all", "active", "maintenance", "inactive"].map((s) => (
              <button
                key={s}
                className={`pml-filter-btn ${filterStatus === s ? "active" : ""}`}
                onClick={() => setFilterStatus(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="pml-plant-list">
            {filtered.length === 0 && (
              <div className="pml-no-results">No plants match your filter.</div>
            )}
            {filtered.map((plant) => (
              <div
                key={plant.id}
                className={`pml-plant-card ${selectedPlant?.id === plant.id ? "selected" : ""}`}
                onClick={() => handlePlantClick(plant)}
              >
                <div className="pml-plant-card-top">
                  <span
                    className="pml-status-dot"
                    style={{ background: STATUS_COLORS[plant.status] || "#888" }}
                  />
                  <span className="pml-plant-name">{plant.locationName}</span>
                </div>
                <div className="pml-plant-meta">
                  <i className="fa fa-map-marker" />
                  <span>{plant.city}, {plant.state}</span>
                </div>
                <div className="pml-plant-meta">
                  <i className={`fa ${PLANT_TYPE_ICON[plant.plantType] || "fa-building"}`} />
                  <span>{plant.plantType || "Plant"}</span>
                  <span className="pml-region-tag">{plant.regionName}</span>
                </div>
                <button
                  className="pml-open-btn"
                  onClick={(e) => { e.stopPropagation(); handleNavigate(plant); }}
                >
                  Open Dashboard <i className="fa fa-arrow-right" />
                </button>
              </div>
            ))}
          </div>

          <div className="pml-legend">
            <div className="pml-legend-title">Status Legend</div>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <div key={s} className="pml-legend-row">
                <span className="pml-legend-dot" style={{ background: c }} />
                <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pml-map-wrap">
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={INDIA_CENTER}
            zoom={5}
            options={MAP_OPTIONS}
            onLoad={onMapLoad}
          >
            {plants
              .filter((p) => p.latitude && p.longitude)
              .map((plant) => (
                <MarkerF
                  key={plant.id}
                  position={{ lat: Number(plant.latitude), lng: Number(plant.longitude) }}
                  icon={getPlantIcon(plant.status)}
                  onClick={() => setSelectedPlant(plant)}
                >
                  {selectedPlant?.id === plant.id && (
                    <InfoWindowF onCloseClick={() => setSelectedPlant(null)}>
                      <div className="pml-popup-inner">
                        <div className="pml-popup-header">
                          <span
                            className="pml-popup-status"
                            style={{ background: STATUS_COLORS[plant.status] }}
                          >
                            {plant.status?.toUpperCase()}
                          </span>
                          <span className="pml-popup-type">{plant.plantType}</span>
                        </div>
                        <div className="pml-popup-name">{plant.locationName}</div>
                        <div className="pml-popup-row">
                          <i className="fa fa-map-marker" />
                          {plant.city}, {plant.state}
                        </div>
                        <div className="pml-popup-row">
                          <i className="fa fa-globe" />
                          {plant.regionName}
                        </div>
                        {plant.description && (
                          <div className="pml-popup-desc">{plant.description}</div>
                        )}
                        <button
                          className="pml-popup-nav-btn"
                          onClick={() => handleNavigate(plant)}
                        >
                          <i className="fa fa-tachometer" /> Open EMS Dashboard
                        </button>
                      </div>
                    </InfoWindowF>
                  )}
                </MarkerF>
              ))}
          </GoogleMap>

          <div className="pml-map-tip">
            {plants.length === 0
              ? <><i className="fa fa-exclamation-triangle" /> No plant locations found. Add latitude/longitude in Configuration → Regions → Add Location.</>
              : <><i className="fa fa-info-circle" /> Click any marker to view plant details</>}
          </div>
        </div>
      </div>
    </div>
  );
}
*/
