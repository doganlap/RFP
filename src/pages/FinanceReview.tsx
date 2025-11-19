import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../services/ApiClient';
import { DollarSign, Plus, Edit, CheckCircle } from 'lucide-react';

interface RFP {
  id: string;
  title: string;
  status: string;
  financeReview?: string;
}

const FinanceReview: React.FC = () => {
  const { t } = useTranslation();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRFP, setSelectedRFP] = useState<RFP | null>(null);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    try {
      const data = await apiClient.getRFPs();
      setRfps(data);
    } catch (error) {
      console.error('Failed to load RFPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedRFP) return;
    try {
      await apiClient.updateRFP(selectedRFP.id, { financeReview: reviewText });
      await loadRFPs();
      setSelectedRFP(null);
      setReviewText('');
    } catch (error) {
      console.error('Failed to save review:', error);
    }
  };

  if (loading) {
    return <div className="p-6">{t('loading')}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <DollarSign className="w-6 h-6" />
        {t('finance_review')}
      </h1>

      <div className="grid gap-4">
        {rfps.map((rfp) => (
          <div key={rfp.id} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{rfp.title}</h3>
                <p className="text-sm text-gray-500">Status: {rfp.status}</p>
                {rfp.financeReview && (
                  <p className="text-sm text-green-600 mt-2">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Reviewed
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedRFP(rfp);
                  setReviewText(rfp.financeReview || '');
                }}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                {rfp.financeReview ? t('edit_review') : t('add_review')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedRFP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {t('finance_review')} - {selectedRFP.title}
            </h2>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={t('enter_review')}
              className="w-full p-2 border rounded h-32"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReview}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {t('save')}
              </button>
              <button
                onClick={() => {
                  setSelectedRFP(null);
                  setReviewText('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceReview;
