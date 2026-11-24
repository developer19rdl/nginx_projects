// A "Configure Cell" binding can hold several widgets stacked in one table
// cell (Standard Card + Cycling Badge + ..., each independently configured)
// since cells stopped being limited to a single widget type. Cells saved
// before that change used a flat shape — every widget field lived directly
// on the binding, one widget per cell, and label/textColor/bgColor did
// double duty as both that widget's own styling and (for a pure nav-link
// cell with no sensor) the nav chip's appearance.
//
// normalizeCellBinding() upgrades either shape to the current
// { navigateTargetTabIndex, label, textColor, bgColor, widgets: [...] } shape
// so CellBindingDialog and ScadaDynamicTable only ever have to handle one —
// no DB migration needed, this runs at read time.
export const normalizeCellBinding = (binding) => {
    if (!binding) {
        return { navigateTargetTabIndex: null, label: "", textColor: "", bgColor: "", widgets: [] };
    }
    if (Array.isArray(binding.widgets)) {
        return {
            navigateTargetTabIndex: binding.navigateTargetTabIndex ?? null,
            label: binding.label || "",
            textColor: binding.textColor || "",
            bgColor: binding.bgColor || "",
            widgets: binding.widgets,
        };
    }
    // Legacy flat binding: everything except navigateTargetTabIndex is one
    // widget's fields. A pure nav-only cell (no sensor ever bound) yields an
    // empty widget list, with label/textColor/bgColor kept at the top level
    // for the nav-chip appearance (NavOnlyCell).
    const { navigateTargetTabIndex = null, label = "", textColor = "", bgColor = "", ...rest } = binding;
    const hasSensor = !!rest.tagKey || (rest.combinedSensors && rest.combinedSensors.length > 0);
    return {
        navigateTargetTabIndex,
        label, textColor, bgColor,
        widgets: hasSensor ? [{ ...rest, label, textColor, bgColor }] : [],
    };
};

// A fresh widget's defaults — one entry in a cell's `widgets` list.
export const makeEmptyWidget = () => ({
    tagKey: null, tagName: "", deviceId: null, deviceName: "", slaveId: null,
    label: "", unit: "",
    widgetType: "card",
    chartMode: "single",
    combinedSensors: [],
    textColor: "#1a3a5c", bgColor: "#e8f5e9",
    decimalPoints: 2,
    threshold1: 20, color1: "#4caf50",
    threshold2: 60, color2: "#ffeb3b",
    color3: "#f44336",
});

export const usesSensorList = (widgetType) => widgetType === "cyclebadge" || widgetType === "multicard";

export const widgetTypeLabel = (widgetType) => ({
    card: "Standard Card",
    status: "Status Indicator",
    cyclebadge: "Cycling Badge",
    multicard: "Multiple Cards",
}[widgetType] || widgetType);

// One-line summary shown on a widget's collapsed row in the dialog's list.
export const widgetSummary = (widget) => {
    if (usesSensorList(widget.widgetType)) {
        const sensors = widget.combinedSensors || [];
        // Cycling Badge is identified by its OWN fixed name (its Display Label,
        // shown below the live circle) rather than whichever sensor is
        // currently rotating through it — show that name here too when set.
        if (widget.widgetType === "cyclebadge" && widget.label) return widget.label;
        if (!sensors.length) return "No sensors added yet";
        return sensors.map((s) => s.label || s.tagName || "Sensor").join(", ");
    }
    return widget.tagName || widget.label || "No sensor bound";
};
