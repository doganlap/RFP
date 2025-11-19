import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRFP } from '../../hooks/useRFP';
import type { RFP } from '../../types';
import { Priority } from '../../types';
import { ROUTES, getRoute } from '../../config/routes';
import { useTranslation } from 'react-i18next';
import DailyQuote from '../DailyQuote';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  ON_HOLD: 'bg-orange-100 text-orange-800',
};

const formatCurrency = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return currencyFormatter.format(value);
};

export const RFPList: React.FC = () => {
  const { rfps, fetchRFPs, createRFP, deleteRFP, setCurrentRFP } = useRFP();
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    title: '',
    client: '',
    estimatedValue: '',
    submissionDeadline: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    setIsLoading(true);
    fetchRFPs()
      .then(() => setError(null))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load RFPs'))
      .finally(() => setIsLoading(false));
  }, [fetchRFPs]);

  const totalPipeline = useMemo(
    () => rfps.reduce((sum, rfp) => sum + (rfp.estimatedValue || 0), 0),
    [rfps]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateRfp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formValues.title.trim() || !formValues.client.trim()) {
      setError('Title and client are required');
      return;
    }

    setCreating(true);
    try {
      const estimatedValue = formValues.estimatedValue
        ? Number.parseInt(formValues.estimatedValue, 10)
        : undefined;

      const newRfp = await createRFP({
        title: formValues.title.trim(),
        client: formValues.client.trim(),
        estimatedValue,
        currency: 'USD',
        submissionDeadline: formValues.submissionDeadline || undefined,
        priority: Priority.MEDIUM,
      });

      setFormValues({
        title: '',
        client: '',
        estimatedValue: '',
        submissionDeadline: '',
      });
      setError(null);
      setCurrentRFP(newRfp);
      navigate(getRoute(ROUTES.RFP.DETAIL, { id: newRfp.id }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create RFP');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenRfp = (rfp: RFP) => {
    setCurrentRFP(rfp);
    navigate(getRoute(ROUTES.RFP.DETAIL, { id: rfp.id }));
  };

  const handleDeleteRfp = async (rfp: RFP) => {
    const confirmation = window.confirm(`Delete "${rfp.title}"? This cannot be undone.`);
    if (!confirmation) return;

    try {
      await deleteRFP(rfp.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete RFP');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('rfp_portfolio')}</h1>
        <p className="text-gray-600 mt-2">
          {t('real_time_pipeline')}
        </p>
      </div>

      <DailyQuote language={i18n.language as 'ar' | 'en'} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/20 shadow-lg p-5">
          <p className="text-sm text-gray-500">{t('active_rfps')}</p>
          <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{rfps.length}</p>
        </div>
        <div className="rounded-lg backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/20 shadow-lg p-5">
          <p className="text-sm text-gray-500">{t('total_pipeline_value')}</p>
          <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totalPipeline)}</p>
        </div>
        <div className="rounded-lg backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/20 shadow-lg p-5">
          <p className="text-sm text-gray-500">{t('go_no_go_ready')}</p>
          <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {rfps.filter((rfp) => rfp.stage === 'STAGE_2_BUSINESS_REVIEW').length}
          </p>
        </div>
      </div>

      <div className="rounded-lg backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/20 shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{t('create_new_rfp')}</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateRfp}>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rfp-title">
              {t('title')}
            </label>
            <input
              id="rfp-title"
              name="title"
              type="text"
              value={formValues.title}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t('digital_banking_placeholder')}
              required
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rfp-client">
              {t('client')}
            </label>
            <input
              id="rfp-client"
              name="client"
              type="text"
              value={formValues.client}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t('fortune_500_placeholder')}
              required
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rfp-value">
              {t('estimated_value_usd')}
            </label>
            <input
              id="rfp-value"
              name="estimatedValue"
              type="number"
              min="0"
              value={formValues.estimatedValue}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t('value_placeholder')}
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rfp-deadline">
              {t('submission_deadline')}
            </label>
            <input
              id="rfp-deadline"
              name="submissionDeadline"
              type="date"
              value={formValues.submissionDeadline}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? t('creating') : t('create_rfp')}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </form>
      </div>

      <div className="rounded-lg backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/20 shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
          <h2 className="text-xl font-semibold">{t('rfps')}</h2>
          {isLoading && <p className="text-sm text-gray-500">{t('refreshing')}</p>}
        </div>

        {rfps.length === 0 ? (
          <div className="p-6">
            <p className="text-gray-600">
              {isLoading ? t('loading_rfps') : t('no_rfps_yet')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('title')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('client')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('stage')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('value')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('deadline')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rfps.map((rfp) => (
                  <tr key={rfp.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="font-medium text-gray-900">{rfp.title}</p>
                      <p className="text-sm text-gray-500">{rfp.id}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {rfp.client}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {rfp.stage.replace(/_/g, ' ')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          statusColors[rfp.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rfp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {formatCurrency(rfp.estimatedValue)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {rfp.submissionDeadline
                        ? new Date(rfp.submissionDeadline).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-3">
                      <button
                        type="button"
                        onClick={() => handleOpenRfp(rfp)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {t('open')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRfp(rfp)}
                        className="text-red-600 hover:text-red-800"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RFPList;
