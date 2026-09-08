import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../i18n/I18nProvider';
import { scanApi } from '../api/client';
import { Camera, Search } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const history = await scanApi.getHistory();
        setScans(history);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  const handleScanClick = (scan: any) => {
    // Store as a result for the Results page
    sessionStorage.setItem('lastScanResult', JSON.stringify({
      status: 'found',
      medicine: scan.medicine,
      batch: scan.batch,
      trust_score: scan.trust_score || { score: scan.trust_score_value, breakdown: {} },
      alternatives: [],
      recalls: []
    }));
    navigate('/results/' + scan.id);
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <div className="bg-teal-600 text-white p-6 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-1">
          {user?.name ? t('home.greeting', { name: user.name }) : t('home.welcome')}
        </h1>
        <p className="text-teal-100 text-sm">Verify your medicines instantly</p>
      </div>

      <div className="p-6 -mt-8">
        <button
          onClick={() => navigate('/scan')}
          className="w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center gap-4 transition-transform active:scale-95 border-2 border-teal-500"
        >
          <div className="bg-teal-100 p-4 rounded-full">
            <Camera size={48} className="text-teal-600" />
          </div>
          <span className="text-xl font-bold text-teal-700">{t('home.scanButton')}</span>
        </button>
      </div>

      <div className="px-6 mt-4">
        <h2 className="font-bold text-lg mb-4 text-gray-800">{t('home.recentScans')}</h2>
        
        {loading ? (
          <div className="text-center p-4 text-gray-500">{t('common.loading')}</div>
        ) : scans.length === 0 ? (
          <EmptyState 
            icon={Search} 
            title={t('home.noScans')}
          />
        ) : (
          <div className="space-y-4">
            {scans.slice(0, 5).map(scan => {
              const medName = scan.medicine?.brand_name || scan.medicine?.brandName || 'Medicine';
              const scanDate = scan.scanned_at ? new Date(scan.scanned_at * 1000) : new Date();
              const score = scan.trust_score?.score ?? scan.trust_score ?? 0;
              const status = score >= 80 ? 'genuine' : score >= 50 ? 'inconclusive' : 'flagged';

              return (
                <div 
                  key={scan.id} 
                  onClick={() => handleScanClick(scan)}
                  className="card flex items-center p-4 cursor-pointer active:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{medName}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {scanDate.toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-medium border
                    ${status === 'genuine' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                    ${status === 'inconclusive' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                    ${status === 'flagged' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                  `}>
                    Score: {score}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
