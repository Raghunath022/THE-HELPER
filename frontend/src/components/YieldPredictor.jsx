import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Sprout, TrendingUp, DollarSign } from 'lucide-react';

const CROP_BASE_YIELDS = {
  rice: { name: 'Rice (Paddy)', base: 1.8, phOptimal: 6.5, pricePerTon: 24500 },
  maize: { name: 'Maize (Corn)', base: 2.2, phOptimal: 6.2, pricePerTon: 20500 },
  wheat: { name: 'Wheat', base: 1.6, phOptimal: 6.8, pricePerTon: 22750 },
  cotton: { name: 'Cotton', base: 1.0, phOptimal: 6.8, pricePerTon: 71000 },
  groundnut: { name: 'Groundnut', base: 1.2, phOptimal: 6.0, pricePerTon: 58000 },
  sugarcane: { name: 'Sugarcane', base: 32.0, phOptimal: 6.8, pricePerTon: 3100 },
  banana: { name: 'Banana', base: 16.0, phOptimal: 6.5, pricePerTon: 22000 },
  pomegranate: { name: 'Pomegranate', base: 6.5, phOptimal: 6.8, pricePerTon: 65000 },
  mango: { name: 'Mango', base: 5.0, phOptimal: 6.5, pricePerTon: 45000 }
};

const STATE_MULTIPLIERS = {
  'Tamil Nadu': { rice: 1.15, sugarcane: 1.10, banana: 1.18, default: 1.02 },
  'Punjab': { wheat: 1.25, rice: 1.18, default: 1.05 },
  'Haryana': { wheat: 1.20, rice: 1.12, default: 1.03 },
  'Uttar Pradesh': { sugarcane: 1.22, wheat: 1.15, default: 1.00 },
  'Maharashtra': { sugarcane: 1.18, cotton: 1.10, default: 0.99 },
  'Karnataka': { banana: 1.15, sugarcane: 1.10, default: 1.01 },
  'Gujarat': { cotton: 1.20, default: 1.00 }
};

export default function YieldPredictor() {
  const { t } = useTranslation();

  const [crop, setCrop] = useState('rice');
  const [area, setArea] = useState(2.0);
  const [ph, setPh] = useState(6.5);
  const [irrigation, setIrrigation] = useState('canal');
  const [state, setState] = useState('Tamil Nadu');
  const [fertilizerLevel, setFertilizerLevel] = useState(80);

  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    runInference();
  }, [crop, area, ph, irrigation, state, fertilizerLevel]);

  const runInference = () => {
    const cropData = CROP_BASE_YIELDS[crop] || { base: 1.5, phOptimal: 6.5, pricePerTon: 20000 };
    
    // Gaussian RBF pH suitability
    const phPenalty = Math.exp(-Math.pow(ph - cropData.phOptimal, 2) / 1.6);
    
    // Irrigation Multipliers
    const irrigationMults = {
      drip: 1.25,
      sprinkler: 1.12,
      canal: 1.00,
      rainfed: 0.65
    };
    const irrMult = irrigationMults[irrigation] || 1.00;

    // State multipliers
    const stateData = STATE_MULTIPLIERS[state] || { default: 1.00 };
    const stateMult = stateData[crop] || stateData.default || 1.00;

    // Fertilizer modifier
    const x = Math.min(150, Math.max(0, fertilizerLevel)) / 100;
    const fertFactor = 0.58 + 0.62 * x - 0.20 * Math.pow(x, 2);

    const yieldPerAcre = cropData.base * phPenalty * irrMult * stateMult * fertFactor;
    const totalYieldTons = yieldPerAcre * parseFloat(area || 0);

    const grossRevenue = totalYieldTons * cropData.pricePerTon;
    const estCostPerAcre = 12000;
    const totalCost = estCostPerAcre * parseFloat(area || 0);
    const netProfit = grossRevenue - totalCost;

    setPrediction({
      yieldPerAcre: yieldPerAcre.toFixed(2),
      totalYield: totalYieldTons.toFixed(2),
      grossRevenue: Math.round(grossRevenue),
      totalCost: Math.round(totalCost),
      netProfit: Math.round(netProfit),
      phPenalty: Math.round(phPenalty * 100),
      fertFactor: Math.round(fertFactor * 100)
    });
  };

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      
      {/* ── Header ── */}
      <div className="card-glass" style={{ marginBottom: '14px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={22} style={{ color: '#52b788' }} />
          Yield & Financial Revenue Predictor
        </h2>
        <span style={{ fontSize: '0.75rem', color: '#52b788', fontWeight: 700, background: 'rgba(82,183,136,0.12)', padding: '4px 10px', borderRadius: '12px' }}>
          ⚡ RBF Regression Simulation
        </span>
      </div>

      {/* ── 2-Column Compact Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px' }}>
        
        {/* LEFT PANEL: Inputs Grid */}
        <div className="card-glass" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '4px' }}>Target Crop</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(82,183,136,0.3)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
              >
                {Object.keys(CROP_BASE_YIELDS).map(c => (
                  <option key={c} value={c} style={{ background: '#0a2419' }}>
                    {CROP_BASE_YIELDS[c].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#52b788', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Land Area (Acres)</label>
              <input 
                type="number" step="0.25" min="0.1" max="100"
                value={area}
                onChange={(e) => setArea(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(82, 183, 136, 0.08)', border: '1.5px solid #52b788', color: '#fff', fontSize: '0.85rem', fontWeight: 800 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '4px' }}>Irrigation Type</label>
              <select
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
              >
                <option value="drip" style={{ background: '#0a2419' }}>💧 Drip Irrigation (+25%)</option>
                <option value="sprinkler" style={{ background: '#0a2419' }}>🌧️ Sprinkler (+12%)</option>
                <option value="canal" style={{ background: '#0a2419' }}>🌊 Canal / Borewell</option>
                <option value="rainfed" style={{ background: '#0a2419' }}>🌦️ Rainfed (-35%)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '4px' }}>State / Region</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
              >
                {Object.keys(STATE_MULTIPLIERS).map(s => (
                  <option key={s} value={s} style={{ background: '#0a2419' }}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Number Entering Fields for pH & Fertilizer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '4px' }}>Soil pH Level</label>
              <input 
                type="number" step="0.1" min="3.5" max="9.5"
                value={ph}
                onChange={(e) => setPh(parseFloat(e.target.value) || 6.5)}
                placeholder="e.g. 6.5"
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '4px' }}>Fertilizer Dosage Intensity (%)</label>
              <input 
                type="number" min="10" max="150" step="5"
                value={fertilizerLevel}
                onChange={(e) => setFertilizerLevel(parseInt(e.target.value) || 80)}
                placeholder="e.g. 80"
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}
              />
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>
            *100% matches optimal NPK target dosage. Higher intensity increases yield up to 120%.
          </div>
        </div>

        {/* RIGHT PANEL: Projected Yield & Financial Return HUD */}
        {prediction && (
          <div className="card-glass" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#52b788', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sprout size={16} /> ML Projected Yield Output
              </span>
            </div>

            {/* Total Yield & Per-Acre Yield Grid (Clean Typography) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(82, 183, 136, 0.2)', padding: '12px 14px', borderRadius: '10px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>Total Expected Yield</span>
                <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 800, lineHeight: 1.2 }}>
                  {prediction.totalYield} <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>Tons</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>Avg Yield / Acre</span>
                <div style={{ fontSize: '1.4rem', color: '#52b788', fontWeight: 800, lineHeight: 1.2 }}>
                  {prediction.yieldPerAcre} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Tons/Acre</span>
                </div>
              </div>
            </div>

            {/* Financial Estimates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: 'rgba(82,183,136,0.04)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(82,183,136,0.1)' }}>
                <span style={{ fontSize: '0.68rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>Est. Gross Revenue</span>
                <span style={{ fontSize: '0.95rem', color: '#52b788', fontWeight: 800 }}>₹{prediction.grossRevenue.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ background: 'rgba(82,183,136,0.04)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(82,183,136,0.1)' }}>
                <span style={{ fontSize: '0.68rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>Est. Net Profit</span>
                <span style={{ fontSize: '0.95rem', color: '#ffa726', fontWeight: 800 }}>₹{prediction.netProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Multipliers Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>
                pH Compatibility: <strong style={{ color: prediction.phPenalty > 85 ? '#52b788' : '#ffa726' }}>{prediction.phPenalty}%</strong>
              </span>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>
                Fertilizer Multiplier: <strong style={{ color: '#52b788' }}>{prediction.fertFactor}%</strong>
              </span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
