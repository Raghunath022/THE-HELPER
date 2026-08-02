import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, LayoutDashboard, Camera, Coins, Globe, LogIn, LogOut, Menu, X, FlaskConical, Calculator, Sun, Moon, Cpu, MessageCircle, Satellite, Calendar, Leaf, BookOpen, History, BarChart3, Zap, Mic, Activity } from 'lucide-react';

// Component Imports
import Dashboard from './components/Dashboard';
import CropPredictor from './components/CropPredictor';
import DiseaseDetector from './components/DiseaseDetector';
import MarketInsights from './components/MarketInsights';
import FertilizerAdvisor from './components/FertilizerAdvisor';
import YieldPredictor from './components/YieldPredictor';
import WeatherDashboard from './components/WeatherDashboard';
import IoTTelemetry from './components/IoTTelemetry';
import AuthModal from './components/AuthModal';
import AIChatAssistant from './components/AIChatAssistant';
import ToastProvider from './components/ToastProvider';
import SatelliteView from './components/SatelliteView';
import PrecisionCostEstimator from './components/PrecisionCostEstimator';
import CustomCursor from './components/CustomCursor';

const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `${window.location.protocol}//${window.location.hostname}:10000`
  : 'https://smart-agri-platform-1.onrender.com';

export default function App() {
  const { t, i18n } = useTranslation();

  // Navigation & UI & Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('agri_ai_theme') || 'dark');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('agri_ai_theme', theme);
  }, [theme]);
  
  // Shared Farm Profile State
  const [farmProfile, setFarmProfile] = useState({
    state: 'Uttar Pradesh',
    soilType: 'Loamy',
    crop: 'Tomato'
  });

  // Auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  // Load auth state and saved language from localStorage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('agri_ai_user');
    const savedToken = localStorage.getItem('agri_ai_token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }

    // Restore saved language
    const savedLang = localStorage.getItem('agri_ai_lang');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('ServiceWorker registration successful: ', reg.scope))
          .catch(err => console.log('ServiceWorker registration failed: ', err));
      });
    }
  }, []);

  // Update shared profile on user smart card changes
  useEffect(() => {
    if (user && user.smartCardId) {
      const record = {
        'F-88291': { state: 'Uttar Pradesh', soilType: 'Loamy', crop: 'Tomato' },
        'F-77482': { state: 'Uttar Pradesh', soilType: 'Loamy', crop: 'Wheat' },
        'F-55321': { state: 'Tamil Nadu', soilType: 'Clay', crop: 'Paddy' }
      }[user.smartCardId];
      if (record) {
        setFarmProfile(record);
      }
    }
  }, [user]);

  const handleAuthSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('agri_ai_token');
    localStorage.removeItem('agri_ai_user');
    setUser(null);
    setToken('');
    setActiveTab('dashboard');
  };

  const handleTabChange = (tabId) => {
    // If attempting to go to Predictor but not authenticated, trigger Auth modal
    if (tabId === 'predictor' && !user) {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <ToastProvider>
      <CustomCursor />

    <div className="app-layout relative overflow-hidden">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      
      {/* Top Navigation Bar */}
      <header className="navbar">
        <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Left: Hamburger + Logo + Brand */}
          <div className="flex-center-y flex-gap-3">

            {/* Hamburger menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: isMobileMenuOpen ? 'rgba(82,183,136,0.15)' : 'rgba(82,183,136,0.08)',
                border: '1px solid rgba(82,183,136,0.2)',
                borderRadius: '10px',
                width: '40px', height: '40px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '5px',
                cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
              }}
              title="Menu"
            >
              {isMobileMenuOpen ? <X size={20} color="#52b788" /> : (
                <>
                  <span style={{ width: '18px', height: '2px', background: '#52b788', borderRadius: '2px', transition: 'all 0.2s' }} />
                  <span style={{ width: '14px', height: '2px', background: '#52b788', borderRadius: '2px', transition: 'all 0.2s' }} />
                  <span style={{ width: '18px', height: '2px', background: '#52b788', borderRadius: '2px', transition: 'all 0.2s' }} />
                </>
              )}
            </button>

            {/* Logo image */}
            <img
              src="/logo.jpg"
              alt="Agri AI Logo"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                objectFit: 'cover',
                objectPosition: 'center',
                border: '1.5px solid rgba(82,183,136,0.5)',
                boxShadow: '0 0 12px rgba(82,183,136,0.3)',
                flexShrink: 0,
              }}
            />

            {/* Brand text */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="brand-title block" style={{ fontSize: '1.2rem', lineHeight: '1.15' }}>
                {t('brandName')}
              </span>
              <span className="brand-subtitle" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                {t('brandSubtitle')}
              </span>
            </div>
          </div>

          {/* Right: Theme Toggle + Language + Auth */}
          <div className="flex-center-y flex-gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '10px',
                border: '1px solid rgba(82, 183, 136, 0.2)'
              }}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun size={14} style={{ color: '#ffa726' }} /> : <Moon size={14} style={{ color: '#1e754a' }} />}
              <span className="hide-mobile" style={{ fontWeight: 600 }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {/* Language Selector */}
            <div className="lang-selector">
              <Globe size={14} className="lang-icon" />
              <select
                value={i18n.language}
                onChange={(e) => {
                  const lang = e.target.value;
                  i18n.changeLanguage(lang);
                  localStorage.setItem('agri_ai_lang', lang);
                }}
                className="lang-select"
              >
                <option value="en">English (EN)</option>
                <option value="hi">हिन्दी (HI)</option>
                <option value="ta">தமிழ் (TA)</option>
                <option value="bn">বাংলা (BN)</option>
                <option value="as">அসমீயா (AS)</option>
              </select>
            </div>

            {/* User Auth */}
            {user ? (
              <div className="user-profile-badge">
                <div className="user-avatar-container">
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info hide-mobile">
                    <span className="user-name">{user.name}</span>
                    <span className="user-role">{user.role}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="btn-logout" title={t('logout')}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                <LogIn size={14} />
                <span className="hide-mobile">{t('login')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Slide-in Sidebar Drawer ───────────────────────────────────────────── */}
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 998,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Sidebar panel */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 999,
        width: '280px',
        background: 'linear-gradient(180deg, hsl(150,35%,6%) 0%, hsl(150,25%,5%) 100%)',
        borderRight: '1px solid rgba(82,183,136,0.15)',
        boxShadow: '4px 0 40px rgba(0,0,0,0.6)',
        transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>

        {/* Sidebar header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(82,183,136,0.1)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <img
            src="/logo.jpg"
            alt="Logo"
            style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '1.5px solid rgba(82,183,136,0.4)' }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{t('brandName')}</div>
            <div style={{ fontSize: '0.72rem', color: 'hsl(150,15%,50%)', marginTop: '2px' }}>{t('brandSubtitle')}</div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'hsl(150,10%,45%)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <div style={{ padding: '12px 12px', flex: 1 }}>
          {[
            {
              title: t('navGroupMain') || "Main Dashboard",
              items: [
                { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: t('dashboard') },
                { id: 'chat',      icon: <MessageCircle size={18} />, label: t('aiChatAssistant'), badge: 'AI' },
              ]
            },
            {
              title: t('navGroupPlanner') || "Interactive Farm Planner",
              items: [
                { id: 'profiler', icon: <Leaf size={18} />,           label: t('guidedFarmProfiler') || "Guided Farm Profiler" },
                { id: 'weekly-planner', icon: <Calendar size={18} />,  label: t('weeklyPlanner') || "Weekly Operations Planner" },
                { id: 'today-status', icon: <Activity size={18} />,    label: t('todayStatus') || "Today's Farm Status" },
                { id: 'planner', icon: <Mic size={18} />,             label: t('farmerVoiceAssistant') || "Farmer Voice Assistant" },
              ]
            },
            {
              title: t('navGroupEconomics') || "Decision & Economics",
              items: [
                { id: 'predictor', icon: <Sprout size={18} />,       label: t('cropRecommend') },
                { id: 'fertilizer',icon: <FlaskConical size={18} />,  label: t('fertilizer') },
                { id: 'yield',     icon: <Calculator size={18} />,    label: t('yieldPrediction') },
                { id: 'cost-estimator', icon: <Coins size={18} />,   label: t('precisionCostEstimator') || "Precision Cost & Profit Estimator" },
              ]
            },
            {
              title: t('navGroupMonitoring') || "Monitoring & Logs",
              items: [
                { id: 'disease',   icon: <Camera size={18} />,        label: t('diseaseCamera') },
                { id: 'market',    icon: <Coins size={18} />,         label: t('marketPrices') },
                { id: 'weather',   icon: <Sun size={18} />,           label: t('weather') },
                { id: 'iot',       icon: <Cpu size={18} />,            label: t('iotTelemetry') },
                { id: 'satellite', icon: <Satellite size={18} />,      label: t('satelliteView') },
              ]
            },
            {
              title: t('navGroupAudits') || "Platform Audits",
              items: [
                { id: 'telemetry-audit', icon: <History size={18} />, label: t('historicalTelemetryAudit') || "Historical Telemetry Audit" },
                { id: 'crop-projections', icon: <BarChart3 size={18} />,label: t('cropProjections') || "Crop Allocation & Yield Projections" },
                { id: 'transparency', icon: <Zap size={18} />,        label: t('decisionTransparency') || "Decision Calculation Transparency" },
              ]
            }
          ].map(group => (
            <div key={group.title}>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'hsl(150,20%,40%)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 8px 4px', margin: 0 }}>
                {group.title}
              </p>
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '11px 12px', borderRadius: '10px', border: 'none',
                    marginBottom: '2px', cursor: 'pointer', textAlign: 'left',
                    background: activeTab === item.id ? 'rgba(82,183,136,0.15)' : 'transparent',
                    color: activeTab === item.id ? '#52b788' : 'hsl(150,10%,65%)',
                    fontWeight: activeTab === item.id ? 700 : 500,
                    fontSize: '0.88rem', transition: 'all 0.15s',
                    borderLeft: activeTab === item.id ? '3px solid #52b788' : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'rgba(82,183,136,0.06)'; }}
                  onMouseLeave={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ opacity: activeTab === item.id ? 1 : 0.65 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', background: 'rgba(82,183,136,0.2)', color: '#52b788', letterSpacing: '0.04em' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Sidebar footer — language switcher */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(82,183,136,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Globe size={13} color="#52b788" />
            <span style={{ fontSize: '0.75rem', color: 'hsl(150,15%,50%)', fontWeight: 600 }}>{t('sidebarLanguage')}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[['en','EN'],['hi','HI'],['ta','TA'],['bn','BN'],['as','AS']].map(([code, label]) => (
              <button
                key={code}
                onClick={() => {
                  i18n.changeLanguage(code);
                  localStorage.setItem('agri_ai_lang', code);
                }}
                style={{
                  padding: '5px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                  border: i18n.language === code ? '1px solid rgba(82,183,136,0.5)' : '1px solid rgba(82,183,136,0.15)',
                  background: i18n.language === code ? 'rgba(82,183,136,0.15)' : 'transparent',
                  color: i18n.language === code ? '#52b788' : 'hsl(150,10%,50%)',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace Frame container */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard user={user || { name: 'Guest Farmer', role: 'farmer' }} token={token} backendUrl={BACKEND_URL} onNavigate={handleTabChange} />
        )}
        
        {activeTab === 'predictor' && (
          <CropPredictor user={user} token={token} backendUrl={BACKEND_URL} />
        )}

        {activeTab === 'fertilizer' && (
          <FertilizerAdvisor />
        )}

        {activeTab === 'yield' && (
          <YieldPredictor />
        )}

        {activeTab === 'weather' && (
          <WeatherDashboard />
        )}

        {activeTab === 'iot' && (
          <IoTTelemetry backendUrl={BACKEND_URL} />
        )}

        {activeTab === 'disease' && (
          <DiseaseDetector />
        )}

        {activeTab === 'market' && (
          <MarketInsights backendUrl={BACKEND_URL} />
        )}

        {activeTab === 'chat' && (
          <AIChatAssistant />
        )}

        {activeTab === 'satellite' && (
          <SatelliteView />
        )}

        {activeTab === 'cost-estimator' && (
          <PrecisionCostEstimator />
        )}
      </main>

      {/* Footer copyright indicators */}
      <footer className="footer">
        <p>{t('footerLabel')}</p>
      </footer>

      {/* Authentication Gateway Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
        backendUrl={BACKEND_URL}
      />

    </div>
    </ToastProvider>
  );
}
