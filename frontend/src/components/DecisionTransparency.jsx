import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';

export default function DecisionTransparency() {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div className="card-glass" style={{ borderLeft: '4px solid #52b788', padding: '16px 24px' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
          {t('dctTitle', 'Decision Calculation Transparency')}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '4px', margin: 0 }}>
          {t('dctSubtitle', 'Inspect the logic, datasets, and agronomic formulas governing our AI recommendations.')}
        </p>
      </div>

      <div className="card-glass" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <BookOpen size={18} style={{ color: '#52b788' }} />
          {t('dctHeader', 'Decision Engine Methodology')}
        </h3>
        
        <div className="credibility-container" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ lineHeight: 1.5, fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
            {t('dctDesc', 'Our decision engine combines real-time localized weather telemetry and soil composition data with standard agronomic indices. Sowing suitability indexes are determined using crown root initiation benchmarks (CRI) and crop transpiration factors. Profit projections utilize current regional Mandi rates reported by Agmarknet.')}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            <span className="credibility-badge" style={{ fontSize: '0.75rem', fontWeight: 600, padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(82, 183, 136, 0.15)', color: '#52b788' }}>
              {t('dctBadgeImd', 'IMD Weather Data API')}
            </span>
            <span className="credibility-badge" style={{ fontSize: '0.75rem', fontWeight: 600, padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(82, 183, 136, 0.15)', color: '#52b788' }}>
              {t('dctBadgeIcar', 'ICAR Soil Chemistry Database')}
            </span>
            <span className="credibility-badge" style={{ fontSize: '0.75rem', fontWeight: 600, padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(82, 183, 136, 0.15)', color: '#52b788' }}>
              {t('dctBadgeFao', 'FAO-56 Evapotranspiration Standards')}
            </span>
            <span className="credibility-badge" style={{ fontSize: '0.75rem', fontWeight: 600, padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(82, 183, 136, 0.15)', color: '#52b788' }}>
              {t('dctBadgeAgmarknet', 'Agmarknet Mandi API')}
            </span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
