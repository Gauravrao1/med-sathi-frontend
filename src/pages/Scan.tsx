import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { scanApi } from '../api/client';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, Shield, Loader2, CheckCircle, XCircle, Zap, SwitchCamera, X, Image as ImageIcon } from 'lucide-react';

type Phase = 'select' | 'scanning' | 'uploading' | 'processing' | 'done' | 'error';

export const Scan: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>('select');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [scanStep, setScanStep] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [lastDetectedCode, setLastDetectedCode] = useState('');

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Animate processing steps
  useEffect(() => {
    if (phase === 'processing') {
      setScanStep(0);
      const timers = [
        setTimeout(() => setScanStep(1), 600),
        setTimeout(() => setScanStep(2), 1200),
        setTimeout(() => setScanStep(3), 1800),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [phase]);

  const stopCamera = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
    } catch (e) {
      // ignore
    }
    setCameraActive(false);
  };

  // =====================
  // LIVE BARCODE/QR SCAN
  // =====================
  const startLiveScan = async () => {
    setPhase('scanning');
    setCameraActive(true);
    setScannedCode('');
    setLastDetectedCode('');

    // Small delay for DOM to render the container
    await new Promise(r => setTimeout(r, 300));

    try {
      const scanner = new Html5Qrcode('qr-scanner-container');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 150 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Barcode/QR code detected!
          setLastDetectedCode(decodedText);
          setScannedCode(decodedText);
          handleBarcodeScan(decodedText);
          stopCamera();
        },
        () => {
          // scan miss - do nothing
        }
      );
    } catch (err: any) {
      console.error('Camera error:', err);
      setErrorMessage('Could not access camera. Please check permissions or try Upload instead.');
      setPhase('error');
      setCameraActive(false);
    }
  };

  const handleBarcodeScan = async (code: string) => {
    setPhase('processing');
    try {
      const result = await scanApi.submitScan({
        barcode_data: code,
        scan_method: 'barcode'
      });

      // Minimum processing animation time
      await new Promise(r => setTimeout(r, 2000));

      sessionStorage.setItem('lastScanResult', JSON.stringify(result));
      setPhase('done');
      navigate('/results/latest');
    } catch (err: any) {
      // If barcode not found in DB, show the code
      setErrorMessage('Barcode "' + code + '" not found in our database. Try scanning the medicine name instead.');
      setPhase('error');
    }
  };

  // =====================
  // TAKE PHOTO (Capture)
  // =====================
  const handleTakePhoto = () => {
    // Stop live scanner first if running
    stopCamera();
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) processImageFile(file);
    };
    input.click();
  };

  // =====================
  // UPLOAD FROM GALLERY
  // =====================
  const handleUpload = () => {
    cameraInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  // =====================
  // PROCESS IMAGE FILE
  // =====================
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file');
      setPhase('error');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setPhase('processing');

    try {
      const result = await scanApi.scanImage(file);
      
      // Wait for minimum animation
      await new Promise(r => setTimeout(r, 2500));

      sessionStorage.setItem('lastScanResult', JSON.stringify(result));
      setPhase('done');
      navigate('/results/latest');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to scan image. Try again with a clearer photo.');
      setPhase('error');
    }
  };

  const resetScan = () => {
    stopCamera();
    setPhase('select');
    setUploadedImage(null);
    setErrorMessage('');
    setScannedCode('');
    setScanStep(0);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // =====================
  // RENDER PHASES
  // =====================

  // SELECT PHASE — Main menu
  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Hidden file input for gallery upload */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Header */}
        <div className="bg-teal-600 text-white p-6">
          <h1 className="text-2xl font-bold">{t('scan.title')}</h1>
          <p className="text-teal-100 text-sm mt-1">Scan barcode, take photo, or upload image</p>
        </div>

        <div className="p-4 space-y-4">
          {/* PRIMARY: Live Scan Button */}
          <button
            onClick={startLiveScan}
            className="w-full bg-teal-600 text-white rounded-2xl p-5 flex items-center gap-4 active:bg-teal-700 transition-colors"
          >
            <div className="bg-white/20 p-3 rounded-xl">
              <Camera size={28} />
            </div>
            <div className="text-left">
              <div className="font-bold text-lg">Live Scan</div>
              <div className="text-teal-100 text-sm">Point camera at barcode or QR code</div>
            </div>
          </button>

          {/* Two column options */}
          <div className="flex gap-3">
            <button
              onClick={handleTakePhoto}
              className="flex-1 bg-white border-2 border-teal-500 text-teal-700 rounded-2xl p-4 flex flex-col items-center gap-2 active:bg-teal-50 transition-colors"
            >
              <Camera size={24} />
              <div className="font-semibold text-sm">Take Photo</div>
              <div className="text-xs text-gray-500">Snap medicine strip</div>
            </button>
            <button
              onClick={handleUpload}
              className="flex-1 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl p-4 flex flex-col items-center gap-2 active:bg-gray-50 transition-colors"
            >
              <Upload size={24} />
              <div className="font-semibold text-sm">Upload</div>
              <div className="text-xs text-gray-500">From gallery</div>
            </button>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 text-sm mb-3">How it works</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-teal-100 text-teal-700 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <div>
                  <div className="text-sm font-medium text-gray-800">Scan or photograph</div>
                  <div className="text-xs text-gray-500">Point at barcode, QR code, or medicine strip</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-teal-100 text-teal-700 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                <div>
                  <div className="text-sm font-medium text-gray-800">AI reads the medicine</div>
                  <div className="text-xs text-gray-500">Extracts name, batch, expiry, manufacturer</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-teal-100 text-teal-700 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                <div>
                  <div className="text-sm font-medium text-gray-800">Get verification report</div>
                  <div className="text-xs text-gray-500">Trust score, pricing, generic alternatives, alerts</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            <div className="flex-1 bg-teal-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-teal-700">500+</div>
              <div className="text-xs text-teal-600">Medicines in DB</div>
            </div>
            <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-blue-700">NPPA</div>
              <div className="text-xs text-blue-600">Price Verified</div>
            </div>
            <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-amber-700">CDSCO</div>
              <div className="text-xs text-amber-600">Safety Checked</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCANNING PHASE — Live camera
  if (phase === 'scanning') {
    return (
      <div className="min-h-screen bg-black">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <button onClick={resetScan} className="text-white p-2">
            <X size={24} />
          </button>
          <span className="text-white font-semibold text-sm">Scanning for Barcode/QR...</span>
          <button onClick={handleTakePhoto} className="text-white p-2 bg-white/20 rounded-lg">
            <ImageIcon size={20} />
          </button>
        </div>

        {/* Scanner viewport */}
        <div className="flex items-center justify-center min-h-screen">
          <div id="qr-scanner-container" className="w-full" style={{ maxWidth: '100vw' }}></div>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white/80 text-center text-sm mb-4">
            Point your camera at the barcode or QR code on the medicine strip
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleTakePhoto}
              className="flex-1 bg-white text-gray-900 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Camera size={18} />
              Take Photo Instead
            </button>
            <button
              onClick={() => { stopCamera(); handleUpload(); }}
              className="flex-1 bg-white/20 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              Upload
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PROCESSING PHASE — Analyzing
  if (phase === 'processing') {
    const steps = [
      { label: 'Reading medicine strip...', icon: '🔍' },
      { label: 'Extracting medicine details...', icon: '💊' },
      { label: 'Verifying against database...', icon: '🔐' },
      { label: 'Generating trust report...', icon: '📋' },
    ];

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        {/* Image preview with scan animation */}
        {uploadedImage && (
          <div className="relative w-64 h-40 rounded-2xl overflow-hidden mb-8 border-2 border-teal-500">
            <img src={uploadedImage} alt="Scanning" className="w-full h-full object-cover" />
            <div 
              className="absolute left-0 right-0 h-0.5 bg-green-400 shadow-lg shadow-green-400/50"
              style={{
                animation: 'scanLine 2s ease-in-out infinite',
              }}
            />
            <div className="absolute inset-0 bg-teal-500/10" />
          </div>
        )}

        {scannedCode && (
          <div className="mb-6 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2">
            <p className="text-teal-800 text-xs font-mono">Barcode: {scannedCode}</p>
          </div>
        )}

        {/* Processing steps */}
        <div className="w-full max-w-sm space-y-3">
          {steps.map((step, i) => (
            <div 
              key={i}
              className={'flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ' + 
                (i <= scanStep ? 'bg-white border border-teal-200' : 'bg-gray-100 border border-transparent opacity-40')
              }
            >
              {i < scanStep ? (
                <CheckCircle size={20} className="text-teal-600 shrink-0" />
              ) : i === scanStep ? (
                <Loader2 size={20} className="text-teal-600 animate-spin shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-300 shrink-0" />
              )}
              <span className={'text-sm ' + (i <= scanStep ? 'text-gray-800 font-medium' : 'text-gray-400')}>
                {step.icon} {step.label}
              </span>
            </div>
          ))}
        </div>

        <style>{
          '@keyframes scanLine { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }'
        }</style>
      </div>
    );
  }

  // ERROR PHASE
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-sm w-full">
          <XCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Scan Failed</h2>
          <p className="text-gray-500 text-sm mb-6">{errorMessage}</p>
          <button
            onClick={resetScan}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold active:bg-teal-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
};
