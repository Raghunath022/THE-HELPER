import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Thermometer, Droplets, FlaskConical, Heart, Zap, AlertTriangle, CheckCircle2, AlertOctagon, RefreshCw, Cpu, Activity } from 'lucide-react';

export default function IoTTelemetry({ backendUrl }) {
  const { t } = useTranslation();
  const [telemetry, setTelemetry] = useState(null);
  const [history, setHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const timerRef = useRef(null);
  const updateSecRef = useRef(null);

  // Poll server for latest sensor reading
  const fetchTelemetry = async () => {
    try {
      const baseUrl = backendUrl || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `${window.location.protocol}//${window.location.hostname}:10000`
        : 'https://smart-agri-platform-1.onrender.com');
      const response = await fetch(`${baseUrl}/api/sensor-data`);
      if (response.ok) {
        const data = await response.json();
        if (data.latest) {
          setTelemetry(data.latest);
          setHistory(data.history || []);
          setIsConnected(true);
          setLastUpdated(0);
        } else {
          setIsConnected(false);
        }
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error fetching IoT telemetry:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTelemetry();

    // Poll every 3 seconds
    timerRef.current = setInterval(fetchTelemetry, 3000);

    // Track time since last updated
    updateSecRef.current = setInterval(() => {
      setLastUpdated(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(updateSecRef.current);
    };
  }, []);

  // Map backend suggestion codes to localized translation strings
  const getLocalizedSuggestion = (sugg) => {
    if (!sugg) return '';
    const key = `sugg_${sugg.code}`;
    const translated = t(key);
    // If translation doesn't exist, fallback to the English text sent by backend
    return translated === key ? sugg.text : translated;
  };

  // Helper to render SVG charts smoothly
  const renderTrendChart = () => {
    if (history.length < 2) return <div className="text-center py-8 text-muted">{t('noDataYet', 'Waiting for historical data...')}</div>;

    const width = 600;
    const height = 180;
    const padding = 20;

    // Filter last 30 data points
    const dataPoints = history.slice(-30);
    const maxIdx = dataPoints.length - 1;

    // Get limits for Temperature & Humidity
    const temps = dataPoints.map(d => d.temperature_humidity.temperature_c);
    const hums = dataPoints.map(d => d.temperature_humidity.humidity_percent);

    const minTemp = Math.min(...temps, 10);
    const maxTemp = Math.max(...temps, 40);
    const minHum = Math.min(...hums, 20);
    const maxHum = Math.max(...hums, 100);

    // Coordinate mapping functions
    const getX = (index) => padding + (index / maxIdx) * (width - 2 * padding);
    const getTempY = (val) => height - padding - ((val - minTemp) / (maxTemp - minTemp)) * (height - 2 * padding);
    const getHumY = (val) => height - padding - ((val - minHum) / (maxHum - minHum)) * (height - 2 * padding);

    // Build SVG paths
    let tempPath = "";
    let humPath = "";

    dataPoints.forEach((d, idx) => {
      const x = getX(idx);
      const ty = getTempY(d.temperature_humidity.temperature_c);
      const hy = getHumY(d.temperature_humidity.humidity_percent);

      if (idx === 0) {
        tempPath = `M ${x} ${ty}`;
        humPath = `M ${x} ${hy}`;
      } else {
        tempPath += ` L ${x} ${ty}`;
        humPath += ` L ${x} ${hy}`;
      }
    });

    return (
      <svg className="trend-svg" viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
        {/* Horizontal gridlines */}
        <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
        
        {/* Temperature Line */}
        <path d={tempPath} fill="none" stroke="hsl(var(--danger, 0))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'd 0.3s ease' }} />
        
        {/* Humidity Line */}
        <path d={humPath} fill="none" stroke="#52b788" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'd 0.3s ease' }} />

        {/* Legend */}
        <g transform={`translate(${padding}, 15)`}>
          <rect width="10" height="10" fill="hsl(var(--danger, 0))" rx="2" />
          <text x="15" y="9" fill="hsl(var(--text-secondary))" fontSize="10">{t('iot_temperature')}</text>
          
          <rect x="100" width="10" height="10" fill="#52b788" rx="2" />
          <text x="115" y="9" fill="hsl(var(--text-secondary))" fontSize="10">{t('iot_humidity')}</text>
        </g>
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="glass-card flex-center flex-column" style={{ minHeight: '350px' }}>
        <RefreshCw className="animate-spin text-primary" size={32} />
        <p style={{ marginTop: '16px', color: 'hsl(var(--text-secondary))' }}>Calibrating sensor connection...</p>
      </div>
    );
  }

  // Node disconnected or no data received yet
  if (!telemetry) {
    return (
      <div className="glass-card text-center" style={{ padding: '60px 20px' }}>
        <div className="flex-center" style={{ marginBottom: '20px' }}>
          <div className="pulsing-circle disconnected"></div>
          <Cpu size={48} style={{ color: 'hsl(var(--text-secondary))', marginLeft: '12px' }} />
        </div>
        <h3 className="section-title">{t('iot_status')}: {t('iot_disconnected')}</h3>
        <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '500px', margin: '12px auto' }}>
          Waiting for IoT node streams. Run the Python simulator script (`python backend/simulator.py`) to start emitting telemetry data.
        </p>
        <button className="btn-primary" onClick={fetchTelemetry} style={{ marginTop: '16px' }}>
          <RefreshCw size={14} style={{ marginRight: '8px' }} />
          Retry Connection
        </button>
      </div>
    );
  }

  const { severity, plant_status, primary_suggestion, all_suggestions } = telemetry.analysis;
  const { temperature_c, humidity_percent } = telemetry.temperature_humidity;
  const { nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg } = telemetry.npk;
  const { do_mg_l } = telemetry.dissolved_oxygen;
  const { voltage_mv } = telemetry.bioelectrical;

  return (
    <div className="iot-telemetry-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Top Banner Status Bar */}
      <div className="glass-card flex-between flex-wrap" style={{ padding: '16px 24px', width: '100%', marginBottom: '16px' }}>
        <div className="flex-center-y flex-gap-3">
          <div className={`pulsing-circle ${isConnected ? 'connected' : 'disconnected'}`}></div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>{t('iot_status')}</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 'bold', color: isConnected ? '#52b788' : 'hsl(var(--danger))' }}>
              {isConnected ? t('iot_connected') : t('iot_disconnected')}
            </span>
          </div>
        </div>

        <div className="flex-center-y flex-gap-4 hide-mobile">
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>Active Node ID</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>AGRI-NODE-01</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>{t('iot_last_update')}</span>
            <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>
              {lastUpdated} {t('iot_seconds_ago')}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ width: '100%', gap: '16px', marginBottom: '16px' }}>
        
        {/* Temperature & Humidity */}
        <div className={`glass-card metric-card ${severity !== 'normal' && (temperature_c > 30 || temperature_c < 18 || humidity_percent > 85 || humidity_percent < 50) ? 'alert-pulse-warning' : ''}`}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <span className="card-label">{t('iot_temperature')} & {t('iot_humidity')}</span>
            <Thermometer className="text-primary" size={20} />
          </div>
          
          <div className="flex-around" style={{ padding: '10px 0' }}>
            <div className="text-center">
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'hsl(var(--text-primary))' }}>{temperature_c}</span>
              <span style={{ fontSize: '1rem', color: 'hsl(var(--text-secondary))' }}>°C</span>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>Temp</p>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div className="text-center">
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#52b788' }}>{humidity_percent}</span>
              <span style={{ fontSize: '1rem', color: 'hsl(var(--text-secondary))' }}>%</span>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>Humidity</p>
            </div>
          </div>
        </div>

        {/* NPK Concentration */}
        <div className={`glass-card metric-card ${nitrogen_mg_kg < 100 || phosphorus_mg_kg < 20 || potassium_mg_kg < 80 ? 'alert-pulse-warning' : ''}`}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span className="card-label">Soil Nutrient (N-P-K)</span>
            <FlaskConical className="text-primary" size={20} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                <span>Nitrogen (N)</span>
                <span style={{ fontWeight: 'bold' }}>{nitrogen_mg_kg} mg/kg</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '6px' }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.min((nitrogen_mg_kg / 150) * 100, 100)}%`, background: nitrogen_mg_kg < 100 ? 'hsl(var(--warning))' : '#52b788', height: '6px' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                <span>Phosphorus (P)</span>
                <span style={{ fontWeight: 'bold' }}>{phosphorus_mg_kg} mg/kg</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '6px' }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.min((phosphorus_mg_kg / 40) * 100, 100)}%`, background: phosphorus_mg_kg < 20 ? 'hsl(var(--warning))' : '#52b788', height: '6px' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                <span>Potassium (K)</span>
                <span style={{ fontWeight: 'bold' }}>{potassium_mg_kg} mg/kg</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '6px' }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.min((potassium_mg_kg / 120) * 100, 100)}%`, background: potassium_mg_kg < 80 ? 'hsl(var(--warning))' : '#52b788', height: '6px' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bioelectrical & Dissolved Oxygen */}
        <div className={`glass-card metric-card ${severity === 'critical' || do_mg_l < 6.0 ? 'alert-pulse-critical' : ''}`}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <span className="card-label">Bio-potential & Aeration</span>
            <Activity className="text-primary" size={20} />
          </div>

          <div className="flex-around" style={{ padding: '10px 0' }}>
            <div className="text-center">
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: do_mg_l < 5.0 ? 'hsl(var(--danger))' : 'hsl(var(--text-primary))' }}>{do_mg_l}</span>
              <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}> mg/L</span>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>D. Oxygen</p>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div className="text-center">
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'hsl(var(--text-primary))' }}>{voltage_mv}</span>
              <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}> mV</span>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>Potentials</p>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ width: '100%', gap: '16px', alignItems: 'start' }}>
        
        {/* Trend Graph Area */}
        <div className="glass-card lg:col-span-2" style={{ padding: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 className="card-title flex-center-y flex-gap-2">
              <Activity size={18} className="text-primary" />
              {t('iot_history')}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Real-time updates</span>
          </div>
          {renderTrendChart()}
        </div>

        {/* Diagnosis & Suggestions Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 className="card-title flex-center-y flex-gap-2" style={{ marginBottom: '16px' }}>
            <Heart size={18} className="text-primary" />
            {t('iot_active_alerts')}
          </h3>

          {/* Severity status badge */}
          <div className="flex-center-y flex-gap-3" style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', marginBottom: '16px' }}>
            {severity === 'critical' ? (
              <AlertOctagon className="text-danger" size={24} />
            ) : severity === 'warning' ? (
              <AlertTriangle className="text-warning" size={24} />
            ) : (
              <CheckCircle2 className="text-success" size={24} />
            )}
            <div>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>{t('iot_stress_level')}</span>
              <span style={{ fontSize: '1rem', fontWeight: 'bold', color: severity === 'critical' ? 'hsl(var(--danger))' : severity === 'warning' ? 'hsl(var(--warning))' : '#52b788' }}>
                {plant_status}
              </span>
            </div>
          </div>

          {/* Warnings List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {all_suggestions.map((sugg, index) => {
              const localizedText = getLocalizedSuggestion(sugg);
              return (
                <div 
                  key={index} 
                  className="flex-gap-2" 
                  style={{ 
                    fontSize: '0.85rem', 
                    lineHeight: '1.4', 
                    padding: '8px 12px', 
                    borderRadius: '6px', 
                    background: 'rgba(0,0,0,0.15)',
                    borderLeft: `3px solid ${severity === 'critical' ? 'hsl(var(--danger))' : severity === 'warning' ? 'hsl(var(--warning))' : '#52b788'}`
                  }}
                >
                  <span style={{ color: 'hsl(var(--text-primary))' }}>{localizedText}</span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(82, 183, 136, 0.05)', borderRadius: '6px', border: '1px solid rgba(82, 183, 136, 0.15)', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
            💡 <strong>Protip:</strong> Press keys in the Python console running `simulator.py` to test different microclimate and bio-potentials stress events.
          </div>
        </div>

      </div>
    </div>
  );
}
