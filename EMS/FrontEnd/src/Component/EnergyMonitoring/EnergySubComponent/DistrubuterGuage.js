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

export const DistrubuterGuage = (props) => {

    return (
        <div style={{ width: '200px' }}>
            <div style={{ paddingLeft: '25px' }}>
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
                            formatTextValue: kbitsToMbits,
                            style: {
                                fontSize: 25
                            },
                            hide: true
                        },
                        tickLabels: {
                            type: "outer",
                            ticks: [
                                // { value: 50 },
                                { value: 0 },
                                { value: 500 },
                                // { value: 600 },
                                // { value: 700 },
                                // { value: 800 },
                                // { value: 900 },
                                { value: 1000 },
                                // { value: 1100 },
                                // { value: 1200 },
                                // { value: 1300 },
                                // { value: 1400 },
                                { value: 1500 },
                                // { value: 1600 },
                                // { value: 1700 },
                                // { value: 1800 },
                                // { value: 1900 },
                                { value: 2000 },
                            ],
                            valueConfig: {
                                formatTextValue: kbitsToMbits
                            }
                        }
                    }}
                    value={props.value}
                    maxValue={2000}
                />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#ffffff', }}>{props.value} kW</span>
            </div>
        </div>
    )
}
