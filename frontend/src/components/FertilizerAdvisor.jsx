import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FlaskConical, AlertTriangle, CheckCircle, Sparkles, TrendingUp, Cpu, RefreshCw } from 'lucide-react';

const CROP_NUTRIENT_TARGETS = {
  rice: { name: 'Rice (Paddy)', N: 80, P: 40, K: 40, phMin: 6.0, phMax: 7.0 },
  maize: { name: 'Maize (Corn)', N: 100, P: 50, K: 30, phMin: 5.8, phMax: 7.2 },
  wheat: { name: 'Wheat', N: 90, P: 50, K: 40, phMin: 6.0, phMax: 7.5 },
  cotton: { name: 'Cotton', N: 120, P: 60, K: 40, phMin: 6.0, phMax: 7.5 },
  groundnut: { name: 'Groundnut', N: 25, P: 55, K: 45, phMin: 5.5, phMax: 6.5 },
  sugarcane: { name: 'Sugarcane', N: 150, P: 80, K: 80, phMin: 6.0, phMax: 7.5 },
  banana: { name: 'Banana', N: 110, P: 90, K: 120, phMin: 5.5, phMax: 7.5 },
  pomegranate: { name: 'Pomegranate', N: 30, P: 20, K: 45, phMin: 5.5, phMax: 7.8 },
  mango: { name: 'Mango', N: 35, P: 30, K: 40, phMin: 5.5, phMax: 7.5 }
};

const DEFAULT_TARGETS = { N: 60, P: 40, K: 40, phMin: 6.0, phMax: 7.5 };

export default function FertilizerAdvisor() {
  const { t } = useTranslation();
  
  // Input Mode: 'probe' vs 'manual'
  const [inputMode, setInputMode] = useState('probe');
  const [isProbeSyncing, setIsProbeSyncing] = useState(false);

  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [landAcres, setLandAcres] = useState(1.0);

  // Soil values
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

  // Sync simulated IoT Hardware probe
  const handleProbeSync = async () => {
    setIsProbeSyncing(true);
    await new Promise(res => setTimeout(res, 500));

    setCurrentN(Math.floor(30 + Math.random() * 50));
    setCurrentP(Math.floor(20 + Math.random() * 35));
    setCurrentK(Math.floor(20 + Math.random() * 30));
    setCurrentPh(parseFloat((5.8 + Math.random() * 1.2).toFixed(1)));
    setIsProbeSyncing(false);
  };

  useEffect(() => {
    const defN = Math.max(0, target.N - currentN);
    const defP = Math.max(0, target.P - currentP);
    const defK = Math.max(0, target.K - currentK);
    setDeficits({ N: defN, P: defP, K: defK });

    // Conversion factor from Hectare to Acre (1 Hectare = 2.471 Acres)
    const acres = parseFloat(landAcres) || 1.0;
    const hectareToAcreRatio = 1 / 2.471;

    const ureaKg = (defN * 2.17 * hectareToAcreRatio * acres).toFixed(1);
    const dapKg = (defP * 6.25 * hectareToAcreRatio * acres).toFixed(1);
    const mopKg = (defK * 1.67 * hectareToAcreRatio * acres).toFixed(1);

    const list = [];
    
    if (defN > 0) {
      const bags = (parseFloat(ureaKg) / 50).toFixed(1);
      list.push({
        fertilizer: 'Urea (46% N)',
        dosage: `${ureaKg} kg`,
        bagCount: `~${bags} bag(s) of 50kg`,
        type: 'nitrogen',
        tip: 'Apply in 3 splits: 50% at sowing, 25% at tillering, 25% at flowering.'
      });
    }
    
    if (defP > 0) {
      const bags = (parseFloat(dapKg) / 50).toFixed(1);
      list.push({
        fertilizer: 'DAP / SSP',
        dosage: `${dapKg} kg`,
        bagCount: `~${bags} bag(s) of 50kg`,
        type: 'phosphorus',
        tip: 'Full dose during soil prep before sowing for strong root growth.'
      });
    }

    if (defK > 0) {
      const bags = (parseFloat(mopKg) / 50).toFixed(1);
      list.push({
        fertilizer: 'Muriate of Potash (MOP 60% K)',
        dosage: `${mopKg} kg`,
        bagCount: `~${bags} bag(s) of 50kg`,
        type: 'potassium',
        tip: 'Apply 50% basal dose and 50% at late growth stage for pest resistance.'
      });
    }

    if (defN > 10 || defP > 10 || defK > 10) {
      const compostTons = (2.0 * acres).toFixed(1);
      list.push({
        fertilizer: 'Organic Compost',
        dosage: `${compostTons} Tons`,
        bagCount: 'Soil Restorer',
        type: 'organic',
        tip: 'Incorporate 2-3 weeks before sowing to boost soil moisture & microbes.'
      });
    }

    setSuggestions(list);
  }, [currentN, currentP, currentK, target, landAcres]);

  const getPhAdvisory = () => {
    if (currentPh < target.phMin) {
      const limeKg = (200 * (landAcres || 1)).toFixed(0);
      return {
        status: 'acidic',
        badge: `Acidic (pH ${currentPh})`,
        action: `Apply ${limeKg} kg Agricultural Lime per ${landAcres} Acre(s).`
      };
    } else if (currentPh > target.phMax) {
      const gypsumKg = (150 * (landAcres || 1)).toFixed(0);
      return {
        status: 'alkaline',
        badge: `Alkaline (pH ${currentPh})`,
        action: `Apply ${gypsumKg} kg Gypsum per ${landAcres} Acre(s).`
      };
    }
    return {
      status: 'neutral',
      badge: `Optimal pH (${currentPh})`,
      action: 'No pH modifiers needed.'
    };
  };

  const phAdvisory = getPhAdvisory();

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      
      {/* ── Compact Header Bar ── */}
      <div className="card-glass" style={{ marginBottom: '14px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FlaskConical size={22} style={{ color: '#52b788' }} />
          Fertilizer & Soil Correction Advisor
        </h2>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setInputMode('probe')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: inputMode === 'probe' ? '2px solid #52b788' : '1px solid rgba(255,255,255,0.1)',
              background: inputMode === 'probe' ? 'rgba(82, 183, 136, 0.18)' : 'rgba(255,255,255,0.03)',
              color: inputMode === 'probe' ? '#52b788' : '#fff'
            }}
          >
            <Cpu size={14} />
            Hardware Probe
          </button>

          <button
            onClick={() => setInputMode('manual')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: inputMode === 'manual' ? '2px solid #52b788' : '1px solid rgba(255,255,255,0.1)',
              background: inputMode === 'manual' ? 'rgba(82, 183, 136, 0.18)' : 'rgba(255,255,255,0.03)',
              color: inputMode === 'manual' ? '#52b788' : '#fff'
            }}
          >
            <FlaskConical size={14} />
            Manual Entry
          </button>
        </div>
      </div>

      {/* ── Compact 2-Column Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px' }}>
        
        {/* LEFT COLUMN: Inputs & Deficit Diagnostics */}
        <div className="card-glass" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Probe Bar */}
          {inputMode === 'probe' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px' }}>
              <span style={{ fontSize: '0.75rem', color: '#52b788', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#52b788' }} />
                Probe Telemetry Active
              </span>
              <button
                onClick={handleProbeSync}
                disabled={isProbeSyncing}
                style={{ padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700, color: '#52b788', background: 'rgba(82,183,136,0.12)', border: '1px solid rgba(82,183,136,0.3)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} className={isProbeSyncing ? "animate-spin" : ""} />
                Re-scan
              </button>
            </div>
          )}

          {/* Crop & Land Size Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '4px' }}>Target Crop</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(82,183,136,0.3)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
              >
                {Object.keys(CROP_NUTRIENT_TARGETS).map(cropKey => (
                  <option key={cropKey} value={cropKey} style={{ background: '#0a2419' }}>
                    {CROP_NUTRIENT_TARGETS[cropKey].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#52b788', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Land (Acres)</label>
              <input
                type="number" step="0.25" min="0.1" max="50"
                value={landAcres}
                onChange={(e) => setLandAcres(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(82, 183, 136, 0.08)', border: '1.5px solid #52b788', color: '#fff', fontSize: '0.85rem', fontWeight: 800 }}
              />
            </div>
          </div>

          {/* 4 Inputs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '2px' }}>Nitrogen (N mg/kg)</label>
              <input 
                type="number" min="0" max="200" value={currentN}
                onChange={(e) => setCurrentN(Math.max(0, parseInt(e.target.value) || 0))}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '2px' }}>Phosphorus (P mg/kg)</label>
              <input 
                type="number" min="0" max="150" value={currentP}
                onChange={(e) => setCurrentP(Math.max(0, parseInt(e.target.value) || 0))}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '2px' }}>Potassium (K mg/kg)</label>
              <input 
                type="number" min="0" max="180" value={currentK}
                onChange={(e) => setCurrentK(Math.max(0, parseInt(e.target.value) || 0))}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '2px' }}>Soil pH Level</label>
              <input 
                type="number" step="0.1" min="3.5" max="9.5" value={currentPh}
                onChange={(e) => setCurrentPh(parseFloat(e.target.value) || 6.5)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
              />
            </div>
          </div>

          {/* Compact Deficit Diagnostics */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
            <h4 style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={14} style={{ color: '#52b788' }} />
              Nutrient Deficit Diagnostics
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* N */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '2px' }}>
                  <span style={{ color: 'hsl(var(--text-secondary))' }}>Nitrogen (N)</span>
                  <span style={{ color: deficits.N > 0 ? '#ff5252' : '#52b788', fontWeight: 700 }}>
                    {deficits.N > 0 ? `Deficit: -${deficits.N} mg/kg` : 'Optimal'}
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: deficits.N > 0 ? '#ff5252' : '#52b788', width: `${Math.min(100, (currentN / target.N) * 100)}%` }} />
                </div>
              </div>

              {/* P */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '2px' }}>
                  <span style={{ color: 'hsl(var(--text-secondary))' }}>Phosphorus (P)</span>
                  <span style={{ color: deficits.P > 0 ? '#ff5252' : '#52b788', fontWeight: 700 }}>
                    {deficits.P > 0 ? `Deficit: -${deficits.P} mg/kg` : 'Optimal'}
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: deficits.P > 0 ? '#ff5252' : '#52b788', width: `${Math.min(100, (currentP / target.P) * 100)}%` }} />
                </div>
              </div>

              {/* K */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '2px' }}>
                  <span style={{ color: 'hsl(var(--text-secondary))' }}>Potassium (K)</span>
                  <span style={{ color: deficits.K > 0 ? '#ff5252' : '#52b788', fontWeight: 700 }}>
                    {deficits.K > 0 ? `Deficit: -${deficits.K} mg/kg` : 'Optimal'}
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: deficits.K > 0 ? '#ff5252' : '#52b788', width: `${Math.min(100, (currentK / target.K) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Compact pH Badge */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px 12px', borderLeft: `3px solid ${phAdvisory.status === 'neutral' ? '#52b788' : '#ffa726'}` }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: phAdvisory.status === 'neutral' ? '#52b788' : '#ffa726', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {phAdvisory.status === 'neutral' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              {phAdvisory.badge}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#fff', marginTop: '2px' }}>{phAdvisory.action}</div>
          </div>

        </div>

        {/* RIGHT COLUMN: Required Fertilizer Dosage for Acres */}
        <div className="card-glass" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 800, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} style={{ color: '#ffa726' }} />
            Required Fertilizer for {landAcres} Acre(s)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {suggestions.map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: 'rgba(82, 183, 136, 0.04)', 
                  border: '1px solid rgba(82, 183, 136, 0.18)', 
                  padding: '10px 12px', 
                  borderRadius: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>{item.fertilizer}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#52b788' }}>{item.dosage}</span>
                    <span style={{ fontSize: '0.68rem', color: '#ffa726', fontWeight: 700, display: 'block' }}>({item.bagCount})</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', margin: '4px 0 0', lineHeight: 1.3 }}>
                  • {item.tip}
                </p>
              </div>
            ))}

            {suggestions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'hsl(var(--text-muted))', fontSize: '0.8rem' }}>
                <CheckCircle size={24} style={{ color: '#52b788', marginInline: 'auto', marginBottom: '6px' }} />
                Soil NPK levels are optimal! No chemical fertilizers needed.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
