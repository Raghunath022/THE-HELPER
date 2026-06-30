import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, TrendingUp, Users, Calendar, RefreshCw } from 'lucide-react';

export default function HistoricalTelemetryAudit({ user, token, backendUrl }) {
  const { t, i18n } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fallback mock history if no backend history found
  const mockHistory = [
    { id: 1, createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), inputs: { N: 90, P: 45, K: 40, ph: 6.2 }, state: 'Uttar Pradesh', recommendation: { crop: 'tomato', confidence: 0.94 }, market: { modal: 18000, unit: 'Ton' } },
    { id: 2, createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), inputs: { N: 110, P: 35, K: 50, ph: 6.8 }, state: 'Punjab', recommendation: { crop: 'wheat', confidence: 0.88 }, market: { modal: 24000, unit: 'Ton' } },
    { id: 3, createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), inputs: { N: 130, P: 28, K: 85, ph: 5.8 }, state: 'Tamil Nadu', recommendation: { crop: 'paddy', confidence: 0.91 }, market: { modal: 22000, unit: 'Ton' } }
  ];

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const url = backendUrl || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `${window.location.protocol}//${window.location.hostname}:10000`
        : 'https://smart-agri-platform-1.onrender.com');

      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${url}/api/history`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setHistory(data);
        } else {
          setHistory(mockHistory);
        }
      } else {
        setHistory(mockHistory);
      }
    } catch (err) {
      console.warn("Telemetry History API offline, loading fallback metrics:", err);
      setHistory(mockHistory);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const activeUser = user || { name: 'Guest Farmer', role: 'farmer' };
  const totalQueries = history.length;
  const avgConfidence = totalQueries > 0 
    ? Math.round((history.reduce((acc, curr) => acc + (curr.recommendation?.confidence || 0.85), 0) / totalQueries) * 100)
    : 85;

  const translateCrop = (cropName) => {
    if (!cropName) return 'N/A';
    const cleanCrop = cropName.trim().toLowerCase();
    const map = {
      'tomato': t('tomato', 'Tomato'),
      'potato': t('potato', 'Potato'),
      'paddy': t('paddy', t('rice', 'Paddy')),
      'wheat': t('wheat', 'Wheat'),
      'maize': t('maize', 'Maize')
    };
    return map[cleanCrop] || cropName;
  };

  const translateState = (stateName) => {
    if (!stateName) return 'N/A';
    const map = {
      'Uttar Pradesh': t('state_up', 'Uttar Pradesh'),
      'Maharashtra': t('state_maharashtra', 'Maharashtra'),
      'Tamil Nadu': t('state_tn', 'Tamil Nadu'),
      'Bihar': t('state_bihar', 'Bihar'),
      'Karnataka': t('state_karnataka', 'Karnataka'),
      'Punjab': t('state_punjab', 'Punjab')
    };
    return map[stateName] || stateName;
  };

  const translateRole = (role) => {
    const map = {
      'farmer': t('roleFarmer', 'Farmer'),
      'admin': t('roleAdmin', 'Admin'),
      'expert': t('roleExpert', 'Expert'),
      'agronomist': t('roleExpert', 'Agronomist')
    };
    return map[role.toLowerCase()] || role;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div className="card-glass" style={{ borderLeft: '4px solid #52b788', padding: '16px 24px' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
          {t('htaTitle', 'Historical Telemetry Audit & System logs')}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '4px', margin: 0 }}>
          {t('htaSubtitle', 'Audit all previous agronomic recommendations, query confidence ratings, and API transaction history logs.')}
        </p>
      </div>

      {loading ? (
        <div className="card-glass flex-center" style={{ height: '180px' }}>
          <RefreshCw className="animate-spin text-primary" size={28} />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '16px' }}>
            
            <div className="metric-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '12px', border: '1px solid rgba(82, 183, 136, 0.1)' }}>
              <div className="stat-icon stat-icon-emerald" style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', background: 'rgba(82,183,136,0.1)', color: '#52b788' }}>
                <Database size={24} />
              </div>
              <div>
                <p className="input-label" style={{ fontSize: '0.72rem', margin: 0, color: 'hsl(var(--text-muted))', fontWeight: 600 }}>{t('htaTotalQueries', 'TOTAL QUERIES')}</p>
                <h3 style={{ fontSize: '1.75rem', color: '#fff', margin: '4px 0 0 0', fontWeight: 800 }}>{totalQueries}</h3>
              </div>
            </div>

            <div className="metric-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '12px', border: '1px solid rgba(82, 183, 136, 0.1)' }}>
              <div className="stat-icon stat-icon-teal" style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', background: 'rgba(20, 180, 180, 0.1)', color: '#14b4b4' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="input-label" style={{ fontSize: '0.72rem', margin: 0, color: 'hsl(var(--text-muted))', fontWeight: 600 }}>{t('htaAvgConfidence', 'AVG CONFIDENCE')}</p>
                <h3 style={{ fontSize: '1.75rem', color: '#fff', margin: '4px 0 0 0', fontWeight: 800 }}>{avgConfidence}%</h3>
              </div>
            </div>

            <div className="metric-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '12px', border: '1px solid rgba(82, 183, 136, 0.1)' }}>
              <div className="stat-icon stat-icon-amber" style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', background: 'rgba(249, 166, 32, 0.1)', color: '#f9a620' }}>
                <Users size={24} />
              </div>
              <div>
                <p className="input-label" style={{ fontSize: '0.72rem', margin: 0, color: 'hsl(var(--text-muted))', fontWeight: 600 }}>{t('htaScope', 'ACCOUNT SCOPE')}</p>
                <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: '4px 0 0 0', fontWeight: 800, textTransform: 'capitalize' }}>{translateRole(activeUser.role)}</h3>
              </div>
            </div>

          </div>

          {/* Table Log */}
          <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Calendar size={18} style={{ color: '#52b788' }} />
              {t('htaHeader', 'System Telemetry Transaction Logs')}
            </h3>

            <div className="table-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
              <table className="custom-table" style={{ width: '100%', minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th>{t('htaColDate', 'Date / Time')}</th>
                    <th>{t('htaColSoil', 'Soil Metrics Profile')}</th>
                    <th>{t('htaColRegion', 'Region Scope')}</th>
                    <th>{t('htaColMatch', 'Inferred Match')}</th>
                    <th>{t('htaColPrice', 'Mandi Price')}</th>
                    <th style={{ textAlign: 'right' }}>{t('htaColConf', 'Confidence')}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id || item._id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} style={{ color: 'hsl(var(--text-muted))', flexShrink: 0 }} />
                        {new Date(item.createdAt || Date.now()).toLocaleDateString(i18n.language === 'en' ? 'en-IN' : i18n.language, {
                          day: 'numeric', month: 'short'
                        })}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {item.inputs?.N ?? 0}-{item.inputs?.P ?? 0}-{item.inputs?.K ?? 0} (pH {item.inputs?.ph ?? 0})
                      </td>
                      <td>{translateState(item.state)}</td>
                      <td style={{ textTransform: 'capitalize', fontWeight: 600, color: '#fff' }}>
                        {translateCrop(item.recommendation?.crop)}
                      </td>
                      <td style={{ color: '#ffa726', fontWeight: 500 }}>
                        {item.market?.price ? `₹${item.market.price.toLocaleString('en-IN')}` : item.market?.modal ? `₹${item.market.modal.toLocaleString('en-IN')}` : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#52b788' }}>
                        {Math.round((item.recommendation?.confidence || 0.85) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
