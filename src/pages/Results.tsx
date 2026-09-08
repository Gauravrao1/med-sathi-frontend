import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { TrustBadge } from '../components/TrustBadge';
import { PriceComparison } from '../components/PriceComparison';
import { RecallBanner } from '../components/RecallBanner';
import { MedicineCard } from '../components/MedicineCard';
import { Disclaimer } from '../components/Disclaimer';
import { Camera, Calendar, AlertTriangle, Shield } from 'lucide-react';

interface ScanResult {
  status: 'verified' | 'unverified' | 'not_found';
  error_message?: string;
  extracted?: any;
  medicine: any;
  batch: any;
  trust_score: any;
  alternatives: any[];
  recalls: any[];
}

export const Results: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('lastScanResult');
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {
        navigate('/home');
      }
    } else {
      navigate('/home');
    }
  }, [navigate]);

  if (!result) return null;

  if (result.status === 'not_found') {
    const errorMsg = result.error_message || '';
    const isApiKeyMissing = errorMsg.includes('GEMINI_API_KEY');
    
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-red-500 text-white p-6">
          <h1 className="text-2xl font-bold">Scan Failed</h1>
          <p className="text-red-100 text-sm mt-1">Could not extract medicine data</p>
        </div>
        
        <div className="p-4 space-y-4">
          {isApiKeyMissing ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-bold text-amber-800 text-sm mb-1">AI Scanning Not Set Up</h3>
                  <p className="text-amber-700 text-xs mb-3">
                    The app needs a Gemini API key to read medicine images. The key is <strong>completely free</strong>.
                  </p>
                  <div className="bg-white rounded-lg border border-amber-200 p-3 space-y-2">
                    <p className="text-xs font-bold text-gray-700">Setup (2 minutes):</p>
                    <ol className="text-xs text-gray-600 space-y-1.5 list-decimal pl-4">
                      <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">aistudio.google.com/apikey</a></li>
                      <li>Click "Create API Key" (it's free)</li>
                      <li>Create file <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">server/.env</code></li>
                      <li>Add: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">GEMINI_API_KEY=your_key_here</code></li>
                      <li>Restart the server</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <AlertTriangle size={32} className="text-amber-500 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">
                Could not read medicine data from this photo. Try with a clearer, well-lit image of the medicine strip.
              </p>
            </div>
          )}
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 text-sm mb-2">Search Manually Instead</h3>
            <p className="text-xs text-gray-500 mb-3">Type the medicine name from the strip to find it in our database of 500+ medicines.</p>
            <button
              onClick={() => navigate('/home')}
              className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold text-sm"
            >
              Go to Home & Search
            </button>
          </div>

          <button
            onClick={() => navigate('/scan')}
            className="w-full bg-gray-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Camera size={18} />
            Try Scanning Again
          </button>
        </div>
      </div>
    );
  }

  if (result.status === 'unverified') {
    const extracted = result.extracted || {};
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-amber-500 text-white p-6">
          <h1 className="text-2xl font-bold">Unverified Results</h1>
          <p className="text-amber-100 text-sm mt-1">
            Read from image, not verified against database
          </p>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
             <AlertTriangle className="text-amber-500 shrink-0" size={24} />
             <p className="text-amber-800 text-sm">
               This medicine was read from your photo but not found in our verified database. The information shown is extracted directly from the packaging.
             </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-4">Extracted Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm">Brand Name</span>
                <span className="font-medium text-gray-900 text-right">{extracted.medicine_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm">Generic</span>
                <span className="font-medium text-gray-900 text-right">{extracted.generic_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm">Manufacturer</span>
                <span className="font-medium text-gray-900 text-right">{extracted.manufacturer || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm">Batch Number</span>
                <span className="font-medium text-gray-900 text-right">{extracted.batch_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm">Expiry Date</span>
                <span className="font-medium text-gray-900 text-right">{extracted.expiry_date || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm">Strength</span>
                <span className="font-medium text-gray-900 text-right">{extracted.strength || 'N/A'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/scan')}
            className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:bg-teal-700 transition-colors"
          >
            <Camera size={20} />
            Try Another Photo
          </button>
        </div>
      </div>
    );
  }

  const medicine = result.medicine;
  const batch = result.batch;
  const trustScore = result.trust_score;
  const alternatives = result.alternatives || [];
  const recalls = result.recalls || [];

  // Format expiry date
  const expiryDate = new Date(batch?.expiry_date);
  const now = new Date();
  const daysToExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
  const isExpired = daysToExpiry < 0;
  const expiresSoon = daysToExpiry >= 0 && daysToExpiry <= 30;

  // Map trust score to frontend format
  const trustScoreResult = {
    score: trustScore?.score || 0,
    status: (trustScore?.score || 0) >= 80 ? 'genuine' as const
      : (trustScore?.score || 0) >= 50 ? 'inconclusive' as const
      : 'flagged' as const,
    breakdown: Object.entries(trustScore?.breakdown || {}).map(([key, value]) => ({
      label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value: Math.max(0, value as number),
      max: key === 'verification_status' ? 40 : key === 'manufacturer' ? 20 : key === 'expiry' ? 20 : key === 'base_score' ? 20 : 30,
      status: (value as number) > 0 ? 'pass' as const : 'fail' as const
    }))
  };

  // Map medicine to frontend format
  const medicineFormatted = medicine ? {
    id: String(medicine.id),
    brandName: medicine.brand_name,
    genericName: medicine.generic_name,
    manufacturer: medicine.manufacturer,
    dosageForm: medicine.dosage_form,
    strength: medicine.strength,
    mrp: medicine.mrp,
    ceilingPrice: medicine.nppa_ceiling_price || medicine.mrp
  } : null;

  // Map alternatives
  const alternativesFormatted = alternatives.map((alt: any) => ({
    id: String(alt.alternative_medicine?.id || alt.alternative_medicine_id),
    brandName: alt.alternative_medicine?.brand_name || 'Generic Alternative',
    manufacturer: alt.alternative_medicine?.manufacturer || 'Jan Aushadhi',
    mrp: alt.alternative_medicine?.mrp || 0
  }));

  // Map recalls
  const recallsFormatted = recalls.map((r: any) => ({
    id: String(r.id),
    batchId: String(r.batch_id),
    reason: r.reason,
    severity: r.severity === 'critical' ? 'Critical' as const : 'Warning' as const,
    alertDate: r.alert_date
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-teal-600 text-white p-6">
        <h1 className="text-2xl font-bold">{t('results.title')}</h1>
        <p className="text-teal-100 text-sm mt-1">
          {medicineFormatted?.brandName} {batch ? '· Batch ' + batch.batch_number : ''}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Extracted from image — show what AI read */}
        {result.extracted && result.extracted.medicine_name && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-blue-600" />
              <span className="text-blue-800 font-semibold text-sm">Scanned from Image</span>
              <span className="bg-blue-200 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto">
                {result.extracted.confidence || 0}% confidence
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {result.extracted.medicine_name && (
                <>
                  <span className="text-blue-600">Name</span>
                  <span className="text-blue-900 font-medium">{result.extracted.medicine_name}</span>
                </>
              )}
              {result.extracted.manufacturer && (
                <>
                  <span className="text-blue-600">Manufacturer</span>
                  <span className="text-blue-900 font-medium">{result.extracted.manufacturer}</span>
                </>
              )}
              {result.extracted.batch_number && (
                <>
                  <span className="text-blue-600">Batch</span>
                  <span className="text-blue-900 font-medium font-mono">{result.extracted.batch_number}</span>
                </>
              )}
              {result.extracted.expiry_date && (
                <>
                  <span className="text-blue-600">Expiry</span>
                  <span className="text-blue-900 font-medium">{result.extracted.expiry_date}</span>
                </>
              )}
              {result.extracted.mrp && (
                <>
                  <span className="text-blue-600">MRP on strip</span>
                  <span className="text-blue-900 font-medium">₹{result.extracted.mrp}</span>
                </>
              )}
            </div>
          </div>
        )}
        {/* Recall Alerts — MUST be first and unmissable */}
        {recallsFormatted.map(recall => (
          <RecallBanner key={recall.id} recall={recall} />
        ))}

        {/* Trust Score */}
        {trustScore && <TrustBadge result={trustScoreResult} />}

        {/* Expiry Date */}
        {batch && (
          <div className={`rounded-xl border p-4 ${
            isExpired ? 'bg-red-50 border-red-200' :
            expiresSoon ? 'bg-amber-50 border-amber-200' :
            'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <Calendar size={20} className={
                isExpired ? 'text-red-500' :
                expiresSoon ? 'text-amber-500' :
                'text-gray-400'
              } />
              <div>
                <p className="text-sm text-gray-600">{t('results.expiry')}</p>
                <p className={`font-bold text-lg ${
                  isExpired ? 'text-red-600' :
                  expiresSoon ? 'text-amber-600' :
                  'text-gray-900'
                }`}>
                  {expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {isExpired && (
                  <span className="text-xs text-red-600 font-medium bg-red-100 px-2 py-0.5 rounded-full">
                    {t('results.expired')}
                  </span>
                )}
                {expiresSoon && (
                  <span className="text-xs text-amber-600 font-medium bg-amber-100 px-2 py-0.5 rounded-full">
                    {t('results.expiresSoon')} — {daysToExpiry} days left
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Medicine Info */}
        {medicineFormatted && <MedicineCard medicine={medicineFormatted} />}

        {/* Price Comparison */}
        {medicineFormatted && <PriceComparison medicine={medicineFormatted} alternatives={alternativesFormatted} />}

        {/* Disclaimer */}
        <Disclaimer />

        {/* Scan Another */}
        <button
          onClick={() => navigate('/scan')}
          className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:bg-teal-700 transition-colors"
        >
          <Camera size={20} />
          {t('results.scanAnother')}
        </button>
      </div>
    </div>
  );
};
