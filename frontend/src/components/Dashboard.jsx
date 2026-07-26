import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, RefreshCw, Sprout, FlaskConical, Calculator, Camera, Sun, Coins, MessageCircle, ArrowRight } from 'lucide-react';
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

export default function Dashboard({ user, token, backendUrl, onNavigate }) {
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
    <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto', padding: '20px' }}>
      {/* Hero Banner Card */}
      <div className="hero-banner" style={{ width: '100%', marginBottom: '30px' }}>
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

      {/* Quick Launch Tools Section */}
      <div className="dashboard-tools-section">
        <h2 className="dashboard-section-title">
          {t('coreServices') || '🛠️ Core Agricultural Services'}
        </h2>
        <div className="dashboard-tools-grid">
          <div className="tool-card" onClick={() => onNavigate('predictor')}>
            <div className="tool-card-icon-wrapper">
              <Sprout size={24} />
            </div>
            <h3 className="tool-card-title">{t('cropRecommend') || 'Crop Advisor'}</h3>
            <p className="tool-card-desc">
              {t('cropAdvisorDesc') || 'Find the best crops to grow using real-time soil analysis (NPK, pH, temperature, and moisture levels).'}
            </p>
            <span className="tool-card-action">
              {t('launchTool') || 'Launch Advisor'} <ArrowRight size={14} />
            </span>
          </div>

          <div className="tool-card" onClick={() => onNavigate('fertilizer')}>
            <div className="tool-card-icon-wrapper">
              <FlaskConical size={24} />
            </div>
            <h3 className="tool-card-title">{t('fertilizer') || 'Fertilizer Recommendation'}</h3>
            <p className="tool-card-desc">
              {t('fertilizerDesc') || 'Get tailored nitrogen, phosphorus, and potassium fertilizer application schedules for optimal soil health.'}
            </p>
            <span className="tool-card-action">
              {t('launchTool') || 'Get Advice'} <ArrowRight size={14} />
            </span>
          </div>

          <div className="tool-card" onClick={() => onNavigate('yield')}>
            <div className="tool-card-icon-wrapper">
              <Calculator size={24} />
            </div>
            <h3 className="tool-card-title">{t('yieldPrediction') || 'Yield Prediction'}</h3>
            <p className="tool-card-desc">
              {t('yieldDesc') || 'Estimate crop yield harvests using regression and historical weather and temperature data.'}
            </p>
            <span className="tool-card-action">
              {t('launchTool') || 'Estimate Yield'} <ArrowRight size={14} />
            </span>
          </div>

          <div className="tool-card" onClick={() => onNavigate('disease')}>
            <div className="tool-card-icon-wrapper">
              <Camera size={24} />
            </div>
            <h3 className="tool-card-title">{t('diseaseCamera') || 'Disease Detector'}</h3>
            <p className="tool-card-desc">
              {t('diseaseDesc') || 'Upload leaf images to diagnose crop diseases and get remediation tips using deep learning.'}
            </p>
            <span className="tool-card-action">
              {t('launchTool') || 'Scan Leaf'} <ArrowRight size={14} />
            </span>
          </div>

          <div className="tool-card" onClick={() => onNavigate('weather')}>
            <div className="tool-card-icon-wrapper">
              <Sun size={24} />
            </div>
            <h3 className="tool-card-title">{t('weather') || 'Weather Station'}</h3>
            <p className="tool-card-desc">
              {t('weatherDesc') || 'Monitor local weather forecasts, precipitation indexes, and receive extreme conditions warnings.'}
            </p>
            <span className="tool-card-action">
              {t('launchTool') || 'View Forecast'} <ArrowRight size={14} />
            </span>
          </div>

          <div className="tool-card" onClick={() => onNavigate('market')}>
            <div className="tool-card-icon-wrapper">
              <Coins size={24} />
            </div>
            <h3 className="tool-card-title">{t('marketPrices') || 'Market Insights'}</h3>
            <p className="tool-card-desc">
              {t('marketDesc') || 'Track crop market rates, regional trends, and minimum support prices across local marketplaces.'}
            </p>
            <span className="tool-card-action">
              {t('launchTool') || 'Check Prices'} <ArrowRight size={14} />
            </span>
          </div>

          <div className="tool-card" onClick={() => onNavigate('chat')}>
            <div className="tool-card-icon-wrapper">
              <MessageCircle size={24} />
            </div>
            <h3 className="tool-card-title">{t('aiChatAssistant') || 'AI Chat Assistant'}</h3>
            <p className="tool-card-desc">
              {t('chatDesc') || 'Chat with our intelligent agricultural bot in your own regional language for smart farming answers.'}
            </p>
            <span className="tool-card-action">
              {t('launchTool') || 'Start Chat'} <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
