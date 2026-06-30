import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { getDecisionData } from './plannerHelpers';

export default function WeeklyOperationsPlanner({ farmProfile }) {
  const { t, i18n } = useTranslation();
  const { state: locationState, soilType, crop: selectedCrop } = farmProfile;
  
  const decisions = getDecisionData(selectedCrop, soilType, locationState, i18n.language);

  const [completedTasks, setCompletedTasks] = useState([0, 1]);

  // Reset checklist when the crop changes
  useEffect(() => {
    setCompletedTasks([0]);
  }, [selectedCrop]);

  const toggleTask = (idx) => {
    if (completedTasks.includes(idx)) {
      setCompletedTasks(completedTasks.filter(i => i !== idx));
    } else {
      setCompletedTasks([...completedTasks, idx]);
    }
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

  const progressPercent = decisions.weeklyPlan.length > 0
    ? Math.round((completedTasks.length / decisions.weeklyPlan.length) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div className="card-glass" style={{ borderLeft: '4px solid #52b788', padding: '16px 24px' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
          {t('wopTitle', 'Weekly Operations Planner')}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '4px', margin: 0 }}>
          {t('wopSubtitle', 'Track daily operational activities custom-scheduled for {{crop}} in your region.', { crop: translateCrop(selectedCrop) })}
        </p>
      </div>

      <div className="card-glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Calendar size={20} style={{ color: '#52b788' }} />
            {t('wopHeader', 'Weekly Operations Checklist')}
          </h3>
          <span className="badge badge-emerald" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
            {progressPercent}% {t('wopDone', 'Done')}
          </span>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-muted))', marginBottom: '16px', lineHeight: 1.4 }}>
          {t('wopDesc', 'Day-by-day precision tasks. Select items below as you complete them to record your seasonal progress:')}
        </p>

        <div className="weekly-checklist" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {decisions.weeklyPlan.map((stepText, idx) => {
            const isCompleted = completedTasks.includes(idx);
            return (
              <div 
                key={idx} 
                className={`checklist-item ${isCompleted ? 'completed' : ''}`}
                onClick={() => toggleTask(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '10px',
                  background: isCompleted ? 'rgba(82, 183, 136, 0.04)' : 'rgba(255,255,255,0.01)',
                  border: isCompleted ? '1px solid rgba(82, 183, 136, 0.15)' : '1px solid rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: isCompleted ? '1px solid #52b788' : '1px solid rgba(255,255,255,0.2)',
                  background: isCompleted ? '#52b788' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  flexShrink: 0
                }}>
                  {isCompleted && <span style={{ fontSize: '0.65rem', fontWeight: 900 }}>✔</span>}
                </div>
                <div className="checklist-text" style={{ fontSize: '0.88rem', color: isCompleted ? 'hsl(var(--text-muted))' : '#fff' }}>
                  <strong>{t('wopDay', 'Day')} {idx + 1}:</strong> {stepText}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
