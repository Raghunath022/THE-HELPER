import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudRain, Compass, Droplets, Sun, Thermometer, Wind, CheckCircle2, AlertTriangle, AlertCircle, Calendar } from 'lucide-react';

const STATE_COORDINATES = {
  'Tamil Nadu': { lat: 13.0827, lon: 80.2707 },
  'Punjab': { lat: 30.7333, lon: 76.7794 },
  'Haryana': { lat: 29.0588, lon: 76.0856 },
  'Uttar Pradesh': { lat: 26.8467, lon: 80.9462 },
  'Maharashtra': { lat: 19.0760, lon: 72.8777 },
  'Karnataka': { lat: 12.9716, lon: 77.5946 },
  'Gujarat': { lat: 23.2156, lon: 72.6369 }
};

const WEATHER_CODES = {
  0: 'Sunny',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Light Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  71: 'Light Snow',
  80: 'Rain Showers',
  81: 'Heavy Showers',
  95: 'Thunderstorm'
};

const FALLBACK_WEATHER = { temp: 31, hum: 78, wind: 10, rain: 5, uv: 10, soil: 42, condition: 'Partly Cloudy' };

export default function WeatherDashboard() {
  const { t } = useTranslation();
  const [selectedState, setSelectedState] = useState('Tamil Nadu');
  const [weather, setWeather] = useState(null);
  const [forecastList, setForecastList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveWeather();
  }, [selectedState]);

  const fetchLiveWeather = async () => {
    setLoading(true);
    try {
      const { lat, lon } = STATE_COORDINATES[selectedState];
      // Open-Meteo Free API (No API key required)
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum&timezone=auto`);
      
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      const current = data.current;
      const daily = data.daily;
      
      // Map API data to our component's format
      const liveData = {
        temp: Math.round(current.temperature_2m),
        hum: Math.round(current.relative_humidity_2m),
        wind: Math.round(current.wind_speed_10m),
        rain: current.precipitation,
        uv: daily.uv_index_max[0] ? Math.round(daily.uv_index_max[0]) : 8,
        soil: Math.max(20, Math.min(80, 50 + (current.precipitation * 5))), // Simulated soil moisture based on rain
        condition: WEATHER_CODES[current.weather_code] || 'Clear'
      };

      setWeather(liveData);

      // Process 5-day forecast
      const list = [];
      const daysLabel = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
      for (let i = 1; i <= 5; i++) {
        if (daily.time[i]) {
          list.push({
            day: daysLabel[i-1] || `Day ${i}`,
            temp: Math.round(daily.temperature_2m_max[i]),
            rain: daily.precipitation_sum[i],
            condition: WEATHER_CODES[daily.weather_code[i]] || 'Clear'
          });
        }
      }
      setForecastList(list);

    } catch (error) {
      console.error("Failed to fetch live weather, using fallback:", error);
      setWeather(FALLBACK_WEATHER);
      setForecastList([
        { day: 'Tomorrow', temp: 32, rain: 0, condition: 'Sunny' },
        { day: 'Day 3', temp: 31, rain: 2, condition: 'Partly Cloudy' },
        { day: 'Day 4', temp: 29, rain: 15, condition: 'Rainy' },
        { day: 'Day 5', temp: 28, rain: 8, condition: 'Showers' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Classification Logic (Mock ML classification) for Sowing, Spraying and Irrigation
  const evaluateAgroIndices = () => {
    if (!weather) return null;
    const indices = {};
    
    // 1. Sowing Feasibility: optimal pH 6-7, temp 22-30C, soil moisture 35-60%
    if (weather.temp >= 22 && weather.temp <= 32 && weather.soil >= 35 && weather.soil <= 65) {
      indices.sowing = {
        status: 'high',
        color: '#52b788',
        label: t('indexHigh'),
        tip: t('sowingTipHigh')
      };
    } else if (weather.soil > 65) {
      indices.sowing = {
        status: 'low',
        color: '#ff5252',
        label: t('indexLow'),
        tip: t('sowingTipLow')
      };
    } else {
      indices.sowing = {
        status: 'medium',
        color: '#ffa726',
        label: t('indexMedium'),
        tip: t('sowingTipMedium')
      };
    }

    // 2. Pesticide Spraying Suitability: optimal wind < 12 km/h, rain probability < 20%
    if (weather.wind > 15) {
      indices.spraying = {
        status: 'low',
        color: '#ff5252',
        label: t('indexLow') + ' (Wind Drift)',
        tip: t('sprayTipLowWind')
      };
    } else if (weather.rain > 5) {
      indices.spraying = {
        status: 'low',
        color: '#ff5252',
        label: t('indexLow') + ' (Washout)',
        tip: t('sprayTipLowRain')
      };
    } else {
      indices.spraying = {
        status: 'high',
        color: '#52b788',
        label: t('indexHigh'),
        tip: t('sprayTipHigh')
      };
    }

    // 3. Irrigation Alert
    if (weather.rain >= 10) {
      indices.irrigation = {
        status: 'suspend',
        color: '#ffa726',
        label: t('suspendIrrigation'),
        icon: AlertTriangle,
        text: t('suspendIrrigationTip')
      };
    } else if (weather.temp >= 33 && weather.soil < 30) {
      indices.irrigation = {
        status: 'danger',
        color: '#ff5252',
        label: t('urgentIrrigation'),
        icon: AlertCircle,
        text: t('urgentIrrigationTip')
      };
    } else {
      indices.irrigation = {
        status: 'normal',
        color: '#52b788',
        label: t('normalIrrigation'),
        icon: CheckCircle2,
        text: t('normalIrrigationTip')
      };
    }

    return indices;
  };

  const indices = evaluateAgroIndices();
  const IrrigationIcon = indices ? indices.irrigation.icon : null;

  return (
    <div className="predictor-grid">
      
      {/* Forecast Info */}
      <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="flex-between" style={{ borderBottom: '1px solid rgba(82, 183, 136, 0.12)', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun style={{ color: '#52b788' }} />
            {t('weatherTitle')}
            <span className="badge badge-emerald" style={{ marginLeft: '8px', fontSize: '0.6rem' }}>LIVE DATA</span>
          </h2>
          
          <select 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="input-field"
            style={{ width: '160px', padding: '6px 12px', fontSize: '0.8rem' }}
          >
            {Object.keys(STATE_COORDINATES).map(st => (
              <option key={st} value={st} style={{ background: '#0a2419' }}>{st}</option>
            ))}
          </select>
        </div>

        {loading || !weather ? (
          <div className="flex-center" style={{ height: '300px', flexDirection: 'column', gap: '16px' }}>
            <div className="animate-spin" style={{ borderRadius: '50%', height: '36px', width: '36px', borderBottom: '2px solid #52b788' }}></div>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>Fetching live meteorological data...</p>
          </div>
        ) : (
          <>
            {/* Current Weather HUD Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              
              {/* Temperature Widget */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: '#ffa726', background: 'rgba(251, 140, 0, 0.08)', padding: '8px', borderRadius: '10px' }}>
                  <Thermometer size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>{t('temperature')}</span>
                  <h3 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '2px' }}>{weather.temp}°C</h3>
                  <span style={{ fontSize: '9px', color: '#52b788' }}>{weather.condition}</span>
                </div>
              </div>

              {/* Humidity Widget */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: '#52b788', background: 'rgba(82, 183, 136, 0.08)', padding: '8px', borderRadius: '10px' }}>
                  <Droplets size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>{t('humidity')}</span>
                  <h3 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '2px' }}>{weather.hum}%</h3>
                </div>
              </div>

              {/* Wind Speed Widget */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: '#38b87d', background: 'rgba(56, 184, 125, 0.08)', padding: '8px', borderRadius: '10px' }}>
                  <Wind size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>{t('windSpeedLabel')}</span>
                  <h3 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '2px' }}>{weather.wind} <span style={{ fontSize: '10px' }}>km/h</span></h3>
                </div>
              </div>

              {/* Rainfall Widget */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: '#2b8a5e', background: 'rgba(43, 138, 94, 0.08)', padding: '8px', borderRadius: '10px' }}>
                  <CloudRain size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>{t('rainfall')}</span>
                  <h3 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '2px' }}>{weather.rain} <span style={{ fontSize: '10px' }}>mm</span></h3>
                </div>
              </div>

              {/* UV Index Widget */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: '#ffa726', background: 'rgba(251, 140, 0, 0.08)', padding: '8px', borderRadius: '10px' }}>
                  <Sun size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>{t('uvIndexLabel')}</span>
                  <h3 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '2px' }}>{weather.uv} <span style={{ fontSize: '10px', color: '#ff5252', fontWeight: 600 }}>{weather.uv >= 8 ? t('extreme') : ''}</span></h3>
                </div>
              </div>

              {/* Soil Moisture Widget */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: '#38b87d', background: 'rgba(56, 184, 125, 0.08)', padding: '8px', borderRadius: '10px' }}>
                  <Compass size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>{t('soilMoistureLabel')}</span>
                  <h3 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '2px' }}>{weather.soil}%</h3>
                </div>
              </div>

            </div>

            {/* 5 Day Forecast List */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} style={{ color: '#52b788' }} /> {t('fiveDayForecast')}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {forecastList.map((f, idx) => (
                  <div 
                    key={idx} 
                    className="flex-between"
                    style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.8rem' }}
                  >
                    <span style={{ color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>{f.day}</span>
                    <span style={{ color: 'hsl(var(--text-muted))' }}>{f.condition}</span>
                    <span style={{ color: '#ffa726', fontWeight: 700 }}>{f.temp}°C</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Agro-Advisories Panel */}
      {indices && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Sowing feasibility card */}
          <div className="card-glass" style={{ borderLeft: `4px solid ${indices.sowing.color}` }}>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>{t('sowingFeasibility')}</span>
            <h3 style={{ fontSize: '1.35rem', color: '#fff', marginTop: '4px', textTransform: 'capitalize', display: 'flex', justifyItems: 'center', gap: '8px' }}>
              {indices.sowing.label}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', marginTop: '8px', lineHeight: 1.4 }}>
              {indices.sowing.tip}
            </p>
          </div>

          {/* Pesticide spraying card */}
          <div className="card-glass" style={{ borderLeft: `4px solid ${indices.spraying.color}` }}>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>{t('spraySuitability')}</span>
            <h3 style={{ fontSize: '1.35rem', color: '#fff', marginTop: '4px', textTransform: 'capitalize' }}>
              {indices.spraying.label}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', marginTop: '8px', lineHeight: 1.4 }}>
              {indices.spraying.tip}
            </p>
          </div>

          {/* Irrigation alert panel */}
          <div className="card-glass" style={{ border: `1.5px solid ${indices.irrigation.color}`, background: 'rgba(255,255,255,0.01)' }}>
            <div className="flex-center-y flex-gap-2">
              <IrrigationIcon size={20} style={{ color: indices.irrigation.color }} />
              <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 800 }}>{indices.irrigation.label}</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '10px', lineHeight: 1.4 }}>
              {indices.irrigation.text}
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
