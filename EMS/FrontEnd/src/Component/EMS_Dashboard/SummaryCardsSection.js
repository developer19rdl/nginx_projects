import React, { useState, useEffect, useRef } from "react";
import { Box, Grid, MenuItem, Select, FormControl, Typography } from "@mui/material";
import SummaryCard from "./SummaryCard";
import { DEFAULT_CARD_CONFIGS } from "./constants";

import tower from "../../Assets/Images/Electric_Transmision_100.png";
import energy from "../../Assets/Images/Green_Energy_100.png";
import genImg from "../../Assets/Images/Generator_100.png";
import co2Img from "../../Assets/Images/CO2_100.png";
import alertImg from "../../Assets/Images/icons8-alert-50.png";

const ICONS = [tower, energy, genImg, co2Img, alertImg];
const CARD_KEYS = ["card1", "card2", "card3", "card4", "card5"];

// Map a plant summary object to the 5 card values
function plantToValues(plant) {
  if (!plant) return CARD_KEYS.map(() => ({ v: 0, u: "" }));

  const co2Raw = plant.co2?.kg ?? 0;
  const co2Val = co2Raw >= 1000
    ? `${(co2Raw / 1000).toFixed(2)}`
    : `${co2Raw.toFixed(1)}`;
  const co2Unit = co2Raw >= 1000 ? "T" : "Kg";

  return [
    { v: plant.eb?.kWh ?? 0, u: "kWh", subV: plant.eb?.kW ?? 0, subU: "kW" },
    { v: plant.greenEnergy?.kWh ?? 0, u: "kWh", subV: plant.greenEnergy?.kW ?? 0, subU: "kW" },
    { v: plant.generator?.kWh ?? 0, u: "kWh", subV: plant.generator?.kW ?? 0, subU: "kW" },
    { v: co2Val, u: co2Unit },
    { v: plant.alert?.count ?? 0, u: "" },
  ];
}

const CYCLE_INTERVAL = 3000; // ms between plant rotations

const SummaryCardsSection = ({ summaryByPlant = [], selectedPlantId, onPlantChange, cardConfigs }) => {
  const multiPlant = summaryByPlant.length > 1;
  const isAll = selectedPlantId === null;

  const [cycleIndex, setCycleIndex] = useState(0);
  const [visible, setVisible] = useState(true); // for fade animation
  const timerRef = useRef(null);

  // Auto-cycle only when "All Plants" is selected and there are multiple plants
  useEffect(() => {
    if (!isAll || !multiPlant) {
      setCycleIndex(0);
      return;
    }

    timerRef.current = setInterval(() => {
      // Fade out → swap plant → fade in
      setVisible(false);
      setTimeout(() => {
        setCycleIndex((i) => (i + 1) % summaryByPlant.length);
        setVisible(true);
      }, 350);
    }, CYCLE_INTERVAL);

    return () => clearInterval(timerRef.current);
  }, [isAll, multiPlant, summaryByPlant.length]);

  // Determine which plant data to display
  const activePlant = isAll
    ? summaryByPlant[cycleIndex]
    : summaryByPlant.find((p) => p.plantId === selectedPlantId) || summaryByPlant[0];

  const values = plantToValues(activePlant);

  return (
    <Box>
      {/* Plant selector — only when multiple plants exist */}
      {multiPlant && (
        <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1} mb={1}>
          <Typography variant="caption" sx={{ color: "#666" }}>Plant:</Typography>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={selectedPlantId ?? "all"}
              onChange={(e) => onPlantChange(e.target.value === "all" ? null : e.target.value)}
              sx={{ backgroundColor: "#fff", fontSize: "0.85rem" }}
            >
              <MenuItem value="all">All Plants</MenuItem>
              {summaryByPlant.map((p) => (
                <MenuItem key={p.plantId} value={p.plantId}>{p.plantName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Cards with fade-slide animation */}
      <Grid
        container
        spacing={2}
        sx={{
          transition: "opacity 0.35s ease, transform 0.35s ease",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0px)" : "translateY(6px)",
        }}
      >
        {CARD_KEYS.map((cardKey, i) => (
          <Grid key={cardKey} item xs={12} md={4} sm={6} xl={2.4}>
            <SummaryCard
              icon={ICONS[i]}
              title={cardConfigs[cardKey]?.title || DEFAULT_CARD_CONFIGS[cardKey].title}
              unit={values[i]?.u ?? cardConfigs[cardKey]?.unit}
              value={values[i]?.v ?? DEFAULT_CARD_CONFIGS[cardKey].defaultValue}
              subValue={values[i]?.subV}
              subUnit={values[i]?.subU}
              percentage={i < 4 ? undefined : undefined}
              trend={i < 4 ? "up" : undefined}
              subtitle={isAll && multiPlant ? activePlant?.plantName : undefined}
              hasSubValue={values.some((v) => v.subV !== undefined)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Plant dots indicator (only in All Plants cycling mode) */}
      {isAll && multiPlant && (
        <Box display="flex" justifyContent="center" gap={0.5} mt={0.5}>
          {summaryByPlant.map((_, i) => (
            <Box
              key={i}
              onClick={() => { clearInterval(timerRef.current); setCycleIndex(i); }}
              sx={{
                width: 8, height: 8, borderRadius: "50%", cursor: "pointer",
                backgroundColor: i === cycleIndex ? "#1976d2" : "#bbb",
                transition: "background-color 0.3s",
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SummaryCardsSection;
