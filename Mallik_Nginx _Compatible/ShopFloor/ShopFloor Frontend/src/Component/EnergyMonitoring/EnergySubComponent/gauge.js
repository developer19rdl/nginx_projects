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
                        { value: 50 },
                        { value: 100 },
                        { value: 150 },
                        { value: 200 },
                        { value: 250 },
                        { value: 300 },
                    ],
                    valueConfig: {
                        formatTextValue: kbitsToMbits
                    }
                }
            }}
            value={props.value}
            maxValue={300}
        />
    )
}
