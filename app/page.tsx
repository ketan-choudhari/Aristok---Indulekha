'use client';

import { useState, useEffect } from 'react';

interface Campaign {
  'Account': string;
  'Campaign name': string;
  'Type': string;
  'Amount spent (INR)': number;
  'Impressions': number;
  'CPM': number;
  'CTR': number;
  'CVR': number;
  'ROAS': number;
  'CPI': number;
  'Purchases with shared items': number;
  [key: string]: any;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}

function MetricCard({ label, value, color = 'blue' }: MetricCardProps) {
  const colorMap = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400'
  };
  
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[color]}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('COMPARE');
  const [sideA, setSideA] = useState('Zepto');
  const [sideB, setSideB] = useState('Nykaa');
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/dashboard_data.json')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-20 text-white">Loading...</div>;
  if (!data) return <div className="text-center p-20 text-red-400">No data</div>;

  const accounts = data.accounts || [];
  const campaigns = data.campaigns || [];

  const filterCampaigns = (account: string) => {
    return campaigns.filter(c => c.Account === account && (filterType === 'All' || c.Type === filterType));
  };

  const campaignDataA = filterCampaigns(sideA);
  const campaignDataB = filterCampaigns(sideB);

  const calcMetrics = (campData: Campaign[]) => {
    if (campData.length === 0) return { spend: 0, purchases: 0, cpi: 0, cpm: 0, ctr: 0, cvr: 0, roas: 0 };
    
    const spend = campData.reduce((sum, c) => sum + (c['Amount spent (INR)'] || 0), 0);
    const purchases = campData.reduce((sum, c) => sum + (c['Purchases with shared items'] || 0), 0);
    const cpi = purchases > 0 ? spend / purchases : 0;
    const impressions = campData.reduce((sum, c) => sum + (c.Impressions || 0), 0);
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const ctr = campData.reduce((sum, c) => sum + (c.CTR || 0), 0) / campData.length;
    const cvr = campData.reduce((sum, c) => sum + (c.CVR || 0), 0) / campData.length;
    const roas = spend > 0 ? campData.reduce((sum, c) => sum + (c['Purchases conversion value for shared items only'] || c.ROAS * spend || 0), 0) / spend : 0;

    return { spend, purchases, cpi, cpm, ctr, cvr, roas };
  };

  const metricsA = calcMetrics(campaignDataA);
  const metricsB = calcMetrics(campaignDataB);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SuperUp × Aristok Dashboard</h1>
          <p className="text-slate-400">Performance Marketing Intelligence Platform</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-700">
          {['COMPARE', 'OVERVIEW', 'CREATIVES', 'DAILY'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* COMPARE Tab */}
        {activeTab === 'COMPARE' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Side A</label>
                <select value={sideA} onChange={(e) => setSideA(e.target.value)} className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-700">
                  {accounts.map(acc => <option key={acc}>{acc}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Side B</label>
                <select value={sideB} onChange={(e) => setSideB(e.target.value)} className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-700">
                  {accounts.map(acc => <option key={acc}>{acc}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Campaign Type</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-700">
                  <option>All</option>
                  <option>Purchase</option>
                  <option>ATC</option>
                  <option>Retargeting</option>
                </select>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <MetricCard label="Side A Spend" value={`₹${metricsA.spend.toFixed(0)}`} color="blue" />
              <MetricCard label="Side A CPI" value={`₹${metricsA.cpi.toFixed(0)}`} color="green" />
              <MetricCard label="Side B Spend" value={`₹${metricsB.spend.toFixed(0)}`} color="purple" />
              <MetricCard label="Side B CPI" value={`₹${metricsB.cpi.toFixed(0)}`} color="orange" />
              <MetricCard label="A Purchases" value={metricsA.purchases} color="blue" />
              <MetricCard label="B Purchases" value={metricsB.purchases} color="purple" />
            </div>

            {/* Campaign Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {['A', 'B'].map((side) => {
                const campaigns = side === 'A' ? campaignDataA : campaignDataB;
                return (
                  <div key={side} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                    <div className="bg-slate-900 p-4 border-b border-slate-700">
                      <h3 className="font-semibold">Side {side} - {side === 'A' ? sideA : sideB}</h3>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-slate-900">
                        <tr>
                          <th className="px-4 py-2 text-left text-slate-300">Campaign</th>
                          <th className="px-4 py-2 text-right text-slate-300">Spend</th>
                          <th className="px-4 py-2 text-right text-slate-300">CPI</th>
                          <th className="px-4 py-2 text-right text-slate-300">ROAS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map((c, idx) => (
                          <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700">
                            <td className="px-4 py-2 text-slate-300">{c['Campaign name']}</td>
                            <td className="px-4 py-2 text-right text-white">₹{(c['Amount spent (INR)'] || 0).toFixed(0)}</td>
                            <td className="px-4 py-2 text-right text-green-400">₹{(c.CPI || 0).toFixed(0)}</td>
                            <td className="px-4 py-2 text-right text-blue-400">{(c.ROAS || 0).toFixed(2)}x</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DAILY Tab */}
        {activeTab === 'DAILY' && (
          <div className="text-center py-20">
            <p className="text-slate-400">DAILY trends coming in v1.2...</p>
          </div>
        )}

        {/* OVERVIEW Tab */}
        {activeTab === 'OVERVIEW' && (
          <div className="text-center py-20">
            <p className="text-slate-400">OVERVIEW tab coming soon...</p>
          </div>
        )}

        {/* CREATIVES Tab */}
        {activeTab === 'CREATIVES' && (
          <div className="text-center py-20">
            <p className="text-slate-400">CREATIVES view coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
