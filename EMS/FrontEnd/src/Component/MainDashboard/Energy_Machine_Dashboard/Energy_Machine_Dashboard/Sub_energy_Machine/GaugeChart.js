import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts';
import './GaugeChart.css'

export default class GaugeChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            error: "",
            value: 90,
            openChart: false,
            options: {
                chart: {
                    offsetY: -10,

                },
                plotOptions: {
                    radialBar: {
                        startAngle: -135,
                        endAngle: 135,
                        fill: "#1cbd00",
                        border: '1px solid black',
                        dataLabels: {
                            border: "1px solid #fac5c7",
                            name: {
                                fontSize: '14px',
                                color: "#636363",
                                fontFamily: 'SegoeUI',
                                offsetY: 20,
                            },
                            value: {
                                offsetY: -20,
                                fontSize: this.props.fontSize || '25px',
                                color: "#636363",
                                fontFamily: 'SegoeUI',
                                formatter: function (val) {
                                    let labelValue = ((val / 100) * 90000) | 0;
                                    if (labelValue && labelValue > 9999) {
                                        // Nine Zeroes for Billions
                                        return Math.abs(Number(labelValue)) >= 1.0e+9

                                            ? Math.abs(Number(labelValue)) / 1.0e+9 + "B"
                                            // Six Zeroes for Millions 
                                            : Math.abs(Number(labelValue)) >= 1.0e+6

                                                ? Math.abs(Number(labelValue)) / 1.0e+6 + "M"
                                                // Three Zeroes for Thousands
                                                : Math.abs(Number(labelValue)) >= 1.0e+3

                                                    ? Math.abs(Number(labelValue)) / 1.0e+3 + "K"

                                                    : Math.abs(Number(labelValue));
                                    } else {
                                        return labelValue;
                                    }
                                }
                            }
                        }
                    }
                },
                fill: {
                    opacity: 1.5,
                    colors: ['#ff9966'],
                    type: 'gradient',
                    gradient: {
                        gradientToColors: ['#ff5e62'],
                        shadeIntensity: 1,
                        opacityFrom: 1,
                        opacityTo: 2,
                        stops: [0, 50, 100],
                        inverseColors: false
                    },
                },
                // stroke: {
                //     lineCap: "round"
                // },
                labels: ['Audience']
            }
        }
    }

    numberConverter = function (labelValue) {

        if (labelValue && labelValue > 9999) {
            // Nine Zeroes for Billions
            return Math.abs(Number(labelValue)) >= 1.0e+9

                ? Math.abs(Number(labelValue)) / 1.0e+9 + "B"
                // Six Zeroes for Millions 
                : Math.abs(Number(labelValue)) >= 1.0e+6

                    ? Math.abs(Number(labelValue)) / 1.0e+6 + "M"
                    // Three Zeroes for Thousands
                    : Math.abs(Number(labelValue)) >= 1.0e+3

                        ? Math.abs(Number(labelValue)) / 1.0e+3 + "K"

                        : Math.abs(Number(labelValue));
        } else {
            return labelValue;
        }

    }

    render() {
        let series = [];
        let percentage = (10000 / 90000) * 100;
        series.push(percentage);

        return <React.Fragment>
            <div className="row">
                <div className="col-md-12 col-sm-12 col-lg-12 col-xs-12 text-center" style={{ marginLeft: '-50px', marginRight: '-50px' }} >
                    <ReactApexChart
                        options={this.state.options}
                        series={series}
                        type="radialBar"
                        height={this.props.height}
                        className="chart-container"

                    />
                </div>
            </div>
            {}
        </React.Fragment>
    }
}
