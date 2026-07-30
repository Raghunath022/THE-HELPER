import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, RefreshCw, Sprout, FlaskConical, Calculator, Camera, Sun, Coins, MessageCircle, ArrowRight, Droplets, Thermometer, Cloud, Leaf, Cpu, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../useToast';

// ── Crop database with grow steps (used on dashboard preview) ──
const DASH_CROPS = {
  rice:        { name: 'Rice (Paddy)',  emoji: '🌾', growthPeriod: 120, yield: '3–8 tons/ha',   ph: { min:5.5, max:7.0, optimal:6.0 }, temperature: { min:20, max:35, optimal:25 }, rainfall: { min:1000, max:2000, optimal:1200 }, steps: ['🌱 Soak seeds 24 hrs, sow in nursery. Transplant 25-day seedlings into flooded rows.','💧 Keep 5–10 cm water throughout. Drain field 2 weeks before harvest.','🌿 Apply urea 3 times: at planting, 30 days, and 60 days after transplant.','🌾 Harvest when grains turn golden (day 110–120). Cut and thresh immediately.'] },
  wheat:       { name: 'Wheat',         emoji: '🌾', growthPeriod: 90,  yield: '2–6 tons/ha',   ph: { min:6.0, max:7.5, optimal:6.8 }, temperature: { min:15, max:25, optimal:20 }, rainfall: { min:350,  max:700,  optimal:500  }, steps: ['🌱 Plough 2–3 times. Sow seeds 5 cm deep, rows 20 cm apart (Oct–Nov).','💧 Water 6 times: sowing, crown root, tillering, jointing, flowering, grain filling.','🌿 Apply DAP at sowing + urea top-dress at 3 and 6 weeks. Weed at day 20–30.','🌾 Harvest when straw yellows and grain is hard (day 85–95). Use sickle or thresher.'] },
  maize:       { name: 'Maize (Corn)',   emoji: '🌽', growthPeriod: 110, yield: '4–12 tons/ha',  ph: { min:6.0, max:7.0, optimal:6.5 }, temperature: { min:18, max:30, optimal:24 }, rainfall: { min:500,  max:1200, optimal:800  }, steps: ['🌱 Sow 2 seeds/hole, 3 cm deep. Row 60 cm × plant 30 cm. Thin to 1 plant at day 10.','💧 Water every 10–12 days. Never let it dry at tasseling or silking stage.','🌿 Split nitrogen into 3 doses. Weed at 20 and 40 days after planting.','🌽 Harvest when husks brown and kernels hard (day 100–115). Sun-dry cobs 3–5 days.'] },
  cotton:      { name: 'Cotton',         emoji: '🌿', growthPeriod: 150, yield: '1.5–3.5 t/ha', ph: { min:6.0, max:7.5, optimal:6.8 }, temperature: { min:22, max:32, optimal:27 }, rainfall: { min:500,  max:1000, optimal:750  }, steps: ['🌱 Deep plough twice. Sow soaked seeds 3–4 cm deep. Row 90 cm × plant 60 cm.','💧 Water every 15 days. Ensure row drainage — avoid waterlogging.','🌿 Phosphorus at sowing. Add N & K at 45 and 90 days. Watch for bollworm.','🌿 Hand-pick open white bolls every 5–7 days from day 140. 3–5 picking rounds.'] },
  groundnut:   { name: 'Groundnut',      emoji: '🥜', growthPeriod: 120, yield: '1.5–3 tons/ha', ph: { min:5.5, max:6.5, optimal:6.0 }, temperature: { min:20, max:30, optimal:25 }, rainfall: { min:500,  max:1000, optimal:700  }, steps: ['🌱 Sow shelled seeds 5 cm deep, sandy-loam soil. Rows 30 cm × 10 cm (June–July).','💧 Water every 10 days. Extra at flowering (day 30) and pegging (day 45–60).','🌿 Apply gypsum at flowering — fills pods. Weed lightly at 20 and 40 days.','🥜 Harvest when leaves yellow (day 115–125). Uproot, dry in shade 3–4 days.'] },
  pomegranate: { name: 'Pomegranate',    emoji: '🍎', growthPeriod: 240, yield: '12–20 t/ha',   ph: { min:5.5, max:7.5, optimal:6.5 }, temperature: { min:25, max:35, optimal:30 }, rainfall: { min:500,  max:800,  optimal:650  }, steps: ['🌱 Dig 60×60×60 cm pits. Plant rooted cuttings 4.5 m × 3 m apart. Mix FYM.','💧 Drip irrigation: 20–30 L/plant/day in summer, less in winter.','🌿 Prune to single stem in year 1. Remove suckers. Apply NPK every 4 months.','🍎 First harvest year 3. Pick when skin is dark red and tapping sounds metallic.'] },
  mango:       { name: 'Mango',          emoji: '🥭', growthPeriod: 365, yield: '8–22 tons/ha',  ph: { min:5.5, max:7.5, optimal:6.5 }, temperature: { min:24, max:35, optimal:28 }, rainfall: { min:750,  max:2500, optimal:1500 }, steps: ['🌱 Dig 1m × 1m × 1m pit. Plant grafted sapling 10 m apart. Mix FYM+soil+sand.','💧 Water every 3 days for 2 years. Mature trees: water only at fruit development.','🌿 Apply NPK + micronutrients twice/year (June & Oct). Prune dead branches.','🥭 Harvest April–June when fruit color changes and separates easily. Handle gently.'] },
};

function dashCalcSuitability(crop, ph, temp, rain) {
  const phDiff   = Math.abs(ph   - crop.ph.optimal);          const phScore   = Math.max(0, 100 - phDiff * 50);
  const tempDiff = Math.abs(temp - crop.temperature.optimal); const tempScore = Math.max(0, 100 - tempDiff * 10);
  let rainScore;
  if (rain >= crop.rainfall.min && rain <= crop.rainfall.max) rainScore = 100;
  else {
    const dist = rain < crop.rainfall.min ? crop.rainfall.min - rain : rain - crop.rainfall.max;
    rainScore = Math.max(0, 100 - (dist / crop.rainfall.optimal) * 100);
  }
  return Math.round(phScore * 0.35 + tempScore * 0.25 + rainScore * 0.40);
}

function useCounter(target, duration = 1800, refreshKey = 0) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);
  
  useEffect(() => {
    setCount(0);
    started.current = false;
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(target * ease));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, refreshKey]);
  return [count, ref];
}

export default function Dashboard({ user, token, backendUrl, onNavigate }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const [farmersCount, farmersRef] = useCounter(12400, 1500, refreshKey);
  const [queriesCount, queriesRef] = useCounter(89200, 1800, refreshKey);
  const [cropsCount,   cropsRef]   = useCounter(47, 1200, refreshKey);

  // Real-time IoT Sensor Simulation State
  const [sensors, setSensors] = useState([
    { label: 'Soil Moisture', value: '62%', status: 'optimal', iconKey: 'moisture' },
    { label: 'Air Temperature', value: '24.5°C', status: 'optimal', iconKey: 'temp' },
    { label: 'Air Humidity', value: '70%', status: 'optimal', iconKey: 'humidity' },
    { label: 'Soil Nitrogen', value: '42 ppm', status: 'warning', iconKey: 'nitrogen' },
    { label: 'Soil pH Level', value: '6.4', status: 'optimal', iconKey: 'ph' },
    { label: 'Solar Light', value: '950 lux', status: 'optimal', iconKey: 'light' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSensors([
        { label: 'Soil Moisture', value: Math.round(55 + Math.random() * 20) + '%', status: 'optimal', iconKey: 'moisture' },
        { label: 'Air Temperature', value: (22 + Math.random() * 6).toFixed(1) + '°C', status: 'optimal', iconKey: 'temp' },
        { label: 'Air Humidity', value: Math.round(60 + Math.random() * 20) + '%', status: 'optimal', iconKey: 'humidity' },
        { label: 'Soil Nitrogen', value: Math.round(30 + Math.random() * 20) + ' ppm', status: 'warning', iconKey: 'nitrogen' },
        { label: 'Soil pH Level', value: (6.2 + Math.random() * 0.8).toFixed(1), status: 'optimal', iconKey: 'ph' },
        { label: 'Solar Light', value: Math.round(800 + Math.random() * 400) + ' lux', status: 'optimal', iconKey: 'light' }
      ]);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const getSensorIcon = (key) => {
    switch (key) {
      case 'moisture': return <Droplets size={16} style={{ color: '#52b788' }} />;
      case 'temp': return <Thermometer size={16} style={{ color: '#52b788' }} />;
      case 'humidity': return <Cloud size={16} style={{ color: '#52b788' }} />;
      case 'nitrogen': return <Leaf size={16} style={{ color: '#ffa726' }} />;
      case 'ph': return <FlaskConical size={16} style={{ color: '#52b788' }} />;
      case 'light': return <Sun size={16} style={{ color: '#52b788' }} />;
      default: return <Zap size={16} />;
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success(t('dashboardDataRefreshed') || '📊 Analytics data refreshed successfully!');
  };

  return (
    <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto', padding: '20px' }}>
      {/* Hero Banner Card */}
      <div className="hero-banner" style={{ width: '100%', marginBottom: '30px' }}>
        <div className="hero-bg-pattern" />
        <div className="hero-grid-lines" />
        <span className="hero-emoji-float">🌿</span>

        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={11} />
            {t('heroBadge')}
          </div>

          <h1 className="hero-headline">
            {t('heroHeadline')}
          </h1>

          <p className="hero-sub">
            {t('heroSubtitle')}
          </p>

          <div className="hero-actions">
            <button
              className="btn-secondary"
              style={{ padding: '12px 20px', fontSize: '0.88rem' }}
              onClick={handleRefresh}
            >
              <RefreshCw size={15} />
              {t('refreshData')}
            </button>
          </div>

          <div className="hero-stat-row">
            <div className="hero-stat" ref={farmersRef}>
              <span className="hero-stat-value">{farmersCount.toLocaleString('en-IN')}+</span>
              <span className="hero-stat-label">{t('heroStatFarmers')}</span>
            </div>
            <div className="hero-stat" ref={queriesRef}>
              <span className="hero-stat-value">{queriesCount.toLocaleString('en-IN')}+</span>
              <span className="hero-stat-label">{t('heroStatQueries')}</span>
            </div>
            <div className="hero-stat" ref={cropsRef}>
              <span className="hero-stat-value">{cropsCount}+</span>
              <span className="hero-stat-label">{t('heroStatCrops')}</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value" style={{ color: '#52b788' }}>24/7</span>
              <span className="hero-stat-label">{t('heroStatAvailability')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Tools Section */}
      <div className="dashboard-tools-section">
        <h2 className="dashboard-section-title">
          {t('coreServices') || '🛠️ Core Agricultural Services'}
        </h2>
        <div className="dashboard-tools-grid">
          <div className="tool-card" onClick={() => onNavigate('predictor')}>
            <div className="tool-card-icon-wrapper">
              <Sprout size={24} />
            </div>
            <h3 className="tool-card-title">{t('cropRecommend') || 'Crop Advisor'}</h3>
            <p className="tool-card-desc">
              {t('cropAdvisorDesc') || 'Find the best crops to grow using real-time soil analysis (NPK, pH, temperature, and moisture levels).'}
            </p>
            <span className="tool-card-action">
              {t('launchTool') || 'Launch Advisor'} <ArrowRight size={14} />
            </span>
          </div>

          <div className="tool-card" onClick={() => onNavigate('fertilizer')}>
            <div className="tool-card-icon-wrapper">
              <FlaskConical size={24} />
            </div>
            <h3 className="tool-card-title">{t('fertilizer') || 'Fertilizer Recommendation'}</h3>
            <p className="tool-card-desc">
              {t('fertilizerDesc') || 'Get tailored nitrogen, phosphorus, and potassium fertilizer application schedules for optimal soil health.'}
            </p>
            <span className="tool-card-action">
              {t('launchTool') || 'Get Advice'} <ArrowRight size={14} />
            </span>
          </div>

          <div className="tool-card" onClick={() => onNavigate('yield')}>
            <div className="tool-card-icon-wrapper">
              <Calculator size={24} />
            </div>
            <h3 className="tool-card-title">{t('yieldPrediction') || 'Yield Prediction'}</h3>
            <p className="tool-card-desc">
              {t('yieldDesc') || 'Estimate crop yield harvests using regression and historical weather and temperature data.'}
            </p>
            <span className="tool-card-action">
              {t('launchTool') || 'Estimate Yield'} <ArrowRight size={14} />
            </span>
          </div>

          <div className="tool-card" onClick={() => onNavigate('disease')}>
            <div className="tool-card-icon-wrapper">
              <Camera size={24} />
            </div>
            <h3 className="tool-card-title">{t('diseaseCamera') || 'Disease Detector'}</h3>
            <p className="tool-card-desc">
              {t('diseaseDesc') || 'Upload leaf images to diagnose crop diseases and get remediation tips using deep learning.'}
            </p>
            <span className="tool-card-action">
              {t('launchTool') || 'Scan Leaf'} <ArrowRight size={14} />
            </span>
          </div>

          <div className="tool-card" onClick={() => onNavigate('weather')}>
            <div className="tool-card-icon-wrapper">
              <Sun size={24} />
            </div>
            <h3 className="tool-card-title">{t('weather') || 'Weather Station'}</h3>
            <p className="tool-card-desc">
              {t('weatherDesc') || 'Monitor local weather forecasts, precipitation indexes, and receive extreme conditions warnings.'}
            </p>
            <span className="tool-card-action">
              {t('launchTool') || 'View Forecast'} <ArrowRight size={14} />
            </span>
          </div>

          <div className="tool-card" onClick={() => onNavigate('market')}>
            <div className="tool-card-icon-wrapper">
              <Coins size={24} />
            </div>
            <h3 className="tool-card-title">{t('marketPrices') || 'Market Insights'}</h3>
            <p className="tool-card-desc">
              {t('marketDesc') || 'Track crop market rates, regional trends, and minimum support prices across local marketplaces.'}
            </p>
            <span className="tool-card-action">
              {t('launchTool') || 'Check Prices'} <ArrowRight size={14} />
            </span>
          </div>

          <div className="tool-card" onClick={() => onNavigate('chat')}>
            <div className="tool-card-icon-wrapper">
              <MessageCircle size={24} />
            </div>
            <h3 className="tool-card-title">{t('aiChatAssistant') || 'AI Chat Assistant'}</h3>
            <p className="tool-card-desc">
              {t('chatDesc') || 'Chat with our intelligent agricultural bot in your own regional language for smart farming answers.'}
            </p>
            <span className="tool-card-action">
              {t('launchTool') || 'Start Chat'} <ArrowRight size={14} />
            </span>
          </div>
        </div>

        {/* ── Live IoT Farm Dashboard Section ── */}
        <div className="card-glass" style={{ marginTop: '28px', padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Cpu size={22} style={{ color: '#52b788' }} />
            Live Farm Dashboard (IoT Telemetry)
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', marginBottom: '20px' }}>
            Real-time simulated telemetry feeds from wireless agricultural sensor nodes deployed across your fields.
          </p>
          <div className="dashboard-sensor-grid">
            {sensors.map((sensor, idx) => (
              <div key={idx} className="sensor-value-card">
                <div className="sensor-card-label">
                  {getSensorIcon(sensor.iconKey)}
                  {sensor.label}
                </div>
                <div className="sensor-card-value">{sensor.value}</div>
                <div className={`sensor-badge-status ${sensor.status === 'optimal' ? 'sensor-status-optimal' : 'sensor-status-warning'}`}>
                  {sensor.status === 'optimal' ? 'Optimal' : 'Monitor'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Best Crops You Can Grow ── */}
        <div className="card-glass" style={{ marginTop: '28px', padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sprout size={20} style={{ color: '#52b788' }} />
            🌾 Best Crops You Can Grow
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginBottom: '20px' }}>
            Based on average Indian soil conditions. Tap any crop to see the simple grow guide.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.keys(DASH_CROPS)
              .map(key => {
                const crop = DASH_CROPS[key];
                const pct  = dashCalcSuitability(crop, 6.5, 26, 900);
                return { key, ...crop, pct };
              })
              .sort((a, b) => b.pct - a.pct)
              .map((crop, index) => {
                const isTop  = index === 0;
                const color  = crop.pct >= 80 ? '#52b788' : crop.pct >= 60 ? '#ffa726' : '#e63946';
                const label  = crop.pct >= 80 ? '✅ Excellent' : crop.pct >= 60 ? '⚠️ Good' : '❌ Poor';
                return (
                  <details
                    key={crop.key}
                    open={isTop}
                    style={{
                      borderRadius: '14px',
                      border: isTop ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.07)',
                      background: isTop ? 'rgba(82,183,136,0.06)' : 'rgba(255,255,255,0.02)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                  >
                    <summary style={{ listStyle: 'none', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: '12px', userSelect: 'none' }}>
                      <span style={{ fontSize: '1.5rem', minWidth: '32px', textAlign: 'center' }}>{crop.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                          <strong style={{ fontSize: '0.93rem', color: '#fff' }}>
                            {isTop ? '🏆 ' : `#${index + 1} `}{crop.name}
                          </strong>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color, background: `${color}22`, padding: '2px 8px', borderRadius: '20px' }}>
                            {crop.pct}% {label}
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${crop.pct}%`, height: '100%', backgroundColor: color, borderRadius: '10px', transition: 'width 0.6s ease' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '14px', marginTop: '5px', fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                          <span>⏱ {crop.growthPeriod} days</span>
                          <span>📦 {crop.yield}</span>
                        </div>
                      </div>
                    </summary>

                    {/* Step-by-step grow guide */}
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '0.75rem', color: '#52b788', fontWeight: 700, margin: '12px 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📋 How to Grow — Step by Step</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {crop.steps.map((step, i) => (
                          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '9px 12px' }}>
                            <div style={{ minWidth: '22px', height: '22px', borderRadius: '50%', background: 'rgba(82,183,136,0.2)', border: '1px solid rgba(82,183,136,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#52b788', flexShrink: 0 }}>
                              {i + 1}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.55 }}>{step}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => onNavigate('predictor')}
                        style={{ marginTop: '14px', width: '100%', padding: '9px', borderRadius: '10px', background: 'rgba(82,183,136,0.12)', border: '1px solid rgba(82,183,136,0.3)', color: '#52b788', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Sprout size={14} /> Check with Your Soil Values <ArrowRight size={13} />
                      </button>
                    </div>
                  </details>
                );
              })
            }
          </div>
        </div>

      </div>
    </div>
  );
}
