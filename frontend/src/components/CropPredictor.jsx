import React, { useState } from 'react';
import { 
  Sprout, FlaskConical, CheckCircle2, RefreshCw, Sparkles,
  Cpu, Zap, BookOpen
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Crop Database with NPK, pH, Climate optimal datasets & growing steps
const CROP_DATABASE = {
  maize: { 
    name: 'Maize (Corn)', emoji: '🌽',
    N: { min: 60, max: 120, optimal: 90 },
    P: { min: 30, max: 60, optimal: 45 },
    K: { min: 30, max: 55, optimal: 40 },
    ph: { min: 6.0, max: 7.0, optimal: 6.5 }, 
    temperature: { min: 18, max: 30, optimal: 24 }, 
    rainfall: { min: 500, max: 1200, optimal: 800 },
    growthPeriod: 110, yield: '4–12 tons/ha',
    steps: [
      '🌱 Sow 2 seeds per hole, 3 cm deep. Row 60 cm × plant 30 cm.',
      '💧 Water every 10–12 days. Never let it dry at tasseling or silking stage.',
      '🌿 Apply nitrogen fertilizer in 3 splits. Weed at 20 and 40 days.',
      '🌽 Harvest when husks brown and kernels are hard (day 100–115).'
    ]
  },
  rice: { 
    name: 'Rice (Paddy)', emoji: '🌾',
    N: { min: 80, max: 140, optimal: 115 },
    P: { min: 35, max: 60, optimal: 48 },
    K: { min: 30, max: 50, optimal: 40 },
    ph: { min: 5.5, max: 7.0, optimal: 6.0 }, 
    temperature: { min: 20, max: 35, optimal: 25 }, 
    rainfall: { min: 1000, max: 2000, optimal: 1400 },
    growthPeriod: 120, yield: '3–8 tons/ha',
    steps: [
      '🌱 Soak seeds 24hrs, sow in nursery. Transplant 25-day seedlings.',
      '💧 Keep 5–10 cm water throughout growing season. Drain 2 weeks before harvest.',
      '🌿 Apply urea 3 times: at planting, 30 days, and 60 days.',
      '🌾 Harvest when grains turn golden-yellow (around day 110–120).'
    ]
  },
  cotton: { 
    name: 'Cotton', emoji: '🌿',
    N: { min: 95, max: 140, optimal: 120 },
    P: { min: 40, max: 65, optimal: 50 },
    K: { min: 35, max: 55, optimal: 45 },
    ph: { min: 6.0, max: 7.8, optimal: 6.8 }, 
    temperature: { min: 22, max: 34, optimal: 28 }, 
    rainfall: { min: 500, max: 1000, optimal: 750 },
    growthPeriod: 150, yield: '1.5–3.5 tons/ha',
    steps: [
      '🌱 Deep plough twice. Sow seeds 3–4 cm deep (row 90 cm × 60 cm).',
      '💧 Water every 15 days. Ensure furrow drainage — avoid waterlogging.',
      '🌿 Apply phosphorus at sowing. Add N & K at 45 and 90 days.',
      '🌿 Hand-pick open white bolls every 5–7 days from day 140 onward.'
    ]
  },
  wheat: { 
    name: 'Wheat', emoji: '🌾',
    N: { min: 90, max: 140, optimal: 120 },
    P: { min: 40, max: 70, optimal: 55 },
    K: { min: 35, max: 60, optimal: 45 },
    ph: { min: 6.0, max: 7.5, optimal: 6.8 }, 
    temperature: { min: 14, max: 25, optimal: 19 }, 
    rainfall: { min: 350, max: 700, optimal: 500 },
    growthPeriod: 90, yield: '2–6 tons/ha',
    steps: [
      '🌱 Sow seeds 5 cm deep in rows 20 cm apart (October–November).',
      '💧 Water 6 times: sowing, crown root, tillering, jointing, flowering, grain filling.',
      '🌿 Apply DAP at sowing + urea top-dress at 3 and 6 weeks.',
      '🌾 Harvest when straw yellows and grain is hard (day 85–95).'
    ]
  },
  groundnut: { 
    name: 'Groundnut', emoji: '🥜',
    N: { min: 15, max: 40, optimal: 25 },
    P: { min: 40, max: 70, optimal: 55 },
    K: { min: 30, max: 60, optimal: 45 },
    ph: { min: 5.5, max: 6.5, optimal: 6.0 }, 
    temperature: { min: 20, max: 32, optimal: 26 }, 
    rainfall: { min: 450, max: 950, optimal: 650 },
    growthPeriod: 120, yield: '1.5–3 tons/ha',
    steps: [
      '🌱 Sow seeds 5 cm deep in sandy-loam soil. Rows 30 cm × 10 cm.',
      '💧 Water every 10 days. Extra at flowering (day 30) & pegging (day 45–60).',
      '🌿 Apply gypsum at flowering to fill pods. Weed at 20 and 40 days.',
      '🥜 Harvest when leaves turn yellow (day 115–125). Dry in shade.'
    ]
  },
  banana: { 
    name: 'Banana', emoji: '🍌',
    N: { min: 85, max: 130, optimal: 110 },
    P: { min: 60, max: 95, optimal: 78 },
    K: { min: 45, max: 80, optimal: 65 },
    ph: { min: 5.5, max: 7.0, optimal: 6.3 }, 
    temperature: { min: 22, max: 35, optimal: 27 }, 
    rainfall: { min: 1000, max: 2200, optimal: 1500 },
    growthPeriod: 300, yield: '30–50 tons/ha',
    steps: [
      '🌱 Dig 45×45×45 cm pits. Plant tissue-culture suckers with 1.8 m × 1.8 m spacing.',
      '💧 Drip irrigation daily. Bananas require consistent moisture.',
      '🌿 Apply heavy potassium and nitrogen doses every 2 months.',
      '🍌 Harvest bunches when fingers fill out and angles disappear.'
    ]
  },
  pomegranate: { 
    name: 'Pomegranate', emoji: '🍎',
    N: { min: 15, max: 50, optimal: 30 },
    P: { min: 10, max: 35, optimal: 20 },
    K: { min: 30, max: 60, optimal: 45 },
    ph: { min: 5.5, max: 7.8, optimal: 6.8 }, 
    temperature: { min: 24, max: 38, optimal: 30 }, 
    rainfall: { min: 400, max: 800, optimal: 550 },
    growthPeriod: 240, yield: '12–20 tons/ha',
    steps: [
      '🌱 Dig 60×60×60 cm pits. Plant cuttings 4.5 m × 3 m apart. Mix FYM.',
      '💧 Drip irrigation: 20–30 L/plant/day in summer.',
      '🌿 Prune to single stem in year 1. Apply NPK every 4 months.',
      '🍎 Harvest when skin turns dark red and tapping sounds metallic.'
    ]
  },
  mango: { 
    name: 'Mango', emoji: '🥭',
    N: { min: 20, max: 60, optimal: 35 },
    P: { min: 15, max: 45, optimal: 30 },
    K: { min: 25, max: 55, optimal: 40 },
    ph: { min: 5.5, max: 7.5, optimal: 6.5 }, 
    temperature: { min: 24, max: 36, optimal: 28 }, 
    rainfall: { min: 750, max: 2500, optimal: 1400 },
    growthPeriod: 365, yield: '8–22 tons/ha',
    steps: [
      '🌱 Dig 1m×1m×1m pits. Plant grafted saplings 10 m apart.',
      '💧 Water every 3 days for 2 years. Mature trees water at fruit stage.',
      '🌿 Apply NPK twice/year (June & Oct). Prune dead branches.',
      '🥭 Harvest April–June when fruit color changes.'
    ]
  },
  watermelon: { 
    name: 'Watermelon', emoji: '🍉',
    N: { min: 70, max: 120, optimal: 95 },
    P: { min: 10, max: 30, optimal: 20 },
    K: { min: 40, max: 65, optimal: 50 },
    ph: { min: 6.0, max: 7.0, optimal: 6.5 }, 
    temperature: { min: 24, max: 34, optimal: 28 }, 
    rainfall: { min: 400, max: 700, optimal: 500 },
    growthPeriod: 85, yield: '25–45 tons/ha',
    steps: [
      '🌱 Sow seeds 2–3 cm deep in sandy loam soil on raised ridges.',
      '💧 Water every 4–5 days. Stop watering 1 week before harvest to increase sweetness.',
      '🌿 Apply N at vine growth, K at fruit development stage.',
      '🍉 Harvest when tendril nearest to fruit dries up and belly turns yellow.'
    ]
  }
};

function calculateSuitabilityScore(cropKey, inputs) {
  const crop = CROP_DATABASE[cropKey];
  if (!crop) return 50;

  // Nitrogen score
  const userN = parseFloat(inputs.N) || 80;
  const nDiff = Math.abs(userN - crop.N.optimal);
  const nScore = Math.max(0, 100 - (nDiff / crop.N.optimal) * 80);

  // Phosphorus score
  const userP = parseFloat(inputs.P) || 40;
  const pDiff = Math.abs(userP - crop.P.optimal);
  const pScore = Math.max(0, 100 - (pDiff / crop.P.optimal) * 80);

  // Potassium score
  const userK = parseFloat(inputs.K) || 40;
  const kDiff = Math.abs(userK - crop.K.optimal);
  const kScore = Math.max(0, 100 - (kDiff / crop.K.optimal) * 80);

  // pH Score
  const userPh = parseFloat(inputs.ph) || 6.5;
  const phDiff = Math.abs(userPh - crop.ph.optimal);
  const phScore = Math.max(0, 100 - phDiff * 45);

  // Temperature Score
  const userTemp = parseFloat(inputs.temperature) || 25;
  const tempDiff = Math.abs(userTemp - crop.temperature.optimal);
  const tempScore = Math.max(0, 100 - tempDiff * 8);

  // Rainfall Score
  const userRain = parseFloat(inputs.rainfall) || 120;
  let rainScore = 100;
  if (userRain < crop.rainfall.min || userRain > crop.rainfall.max) {
    const diff = Math.abs(userRain - crop.rainfall.optimal);
    rainScore = Math.max(0, 100 - (diff / crop.rainfall.optimal) * 70);
  }

  // Multi-factor weighted score formula
  const totalScore = (nScore * 0.22) + (pScore * 0.16) + (kScore * 0.16) + (phScore * 0.18) + (tempScore * 0.14) + (rainScore * 0.14);

  return Math.min(99, Math.max(25, Math.round(totalScore)));
}

export default function CropPredictor({ user, token, backendUrl }) {
  const { t } = useTranslation();

  // Mode state: 'probe' (Hardware Probe) vs 'manual' (Manual Soil Data Entry)
  const [inputMode, setInputMode] = useState('probe');

  // Form soil values
  const [formData, setFormData] = useState({
    N: '90',
    P: '45',
    K: '40',
    ph: '6.5',
    temperature: '25.0',
    humidity: '70.0',
    rainfall: '125.0'
  });

  const [isProbeSyncing, setIsProbeSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(null);

  // Auto-calculate default probe matches on load
  React.useEffect(() => {
    computeMatches(formData);
  }, []);

  // Handle value change & live dynamic recalculation
  const handleInputChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    computeMatches(updated);
  };

  // Handle probe reading sync
  const handleProbeSync = async () => {
    setIsProbeSyncing(true);

    await new Promise(res => setTimeout(res, 600));

    const simulatedProbeData = {
      N: Math.floor(75 + Math.random() * 40).toString(),
      P: Math.floor(35 + Math.random() * 25).toString(),
      K: Math.floor(35 + Math.random() * 30).toString(),
      ph: (6.2 + Math.random() * 0.6).toFixed(1),
      temperature: (23 + Math.random() * 6).toFixed(1),
      humidity: Math.floor(65 + Math.random() * 20).toString(),
      rainfall: Math.floor(110 + Math.random() * 60).toString()
    };

    setFormData(simulatedProbeData);
    setIsProbeSyncing(false);
    computeMatches(simulatedProbeData);
  };

  const computeMatches = (data) => {
    setLoading(true);
    setTimeout(() => {
      const calculated = Object.keys(CROP_DATABASE).map(key => {
        const crop = CROP_DATABASE[key];
        const score = calculateSuitabilityScore(key, data);
        return { key, ...crop, matchPercentage: score };
      }).sort((a, b) => b.matchPercentage - a.matchPercentage);

      setMatches(calculated);
      setLoading(false);
    }, 150);
  };

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      
      {/* ── Friendly Clean Header ── */}
      <div className="card-glass" style={{ marginBottom: '20px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <h1 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sprout size={26} style={{ color: '#52b788' }} />
          Crop Advisor
        </h1>

        {/* ── Mode Selection Tabs ── */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setInputMode('probe')}
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: inputMode === 'probe' ? '2px solid #52b788' : '1px solid rgba(255,255,255,0.1)',
              background: inputMode === 'probe' ? 'rgba(82, 183, 136, 0.18)' : 'rgba(255,255,255,0.03)',
              color: inputMode === 'probe' ? '#52b788' : '#fff',
              transition: 'all 0.2s ease'
            }}
          >
            <Cpu size={16} />
            Hardware Soil Probe
          </button>

          <button
            onClick={() => setInputMode('manual')}
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: inputMode === 'manual' ? '2px solid #52b788' : '1px solid rgba(255,255,255,0.1)',
              background: inputMode === 'manual' ? 'rgba(82, 183, 136, 0.18)' : 'rgba(255,255,255,0.03)',
              color: inputMode === 'manual' ? '#52b788' : '#fff',
              transition: 'all 0.2s ease'
            }}
          >
            <FlaskConical size={16} />
            Manual Soil Entry
          </button>
        </div>
      </div>

      {/* ── MODE A: Hardware Probe (Live Telemetry Strip) ── */}
      {inputMode === 'probe' && (
        <div className="card-glass" style={{ marginBottom: '20px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: '#52b788', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#52b788' }} />
              Probe Live Readings:
            </span>
            <span style={{ fontSize: '0.78rem', color: '#fff', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '6px' }}>
              N: <strong>{formData.N} ppm</strong>
            </span>
            <span style={{ fontSize: '0.78rem', color: '#fff', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '6px' }}>
              P: <strong>{formData.P} ppm</strong>
            </span>
            <span style={{ fontSize: '0.78rem', color: '#fff', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '6px' }}>
              K: <strong>{formData.K} ppm</strong>
            </span>
            <span style={{ fontSize: '0.78rem', color: '#fff', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '6px' }}>
              pH: <strong>{formData.ph}</strong>
            </span>
            <span style={{ fontSize: '0.78rem', color: '#fff', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '6px' }}>
              Temp: <strong>{formData.temperature}°C</strong>
            </span>
          </div>

          <button
            onClick={handleProbeSync}
            disabled={isProbeSyncing}
            style={{
              padding: '8px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#52b788',
              background: 'rgba(82, 183, 136, 0.12)',
              border: '1px solid rgba(82, 183, 136, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={14} className={isProbeSyncing ? "animate-spin" : ""} />
            {isProbeSyncing ? 'Scanning...' : 'Re-scan Probe'}
          </button>
        </div>
      )}

      {/* ── MODE B: Manual Soil Entry & Dynamic Inputs ── */}
      {inputMode === 'manual' && (
        <div className="card-glass" style={{ marginBottom: '28px', padding: '24px' }}>
          
          {/* Quick 1-Tap Soil Presets */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} style={{ color: '#ffa726' }} />
              Quick Soil Presets (1-Tap Fill)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <button
                type="button"
                style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => {
                  const data = { N: '90', P: '45', K: '40', ph: '6.2', temperature: '24.2', humidity: '75', rainfall: '145' };
                  setFormData(data);
                  computeMatches(data);
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>🌾 Loamy Alluvial</div>
                <div style={{ fontSize: '0.68rem', color: 'hsl(var(--text-muted))' }}>High NPK — Wheat & Maize</div>
              </button>

              <button
                type="button"
                style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => {
                  const data = { N: '115', P: '48', K: '40', ph: '5.8', temperature: '28.0', humidity: '85', rainfall: '215' };
                  setFormData(data);
                  computeMatches(data);
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>💧 Clayey Paddy</div>
                <div style={{ fontSize: '0.68rem', color: 'hsl(var(--text-muted))' }}>High N & Water — Paddy Rice</div>
              </button>

              <button
                type="button"
                style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => {
                  const data = { N: '25', P: '55', K: '45', ph: '6.0', temperature: '26.0', humidity: '55', rainfall: '98' };
                  setFormData(data);
                  computeMatches(data);
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>🥜 Legume / Groundnut</div>
                <div style={{ fontSize: '0.68rem', color: 'hsl(var(--text-muted))' }}>Low N, High P — Groundnuts</div>
              </button>

              <button
                type="button"
                style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => {
                  const data = { N: '110', P: '78', K: '65', ph: '6.3', temperature: '27.0', humidity: '80', rainfall: '180' };
                  setFormData(data);
                  computeMatches(data);
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>🍌 High Potash Soil</div>
                <div style={{ fontSize: '0.68rem', color: 'hsl(var(--text-muted))' }}>High P & K — Banana</div>
              </button>
            </div>
          </div>

          {/* Direct Number Entering Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '6px' }}>
                Nitrogen (N in ppm)
              </label>
              <input 
                type="number" 
                min="0" 
                max="300"
                value={formData.N} 
                onChange={(e) => handleInputChange('N', e.target.value)} 
                placeholder="e.g. 90"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(82, 183, 136, 0.3)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '6px' }}>
                Phosphorus (P in ppm)
              </label>
              <input 
                type="number" 
                min="0" 
                max="200"
                value={formData.P} 
                onChange={(e) => handleInputChange('P', e.target.value)} 
                placeholder="e.g. 45"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(82, 183, 136, 0.3)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '6px' }}>
                Potassium (K in ppm)
              </label>
              <input 
                type="number" 
                min="0" 
                max="200"
                value={formData.K} 
                onChange={(e) => handleInputChange('K', e.target.value)} 
                placeholder="e.g. 40"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(82, 183, 136, 0.3)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '6px' }}>
                Soil pH Level (0 - 14)
              </label>
              <input 
                type="number" 
                step="0.1" 
                min="3" 
                max="10"
                value={formData.ph} 
                onChange={(e) => handleInputChange('ph', e.target.value)} 
                placeholder="e.g. 6.5"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(82, 183, 136, 0.3)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── DYNAMIC CROP MATCH RESULTS ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <RefreshCw size={28} className="animate-spin" style={{ color: '#52b788', marginInline: 'auto' }} />
          <p style={{ color: '#fff', fontSize: '0.85rem', marginTop: '8px' }}>Recalculating crop suitability matches...</p>
        </div>
      )}

      {matches && !loading && (
        <div>
          <h2 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} style={{ color: '#52b788' }} />
            Matched Crops (Ranked by Suitability)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {matches.map((crop, idx) => {
              const isTop = idx === 0;
              const color = crop.matchPercentage >= 80 ? '#52b788' : crop.matchPercentage >= 65 ? '#ffa726' : '#e63946';

              return (
                <details
                  key={crop.key}
                  open={isTop}
                  style={{
                    borderRadius: '14px',
                    border: isTop ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
                    background: isTop ? 'rgba(82,183,136,0.06)' : 'rgba(255,255,255,0.02)',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                >
                  <summary style={{ listStyle: 'none', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', userSelect: 'none' }}>
                    <span style={{ fontSize: '1.8rem', minWidth: '36px', textAlign: 'center' }}>{crop.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <strong style={{ fontSize: '1rem', color: '#fff' }}>
                          {isTop ? '🏆 ' : `#${idx + 1} `}{crop.name}
                        </strong>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color, background: `${color}22`, padding: '4px 12px', borderRadius: '20px' }}>
                          {crop.matchPercentage}% Confident Match
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '7px', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${crop.matchPercentage}%`, height: '100%', backgroundColor: color, transition: 'width 0.4s ease' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                        <span>⏱ Growth: {crop.growthPeriod} days</span>
                        <span>📦 Yield: {crop.yield}</span>
                      </div>
                    </div>
                  </summary>

                  {/* Step-by-Step Grow Guide */}
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize: '0.78rem', color: '#52b788', fontWeight: 700, margin: '14px 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={14} /> How to Grow — Step by Step
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {crop.steps.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px' }}>
                          <div style={{ minWidth: '22px', height: '22px', borderRadius: '50%', background: 'rgba(82,183,136,0.2)', border: '1px solid rgba(82,183,136,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#52b788', flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
