'use client';

import { useEffect, useMemo, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

type Summary = {
  totalRFPs: number;
  analyzed: number;
  byDecision: Record<string, number>;
};

export default function Page() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [lang, setLang] = useState<'en'|'ar'>('en');

  const t = useMemo(()=>{
    return lang === 'en'
      ? {
          title: 'RFP Control Tower',
          total: 'Total RFPs',
          analyzed: 'Analyzed',
          byDecision: 'By Decision',
          refresh: 'Refresh',
          langSwitch: 'العربية'
        }
      : {
          title: 'برج التحكم للعطاءات',
          total: 'إجمالي المناقصات',
          analyzed: 'تم التحليل',
          byDecision: 'حسب القرار',
          refresh: 'تحديث',
          langSwitch: 'English'
        };
  }, [lang]);

  useEffect(() => {
    fetch(`${API}/api/rfps/dashboard/summary`)
      .then(r => r.json())
      .then(setSummary)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (lang === 'ar') document.documentElement.dir = 'rtl';
    else document.documentElement.dir = 'ltr';
  }, [lang]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <button
          onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
          className="px-3 py-1.5 rounded border bg-white shadow-sm"
        >
          {t.langSwitch}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card label={t.total} value={summary?.totalRFPs ?? 0} />
        <Card label={t.analyzed} value={summary?.analyzed ?? 0} />
        <Card label={t.byDecision} value={Object.keys(summary?.byDecision || {}).length} />
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">{t.byDecision}</h2>
          <button
            onClick={async ()=>{
              const s = await fetch(`${API}/api/rfps/dashboard/summary`).then(r=>r.json());
              setSummary(s);
            }}
            className="px-3 py-1.5 rounded border bg-white shadow-sm"
          >
            {t.refresh}
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {Object.entries(summary?.byDecision || {}).map(([k,v])=> (
            <li key={k} className="flex items-center justify-between border-b py-2">
              <span className="font-mono">{k}</span>
              <span className="font-semibold">{v as any}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-gray-500">{label}</div>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
  );
}
