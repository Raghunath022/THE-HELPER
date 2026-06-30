import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, RefreshCw } from 'lucide-react';
import { useToast } from '../useToast';

function useCounter(target, duration = 1800, refreshKey = 0) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);
  
  useEffect(() => {
    setCount(0);
    started.current = false;
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(target * ease));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, refreshKey]);
  return [count, ref];
}

export default function Dashboard() {
  const { t } = useTranslation();
  const toast = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const [farmersCount, farmersRef] = useCounter(12400, 1500, refreshKey);
  const [queriesCount, queriesRef] = useCounter(89200, 1800, refreshKey);
  const [cropsCount,   cropsRef]   = useCounter(47, 1200, refreshKey);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success(t('dashboardDataRefreshed') || '📊 Analytics data refreshed successfully!');
  };

  return (
    <div className="flex-center" style={{ minHeight: 'calc(100vh - 160px)', padding: '20px' }}>
      <div className="hero-banner" style={{ width: '100%', maxWidth: '960px' }}>
        <div className="hero-bg-pattern" />
        <div className="hero-grid-lines" />
        <span className="hero-emoji-float">🌿</span>

        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={11} />
            {t('heroBadge')}
          </div>

          <h1 className="hero-headline">
            {t('heroHeadline')}
          </h1>

          <p className="hero-sub">
            {t('heroSubtitle')}
          </p>

          <div className="hero-actions">
            <button
              className="btn-secondary"
              style={{ padding: '12px 20px', fontSize: '0.88rem' }}
              onClick={handleRefresh}
            >
              <RefreshCw size={15} />
              {t('refreshData')}
            </button>
          </div>

          <div className="hero-stat-row">
            <div className="hero-stat" ref={farmersRef}>
              <span className="hero-stat-value">{farmersCount.toLocaleString('en-IN')}+</span>
              <span className="hero-stat-label">{t('heroStatFarmers')}</span>
            </div>
            <div className="hero-stat" ref={queriesRef}>
              <span className="hero-stat-value">{queriesCount.toLocaleString('en-IN')}+</span>
              <span className="hero-stat-label">{t('heroStatQueries')}</span>
            </div>
            <div className="hero-stat" ref={cropsRef}>
              <span className="hero-stat-value">{cropsCount}+</span>
              <span className="hero-stat-label">{t('heroStatCrops')}</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value" style={{ color: '#52b788' }}>24/7</span>
              <span className="hero-stat-label">{t('heroStatAvailability')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
