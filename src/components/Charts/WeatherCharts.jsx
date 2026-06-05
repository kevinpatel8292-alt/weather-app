import React, { useState } from 'react';
import { useWeatherContext } from '../../context/WeatherContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const WeatherCharts = () => {
  const { forecast, loading, theme } = useWeatherContext();
  const [activeTab, setActiveTab] = useState('temp');

  if (loading || !forecast) {
    return <div className="glass-panel skeleton mt-6" style={{ height: '300px' }}></div>;
  }

  // Get data for next 24 hours
  const data = forecast.list.slice(0, 8).map(item => ({
    time: format(new Date(item.dt * 1000), 'h a'),
    temp: Math.round(item.main.temp),
    humidity: item.main.humidity,
    wind: item.wind.speed
  }));

  const chartColor = theme === 'dark' ? '#f8fafc' : '#1e293b';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const getChartDataKey = () => activeTab;
  const getChartColor = () => {
    switch(activeTab) {
      case 'temp': return '#f59e0b';
      case 'humidity': return '#3b82f6';
      case 'wind': return '#10b981';
      default: return '#f59e0b';
    }
  };

  return (
    <div className="glass-panel mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Weather Statistics</h3>
        <div className="flex gap-2">
          {['temp', 'humidity', 'wind'].map(tab => (
            <button
              key={tab}
              className={`btn-primary ${activeTab !== tab ? 'glass-card' : ''}`}
              style={{
                backgroundColor: activeTab === tab ? 'var(--primary-color)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--text-color)',
                padding: '0.25rem 0.75rem',
                border: activeTab !== tab ? '1px solid var(--glass-border)' : 'none',
              }}
              onClick={() => setActiveTab(tab)}
            >
              <span className="capitalize">{tab === 'temp' ? 'Temperature' : tab}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '250px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={getChartColor()} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: chartColor, fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: chartColor, fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--glass-bg)', 
                borderColor: 'var(--glass-border)',
                borderRadius: '0.5rem',
                color: 'var(--text-color)',
                backdropFilter: 'blur(8px)'
              }} 
            />
            <Area type="monotone" dataKey={getChartDataKey()} stroke={getChartColor()} fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeatherCharts;
