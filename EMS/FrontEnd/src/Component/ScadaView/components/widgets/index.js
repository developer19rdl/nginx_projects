import React from "react";
import CardWidget from "./CardWidget";
import SevenSegmentWidget from "./SevenSegmentWidget";
import StatusWidget from "./StatusWidget";
import ProgressWidget from "./ProgressWidget";
import GaugeWidget from "./GaugeWidget";
import SemiCircleWidget from "./SemiCircleWidget";
import GraphWidget from "./GraphWidget";
import TextWidget from "./TextWidget";
import CyclingBadgeWidget from "./CyclingBadgeWidget";
import { formatLastSeen } from "../../utils/markerUtils";

const renderWidget = (props) => {
    switch (props.style?.widgetType) {
        case "text":         return <TextWidget {...props} />;
        case "sevensegment": return <SevenSegmentWidget {...props} />;
        case "status":       return <StatusWidget {...props} />;
        case "progress":     return <ProgressWidget {...props} />;
        case "gauge":        return <GaugeWidget {...props} />;
        case "semicircle":   return <SemiCircleWidget {...props} />;
        case "cyclebadge":   return <CyclingBadgeWidget {...props} />;
        case "linechart":
        case "barchart":
        case "areachart":    return <GraphWidget {...props} />;
        default:             return <CardWidget {...props} />;
    }
};

// Single dispatch point for every widget type — greys out and overlays an OFFLINE
// badge here (rather than inside each of the 7 widget renderers) whenever the tag
// hasn't reported within the global offline threshold, so a stale reading is never
// mistaken for a live one.
const ScadaWidget = (props) => {
    const widget = renderWidget(props);
    if (!props.isStale) return widget;

    return (
        <div style={{ position: "relative", display: "inline-block" }} title={formatLastSeen(props.lastUpdated)}>
            <div style={{ filter: "grayscale(0.85)", opacity: 0.5 }}>
                {widget}
            </div>
            <div style={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center", pointerEvents: "none",
            }}>
                <span style={{
                    background: "rgba(239,68,68,0.92)", color: "#fff",
                    fontSize: 9, fontWeight: 700, padding: "2px 7px",
                    borderRadius: 4, letterSpacing: "0.05em", whiteSpace: "nowrap",
                }}>
                    OFFLINE
                </span>
            </div>
        </div>
    );
};

export default ScadaWidget;
