import React from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Info } from 'lucide-react';
import { getDecisionData, getRegionalTrends } from './plannerHelpers';

export default function GuidedFarmProfiler({ farmProfile, setFarmProfile }) {
  const { t, i18n } = useTranslation();
  const { state: locationState, soilType, crop: selectedCrop } = farmProfile;

  const decisions = getDecisionData(selectedCrop, soilType, locationState, i18n.language);
  const regional = getRegionalTrends(locationState, i18n.language);

  const handleChange = (key, value) => {
    setFarmProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const translateState = (stateName) => {
    const map = {
      'Uttar Pradesh': t('state_up', 'Uttar Pradesh'),
      'Maharashtra': t('state_maharashtra', 'Maharashtra'),
      'Tamil Nadu': t('state_tn', 'Tamil Nadu'),
      'Bihar': t('state_bihar', 'Bihar'),
      'Karnataka': t('state_karnataka', 'Karnataka')
    };
    return map[stateName] || stateName;
  };

  const translateSoil = (soilName) => {
    const map = {
      'Loamy': t('soil_loamy', 'Loamy soil (Best for most crops)'),
      'Clay': t('soil_clay', 'Clay soil (Holds water)'),
      'Sandy': t('soil_sandy', 'Sandy soil (Quick draining)'),
      'Black': t('soil_black', 'Black cotton soil'),
      'Red': t('soil_red', 'Red Loamy soil')
    };
    return map[soilName] || soilName;
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
      <div className="card-glass" style={{ borderLeft: '4px solid #52b788', padding: '16px 24px' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
          {t('gfpTitle', 'Guided Farm Profiler')}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '4px', margin: 0 }}>
          {t('gfpSubtitle', 'Set up your regional profile, soil conditions, and target crops to align your precision agricultural workflows.')}
        </p>
      </div>

      <div className="card-glass">
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Leaf size={20} style={{ color: '#52b788' }} />
          {t('gfpHeader', 'Configure Farm Profile')}
        </h3>
        
        <div className="guided-step-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="input-label">{t('gfpState', 'State / Region')}</label>
              <select 
                value={locationState} 
                onChange={(e) => handleChange('state', e.target.value)}
                className="input-field"
              >
                <option value="Uttar Pradesh">{translateState('Uttar Pradesh')}</option>
                <option value="Maharashtra">{translateState('Maharashtra')}</option>
                <option value="Tamil Nadu">{translateState('Tamil Nadu')}</option>
                <option value="Bihar">{translateState('Bihar')}</option>
                <option value="Karnataka">{translateState('Karnataka')}</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="input-label">{t('gfpSoil', 'Soil Type')}</label>
              <select 
                value={soilType} 
                onChange={(e) => handleChange('soilType', e.target.value)}
                className="input-field"
              >
                <option value="Loamy">{translateSoil('Loamy')}</option>
                <option value="Clay">{translateSoil('Clay')}</option>
                <option value="Sandy">{translateSoil('Sandy')}</option>
                <option value="Black">{translateSoil('Black')}</option>
                <option value="Red">{translateSoil('Red')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="input-label">{t('gfpCrop', 'Target Crop')}</label>
              <select 
                value={selectedCrop} 
                onChange={(e) => handleChange('crop', e.target.value)}
                className="input-field"
              >
                <option value="Tomato">{translateCrop('Tomato')}</option>
                <option value="Potato">{translateCrop('Potato')}</option>
                <option value="Paddy">{translateCrop('Paddy')}</option>
                <option value="Wheat">{translateCrop('Wheat')}</option>
                <option value="Maize">{translateCrop('Maize')}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">{t('gfpMandiRef', 'Mandi Reference Price')}</label>
              <div className="input-field" style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#ffa726', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>₹{decisions.cropPricePerTon.toLocaleString('en-IN')}/{t('unit_ton', 'Ton')}</span>
                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>{t('gfpLive', '(Agmarknet Live)')}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(82, 183, 136, 0.05)', border: '1px solid rgba(82, 183, 136, 0.1)', borderRadius: '10px', padding: '12px 16px', fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.4 }}>
            <Info size={16} style={{ color: '#52b788', flexShrink: 0 }} />
            <span>
              {t('gfpInfo', '{{state}} Profile: Sowing trends indicate high popularity for {{mainCrops}} in {{soilType}}. Switching to precision advice saves up to {{waterSavings}} water.', {
                state: translateState(locationState),
                mainCrops: regional.mainCrops,
                soilType: regional.soilType,
                waterSavings: regional.waterSavings
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
