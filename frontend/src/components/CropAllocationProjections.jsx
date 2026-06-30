import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, ShieldCheck } from 'lucide-react';

export default function CropAllocationProjections({ user }) {
  const { t } = useTranslation();
  const activeUser = user || { name: 'Guest Farmer', role: 'farmer' };
  
  const CHART_COLORS = ['#52b788', '#14b4b4', '#ffa726', '#ff5252', '#a855f7'];
  
  const cropDataList = [
    { name: 'paddy', value: 12 },
    { name: 'wheat', value: 8 },
    { name: 'maize', value: 6 },
    { name: 'tomato', value: 4 },
    { name: 'potato', value: 3 }
  ];

  const totalQueries = cropDataList.reduce((acc, curr) => acc + curr.value, 0);

  const yieldForecasts = [
    { crop: 'paddy', projectedYieldTons: 64 },
    { crop: 'wheat', projectedYieldTons: 38 },
    { crop: 'maize', projectedYieldTons: 22 },
    { crop: 'tomato', projectedYieldTons: 15 }
  ];

  const isPremiumUnlocked = activeUser.role === 'admin' || activeUser.role === 'expert' || activeUser.role === 'agronomist';

  const translateCrop = (cropName) => {
    if (!cropName) return '';
    const cleanCrop = cropName.toLowerCase();
    const map = {
      'tomato': t('tomato', 'Tomato'),
      'potato': t('potato', 'Potato'),
      'paddy': t('paddy', t('rice', 'Paddy')),
      'wheat': t('wheat', 'Wheat'),
      'maize': t('maize', 'Maize')
    };
    return map[cleanCrop] || cropName;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div className="card-glass" style={{ borderLeft: '4px solid #52b788', padding: '16px 24px' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
          {t('capTitle', 'Crop Allocation & Yield Projections')}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '4px', margin: 0 }}>
          {t('capSubtitle', 'Analytics dashboards outlining crop allocation query ratios and projected harvest forecasts.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '24px' }}>
        
        {/* Crop Allocation SVG Pie Chart */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <BarChart3 size={18} style={{ color: '#52b788' }} />
            {t('capHeader', 'Crop Query Allocation')}
          </h3>
          
          <div className="flex-row-resp" style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="flex-center" style={{ padding: '8px', display: 'flex', justifyContent: 'center' }}>
              <svg width="140" height="140" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="12" />
                {(() => {
                  let accumulatedPercent = 0;
                  return cropDataList.map((item, idx) => {
                    const count = item.value;
                    const percentage = count / totalQueries;
                    const strokeDasharray = `${percentage * 251.2} 251.2`;
                    const strokeDashoffset = -accumulatedPercent * 251.2;
                    accumulatedPercent += percentage;

                    return (
                      <circle
                        key={item.name}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        style={{ transition: 'stroke-dasharray 0.5s ease' }}
                      />
                    );
                  });
                })()}
                <circle cx="50" cy="50" r="28" fill="#061a12" />
              </svg>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px' }}>
              {cropDataList.map((item, idx) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                    <span style={{ textTransform: 'capitalize', color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>{translateCrop(item.name)}</span>
                  </div>
                  <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 600 }}>{item.value} {t('capInquiries', 'inquiries')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Yield Projections Forecast list */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <TrendingUp size={18} style={{ color: '#ffa726' }} />
            {t('capYieldForecast', 'Yield Forecasts (Seasonal)')}
          </h3>

          {isPremiumUnlocked ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {yieldForecasts.map((item) => (
                <div key={item.crop} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>{translateCrop(item.crop)}</span>
                    <span style={{ color: '#52b788', fontWeight: 600 }}>{item.projectedYieldTons} {t('capTonsTotal', 'Tons Total')}</span>
                  </div>
                  <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(82, 183, 136, 0.06)', borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(82,183,136,0.1)' }}>
                    <div style={{ height: '100%', borderRadius: '9999px', background: 'linear-gradient(90deg, #52b788, #38b87d)', width: `${Math.min(100, (item.projectedYieldTons / 100) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(82, 183, 136, 0.15)', borderRadius: '14px', backgroundColor: 'rgba(82, 183, 136, 0.02)', padding: '24px', textAlign: 'center' }}>
              <ShieldCheck size={36} style={{ color: '#ffa726', marginBottom: '8px' }} />
              <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{t('capPremiumTitle', 'Agronomist & Expert Scope Required')}</h4>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem', maxWidth: '280px', margin: '6px 0 14px 0', lineHeight: 1.4 }}>
                {t('capPremiumDesc', 'Upgrade your user role to Expert or log in with an Administrator smart card to access regional aggregate yield projections.')}
              </p>
              <span className="badge badge-amber" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                {t('capPremiumLocked', 'Premium Feature Locked')}
              </span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
