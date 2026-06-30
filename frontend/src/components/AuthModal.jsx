import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Mail, Lock, User as UserIcon, Shield, CreditCard, Key } from 'lucide-react';
import { useToast } from '../useToast';

const MOCK_SMART_CARDS = {
  'F-88291': { farmerName: "Rajesh Kumar", state: "Uttar Pradesh", soil: "Loamy", crop: "Tomato" },
  'F-77482': { farmerName: "Amrit Singh", state: "Uttar Pradesh", soil: "Loamy", crop: "Wheat" },
  'F-55321': { farmerName: "Selvam M.", state: "Tamil Nadu", soil: "Clay", crop: "Paddy" }
};

export default function AuthModal({ isOpen, onClose, onAuthSuccess, backendUrl }) {
  const { t } = useTranslation();
  const toast = useToast();
  
  const [loginMethod, setLoginMethod] = useState('smartCard'); // 'smartCard' | 'email'
  const [isLogin, setIsLogin] = useState(true); // for email signup/login toggle
  
  // Smart Card State
  const [smartCardId, setSmartCardId] = useState('');
  
  // Email Account State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSmartCardSubmit = (e) => {
    e.preventDefault();
    setError('');
    const trimmedId = smartCardId.trim().toUpperCase();
    if (!trimmedId) {
      setError("Please enter a valid Smart Card ID.");
      return;
    }

    setLoading(true);
    // Simulate minor network check
    setTimeout(() => {
      const record = MOCK_SMART_CARDS[trimmedId] || {
        farmerName: `Farmer #${trimmedId}`,
        state: "Uttar Pradesh",
        soil: "Loamy",
        crop: "Tomato"
      };

      const userObj = {
        id: trimmedId,
        name: record.farmerName,
        email: `smart-${trimmedId.toLowerCase()}@smartfarm.com`,
        role: "farmer",
        smartCardId: trimmedId,
        state: record.state,
        soilType: record.soil,
        selectedCrop: record.crop
      };

      localStorage.setItem('agri_ai_token', `mock-token-${trimmedId}`);
      localStorage.setItem('agri_ai_user', JSON.stringify(userObj));

      onAuthSuccess(userObj, `mock-token-${trimmedId}`);
      toast.success(`Welcome back, ${record.farmerName}! Smart Card profile loaded.`);
      setLoading(false);
      onClose();
    }, 800);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password } 
      : { name, email, password, role };

    try {
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save token and user info
      localStorage.setItem('agri_ai_token', data.token);
      localStorage.setItem('agri_ai_user', JSON.stringify(data.user));
      
      onAuthSuccess(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}!`);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        
        {/* Close Button */}
        <button onClick={onClose} className="modal-close-btn">
          <X size={20} />
        </button>

        {/* Modal Title */}
        <div className="modal-header" style={{ marginBottom: '16px' }}>
          <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {loginMethod === 'smartCard' ? 'Smart Card Portal' : isLogin ? t('login') : t('signup')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>
            {loginMethod === 'smartCard' 
              ? 'Access farm profile using your Smart ID Card' 
              : isLogin ? 'Access your agricultural portal' : 'Create a free account to get started'}
          </p>
        </div>

        {/* Auth Method Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(82,183,136,0.1)', marginBottom: '20px' }}>
          <button
            onClick={() => { setLoginMethod('smartCard'); setError(''); }}
            className={`btn-secondary`}
            style={{
              flex: 1, padding: '8px', fontSize: '0.8rem', borderRadius: '8px', border: 'none',
              background: loginMethod === 'smartCard' ? 'rgba(82,183,136,0.15)' : 'transparent',
              color: loginMethod === 'smartCard' ? '#52b788' : 'hsl(var(--text-secondary))',
              fontWeight: loginMethod === 'smartCard' ? 700 : 500
            }}
          >
            <CreditCard size={14} style={{ marginRight: '6px' }} />
            Smart Card
          </button>
          <button
            onClick={() => { setLoginMethod('email'); setError(''); }}
            className={`btn-secondary`}
            style={{
              flex: 1, padding: '8px', fontSize: '0.8rem', borderRadius: '8px', border: 'none',
              background: loginMethod === 'email' ? 'rgba(82,183,136,0.15)' : 'transparent',
              color: loginMethod === 'email' ? '#52b788' : 'hsl(var(--text-secondary))',
              fontWeight: loginMethod === 'email' ? 700 : 500
            }}
          >
            <Mail size={14} style={{ marginRight: '6px' }} />
            Email Account
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(230, 57, 70, 0.1)', border: '1px solid rgba(230, 57, 70, 0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: 'hsl(var(--danger))', fontSize: '0.8rem' }}>
            <X size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* ── PATH 1: SMART CARD LOGIN FORM ── */}
        {loginMethod === 'smartCard' ? (
          <form onSubmit={handleSmartCardSubmit} className="modal-form">
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="input-label">Smart Card ID</label>
              <div className="input-icon-wrapper">
                <CreditCard size={18} className="input-icon" />
                <input 
                  type="text" 
                  value={smartCardId}
                  onChange={(e) => setSmartCardId(e.target.value)}
                  className="input-field input-with-icon" 
                  placeholder="e.g. F-88291" 
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Presets:</span>
              {Object.keys(MOCK_SMART_CARDS).map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSmartCardId(id)}
                  className="credibility-badge"
                  style={{ cursor: 'pointer', border: '1px solid rgba(82, 183, 136, 0.2)' }}
                >
                  {id}
                </button>
              ))}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              {loading ? 'Authenticating...' : 'Verify & Log In'}
            </button>
          </form>
        ) : (
          
          /* ── PATH 2: EMAIL LOGIN/SIGNUP FORM ── */
          <form onSubmit={handleEmailSubmit} className="modal-form">
            {!isLogin && (
              <div className="form-group">
                <label className="input-label">Full Name</label>
                <div className="input-icon-wrapper">
                  <UserIcon size={18} className="input-icon" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field input-with-icon" 
                    placeholder="Full Name" 
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="input-label">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field input-with-icon" 
                  placeholder="farmer@farm.com" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Password</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field input-with-icon" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="input-label">Select Your Role</label>
                <div className="input-icon-wrapper">
                  <Shield size={18} className="input-icon" />
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input-field input-with-icon"
                  >
                    <option value="farmer">{t('roleFarmer')}</option>
                    <option value="expert">{t('roleExpert')}</option>
                    <option value="admin">{t('roleAdmin')}</option>
                  </select>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            >
              {loading ? 'Processing...' : isLogin ? t('login') : t('signup')}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
              {isLogin ? "Don't have an email account?" : "Already have an email account?"}{' '}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline bg-transparent border-none cursor-pointer"
                style={{ padding: 0 }}
              >
                {isLogin ? t('signup') : t('login')}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
