import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Satellite, MapPin, Layers, Locate, Ruler, ZoomIn, ZoomOut, Navigation } from 'lucide-react';

// Fix Leaflet default icon path for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom farm marker
const farmIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:36px;height:36px;border-radius:50% 50% 50% 0;
    background:linear-gradient(135deg,#52b788,#38a169);
    transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 14px rgba(82,183,136,0.5);border:3px solid #fff;">
    <span style="transform:rotate(45deg);font-size:16px;">🌾</span>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -40],
});

// Click handler to place marker
function ClickMarker({ onPlace }) {
  useMapEvents({
    click(e) { onPlace(e.latlng); }
  });
  return null;
}

// Tile layer options
const LAYERS = {
  satellite: {
    label: '🛰️ Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics',
  },
  hybrid: {
    label: '🗺️ Hybrid',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '© Google Maps',
  },
  terrain: {
    label: '⛰️ Terrain',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '© Google Maps',
  },
  roadmap: {
    label: '🛣️ Roadmap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
  },
};

// Area info cards
const FIELD_INFO = [
  { icon: '🌾', label: 'Land Type', value: 'Agricultural / Farmland' },
  { icon: '📐', label: 'Est. Area', value: 'Use click to mark corners' },
  { icon: '🌱', label: 'Soil Zone', value: 'Alluvial / Red Laterite' },
  { icon: '💧', label: 'Water Source', value: 'Canal + Borewell' },
  { icon: '🌡️', label: 'Agro-zone', value: 'Tropical Semi-Arid' },
  { icon: '🏛️', label: 'Land Use', value: 'Kharif + Rabi Cycle' },
];

export default function SatelliteView() {
  const [position, setPosition]       = useState([20.5937, 78.9629]); // India center
  const [markers, setMarkers]         = useState([]);
  const [activeLayer, setActiveLayer] = useState('satellite');
  const [locating, setLocating]       = useState(false);
  const [locationName, setLocationName] = useState('');
  const mapRef = useRef(null);

  // Get user's GPS location
  const locateUser = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPosition([lat, lng]);
        mapRef.current?.flyTo([lat, lng], 16, { duration: 1.5 });

        // Reverse geocode for place name
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          const name = data?.display_name?.split(',').slice(0, 3).join(', ') || 'Your Location';
          setLocationName(name);
          setMarkers(prev => [...prev, { lat, lng, label: '📍 Your Farm Location', note: name }]);
        } catch {
          setLocationName(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          setMarkers(prev => [...prev, { lat, lng, label: '📍 Your Farm Location' }]);
        }
        setLocating(false);
      },
      (err) => {
        console.warn('GPS error:', err);
        alert('Could not get your location. Please allow location access.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const placeMarker = (latlng) => {
    setMarkers(prev => [
      ...prev,
      { lat: latlng.lat, lng: latlng.lng, label: `📌 Field Point ${prev.length + 1}`, note: `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}` }
    ]);
  };

  const clearMarkers = () => setMarkers([]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div className="card-glass" style={{ padding: '20px 24px' }}>
        <div className="flex-row-resp" style={{ gap: '16px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Satellite style={{ color: '#52b788' }} />
              Satellite Land View
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
              View your farmland from satellite imagery • Click map to mark field corners
              {locationName && <> • 📍 <strong style={{ color: '#52b788' }}>{locationName}</strong></>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={locateUser}
              disabled={locating}
              className="btn-primary"
              style={{ padding: '9px 16px', fontSize: '0.82rem' }}
            >
              <Locate size={14} />
              {locating ? 'Locating…' : '📍 My Farm'}
            </button>
            {markers.length > 0 && (
              <button onClick={clearMarkers} className="btn-secondary" style={{ padding: '9px 14px', fontSize: '0.82rem' }}>
                Clear Markers
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>

        {/* Map */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(82,183,136,0.2)', minHeight: '520px' }}>

          {/* Layer switcher bar */}
          <div style={{ display: 'flex', gap: '6px', padding: '10px 12px', background: 'rgba(4,20,10,0.95)', flexWrap: 'wrap' }}>
            {Object.entries(LAYERS).map(([key, layer]) => (
              <button
                key={key}
                onClick={() => setActiveLayer(key)}
                style={{
                  padding: '5px 12px', fontSize: '0.75rem', fontWeight: 600, borderRadius: '20px',
                  border: activeLayer === key ? '1.5px solid #52b788' : '1.5px solid rgba(82,183,136,0.2)',
                  background: activeLayer === key ? 'rgba(82,183,136,0.15)' : 'transparent',
                  color: activeLayer === key ? '#52b788' : 'hsl(var(--text-muted))',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {layer.label}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'hsl(var(--text-muted))', alignSelf: 'center' }}>
              <Navigation size={11} style={{ display: 'inline', marginRight: '4px' }} />
              Click map to mark farm corners
            </span>
          </div>

          <MapContainer
            center={position}
            zoom={6}
            style={{ height: '480px', width: '100%' }}
            ref={mapRef}
            zoomControl={false}
          >
            <TileLayer
              key={activeLayer}
              url={LAYERS[activeLayer].url}
              attribution={LAYERS[activeLayer].attribution}
              maxZoom={20}
            />

            {/* Map click handler */}
            <ClickMarker onPlace={placeMarker} />

            {/* Markers */}
            {markers.map((m, i) => (
              <Marker key={i} position={[m.lat, m.lng]} icon={farmIcon}>
                <Popup>
                  <div style={{ minWidth: '160px' }}>
                    <strong style={{ color: '#2d6a4f' }}>{m.label}</strong><br />
                    {m.note && <small style={{ color: '#555' }}>{m.note}</small>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Field Info */}
          <div className="card-glass" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={15} style={{ color: '#52b788' }} />
              Field Intelligence
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {FIELD_INFO.map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', fontSize: '0.76rem', borderBottom: '1px solid rgba(82,183,136,0.06)', paddingBottom: '8px' }}>
                  <span style={{ color: 'hsl(var(--text-muted))' }}>{f.icon} {f.label}</span>
                  <span style={{ color: '#a8dabc', fontWeight: 600, textAlign: 'right', maxWidth: '120px' }}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Marked Points */}
          <div className="card-glass" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ruler size={15} style={{ color: '#52b788' }} />
              Marked Points ({markers.length})
            </h3>
            {markers.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '12px 0' }}>
                Click on the map to mark farm field corners
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {markers.map((m, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(82,183,136,0.05)', borderRadius: '8px', padding: '8px', border: '1px solid rgba(82,183,136,0.1)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#a8dabc', fontWeight: 600 }}>{m.label}</span>
                    {m.note && <span style={{ fontSize: '0.68rem', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>{m.note}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="card-glass" style={{ padding: '16px', background: 'rgba(82,183,136,0.04)' }}>
            <p style={{ fontSize: '0.73rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
              💡 <strong style={{ color: '#52b788' }}>Tips:</strong><br />
              • Switch to <strong>Satellite</strong> for high-res aerial imagery<br />
              • Use <strong>Hybrid</strong> to overlay road names<br />
              • Click <strong>📍 My Farm</strong> to jump to your GPS location<br />
              • Scroll to zoom in/out on your field
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
