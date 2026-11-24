import React from "react";
import { Chart } from "react-google-charts";

export function ProductivityComponentChart() {
  return (
    <Chart
      width={"100%"}
      height={"207px"}
      chartType="BarChart"
      loader={<div>Loading Chart</div>}
      data={[
        ["Name", "Age"],
        ["Michael", 12],
        ["Elisa", 20],
        ["Robert", 7],
       
       
      ]}
      rootProps={{ "data-testid": "6" }}
      chartPackages={["corechart", "controls"]}
      render={({ renderControl, renderChart }) => {
        return (
          <div style={{ display: "flex" }}>
            {/* <div style={{ width: "100%" }}>{renderControl(() => true)}</div> */}
            <div style={{ width: "100%" }}>{renderChart()}</div>
          </div>
        );
      }}
    
    />
  );
}
