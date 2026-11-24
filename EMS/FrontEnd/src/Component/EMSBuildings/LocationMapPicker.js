import React, { useEffect, useRef, useCallback } from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_SCRIPT_ID } from "../../utils/googleMapsConfig";

const INDIA_CENTER = { lat: 22.9734, lng: 78.6569 };

const MAP_CONTAINER_STYLE = { height: "100%", width: "100%" };

const MAP_OPTIONS = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
};

const BOX_STYLE = {
  height: 250,
  width: "100%",
  borderRadius: 6,
  overflow: "hidden",
  border: "1px solid #ccc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#757575",
  fontSize: 13,
  textAlign: "center",
  padding: 12,
};

const LocationMapPicker = ({ latitude, longitude, onPick }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_SCRIPT_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "",
  });
  const mapRef = useRef(null);
  const position = latitude && longitude ? { lat: Number(latitude), lng: Number(longitude) } : null;

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (mapRef.current && position) {
      mapRef.current.panTo(position);
      if (mapRef.current.getZoom() < 6) mapRef.current.setZoom(6);
    }
  }, [latitude, longitude]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleMapClick(e) {
    onPick(e.latLng.lat(), e.latLng.lng());
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div style={BOX_STYLE}>
        Google Maps API key missing. Set REACT_APP_GOOGLE_MAPS_API_KEY in frontend/.env.
      </div>
    );
  }

  if (loadError) {
    return <div style={BOX_STYLE}>Failed to load Google Maps.</div>;
  }

  if (!isLoaded) {
    return <div style={BOX_STYLE}>Loading map…</div>;
  }

  return (
    <div style={{ height: 250, width: "100%", borderRadius: 6, overflow: "hidden", border: "1px solid #ccc" }}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={position || INDIA_CENTER}
        zoom={position ? 6 : 5}
        options={MAP_OPTIONS}
        onLoad={onMapLoad}
        onClick={handleMapClick}
      >
        {position && <MarkerF position={position} />}
      </GoogleMap>
    </div>
  );
};

export default LocationMapPicker;
