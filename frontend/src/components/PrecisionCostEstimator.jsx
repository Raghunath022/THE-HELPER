import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, RotateCcw } from 'lucide-react';

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

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      
      {/* ── Header ── */}
      <div className="card-glass" style={{ marginBottom: '14px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={22} style={{ color: '#ffa726' }} />
          Precision Cost & Profit Estimator
        </h2>
        <button 
          onClick={handleReset}
          style={{
            padding: '5px 12px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#ffa726',
            background: 'rgba(255,167,38,0.12)',
            border: '1px solid rgba(255,167,38,0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <RotateCcw size={12} />
          Reset Defaults
        </button>
      </div>

      {/* ── 2-Column Compact Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px' }}>
        
        {/* LEFT COLUMN: Direct Number Entry Parameters */}
        <div className="card-glass" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '4px' }}>Select Crop</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(82,183,136,0.3)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
              >
                <option value="Tomato" style={{ background: '#0a2419' }}>Tomato</option>
                <option value="Potato" style={{ background: '#0a2419' }}>Potato</option>
                <option value="Paddy" style={{ background: '#0a2419' }}>Paddy (Rice)</option>
                <option value="Wheat" style={{ background: '#0a2419' }}>Wheat</option>
                <option value="Maize" style={{ background: '#0a2419' }}>Maize</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#52b788', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Cultivated Area (Acres)</label>
              <input 
                type="number" step="0.25" min="0.1" max="100"
                value={acres}
                onChange={(e) => setAcres(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(82, 183, 136, 0.08)', border: '1.5px solid #52b788', color: '#fff', fontSize: '0.85rem', fontWeight: 800 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '4px' }}>Seed Cost (₹/acre)</label>
              <input 
                type="number" step="100" min="0"
                value={seedCost}
                onChange={(e) => setSeedCost(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="e.g. 2500"
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '4px' }}>Labor Cost (₹/acre)</label>
              <input 
                type="number" step="250" min="0"
                value={laborCost}
                onChange={(e) => setLaborCost(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="e.g. 5000"
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '4px' }}>Irrigation Cost (₹/acre)</label>
              <input 
                type="number" step="100" min="0"
                value={irrigationCost}
                onChange={(e) => setIrrigationCost(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="e.g. 1500"
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '4px' }}>Fertilizer & Pesticide (₹/acre)</label>
              <input 
                type="number" step="100" min="0"
                value={fertilizerCost}
                onChange={(e) => setFertilizerCost(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="e.g. 3000"
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Profit Statement & Financial Return */}
        <div className="card-glass" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#52b788', background: 'rgba(82,183,136,0.12)', padding: '3px 10px', borderRadius: '6px' }}>
              PROFIT STATEMENT
            </span>
            <span style={{ 
              backgroundColor: expectedNetProfit > 0 ? 'rgba(82, 183, 136, 0.15)' : 'rgba(255, 82, 82, 0.15)',
              color: expectedNetProfit > 0 ? '#52b788' : '#ff5252', 
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem'
            }}>
              {expectedNetProfit > 0 ? '+' : ''}{roiPercent}% ROI
            </span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(82,183,136,0.15)', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Expected Net Profit</span>
            <h1 style={{ fontSize: '2.2rem', color: expectedNetProfit > 0 ? '#52b788' : '#ff5252', marginTop: '2px', fontWeight: 900, margin: 0 }}>
              {expectedNetProfit < 0 ? '-' : ''}₹{Math.abs(expectedNetProfit).toLocaleString('en-IN')}
            </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.68rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>Total Cultivation Cost</span>
              <span style={{ color: '#ffa726', fontWeight: 800 }}>₹{totalCost.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.68rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>Projected Yield</span>
              <span style={{ color: '#fff', fontWeight: 800 }}>{expectedYieldTons} Tons</span>
            </div>
          </div>

          <div style={{ background: 'rgba(82, 183, 136, 0.04)', border: '1px solid rgba(82, 183, 136, 0.12)', borderRadius: '8px', padding: '10px', fontSize: '0.75rem', lineHeight: 1.4, color: 'hsl(var(--text-secondary))' }}>
            <strong style={{ color: '#fff' }}>💡 Maximizing Return on Investment:</strong>
            <div>Precision seed spacing & targeted fertilizer dosing reduces input costs by ~12% while securing crop yield.</div>
          </div>

        </div>

      </div>

    </div>
  );
}
