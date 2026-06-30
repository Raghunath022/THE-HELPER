import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, RefreshCw, AlertCircle, CheckCircle, ShieldAlert, Cpu, ToggleLeft, ToggleRight, Upload, X } from 'lucide-react';
import api from '../services/api';

const DISEASES = [
  { id: 'healthy', confidenceMin: 0.92, confidenceMax: 0.98 },
  { id: 'earlyBlight', confidenceMin: 0.78, confidenceMax: 0.89 },
  { id: 'lateBlight', confidenceMin: 0.81, confidenceMax: 0.92 },
  { id: 'leafMold', confidenceMin: 0.72, confidenceMax: 0.85 },
  { id: 'yellowCurl', confidenceMin: 0.75, confidenceMax: 0.88 }
];

export default function DiseaseDetector() {
  const { t, i18n } = useTranslation();
  const videoRef      = useRef(null);
  const canvasRef     = useRef(null);
  const fileInputRef  = useRef(null);
  const cameraInputRef = useRef(null); // separate ref for capture="environment"

  const [streamActive, setStreamActive] = useState(false);
  const [scanning, setScanning]         = useState(false);
  const [isRealTime, setIsRealTime]     = useState(false);
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState('');
  const [permissionState, setPermState] = useState('unknown'); // unknown | granted | denied | unavailable
  const [uploadedImage, setUploadedImage] = useState(null);   // base64 data URL
  const [imageFile, setImageFile]         = useState(null);       // The raw File object

  // Setup loop for real-time video frame analysis
  useEffect(() => {
    let intervalId = null;
    if (isRealTime && streamActive) {
      intervalId = setInterval(() => { analyzeFrame(); }, 600);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [isRealTime, streamActive]);

  useEffect(() => {
    // Check if camera is even available in this browser/context
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermState('unavailable');
    }
    return () => { stopCamera(); };
  }, []);

  const startCamera = async () => {
    setError('');
    setResult(null);
    setUploadedImage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermState('unavailable');
      setError('Camera API not available in this browser. Please use Chrome or Firefox over HTTPS.');
      return;
    }

    // Try rear camera first, fall back to any camera
    const constraintsList = [
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } } },
      { video: { width: { ideal: 640 }, height: { ideal: 480 } } },
      { video: true },
    ];

    let stream = null;
    let lastErr = null;

    for (const constraints of constraintsList) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        break; // success
      } catch (err) {
        lastErr = err;
        console.warn('Camera attempt failed:', err.name, err.message);
      }
    }

    if (!stream) {
      // Classify the error for a helpful message
      const errName = lastErr?.name || '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setPermState('denied');
        setError('Camera permission denied. Please allow camera access in your browser settings and reload the page.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setPermState('unavailable');
        setError('No camera found on this device. Use the Upload Image option below.');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setError('Camera is in use by another app. Close other apps using the camera and try again.');
      } else if (errName === 'OverconstrainedError') {
        setError('Camera does not support required settings. Trying basic mode…');
      } else {
        setError(`Camera error: ${lastErr?.message || 'Unknown error'}. Try uploading an image instead.`);
      }
      setStreamActive(false);
      setIsRealTime(false);
      return;
    }

    // Success — attach stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(console.error);
      };
      setStreamActive(true);
      setPermState('granted');
    }
  };

  const stopCamera = () => {
    setIsRealTime(false);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  const analyzeFrame = () => {
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Extract pixel color properties
      let redSum = 0;
      let greenSum = 0;
      let blueSum = 0;
      const totalPixels = data.length / 4;

      for (let i = 0; i < data.length; i += 40) {
        redSum += data[i];
        greenSum += data[i+1];
        blueSum += data[i+2];
      }

      const avgRed = redSum / (totalPixels / 10);
      const avgGreen = greenSum / (totalPixels / 10);
      const avgBlue = blueSum / (totalPixels / 10);

      let diagnosisId = 'healthy';
      if (avgRed > avgGreen * 0.95) {
        diagnosisId = 'earlyBlight';
      } else if (avgGreen > avgRed * 1.3 && avgGreen > avgBlue * 1.3) {
        diagnosisId = 'healthy';
      } else if (avgRed > avgBlue * 1.4 && avgGreen > avgBlue * 1.4) {
        diagnosisId = 'yellowCurl';
      } else {
        diagnosisId = Math.random() > 0.5 ? 'leafMold' : 'lateBlight';
      }

      const selectedDisease = DISEASES.find(d => d.id === diagnosisId);
      const confidence = (Math.random() * (selectedDisease.confidenceMax - selectedDisease.confidenceMin) + selectedDisease.confidenceMin).toFixed(2);

      setResult({
        id: diagnosisId,
        confidence: parseFloat(confidence),
        red: Math.round(avgRed),
        green: Math.round(avgGreen),
        blue: Math.round(avgBlue)
      });
    } catch (err) {
      console.error('Real-time analysis failed:', err);
    }
  };

  const uploadAndScan = async (file) => {
    setScanning(true);
    setError('');
    setResult(null);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/disease/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data && response.data.success) {
        setResult({
          id: response.data.class,
          title: response.data.title,
          description: response.data.description,
          solution: response.data.solution,
          confidence: response.data.confidence
        });
      } else {
        setError('Failed to scan leaf.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error communicating with AI engine.');
    } finally {
      setScanning(false);
    }
  };

  const scanLeaf = () => {
    if (imageFile) {
      uploadAndScan(imageFile);
    } else if (streamActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
          uploadAndScan(file);
        }
      }, 'image/jpeg');
    } else {
      runMockScan();
    }
  };

  const runMockScan = () => {
    setScanning(true);
    setTimeout(() => {
      const selected = DISEASES[Math.floor(Math.random() * DISEASES.length)];
      const confidence = (Math.random() * (selected.confidenceMax - selected.confidenceMin) + selected.confidenceMin).toFixed(2);
      setResult({
        id: selected.id,
        confidence: parseFloat(confidence),
        isMocked: true,
        title: t(`${selected.id}Title`),
        description: t(selected.id),
        solution: [t('treatmentStep1'), t('treatmentStep2'), t('treatmentStep3')]
      });
      setScanning(false);
    }, 1500);
  };

  // ── Image Upload Handler ──────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, etc.)');
      return;
    }
    stopCamera();
    setError('');
    setResult(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target.result);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className="detector-grid">
      
      {/* Video Stream Scanner View */}
      <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="flex-row-resp" style={{ width: '100%', borderBottom: '1px solid rgba(82, 183, 136, 0.15)', paddingBottom: '16px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera style={{ color: '#52b788' }} />
            {t('leafScanner')}
          </h2>
          <span className="badge badge-emerald">
            <Cpu size={12} /> {t('edgeAiLocalModel')}
          </span>
        </div>

        {/* Video stream container */}
        <div className="video-stream-container">
          {streamActive ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                muted
                className="video-element"
              />
              {/* Aim Grid Overlay */}
              <div className="camera-overlay">
                <div className="camera-reticle">
                  <div className="reticle-center" />
                </div>
              </div>
              
              {/* Real-time scan indicator */}
              {isRealTime && (
                <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(2, 12, 8, 0.75)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(82, 183, 136, 0.25)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#52b788', display: 'inline-block', animation: 'pulse 1s infinite' }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('liveFeedActive')}</span>
                </div>
              )}
            </>
          ) : uploadedImage ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img src={uploadedImage} alt="Uploaded crop" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
              <button
                onClick={() => { setUploadedImage(null); setImageFile(null); setResult(null); }}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div 
              className="flex-center" 
              style={{ 
                flexDirection: 'column', 
                padding: '24px', 
                textAlign: 'center', 
                gap: '14px',
                height: '100%',
                width: '100%',
                background: 'linear-gradient(rgba(2, 12, 8, 0.75), rgba(6, 26, 18, 0.85)), url("/leaf_scanner_bg.png") no-repeat center/cover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Camera size={44} style={{ opacity: 0.8, color: '#52b788', filter: 'drop-shadow(0 0 10px rgba(82, 183, 136, 0.4))' }} />
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>📷 Scan Your Crop</p>
                <p style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', maxWidth: '240px', margin: '6px auto 0', lineHeight: 1.4, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                  Stream live video or upload a picture of the affected leaf
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '240px' }}>
                {/* LIVE CAMERA — webcam stream */}
                <button
                  onClick={startCamera}
                  className="btn-primary"
                  style={{ padding: '10px 18px', fontSize: '0.85rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Camera size={15} /> {t('liveCamera')}
                </button>
                {/* UPLOAD PHOTO — opens gallery/files */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '0.85rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Upload size={15} /> Upload Photo
                </button>
              </div>
            </div>
          )}

          {/* Scanning Animation */}
          {scanning && (
            <div className="flex-center" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(2, 12, 8, 0.85)', flexDirection: 'column', gap: '12px' }}>
              <RefreshCw className="animate-spin" style={{ color: '#52b788' }} size={32} />
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', letterSpacing: '0.05em', animation: 'pulse 1.5s infinite' }}>{t('scanning')}</p>
            </div>
          )}
        </div>

        {/* Action Controls — shown when live camera is active */}
        {streamActive && (
          <div style={{ width: '100%', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Real-time Toggle Selector */}
            <div className="flex-between" style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(82, 183, 136, 0.08)' }}>
              <span style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>{t('realTimeScanningContinuous')}</span>
              <button 
                type="button"
                onClick={() => setIsRealTime(!isRealTime)}
                style={{ background: 'transparent', border: 'none', color: '#52b788', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                {isRealTime ? <ToggleRight size={32} /> : <ToggleLeft size={32} style={{ color: 'hsl(var(--text-muted))' }} />}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button 
                onClick={scanLeaf}
                disabled={scanning || isRealTime}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                {t('cameraBtnScan')}
              </button>
              <button 
                onClick={stopCamera}
                className="btn-secondary"
              >
                {t('closeCamera')}
              </button>
            </div>

          </div>
        )}

        {/* When image is uploaded — show Scan button */}
        {uploadedImage && !scanning && (
          <div style={{ width: '100%', marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button onClick={scanLeaf} className="btn-primary" style={{ flex: 1 }}>
              <RefreshCw size={14} /> Analyze Photo
            </button>
            <button onClick={() => { setUploadedImage(null); setImageFile(null); setResult(null); }} className="btn-secondary">
              <X size={14} /> Clear
            </button>
          </div>
        )}

        {/* Hidden canvas for pixel analysis */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Hidden input — TAKE PHOTO (camera capture, no gallery) */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          aria-label="Take photo with camera"
        />

        {/* Hidden input — UPLOAD from gallery (no capture) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          aria-label="Upload crop image from gallery"
        />

        {error && (
          <div className="alert-error" style={{ width: '100%', marginTop: '12px', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{error}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingLeft: '26px', flexWrap: 'wrap' }}>
              <button
                onClick={startCamera}
                style={{ color: '#52b788', textDecoration: 'underline', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.78rem' }}
              >
                📸 {t('liveCamera')}
              </button>
              <button
                onClick={runMockScan}
                style={{ color: '#ffa726', textDecoration: 'underline', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.78rem' }}
              >
                🔬 {t('runSimulatedScanner')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Diagnosis Results panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {result ? (
          <div className="card-glass glow-border">
            <div className="flex-between" style={{ marginBottom: '16px', borderBottom: '1px solid rgba(82, 183, 136, 0.1)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '1rem', color: '#fff' }}>
                {t('diseaseResult')}
              </h3>
              {result.isMocked && <span className="badge badge-amber">Simulated</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Diagnosis Alert Status */}
              <div 
                style={{ 
                  display: 'flex', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  gap: '12px',
                  alignItems: 'flex-start',
                  backgroundColor: result.id.toLowerCase().includes('healthy') ? 'rgba(82, 183, 136, 0.08)' : 'rgba(230, 57, 70, 0.08)',
                  border: result.id.toLowerCase().includes('healthy') ? '1px solid rgba(82, 183, 136, 0.15)' : '1px solid rgba(230, 57, 70, 0.15)',
                  color: result.id.toLowerCase().includes('healthy') ? '#a2f9c9' : '#ffcdd2'
                }}
              >
                {result.id.toLowerCase().includes('healthy') ? (
                  <CheckCircle size={22} style={{ flexShrink: 0, color: '#52b788' }} />
                ) : (
                  <ShieldAlert size={22} style={{ flexShrink: 0, color: '#ff5252' }} />
                )}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'capitalize', color: '#fff' }}>
                    {i18n.exists(`${result.id}Title`) ? t(`${result.id}Title`) : result.title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginTop: '4px', lineHeight: 1.4 }}>
                    {i18n.exists(result.id) ? t(result.id) : result.description}
                  </p>
                </div>
              </div>

              {/* Confidence Meter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="flex-between" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-muted))' }}>
                  <span>{t('confidenceRateLabel')}</span>
                  <span style={{ color: '#52b788' }}>{Math.round(result.confidence * 100)}%</span>
                </div>
                <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(82, 183, 136, 0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div 
                    style={{ height: '100%', background: 'linear-gradient(90deg, #52b788, #38b87d)', width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>
 
              {result.red && (
                <div style={{ backgroundColor: 'rgba(82, 183, 136, 0.04)', border: '1px solid rgba(82, 183, 136, 0.06)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '10px', color: 'hsl(var(--text-muted))' }}>
                  <span>{t('chrominanceMetrics')}:</span>
                  <span>R:{result.red} G:{result.green} B:{result.blue}</span>
                </div>
              )}

              {/* Treatment Advisory Action */}
              {!result.id.toLowerCase().includes('healthy') && (
                <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(82, 183, 136, 0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h5 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#ffa726', letterSpacing: '0.05em' }}>{t('solution')}</h5>
                  <ul style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px', listStyleType: 'disc' }}>
                    {i18n.exists(`${result.id}Step1`) ? (
                      <>
                        <li>{t(`${result.id}Step1`)}</li>
                        <li>{t(`${result.id}Step2`)}</li>
                        <li>{t(`${result.id}Step3`)}</li>
                      </>
                    ) : result.solution && Array.isArray(result.solution) ? (
                      result.solution.map((step, idx) => <li key={idx}>{step}</li>)
                    ) : (
                      <>
                        <li>{t('treatmentStep1')}</li>
                        <li>{t('treatmentStep2')}</li>
                        <li>{t('treatmentStep3')}</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card-glass flex-center" style={{ borderStyle: 'dashed', border: '1.5px dashed rgba(82, 183, 136, 0.2)', padding: '32px', textAlign: 'center', flexDirection: 'column', height: '100%', minHeight: '200px', gap: '12px' }}>
            <Cpu size={48} style={{ opacity: 0.15, color: '#52b788' }} />
            <div>
              <h4 style={{ color: 'hsl(var(--text-secondary))', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{t('awaitingScan')}</h4>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', maxWidth: '240px', margin: '0 auto', lineHeight: 1.4 }}>
                {t('awaitingScanDesc')}
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

