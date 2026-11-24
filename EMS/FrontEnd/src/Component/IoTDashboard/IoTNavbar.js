import React, { useState, useEffect } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const formatDate = () => {
  const d = new Date();
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const formatTime = () => {
  const d = new Date();
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const IoTNavbar = ({ breadcrumb, onMenuToggle }) => {
  const [time, setTime] = useState(formatTime());

  useEffect(() => {
    const t = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-4 flex-shrink-0 sticky top-0 z-20">
      {/* Left — logo + menu */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <MenuIcon style={{ fontSize: 20 }} />
        </button>
        {/* <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">IoT</span>
          </div>
          <span className="text-sm font-bold text-gray-800 hidden sm:block">Monitor</span>
        </div> */}
        <div className="flex items-center gap-1.5">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <i className="fa-solid fa-bolt text-white text-sm"></i>
        </div>

        <span className="text-sm font-bold text-gray-800 hidden sm:block">
          Energy Circuit Level
        </span>
      </div>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-200 flex-shrink-0" />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 flex-1 overflow-hidden">
        {breadcrumb.map((crumb, i) => (
          <React.Fragment key={crumb.id}>
            {i > 0 && (
              <span className="text-gray-300 text-sm flex-shrink-0">›</span>
            )}
            <span
              className={`text-sm truncate flex-shrink-0 ${
                i === breadcrumb.length - 1
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-500 font-medium'
              }`}
            >
              {crumb.name}
            </span>
          </React.Fragment>
        ))}
      </nav>

      {/* Right section */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* System healthy */}
        <div className="hidden md:flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-green-700">System Healthy</span>
        </div>

        {/* Date + Time */}
        <div className="hidden lg:flex items-center gap-1.5 text-gray-500">
          <CalendarTodayIcon style={{ fontSize: 15, color: '#6b7280' }} />
          <span className="text-xs font-medium">{formatDate()}</span>
          <span className="text-xs font-mono font-medium text-gray-600">{time}</span>
        </div>

      </div>
    </header>
  );
};

export default IoTNavbar;
