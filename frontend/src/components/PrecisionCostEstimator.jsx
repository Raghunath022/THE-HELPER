import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign } from 'lucide-react';

export default function PrecisionCostEstimator() {
  const { t } = useTranslation();
  const [crop, setCrop] = useState('Tomato');
  const [acres, setAcres] = useState(2);
  const [seedCost, setSeedCost] = useState(2500);
  const [laborCost, setLaborCost] = useState(5000);
  const [irrigationCost, setIrrigationCost] = useState(1500);
  const [fertilizerCost, setFertilizerCost] = useState(3000);

  const totalCost = (seedCost + laborCost + irrigationCost + fertilizerCost) * acres;
  
  const yieldMultiplier = crop === 'Paddy' ? 2.2
    : crop === 'Tomato' ? 8.5
    : crop === 'Potato' ? 9.0
    : crop === 'Wheat' ? 1.8
    : 3.2; // Maize/Others
    
  const priceMultiplier = crop === 'Paddy' ? 22000
    : crop === 'Tomato' ? 18000
    : crop === 'Potato' ? 15000
    : crop === 'Wheat' ? 24000
    : 19500;

  const expectedYieldTons = (yieldMultiplier * acres).toFixed(1);
  const expectedRevenue = expectedYieldTons * priceMultiplier;
  const expectedNetProfit = expectedRevenue - totalCost;
  const roiPercent = totalCost > 0 ? Math.round((expectedNetProfit / totalCost) * 100) : 0;

  const handleReset = () => {
    setCrop('Tomato');
    setAcres(2);
    setSeedCost(2500);
    setLaborCost(5000);
    setIrrigationCost(1500);
    setFertilizerCost(3000);
  };

  const translateCrop = (cropName) => {
    const map = {
      'Tomato': t('tomato', 'Tomato'),
      'Potato': t('potato', 'Potato'),
      'Paddy': t('paddy', t('rice', 'Paddy')),
      'Wheat': t('wheat', 'Wheat'),
      'Maize': t('maize', 'Maize')
    };
    return map[cropName] || cropName;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div className="card-glass" style={{ borderLeft: '4px solid #ffa726', padding: '16px 24px' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
          {t('pceTitle', 'Precision Cost & Profit Estimator')}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '4px', margin: 0 }}>
          {t('pceSubtitle', 'Calibrate seed, labor, irrigation, and pesticide budgets to project expected revenues and ROI.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '24px' }}>
        
        {/* Left Column: Sliders Input */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} style={{ color: '#ffa726' }} />
              {t('pceHeader', 'Production Cost Parameters')}
            </h3>
            <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.7rem' }} onClick={handleReset}>
              {t('pceReset', 'Reset Sliders')}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Target Crop */}
            <div>
              <label className="input-label">{t('pceSelectCrop', 'Select Crop')}</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="input-field"
              >
                <option value="Tomato">{translateCrop('Tomato')}</option>
                <option value="Potato">{translateCrop('Potato')}</option>
                <option value="Paddy">{translateCrop('Paddy')}</option>
                <option value="Wheat">{translateCrop('Wheat')}</option>
                <option value="Maize">{translateCrop('Maize')}</option>
              </select>
            </div>

            {/* Acres */}
            <div className="profit-slider-row" style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('pceArea', 'Cultivated Area')}</span>
                <strong style={{ color: '#52b788' }}>{acres} {t('acres', 'Acres')}</strong>
              </div>
              <input 
                type="range" min="1" max="50" step="1" 
                value={acres} onChange={(e) => setAcres(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#52b788', cursor: 'ew-resize' }}
              />
            </div>

            {/* Seed Cost */}
            <div className="profit-slider-row" style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('pceSeedCost', 'Seed Cost (per acre)')}</span>
                <strong style={{ color: '#fff' }}>₹{seedCost.toLocaleString('en-IN')}</strong>
              </div>
              <input 
                type="range" min="500" max="10000" step="100" 
                value={seedCost} onChange={(e) => setSeedCost(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ffa726', cursor: 'ew-resize' }}
              />
            </div>

            {/* Labor Cost */}
            <div className="profit-slider-row" style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('pceLaborCost', 'Labor Cost (per acre)')}</span>
                <strong style={{ color: '#fff' }}>₹{laborCost.toLocaleString('en-IN')}</strong>
              </div>
              <input 
                type="range" min="1000" max="15000" step="250" 
                value={laborCost} onChange={(e) => setLaborCost(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ffa726', cursor: 'ew-resize' }}
              />
            </div>

            {/* Irrigation Cost */}
            <div className="profit-slider-row" style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('pceIrrigationCost', 'Irrigation & Water (per acre)')}</span>
                <strong style={{ color: '#fff' }}>₹{irrigationCost.toLocaleString('en-IN')}</strong>
              </div>
              <input 
                type="range" min="200" max="8000" step="100" 
                value={irrigationCost} onChange={(e) => setIrrigationCost(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ffa726', cursor: 'ew-resize' }}
              />
            </div>

            {/* Fertilizer Cost */}
            <div className="profit-slider-row" style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('pceFertilizerCost', 'Fertilizers & Pesticides (per acre)')}</span>
                <strong style={{ color: '#fff' }}>₹{fertilizerCost.toLocaleString('en-IN')}</strong>
              </div>
              <input 
                type="range" min="500" max="12000" step="100" 
                value={fertilizerCost} onChange={(e) => setFertilizerCost(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ffa726', cursor: 'ew-resize' }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Statements Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card-glass glow-border" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span className="badge badge-emerald" style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: '0.75rem' }}>
              {t('pceStatement', 'PROFIT STATEMENT')}
            </span>
            
            <div style={{ borderBottom: '1px solid rgba(82, 183, 136, 0.12)', paddingBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>{t('pceNetProfit', 'Expected Net Profit')}</span>
              <h1 style={{ fontSize: '2.5rem', color: expectedNetProfit > 0 ? '#52b788' : '#ff5252', marginTop: '6px', fontWeight: 900, margin: 0 }}>
                {expectedNetProfit < 0 ? '-' : ''}₹{Math.abs(expectedNetProfit).toLocaleString('en-IN')}
              </h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('pceTotalCost', 'Total Cultivation Cost')}</span>
                <span style={{ color: '#ffa726', fontWeight: 700 }}>₹{totalCost.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('pceYield', 'Projected Yield')}</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{expectedYieldTons} {t('unit_tons', 'Tons')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('pceRoi', 'ROI Rate')}</span>
                <span style={{ 
                  backgroundColor: expectedNetProfit > 0 ? 'rgba(82, 183, 136, 0.15)' : 'rgba(255, 82, 82, 0.15)',
                  color: expectedNetProfit > 0 ? '#52b788' : '#ff5252', 
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.78rem'
                }}>
                  {expectedNetProfit > 0 ? '+' : ''}{roiPercent}% {t('pceRoiText', 'ROI')}
                </span>
              </div>
            </div>

            {/* Impact Display Grid */}
            <div style={{ borderTop: '1px solid rgba(82, 183, 136, 0.15)', paddingTop: '16px', marginTop: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(82, 183, 136, 0.05)', border: '1px solid rgba(82, 183, 136, 0.12)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#52b788' }}>+28%</div>
                  <div style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>{t('pceYieldGain', 'Yield Gain')}</div>
                </div>
                <div style={{ background: 'rgba(82, 183, 136, 0.05)', border: '1px solid rgba(82, 183, 136, 0.12)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#52b788' }}>-18%</div>
                  <div style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>{t('pceWaterSaved', 'Water Saved')}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', lineHeight: 1.4, color: 'hsl(var(--text-secondary))' }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>💡 {t('pceTipTitle', 'Maximizing Return on Investment:')}</span>
            <span>{t('pceTipDesc', 'Selecting precision sowing windows and matching organic manure doses reduces fertilizer expense by 12% while defending crops against high evaporation rates.')}</span>
          </div>

        </div>

      </div>

    </div>
  );
}
