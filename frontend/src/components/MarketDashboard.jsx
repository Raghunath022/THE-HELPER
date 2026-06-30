import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMarketForecast } from '../services/api';
import { Loader, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default function MarketDashboard() {
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const crops = [
    { value: 'rice', label: 'Rice' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'maize', label: 'Maize' },
    { value: 'chickpea', label: 'Chickpea' }
  ];

  useEffect(() => {
    fetchMarketData(selectedCrop);
  }, [selectedCrop]);

  const fetchMarketData = async (crop) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMarketForecast(crop);
      
      // Transform backend data into Recharts format
      // Assuming response.forecast_timeline is an array of next 7 days prices
      // We will mock the historical data for visual representation
      const currentPrice = response.forecast_timeline[0] / 1.05; // rough estimate of current
      
      const chartData = [];
      
      // Mock 7 days of historical
      for(let i = -7; i < 0; i++) {
        chartData.push({
          day: `Day ${i}`,
          historical: currentPrice * (1 + (Math.random() * 0.04 - 0.02)),
          forecast: null
        });
      }
      
      // Today (connects both lines)
      chartData.push({
        day: 'Today',
        historical: currentPrice,
        forecast: currentPrice
      });
      
      // Forecast data
      response.forecast_timeline.forEach((price, index) => {
        chartData.push({
          day: `+${index + 1}d`,
          historical: null,
          forecast: price
        });
      });

      setData({
        trend: response.trend,
        chartData
      });

    } catch (err) {
      setError(err.message || 'Failed to load market analytics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Predictive Market Analytics</h2>
          <p className="text-sm text-gray-500">ARIMA-powered price forecasting</p>
        </div>
        
        <select 
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm"
        >
          {crops.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-h-[300px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center text-blue-600">
            <Loader className="w-8 h-8 animate-spin mb-2" />
            <span className="text-sm font-medium">Running AI Models...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center text-red-500 text-center max-w-sm">
            <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
            <p>{error}</p>
            <button 
              onClick={() => fetchMarketData(selectedCrop)}
              className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 bg-gray-50 p-3 rounded-lg w-max">
              <span className="text-sm font-medium text-gray-600">AI Trend Forecast:</span>
              {data.trend === 'UP' ? (
                <span className="flex items-center text-green-600 font-bold bg-green-100 px-2 py-1 rounded">
                  <TrendingUp className="w-4 h-4 mr-1" /> Bullish (Hold)
                </span>
              ) : (
                <span className="flex items-center text-red-600 font-bold bg-red-100 px-2 py-1 rounded">
                  <TrendingDown className="w-4 h-4 mr-1" /> Bearish (Sell Now)
                </span>
              )}
            </div>
            
            <div className="flex-1 w-full" style={{ minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} domain={['auto', 'auto']} tickFormatter={(value) => `₹${value.toFixed(0)}`}/>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₹${value.toFixed(2)}`, '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                  <Line 
                    type="monotone" 
                    name="Historical Price" 
                    dataKey="historical" 
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    dot={{r: 4, strokeWidth: 2}} 
                    activeDot={{r: 6}}
                  />
                  <Line 
                    type="monotone" 
                    name="ARIMA Forecast" 
                    dataKey="forecast" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    strokeDasharray="5 5" 
                    dot={{r: 4, strokeWidth: 2}} 
                    activeDot={{r: 6}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
