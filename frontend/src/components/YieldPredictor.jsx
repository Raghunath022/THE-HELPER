import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, DollarSign, Sprout, TrendingUp, AlertCircle } from 'lucide-react';

const CROP_BASE_YIELDS = {
  rice: { base: 1.8, phOptimal: 6.5, price: 2450, unit: 'Quintal' },
  maize: { base: 2.2, phOptimal: 6.2, price: 2050, unit: 'Quintal' },
  chickpea: { base: 0.7, phOptimal: 7.0, price: 5200, unit: 'Quintal' },
  cotton: { base: 1.0, phOptimal: 6.8, price: 7100, unit: 'Quintal' },
  sugarcane: { base: 32.0, phOptimal: 6.8, price: 310, unit: 'Quintal' },
  banana: { base: 16.0, phOptimal: 6.5, price: 2200, unit: 'Quintal' },
  grapes: { base: 7.5, phOptimal: 6.5, price: 7000, unit: 'Quintal' },
  coconut: { base: 4.0, phOptimal: 6.0, price: 3200, unit: 'Thousand Nuts' },
  wheat: { base: 1.6, phOptimal: 6.8, price: 2275, unit: 'Quintal' }
};

const STATE_MULTIPLIERS = {
  'Tamil Nadu': { rice: 1.15, coconut: 1.20, sugarcane: 1.10, default: 1.02 },
  'Punjab': { wheat: 1.25, rice: 1.18, default: 1.05 },
  'Haryana': { wheat: 1.20, rice: 1.12, default: 1.03 },
  'Uttar Pradesh': { sugarcane: 1.22, wheat: 1.15, default: 1.00 },
  'Maharashtra': { sugarcane: 1.18, grapes: 1.25, cotton: 1.10, default: 0.99 },
  'Karnataka': { ragi: 1.15, coconut: 1.12, default: 1.01 },
  'Gujarat': { cotton: 1.20, default: 1.00 }
};

export default function YieldPredictor() {
  const { t } = useTranslation();

  const [crop, setCrop] = useState('rice');
  const [area, setArea] = useState(2);
  const [ph, setPh] = useState(6.5);
  const [irrigation, setIrrigation] = useState('canal');
  const [state, setState] = useState('Tamil Nadu');
  const [fertilizerLevel, setFertilizerLevel] = useState(80);

  // Precision Cost Estimator Slider States (Moved from Dashboard)
  const [seedCost, setSeedCost] = useState(2500);
  const [laborCost, setLaborCost] = useState(5000);
  const [irrigationCost, setIrrigationCost] = useState(1500);
  const [fertilizerCost, setFertilizerCost] = useState(3000);

  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    runInference();
  }, [crop, area, ph, irrigation, state, fertilizerLevel, seedCost, laborCost, irrigationCost, fertilizerCost]);

  const runInference = () => {
    const cropData = CROP_BASE_YIELDS[crop] || { base: 1.5, phOptimal: 6.5, price: 2000, unit: 'Quintal' };
    
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
    const x = fertilizerLevel / 100;
    const fertFactor = 0.58 + 0.62 * x - 0.20 * Math.pow(x, 2);

    const yieldPerAcre = cropData.base * phPenalty * irrMult * stateMult * fertFactor;
    const totalYieldTons = yieldPerAcre * parseFloat(area || 0);

    let totalYieldUnits = totalYieldTons * 10;
    if (cropData.unit === 'Thousand Nuts') {
      totalYieldUnits = totalYieldTons * 1.2;
    }

    const revenue = totalYieldUnits * cropData.price;

    // Calibrate cost per acre from the precision slider states
    const costPerAcre = seedCost + laborCost + irrigationCost + fertilizerCost;
    const totalCost = costPerAcre * parseFloat(area || 0);
    const profit = revenue - totalCost;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const roiPercent = totalCost > 0 ? Math.round((profit / totalCost) * 100) : 0;

    setPrediction({
      yieldPerAcre: yieldPerAcre.toFixed(2),
      totalYield: totalYieldTons.toFixed(2),
      revenue: Math.round(revenue),
      cost: Math.round(totalCost),
      profit: Math.round(profit),
      margin: profitMargin.toFixed(1),
      roi: roiPercent,
      unit: cropData.unit,
      phPenalty: Math.round(phPenalty * 100),
      fertFactor: Math.round(fertFactor * 100)
    });
  };

  return (
    <div className="predictor-grid">
      
      {/* Inputs panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Core Yield Inputs Card */}
        <div className="card-glass">
          <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator style={{ color: '#52b788' }} />
            {t('yieldPrediction')}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
            {t('yieldPredictionSub')}
          </p>
    
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Crop Selector */}
            <div>
              <label className="input-label">{t('selectCrop')}</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="input-field"
              >
                {Object.keys(CROP_BASE_YIELDS).map(c => (
                  <option key={c} value={c} style={{ background: '#0a2419' }}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Land Area */}
            <div>
              <label className="input-label">{t('landArea')}</label>
              <input 
                type="number" 
                min="0.5" 
                max="200" 
                step="0.5"
                value={area}
                onChange={(e) => setArea(parseFloat(e.target.value) || '')}
                className="input-field"
                placeholder="e.g. 2 Acres"
              />
            </div>

            {/* Irrigation system */}
            <div>
              <label className="input-label">{t('irrigationType')}</label>
              <select
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value)}
                className="input-field"
              >
                <option value="drip" style={{ background: '#0a2419' }}>{t('irrigationDrip')}</option>
                <option value="sprinkler" style={{ background: '#0a2419' }}>{t('irrigationSprinkler')}</option>
                <option value="canal" style={{ background: '#0a2419' }}>{t('irrigationCanal')}</option>
                <option value="rainfed" style={{ background: '#0a2419' }}>{t('irrigationRainfed')}</option>
              </select>
            </div>

            {/* State selector */}
            <div>
              <label className="input-label">{t('state')}</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="input-field"
              >
                {Object.keys(STATE_MULTIPLIERS).map(s => (
                  <option key={s} value={s} style={{ background: '#0a2419' }}>{s}</option>
                ))}
              </select>
            </div>

            {/* pH level */}
            <div>
              <div className="flex-between" style={{ marginBottom: '6px' }}>
                <span className="input-label" style={{ margin: 0 }}>{t('phValue')}</span>
                <span style={{ color: '#52b788', fontWeight: 700, fontFamily: 'monospace' }}>{ph}</span>
              </div>
              <input 
                type="range" 
                min="4.5" max="8.5" step="0.1"
                value={ph}
                onChange={(e) => setPh(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#52b788', cursor: 'ew-resize' }}
              />
            </div>
    
            {/* Fertilizer level */}
            <div>
              <div className="flex-between" style={{ marginBottom: '6px' }}>
                <span className="input-label" style={{ margin: 0 }}>{t('fertilizerDosageIntensity')}</span>
                <span style={{ color: fertilizerLevel > 110 ? '#ffa726' : '#52b788', fontWeight: 700, fontFamily: 'monospace' }}>
                  {fertilizerLevel}%
                </span>
              </div>
              <input 
                type="range" 
                min="0" max="150" step="5"
                value={fertilizerLevel}
                onChange={(e) => setFertilizerLevel(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#52b788', cursor: 'ew-resize' }}
              />
              <span style={{ fontSize: '9px', color: 'hsl(var(--text-muted))', display: 'block', marginTop: '4px' }}>
                {t('fertilizerLevelMsg')}
              </span>
            </div>
          </div>
        </div>

        {/* Sliders Card removed — moved to standalone view */}
      </div>

      {/* Output Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Prediction HUD */}
        {prediction && (
          <div className="card-glass glow-border">
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sprout size={12} /> {t('mlYieldModel')}
            </span>
            
            <div className="flex-row-resp" style={{ marginTop: '20px', borderBottom: '1px solid rgba(82, 183, 136, 0.12)', paddingBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>{t('predictedYieldHeader')}</span>
                <h1 style={{ fontSize: '2.5rem', color: '#fff', marginTop: '4px' }}>
                  {prediction.totalYield} <span style={{ fontSize: '1.2rem', color: 'hsl(var(--text-secondary))' }}>Tons</span>
                </h1>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>{t('avgYieldAcre')}</span>
                <h3 style={{ fontSize: '1.8rem', color: '#52b788', marginTop: '4px', fontWeight: 800 }}>
                  {prediction.yieldPerAcre} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>T/acre</span>
                </h3>
              </div>
            </div>

            {/* RBF Indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              <div className="flex-between" style={{ fontSize: '0.78rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('phCompatibility')}</span>
                <span style={{ color: prediction.phPenalty > 85 ? '#52b788' : '#ffa726', fontWeight: 600 }}>{prediction.phPenalty}% {t('efficiency')}</span>
              </div>
              <div className="flex-between" style={{ fontSize: '0.78rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('fertMultiplier')}</span>
                <span style={{ color: '#52b788', fontWeight: 600 }}>{prediction.fertFactor}% {t('outputWeight')}</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

