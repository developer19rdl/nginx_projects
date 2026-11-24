// import React from 'react';
// import { SemiCircleProgress } from 'react-semicircle-progressbar';

// export const ProgressBar = (props) => {
//     const { value } = props;

import React from 'react';
import { SemiCircleProgress } from 'react-semicircle-progressbar';
import './BigCard.css'; // Import CSS file for styling

export const ProgressBar = (props) => {
    const { value } = props;

    // Determine stroke color based on the value
    let strokeColor = "#32db7e"; // Default color for greater than 60%

    if (value >= 0 && value < 30) {
        strokeColor = "#C80036"; // Red color for 0-30%
    } else if (value >= 30 && value < 60) {
        strokeColor = "#ffd700"; // Yellow color for 30-60%
    }

    return (
        <div className="progress-containers">
            <SemiCircleProgress
                percentage={value}
                size={{
                    width: 100,
                    height: 80,
                }}
                strokeWidth={10}
                // strokeColor="#32db7e"
                strokeColor={strokeColor}
                hasBackground={true}
            />
            <div className="progress-texts">{value}%</div>
        </div>
    )
}
