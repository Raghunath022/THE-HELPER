import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FlaskConical, AlertTriangle, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';

const CROP_NUTRIENT_TARGETS = {
  rice: { N: 80, P: 40, K: 40, phMin: 6.0, phMax: 7.0 },
  maize: { N: 100, P: 50, K: 30, phMin: 5.8, phMax: 7.2 },
  chickpea: { N: 20, P: 50, K: 20, phMin: 6.0, phMax: 8.0 },
  cotton: { N: 120, P: 60, K: 40, phMin: 6.0, phMax: 7.5 },
  sugarcane: { N: 150, P: 80, K: 80, phMin: 6.0, phMax: 7.5 },
  banana: { N: 110, P: 90, K: 120, phMin: 5.5, phMax: 7.5 },
  grapes: { N: 60, P: 80, K: 140, phMin: 6.0, phMax: 7.0 },
  coconut: { N: 50, P: 40, K: 110, phMin: 5.2, phMax: 7.0 },
  wheat: { N: 90, P: 50, K: 40, phMin: 6.0, phMax: 7.5 }
};

const DEFAULT_TARGETS = { N: 60, P: 40, K: 40, phMin: 6.0, phMax: 7.5 };

export default function FertilizerAdvisor() {
  const { t } = useTranslation();
  
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [currentN, setCurrentN] = useState(40);
  const [currentP, setCurrentP] = useState(30);
  const [currentK, setCurrentK] = useState(25);
  const [currentPh, setCurrentPh] = useState(6.2);
  
  const [target, setTarget] = useState(DEFAULT_TARGETS);
  const [deficits, setDeficits] = useState({ N: 0, P: 0, K: 0 });
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const cropTarget = CROP_NUTRIENT_TARGETS[selectedCrop] || DEFAULT_TARGETS;
    setTarget(cropTarget);
  }, [selectedCrop]);

  useEffect(() => {
    const defN = Math.max(0, target.N - currentN);
    const defP = Math.max(0, target.P - currentP);
    const defK = Math.max(0, target.K - currentK);
    setDeficits({ N: defN, P: defP, K: defK });

    // Calculate Fertilizer dosages
    // 1 kg Nitrogen deficit = 2.17 kg Urea (46% N)
    // 1 kg Phosphorus deficit = 6.25 kg Single Superphosphate (SSP 16% P)
    // 1 kg Potassium deficit = 1.67 kg Muriate of Potash (MOP 60% K)
    const list = [];
    
    if (defN > 0) {
      list.push({
        fertilizer: t('ureaNeeded'),
        dosage: `${(defN * 2.17).toFixed(1)} kg/hectare`,
        type: 'nitrogen',
        tip: t('ureaTip')
      });
    }
    
    if (defP > 0) {
      list.push({
        fertilizer: t('dapNeeded') + ' or SSP',
        dosage: `${(defP * 6.25).toFixed(1)} kg/hectare`,
        type: 'phosphorus',
        tip: t('dapTip')
      });
    }

    if (defK > 0) {
      list.push({
        fertilizer: t('mopNeeded'),
        dosage: `${(defK * 1.67).toFixed(1)} kg/hectare`,
        type: 'potassium',
        tip: t('mopTip')
      });
    }

    // Organic compost recommendations
    if (defN > 10 || defP > 10 || defK > 10) {
      list.push({
        fertilizer: t('organicCompost'),
        dosage: '5-7 Tons/hectare',
        type: 'organic',
        tip: t('organicTip')
      });
    }

    setSuggestions(list);
  }, [currentN, currentP, currentK, target]);

  const getPhAdvisory = () => {
    if (currentPh < target.phMin) {
      return {
        status: 'acidic',
        text: `${t('acidicTitle')} (${selectedCrop.toUpperCase()}). ${t('phValue')} Target: ${target.phMin}-${target.phMax}.`,
        action: t('acidicAction')
      };
    } else if (currentPh > target.phMax) {
      return {
        status: 'alkaline',
        text: `${t('alkalineTitle')} (${selectedCrop.toUpperCase()}). ${t('phValue')} Target: ${target.phMin}-${target.phMax}.`,
        action: t('alkalineAction')
      };
    }
    return {
      status: 'neutral',
      text: `${t('neutralTitle')} (${selectedCrop.toUpperCase()}).`,
      action: t('neutralAction')
    };
  };

  const phAdvisory = getPhAdvisory();

  return (
    <div className="predictor-grid">
      
      {/* Parameters Panel */}
      <div className="card-glass">
        <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FlaskConical style={{ color: '#52b788' }} />
          {t('fertilizerTitle')}
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
          {t('fertilizerSubtitle')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Target Crop Selector */}
          <div>
            <label className="input-label">{t('selectCrop')}</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="input-field"
            >
              {Object.keys(CROP_NUTRIENT_TARGETS).map(crop => (
                <option key={crop} value={crop} style={{ background: '#0a2419' }}>
                  {crop.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Nitrogen slider */}
            <div>
              <div className="flex-between" style={{ marginBottom: '6px' }}>
                <span className="input-label" style={{ margin: 0 }}>{t('nitrogen')}</span>
                <span style={{ color: '#52b788', fontWeight: 700, fontFamily: 'monospace' }}>{currentN} mg/kg</span>
              </div>
              <input 
                type="range" 
                min="0" max="150"
                value={currentN}
                onChange={(e) => setCurrentN(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#52b788', cursor: 'ew-resize' }}
              />
            </div>

            {/* Phosphorus slider */}
            <div>
              <div className="flex-between" style={{ marginBottom: '6px' }}>
                <span className="input-label" style={{ margin: 0 }}>{t('phosphorus')}</span>
                <span style={{ color: '#52b788', fontWeight: 700, fontFamily: 'monospace' }}>{currentP} mg/kg</span>
              </div>
              <input 
                type="range" 
                min="0" max="120"
                value={currentP}
                onChange={(e) => setCurrentP(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#52b788', cursor: 'ew-resize' }}
              />
            </div>

            {/* Potassium slider */}
            <div>
              <div className="flex-between" style={{ marginBottom: '6px' }}>
                <span className="input-label" style={{ margin: 0 }}>{t('potassium')}</span>
                <span style={{ color: '#52b788', fontWeight: 700, fontFamily: 'monospace' }}>{currentK} mg/kg</span>
              </div>
              <input 
                type="range" 
                min="0" max="180"
                value={currentK}
                onChange={(e) => setCurrentK(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#52b788', cursor: 'ew-resize' }}
              />
            </div>

            {/* pH Slider */}
            <div>
              <div className="flex-between" style={{ marginBottom: '6px' }}>
                <span className="input-label" style={{ margin: 0 }}>{t('phValue')}</span>
                <span style={{ color: phAdvisory.status === 'neutral' ? '#52b788' : '#ffa726', fontWeight: 700, fontFamily: 'monospace' }}>
                  {currentPh}
                </span>
              </div>
              <input 
                type="range" 
                min="4.0" max="9.0" step="0.1"
                value={currentPh}
                onChange={(e) => setCurrentPh(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#52b788', cursor: 'ew-resize' }}
              />
            </div>

          </div>

        </div>
      </div>

      {/* Advisory Outputs Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* NPK Target Bars */}
        <div className="card-glass">
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: '#52b788' }} />
            {t('nutrientDeficitTitle')}
          </h3>
 
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Nitrogen bar */}
            <div>
              <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('nitrogen')} - Target: {target.N} mg/kg</span>
                <span style={{ color: deficits.N > 0 ? '#ff5252' : '#52b788', fontWeight: 600 }}>
                  {deficits.N > 0 ? `${t('deficit')}: -${deficits.N} mg/kg` : t('optimal')}
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '9999px', overflow: 'hidden', display: 'flex', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    background: deficits.N > 0 ? 'linear-gradient(90deg, #ffa726, #ff5252)' : 'linear-gradient(90deg, #52b788, #38b87d)', 
                    width: `${Math.min(100, (currentN / target.N) * 100)}%`,
                    transition: 'width 0.4s ease'
                  }} 
                />
              </div>
            </div>
 
            {/* Phosphorus bar */}
            <div>
              <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('phosphorus')} - Target: {target.P} mg/kg</span>
                <span style={{ color: deficits.P > 0 ? '#ff5252' : '#52b788', fontWeight: 600 }}>
                  {deficits.P > 0 ? `${t('deficit')}: -${deficits.P} mg/kg` : t('optimal')}
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '9999px', overflow: 'hidden', display: 'flex', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    background: deficits.P > 0 ? 'linear-gradient(90deg, #ffa726, #ff5252)' : 'linear-gradient(90deg, #52b788, #38b87d)', 
                    width: `${Math.min(100, (currentP / target.P) * 100)}%`,
                    transition: 'width 0.4s ease'
                  }} 
                />
              </div>
            </div>
 
            {/* Potassium bar */}
            <div>
              <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('potassium')} - Target: {target.K} mg/kg</span>
                <span style={{ color: deficits.K > 0 ? '#ff5252' : '#52b788', fontWeight: 600 }}>
                  {deficits.K > 0 ? `${t('deficit')}: -${deficits.K} mg/kg` : t('optimal')}
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '9999px', overflow: 'hidden', display: 'flex', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    background: deficits.K > 0 ? 'linear-gradient(90deg, #ffa726, #ff5252)' : 'linear-gradient(90deg, #52b788, #38b87d)', 
                    width: `${Math.min(100, (currentK / target.K) * 100)}%`,
                    transition: 'width 0.4s ease'
                  }} 
                />
              </div>
            </div>

          </div>
        </div>

        {/* pH Correction Widget */}
        <div 
          className="card-glass" 
          style={{ 
            borderLeft: `4px solid ${phAdvisory.status === 'neutral' ? '#52b788' : '#ffa726'}`,
            padding: '16px'
          }}
        >
          <div className="flex-center-y flex-gap-2">
            {phAdvisory.status === 'neutral' ? (
              <CheckCircle size={20} style={{ color: '#52b788' }} />
            ) : (
              <AlertTriangle size={20} style={{ color: '#ffa726' }} />
            )}
            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>
              {t('pHModifier')}
            </h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '6px', lineHeight: 1.4 }}>
            {phAdvisory.text}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, marginTop: '8px', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            👉 Action: {phAdvisory.action}
          </p>
        </div>

        {/* Recommended Dosages */}
        <div className="card-glass">
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: '#ffa726' }} />
            {t('chemicalCorrection')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {suggestions.map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: 'rgba(82, 183, 136, 0.03)', 
                  border: '1px solid rgba(82, 183, 136, 0.08)', 
                  padding: '14px', 
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div className="flex-between">
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>
                    {item.fertilizer}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#52b788' }}>
                    {item.dosage}
                  </span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', lineHeight: 1.3 }}>
                  • {item.tip}
                </p>
              </div>
            ))}
            
            {suggestions.length === 0 && (
              <div className="flex-center" style={{ flexDirection: 'column', height: '100px', color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
                <CheckCircle size={32} style={{ color: '#52b788', marginBottom: '8px', opacity: 0.8 }} />
                {t('optimalNpkMsg')}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
