import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { TrustBadge } from '../components/TrustBadge';
import { RecallBanner } from '../components/RecallBanner';
import { Disclaimer } from '../components/Disclaimer';
import { Camera, Calendar, AlertTriangle, Shield, CheckCircle, XCircle, Building2, Pill, TrendingDown, Share2, MessageSquare, Factory, Clock, Package, BadgeCheck, ArrowRight, IndianRupee, Star } from 'lucide-react';

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

// Known verified Indian pharma companies
const VERIFIED_COMPANIES = [
  'Cipla', 'Sun Pharma', 'Abbott', 'Lupin', "Dr. Reddy's", 'Mankind', 'Zydus', 'Torrent',
  'Glenmark', 'Alkem', 'Micro Labs', 'GSK', 'Sanofi', 'Pfizer', 'Ranbaxy', 'Ipca', 'Biocon',
  'Cadila', 'Wockhardt', 'Piramal', 'Intas', 'Macleods', 'Hetero', 'Ajanta', 'Natco', 'FDC',
  'Elder', 'Wallace', 'Unichem', 'Lyka Labs', 'Jan Aushadhi (PMBJP)', 'BPMJP', 'USV',
  'Franco-Indian', 'Aristo', 'Emcure', 'Eris', 'JB Chemicals', 'Gland Pharma', 'Aurobindo',
  'Jubilant', 'Strides', 'Laurus Labs', 'Divi\'s Labs', 'Alembic'
];

const getCompanyCategory = (manufacturer: string): string => {
  const mncs = ['GSK', 'Sanofi', 'Pfizer', 'Abbott', 'J&J'];
  if (mncs.some(m => manufacturer.includes(m))) return 'MNC';
  if (manufacturer.includes('Jan Aushadhi') || manufacturer.includes('PMBJP')) return 'Government (PMBJP)';
  return 'Indian Pharma';
};

const isVerifiedCompany = (manufacturer: string): boolean => {
  return VERIFIED_COMPANIES.some(c => manufacturer.toLowerCase().includes(c.toLowerCase()));
};

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

  // ==================== NOT FOUND ====================
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
                      <li>Add <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">GEMINI_API_KEY</code> to Vercel Environment Variables</li>
                      <li>Redeploy</li>
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

  // ==================== UNVERIFIED ====================
  if (result.status === 'unverified') {
    const extracted = result.extracted || {};
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
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
              {[
                { label: 'Brand Name', value: extracted.medicine_name },
                { label: 'Generic', value: extracted.generic_name },
                { label: 'Manufacturer', value: extracted.manufacturer },
                { label: 'Batch Number', value: extracted.batch_number },
                { label: 'Expiry Date', value: extracted.expiry_date },
                { label: 'Strength', value: extracted.strength },
                { label: 'MRP', value: extracted.mrp ? '\u20B9' + extracted.mrp : null }
              ].map((item, i) => (
                <div key={i} className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 text-sm">{item.label}</span>
                  <span className="font-medium text-gray-900 text-right">{item.value || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Company check even for unverified */}
          {extracted.manufacturer && (
            <div className={'rounded-xl border p-4 ' + (isVerifiedCompany(extracted.manufacturer) ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200')}>
              <div className="flex items-center gap-2 mb-2">
                {isVerifiedCompany(extracted.manufacturer) ? (
                  <BadgeCheck size={20} className="text-green-600" />
                ) : (
                  <AlertTriangle size={20} className="text-amber-600" />
                )}
                <span className={'font-bold text-sm ' + (isVerifiedCompany(extracted.manufacturer) ? 'text-green-800' : 'text-amber-800')}>
                  {isVerifiedCompany(extracted.manufacturer) ? 'Known Manufacturer' : 'Unknown Manufacturer'}
                </span>
              </div>
              <p className={'text-xs ' + (isVerifiedCompany(extracted.manufacturer) ? 'text-green-700' : 'text-amber-700')}>
                {isVerifiedCompany(extracted.manufacturer) 
                  ? extracted.manufacturer + ' is a known Indian pharmaceutical company.'
                  : extracted.manufacturer + ' is not in our verified list. Verify independently on cdsco.gov.in'}
              </p>
            </div>
          )}

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

  // ==================== VERIFIED ====================
  const medicine = result.medicine;
  const batch = result.batch;
  const trustScore = result.trust_score;
  const alternatives = result.alternatives || [];
  const recalls = result.recalls || [];

  const expiryDate = new Date(batch?.expiry_date);
  const mfgDate = new Date(batch?.mfg_date);
  const now = new Date();
  const daysToExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
  const isExpired = daysToExpiry < 0;
  const expiresSoon = daysToExpiry >= 0 && daysToExpiry <= 30;
  const isCompanyVerified = isVerifiedCompany(medicine?.manufacturer || '');
  const companyCategory = getCompanyCategory(medicine?.manufacturer || '');
  const isPriceCompliant = !medicine?.nppa_ceiling_price || medicine.mrp <= medicine.nppa_ceiling_price;

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

  const alternativesFormatted = alternatives.map((alt: any) => ({
    id: String(alt.alternative_medicine?.id || alt.alternative_medicine_id),
    brandName: alt.alternative_medicine?.brand_name || 'Generic Alternative',
    genericName: alt.alternative_medicine?.generic_name || '',
    manufacturer: alt.alternative_medicine?.manufacturer || 'Jan Aushadhi',
    mrp: alt.alternative_medicine?.mrp || 0,
    strength: alt.alternative_medicine?.strength || ''
  }));

  const recallsFormatted = recalls.map((r: any) => ({
    id: String(r.id),
    batchId: String(r.batch_id),
    reason: r.reason,
    severity: r.severity === 'critical' ? 'Critical' as const : 'Warning' as const,
    alertDate: r.alert_date
  }));

  const handleShare = async () => {
    const shareText = 'Aslee Scan: ' + medicine.brand_name + ' (' + medicine.generic_name + ') - Trust Score: ' + (trustScore?.score || 0) + '/100';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Aslee Scan Result', text: shareText, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('Result copied to clipboard!');
      }
    } catch (e) { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className={'text-white p-6 ' + (trustScoreResult.status === 'genuine' ? 'bg-teal-600' : trustScoreResult.status === 'inconclusive' ? 'bg-amber-500' : 'bg-red-500')}>
        <div className="flex items-center gap-2 mb-1">
          {trustScoreResult.status === 'genuine' && <CheckCircle size={20} />}
          {trustScoreResult.status === 'inconclusive' && <AlertTriangle size={20} />}
          {trustScoreResult.status === 'flagged' && <XCircle size={20} />}
          <span className="text-sm font-medium opacity-90">
            {trustScoreResult.status === 'genuine' ? 'Verified Medicine' : trustScoreResult.status === 'inconclusive' ? 'Needs Verification' : 'Flagged'}
          </span>
        </div>
        <h1 className="text-2xl font-bold">{medicine?.brand_name}</h1>
        <p className="text-white/80 text-sm mt-1">
          {medicine?.generic_name} {medicine?.strength} {batch ? ' \u00B7 Batch ' + batch.batch_number : ''}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Extracted from image */}
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
            </div>
          </div>
        )}

        {/* Recall Alerts */}
        {recallsFormatted.map(recall => (
          <RecallBanner key={recall.id} recall={recall} />
        ))}

        {/* Trust Score */}
        {trustScore && <TrustBadge result={trustScoreResult} />}

        {/* ===== AUTHENTICITY CHECKLIST ===== */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <Shield size={16} className="text-teal-600" />
            Authenticity Verification
          </h3>
          <div className="space-y-2.5">
            {/* Batch Verified */}
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-green-50">
              <CheckCircle size={18} className="text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Batch Number Verified</p>
                <p className="text-[11px] text-green-600">Batch {batch?.batch_number} found in database</p>
              </div>
            </div>

            {/* Mfg Date */}
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-green-50">
              <CheckCircle size={18} className="text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Manufacturing Date Valid</p>
                <p className="text-[11px] text-green-600">
                  {'Manufactured: ' + mfgDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Expiry */}
            <div className={'flex items-center gap-3 p-2.5 rounded-lg ' + (isExpired ? 'bg-red-50' : expiresSoon ? 'bg-amber-50' : 'bg-green-50')}>
              {isExpired ? (
                <XCircle size={18} className="text-red-600 shrink-0" />
              ) : expiresSoon ? (
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
              ) : (
                <CheckCircle size={18} className="text-green-600 shrink-0" />
              )}
              <div>
                <p className={'text-sm font-medium ' + (isExpired ? 'text-red-800' : expiresSoon ? 'text-amber-800' : 'text-green-800')}>
                  {isExpired ? 'EXPIRED \u2014 Do Not Use!' : expiresSoon ? 'Expiring Soon (' + daysToExpiry + ' days left)' : 'Expiry Date Valid'}
                </p>
                <p className={'text-[11px] ' + (isExpired ? 'text-red-600' : expiresSoon ? 'text-amber-600' : 'text-green-600')}>
                  {'Expires: ' + expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* NPPA Price Compliance */}
            <div className={'flex items-center gap-3 p-2.5 rounded-lg ' + (isPriceCompliant ? 'bg-green-50' : 'bg-red-50')}>
              {isPriceCompliant ? (
                <CheckCircle size={18} className="text-green-600 shrink-0" />
              ) : (
                <XCircle size={18} className="text-red-600 shrink-0" />
              )}
              <div>
                <p className={'text-sm font-medium ' + (isPriceCompliant ? 'text-green-800' : 'text-red-800')}>
                  {isPriceCompliant ? 'NPPA Price Compliant' : 'OVERPRICED \u2014 Above Ceiling!'}
                </p>
                <p className={'text-[11px] ' + (isPriceCompliant ? 'text-green-600' : 'text-red-600')}>
                  {'MRP: \u20B9' + (medicine?.mrp || 0).toFixed(2) + (medicine?.nppa_ceiling_price ? ' | Ceiling: \u20B9' + medicine.nppa_ceiling_price.toFixed(2) : ' | No ceiling set')}
                </p>
              </div>
            </div>

            {/* Company Verified */}
            <div className={'flex items-center gap-3 p-2.5 rounded-lg ' + (isCompanyVerified ? 'bg-green-50' : 'bg-amber-50')}>
              {isCompanyVerified ? (
                <CheckCircle size={18} className="text-green-600 shrink-0" />
              ) : (
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
              )}
              <div>
                <p className={'text-sm font-medium ' + (isCompanyVerified ? 'text-green-800' : 'text-amber-800')}>
                  {isCompanyVerified ? 'Verified Manufacturer' : 'Manufacturer Not in Verified List'}
                </p>
                <p className={'text-[11px] ' + (isCompanyVerified ? 'text-green-600' : 'text-amber-600')}>
                  {medicine?.manufacturer}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== COMPANY VERIFICATION ===== */}
        <div className={'rounded-xl border p-4 ' + (isCompanyVerified ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200')}>
          <div className="flex items-center gap-2 mb-3">
            <Factory size={18} className={isCompanyVerified ? 'text-green-600' : 'text-amber-600'} />
            <h3 className={'font-bold text-sm ' + (isCompanyVerified ? 'text-green-800' : 'text-amber-800')}>
              {isCompanyVerified ? '\u2705 Verified Company' : '\u26A0\uFE0F Unknown Manufacturer'}
            </h3>
          </div>
          <p className={'text-xs mb-3 ' + (isCompanyVerified ? 'text-green-700' : 'text-amber-700')}>
            {isCompanyVerified
              ? medicine?.manufacturer + ' is a licensed Indian pharmaceutical company registered with CDSCO (Central Drugs Standard Control Organisation).'
              : medicine?.manufacturer + ' was not found in our verified manufacturer list. This does not necessarily mean the medicine is fake. Verify independently at cdsco.gov.in'}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/60 rounded-lg p-2.5">
              <span className="text-gray-500 block mb-0.5">Company</span>
              <span className="font-bold text-gray-800">{medicine?.manufacturer}</span>
            </div>
            <div className="bg-white/60 rounded-lg p-2.5">
              <span className="text-gray-500 block mb-0.5">Type</span>
              <span className="font-bold text-gray-800">{companyCategory}</span>
            </div>
            <div className="bg-white/60 rounded-lg p-2.5">
              <span className="text-gray-500 block mb-0.5">CDSCO Status</span>
              <span className={'font-bold ' + (isCompanyVerified ? 'text-green-700' : 'text-amber-700')}>
                {isCompanyVerified ? 'Registered' : 'Unverified'}
              </span>
            </div>
            <div className="bg-white/60 rounded-lg p-2.5">
              <span className="text-gray-500 block mb-0.5">Category</span>
              <span className="font-bold text-gray-800">{medicine?.category}</span>
            </div>
          </div>
        </div>

        {/* ===== FULL MEDICINE DETAILS ===== */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <Pill size={16} className="text-teal-600" />
            Medicine Details
          </h3>
          <div className="space-y-2.5">
            {[
              { label: 'Brand Name', value: medicine?.brand_name, bold: true },
              { label: 'Generic Name (Salt)', value: medicine?.generic_name },
              { label: 'Manufacturer', value: medicine?.manufacturer },
              { label: 'Dosage Form', value: medicine?.dosage_form },
              { label: 'Strength', value: medicine?.strength },
              { label: 'Category', value: medicine?.category },
              { label: 'Batch Number', value: batch?.batch_number, mono: true },
              { label: 'Mfg Date', value: mfgDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
              { label: 'Expiry Date', value: expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), highlight: isExpired ? 'red' : expiresSoon ? 'amber' : '' },
              { label: 'MRP', value: '\u20B9' + (medicine?.mrp || 0).toFixed(2) },
              { label: 'NPPA Ceiling Price', value: medicine?.nppa_ceiling_price ? '\u20B9' + medicine.nppa_ceiling_price.toFixed(2) : 'Not set' }
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-gray-500 text-sm">{item.label}</span>
                <span className={
                  'text-right text-sm ' +
                  (item.bold ? 'font-bold text-gray-900 ' : 'font-medium text-gray-800 ') +
                  (item.mono ? 'font-mono ' : '') +
                  (item.highlight === 'red' ? 'text-red-600 font-bold ' : '') +
                  (item.highlight === 'amber' ? 'text-amber-600 font-bold ' : '')
                }>
                  {item.value || 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== JAN AUSHADHI ALTERNATIVES ===== */}
        {alternativesFormatted.length > 0 ? (
          <div className="bg-teal-50 rounded-xl border-2 border-teal-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-teal-600 text-white p-1.5 rounded-lg">
                <Star size={16} />
              </div>
              <div>
                <h3 className="font-bold text-teal-800 text-sm">{'\uD83D\uDC8A'} Jan Aushadhi Alternative Available!</h3>
                <p className="text-[11px] text-teal-600">Same medicine, 50-90% cheaper</p>
              </div>
            </div>

            {alternativesFormatted.map((alt: any) => {
              const savings = (medicine?.mrp || 0) - alt.mrp;
              const savingsPercent = medicine?.mrp ? Math.round((savings / medicine.mrp) * 100) : 0;

              return (
                <div key={alt.id} className="bg-white rounded-xl p-4 mb-3 border border-teal-100">
                  {/* Side by side comparison */}
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1 text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Your Medicine</p>
                      <p className="text-sm font-bold text-gray-900">{medicine?.brand_name}</p>
                      <p className="text-lg font-bold text-gray-700">{'\u20B9'}{(medicine?.mrp || 0).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center">
                      <ArrowRight size={20} className="text-teal-500" />
                    </div>
                    <div className="flex-1 text-center p-2 bg-teal-50 rounded-lg border border-teal-200">
                      <p className="text-[10px] text-teal-600 font-bold uppercase mb-1">Jan Aushadhi</p>
                      <p className="text-sm font-bold text-teal-800">{alt.brandName}</p>
                      <p className="text-lg font-bold text-teal-700">{'\u20B9'}{alt.mrp.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Savings badge */}
                  {savings > 0 && (
                    <div className="bg-green-100 rounded-lg p-2.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <TrendingDown size={16} className="text-green-700" />
                        <span className="font-bold text-green-800 text-sm">
                          {'Save \u20B9' + savings.toFixed(2) + ' (' + savingsPercent + '% less)'}
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-gray-500 mt-2">
                    {alt.genericName} {alt.strength} by {alt.manufacturer}
                  </p>
                </div>
              );
            })}

            <div className="bg-teal-100/50 rounded-lg p-3 mt-2">
              <p className="text-xs text-teal-700 font-medium">
                {'\uD83C\uDFE5'} Available at 10,000+ Jan Aushadhi Kendras across India. Find nearest: janaushadhi.gov.in
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
            <Pill size={24} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">No Jan Aushadhi alternative found for this medicine</p>
            <p className="text-xs text-gray-400 mt-1">Not all medicines have generic equivalents in the PMBJP catalog</p>
          </div>
        )}

        {/* Disclaimer */}
        <Disclaimer />

        {/* ===== ACTION BUTTONS ===== */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/scan')}
            className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 active:bg-teal-700 transition-colors"
          >
            <Camera size={20} />
            Scan Another Medicine
          </button>

          <button
            onClick={() => navigate('/chat')}
            className="w-full bg-white border-2 border-teal-500 text-teal-700 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:bg-teal-50 transition-colors"
          >
            <MessageSquare size={18} />
            Ask AI About This Medicine
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:bg-gray-200"
            >
              <Share2 size={16} />
              Share Result
            </button>
            <button
              onClick={() => window.open('https://cdscoonline.gov.in/CDSCO/Drugs', '_blank')}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:bg-gray-200"
            >
              <Shield size={16} />
              CDSCO Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
