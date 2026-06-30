import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Award } from 'lucide-react';
import { getDecisionData } from './plannerHelpers';

export default function TodayFarmStatus({ farmProfile }) {
  const { t, i18n } = useTranslation();
  const { state: locationState, soilType, crop: selectedCrop } = farmProfile;
  
  const decisions = getDecisionData(selectedCrop, soilType, locationState, i18n.language);

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
      <div className="card-glass" style={{ borderLeft: '4px solid #52b788', padding: '16px 24px' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
          {t('tfsTitle', "Today's Farm Status")}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '4px', margin: 0 }}>
          {t('tfsSubtitle', 'Real-time weather summaries, soil conditions, and sowing suitability scores for your profile.')}
        </p>
      </div>

      <div className="card-glass" style={{ borderLeft: '4px solid #52b788' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Zap size={20} style={{ color: '#52b788' }} />
          {t('tfsHeader', '🌱 Today’s Decision Alerts')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#52b788' }}>✔</span>
            <span>{t('tfsTargetCrop', 'Target crop')}: <strong>{translateCrop(selectedCrop)}</strong></span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f9a620' }}>⚠</span>
            <span>{t('tfsWeatherStatus', 'Weather status')}: <strong>{decisions.weatherWarning}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#52b788' }}>✅</span>
            <span>{t('tfsActionAdvice', 'Action advice')}: <strong>{decisions.irrigationAdvisory}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(82,183,136,0.1)', paddingTop: '14px', marginTop: '4px' }}>
            <Award size={16} style={{ color: '#ffa726' }} />
            <span>{t('tfsNpkAdvisory', 'NPK Advisory')}: <span style={{ color: 'hsl(var(--text-secondary))' }}>{decisions.fertilizerAdvisory}</span></span>
          </div>

          {/* Sowing Suitability Dial */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '16px 20px', borderRadius: '14px', marginTop: '10px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>{t('tfsSowingIndex', 'SOWING SUITABILITY INDEX')}</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: decisions.sowingScore > 80 ? '#52b788' : '#ffa726', marginTop: '2px', display: 'block' }}>
                {decisions.sowingScore}% ({t('tfsExcellent', 'Excellent')})
              </span>
            </div>
            <div style={{ width: '56px', height: '56px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="56" height="56" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="#52b788" strokeWidth="3.5" 
                  strokeDasharray="100 100" 
                  strokeDashoffset={100 - decisions.sowingScore} 
                  strokeLinecap="round" 
                  transform="rotate(-90 18 18)"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <span style={{ position: 'absolute', fontSize: '0.78rem', fontWeight: 800 }}>{decisions.sowingScore}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
