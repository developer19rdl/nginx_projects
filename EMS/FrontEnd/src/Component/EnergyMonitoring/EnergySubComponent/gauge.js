import React from 'react';
import GaugeComponent from 'react-gauge-component';
import '../EnergySubComponent/gauge.css'

const kbitsToMbits = (value) => {
    if (value >= 100) {
        // value = value / 100;
        if (Number.isInteger(value)) {
            return value.toFixed(0) + ' kW';
        } else {
            return value.toFixed(1) + ' kW';
        }
    } else {
        return value.toFixed(0) + ' kW';
    }
}

export const Gauge = (props) => {

    return (
        <div style={{ width: '250px' }}>
            <GaugeComponent
                arc={{
                    nbSubArcs: 200,
                    colorArray: ['#5BE12C', '#F5CD19', '#EA4228'],
                    width: 0.3,
                    padding: 0.003
                }}
                labels={{
                    valueLabel: {
                        fontSize: 40,
                        formatTextValue: kbitsToMbits
                    },
                    tickLabels: {
                        type: "outer",
                        ticks: [
                            // { value: 50 },
                            // { value: 100 },
                            // { value: 150 },
                            // { value: 200 },
                            // { value: 250 },
                            // { value: 300 },
                            // { value: 100 },
                            { value: 0 },
                            // { value: 300 },
                            { value: 500 },
                            // { value: 500 },
                            { value: 1000 },
                            // { value: 700 },
                            { value: 1500 },
                            // { value: 900 },
                            { value: 2000 },
                            // { value: 1100 },
                            { value: 2500 },
                            // { value: 1300 },
                            { value: 3000 },
                            // { value: 1500 },
                            // { value: 1600 },
                            // // { value: 1700 },
                            // { value: 1800 },
                            // // { value: 1900 },
                            // { value: 2000 },
                        ],
                        valueConfig: {
                            formatTextValue: kbitsToMbits
                        }
                    }
                }}
                value={props.value}
                maxValue={3000}
            />
        </div>
    )
}
