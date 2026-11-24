import { DEFAULT_MARKER_STYLE } from '../constants/scadaDefaults';

export const parseMarkerStyle = (color) => {
    if (!color) return {};
    if (typeof color === "object" && color !== null) return color;
    const colorStr = typeof color === "string" ? color.trim() : "";
    if (!colorStr.startsWith("{")) return { textColor: colorStr || "#ffffff" };
    try {
        return JSON.parse(colorStr);
    } catch {
        const extract = (re) => { const m = colorStr.match(re); return m ? m[1] : undefined; };
        return {
            widgetType: extract(/"widgetType"\s*:\s*"([^"]+)"/) || "card",
            alignment: extract(/"alignment"\s*:\s*"([^"]+)"/) || "top",
            bgColor: extract(/"bgColor"\s*:\s*"([^"]+)"/) || "#040408",
            textColor: extract(/"textColor"\s*:\s*"([^"]+)"/) || "#ffffff",
            iconSize: extract(/"iconSize"\s*:\s*"([^"]+)"/) || "medium",
        };
    }
};

export const mergeMarkerStyle = (colorData) => ({
    ...DEFAULT_MARKER_STYLE,
    ...parseMarkerStyle(colorData),
});

export const buildImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const base =
        process.env.REACT_APP_SCADA_BASE_URL ||
        process.env.REACT_APP_API_URL ||
        process.env.REACT_APP_EMS_API_URL?.replace(/\/api\/?$/, "") ||
        "";
    return `${base}/${imagePath}`;
};

export const resolveImagePath = (tab) => {
    if (tab?.imagePath) return tab.imagePath;
    const tabImage = tab?.image || "";
    const apiBase = process.env.REACT_APP_SCADA_BASE_URL || process.env.REACT_APP_API_URL || process.env.REACT_APP_EMS_API_URL?.replace(/\/api\/?$/, "") || "";
    if (tabImage.startsWith("blob:")) return "";
    if (apiBase && tabImage.startsWith(`${apiBase}/`)) {
        return tabImage.replace(`${apiBase}/`, "");
    }
    if (!tabImage.startsWith("http") && !tabImage.startsWith("blob:")) return tabImage;
    return "";
};

export const computeActiveColor = (style, numericVal) => {
    const { widgetType, threshold1, color1, threshold2, color2, color3, textColor } = style;
    const rangeTypes = ["gauge", "semicircle", "status", "sevensegment", "progress"];
    if (!rangeTypes.includes(widgetType)) return textColor;
    if (numericVal <= (threshold1 || 30)) return color1 || "#4caf50";
    if (numericVal <= (threshold2 || 60)) return color2 || "#ffeb3b";
    return color3 || "#f44336";
};

export const computeDisplayVal = (val, numericVal, decimalPoints) => {
    if (val === undefined || val === null || val === "") return "--";
    if (!isNaN(numericVal) && String(val).includes('.')) {
        return numericVal.toFixed(decimalPoints !== undefined ? Number(decimalPoints) : 2);
    }
    return String(val);
};

export const isAlarmCritical = (widgetType, numericVal, threshold2) => {
    const types = ["gauge", "semicircle", "status", "sevensegment", "progress", "card"];
    return types.includes(widgetType) && numericVal > (threshold2 || 60);
};

// A tag is "offline" when its live_tag_snapshot row hasn't been updated within the
// global threshold (same meter_offline_settings value the Meter Status screen and
// Energy dashboard use) — never based on the value itself. No lastUpdated at all
// (tag has never reported) counts as offline too.
export const isMarkerStale = (lastUpdated, thresholdMinutes) => {
    if (!thresholdMinutes) return false; // threshold not loaded yet — don't flag prematurely
    if (!lastUpdated) return true;
    const ts = new Date(lastUpdated).getTime();
    if (Number.isNaN(ts)) return true;
    return (Date.now() - ts) > thresholdMinutes * 60 * 1000;
};

export const formatLastSeen = (lastUpdated) => {
    if (!lastUpdated) return 'No data received yet';
    const d = new Date(lastUpdated);
    if (Number.isNaN(d.getTime())) return 'No data received yet';
    return `Last seen: ${d.toLocaleString()}`;
};

export const markerTransform = (alignment) => {
    switch (alignment) {
        case "left":   return "translate(-100%, -50%)";
        case "right":  return "translate(0%, -50%)";
        case "bottom": return "translate(-50%, 0%)";
        case "center": return "translate(-50%, -50%)";
        default:       return "translate(-50%, -100%)";
    }
};
