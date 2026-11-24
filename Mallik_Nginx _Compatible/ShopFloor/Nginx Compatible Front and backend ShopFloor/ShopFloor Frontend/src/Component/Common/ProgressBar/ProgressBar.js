import React, { useState, useEffect } from 'react';
import './ProgressBar.css';

function ProgressBar({ value, maxValue }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (value >= 0 && value <= maxValue) {
      setProgress((value / maxValue) * 100);
    }
  }, [value, maxValue]);

  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${progress}%` }}>
        <div className="progress-label">{`${Math.round(progress)}%`}</div>
      </div>
    </div>
  );
}

export default ProgressBar;