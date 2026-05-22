import React, { useState, useMemo } from 'react';
import { PieChart, ShoppingCart, Calculator, RefreshCw, Plus, Trash2, SlidersHorizontal, X, Check } from 'lucide-react';

const initialPortfolio = [
  // 국내 성장주 — 섹터별 코어 + 부품/자동차 추가
  { id: 'kr-1',  category: '국내 성장주', sector: '반도체',   name: '삼성전자',           code: '005930', ticker: '005930', yahooTicker: '005930.KS',  targetWeight: 6, currentPrice: 292500,  autoTrade: true, currency: 'KRW' },
  { id: 'kr-2',  category: '국내 성장주', sector: '로봇',     name: '두산로보틱스',       code: '454910', ticker: '454910', yahooTicker: '454910.KS',  targetWeight: 4, currentPrice: 70000,   autoTrade: true, currency: 'KRW' },
  { id: 'kr-3',  category: '국내 성장주', sector: '2차전지',  name: 'LG에너지솔루션',    code: '373220', ticker: '373220', yahooTicker: '373220.KS',  targetWeight: 5, currentPrice: 398500,  autoTrade: true, currency: 'KRW' },
  { id: 'kr-4',  category: '국내 성장주', sector: '바이오',   name: '삼성바이오로직스',  code: '207940', ticker: '207940', yahooTicker: '207940.KS',  targetWeight: 5, currentPrice: 1415000, autoTrade: true, currency: 'KRW' },
  { id: 'kr-5',  category: '국내 성장주', sector: '전력',     name: 'HD현대일렉트릭',    code: '267260', ticker: '267260', yahooTicker: '267260.KS',  targetWeight: 4, currentPrice: 300000,  autoTrade: true, currency: 'KRW' },
  { id: 'kr-6',  category: '국내 성장주', sector: '방산',     name: '한화에어로스페이스', code: '012450', ticker: '012450', yahooTicker: '012450.KS', targetWeight: 5, currentPrice: 1261000, autoTrade: true, currency: 'KRW' },
  { id: 'kr-7',  category: '국내 성장주', sector: '조선',     name: 'HD한국조선해양',    code: '009540', ticker: '009540', yahooTicker: '009540.KS',  targetWeight: 4, currentPrice: 250000,  autoTrade: true, currency: 'KRW' },
  { id: 'kr-8',  category: '국내 성장주', sector: '원자력',   name: '두산에너빌리티',    code: '034020', ticker: '034020', yahooTicker: '034020.KS',  targetWeight: 4, currentPrice: 20000,   autoTrade: true, currency: 'KRW' },
  { id: 'kr-9',  category: '국내 성장주', sector: '전자부품', name: '삼성전기',           code: '009150', ticker: '009150', yahooTicker: '009150.KS',  targetWeight: 4, currentPrice: 160000,  autoTrade: true, currency: 'KRW' },
  { id: 'kr-10', category: '국내 성장주', sector: '전자부품', name: 'LG이노텍',           code: '011070', ticker: '011070', yahooTicker: '011070.KS',  targetWeight: 4, currentPrice: 170000,  autoTrade: true, currency: 'KRW' },
  { id: 'kr-11', category: '국내 성장주', sector: '자동차',   name: '현대모비스',         code: '012330', ticker: '012330', yahooTicker: '012330.KS',  targetWeight: 5, currentPrice: 260000,  autoTrade: true, currency: 'KRW' },
  // 미국 ETF
  { id: 'us-1', category: '미국 ETF', sector: '기술',    name: 'Invesco QQQM', code: '', ticker: 'QQQM', yahooTicker: 'QQQM', targetWeight: 20, currentPrice: 295.02, autoTrade: true, currency: 'USD' },
  { id: 'us-2', category: '미국 ETF', sector: '배당',    name: 'Schwab Div.',  code: '', ticker: 'SCHD', yahooTicker: 'SCHD', targetWeight: 20, currentPrice: 32.71,  autoTrade: true, currency: 'USD' },
  { id: 'us-3', category: '미국 ETF', sector: 'S&P500', name: 'SPDR S&P 500', code: '', ticker: 'SPY',  yahooTicker: 'SPY',  targetWeight: 10, currentPrice: 744.92, autoTrade: true, currency: 'USD' },
];

const SECTOR_COLORS = {
  '반도체':   'bg-blue-500/20 text-blue-300 border-blue-500/30',
  '로봇':     'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  '2차전지':  'bg-lime-500/20 text-lime-300 border-lime-500/30',
  '바이오':   'bg-pink-500/20 text-pink-300 border-pink-500/30',
  '전력':     'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  '방산':     'bg-red-500/20 text-red-300 border-red-500/30',
  '조선':     'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  '원자력':   'bg-teal-500/20 text-teal-300 border-teal-500/30',
  '전자부품': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  '자동차':   'bg-orange-500/20 text-orange-300 border-orange-500/30',
  '기술':     'bg-sky-500/20 text-sky-300 border-sky-500/30',
  '배당':     'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'S&P500':   'bg-slate-400/20 text-slate-300 border-slate-400/30',
};

const CAT_STYLE = {
  '국내 성장주': { accent: 'text-amber-400', gradFrom: 'from-amber-500/10', border: 'border-amber-500/20', badgeBg: 'bg-amber-500/20 text-amber-300' },
  '미국 ETF':    { accent: 'text-blue-400',  gradFrom: 'from-blue-500/10',  border: 'border-blue-500/20',  badgeBg: 'bg-blue-500/20 text-blue-300'   },
};

const EMPTY_STOCK = { name: '', code: '', yahooTicker: '', sector: '', category: '국내 성장주', targetWeight: 3, currentPrice: 0, currency: 'KRW' };

export default function App() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [totalInvestment, setTotalInvestment] = useState(6500000);
  const [exchangeRate, setExchangeRate] = useState(1517);
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [newStock, setNewStock] = useState(EMPTY_STOCK);

  const updateItem = (id, field, value) =>
    setPortfolio(p => p.map(i => i.id === id ? { ...i, [field]: value } : i));

  const removeItem = (id) => setPortfolio(p => p.filter(i => i.id !== id));

  const addItem = () => {
    if (!newStock.name || !newStock.yahooTicker) return;
    setPortfolio(p => [...p, {
      ...newStock,
      id: `custom-${Date.now()}`,
      ticker: newStock.code || newStock.yahooTicker,
      autoTrade: true,
    }]);
    setNewStock(EMPTY_STOCK);
  };

  const formatKRW = (n) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(Math.round(n));
  const formatUSD = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const fetchPrices = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      let prices, updatedAt;
      if (import.meta.env.PROD) {
        const res = await fetch(`${import.meta.env.BASE_URL}prices.json?t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        prices = data.prices;
        updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
      } else {
        const symbols = ['KRW=X', ...portfolio.map(i => i.yahooTicker)].join(',');
        const res = await fetch(`/api/fetch-prices?symbols=${symbols}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        prices = data.prices;
        updatedAt = new Date();
      }
      const rawFx = prices['KRW=X'];
      if (rawFx) setExchangeRate(Math.round(rawFx > 100 ? rawFx : 1 / rawFx));
      setPortfolio(p => p.map(i => {
        const price = prices[i.yahooTicker];
        return price != null ? { ...i, currentPrice: price } : i;
      }));
      setLastUpdated(updatedAt);
    } catch (e) {
      setFetchError('조회 실패: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatedPortfolio = useMemo(() => portfolio.map(item => {
    const allocatedKRW = totalInvestment * (item.targetWeight / 100);
    const priceInKRW = item.currency === 'USD' ? item.currentPrice * exchangeRate : item.currentPrice;
    const buyShares = priceInKRW > 0 && item.autoTrade ? Math.floor(allocatedKRW / priceInKRW) : 0;
    return { ...item, allocatedKRW, buyShares, expectedCostKRW: buyShares * priceInKRW };
  }), [portfolio, totalInvestment, exchangeRate]);

  const groupedPortfolio = useMemo(() => {
    const g = {};
    calculatedPortfolio.forEach(i => { if (!g[i.category]) g[i.category] = []; g[i.category].push(i); });
    return g;
  }, [calculatedPortfolio]);

  const totals = useMemo(() => calculatedPortfolio.reduce((a, i) => ({
    targetWeight: a.targetWeight + i.targetWeight,
    allocatedKRW: a.allocatedKRW + (i.autoTrade ? i.allocatedKRW : 0),
    expectedCostKRW: a.expectedCostKRW + (i.autoTrade ? i.expectedCostKRW : 0),
  }), { targetWeight: 0, allocatedKRW: 0, expectedCostKRW: 0 }), [calculatedPortfolio]);

  const categorySummary = useMemo(() => {
    const g = {};
    calculatedPortfolio.forEach(i => {
      if (!g[i.category]) g[i.category] = { weight: 0, krw: 0, count: 0 };
      g[i.category].weight += i.targetWeight;
      g[i.category].krw += i.allocatedKRW;
      g[i.category].count++;
    });
    return g;
  }, [calculatedPortfolio]);

  const sectorBadge = (sector) => {
    const c = SECTOR_COLORS[sector] ?? 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    return `text-[10px] px-2 py-0.5 rounded-full font-medium border ${c}`;
  };

  // ─── Summary Cards ────────────────────────────────────────────────────────
  const renderSummary = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {Object.entries(categorySummary).map(([cat, d]) => {
        const s = CAT_STYLE[cat] ?? CAT_STYLE['미국 ETF'];
        return (
          <div key={cat} className={`relative rounded-2xl border ${s.border} bg-gradient-to-br ${s.gradFrom} to-transparent p-5 overflow-hidden`}>
            <div className="absolute inset-0 bg-white/[0.02] rounded-2xl pointer-events-none" />
            <p className={`text-[10px] uppercase tracking-[0.18em] font-bold ${s.accent} mb-3`}>{cat}</p>
            <p className="text-4xl font-light text-white mb-1 leading-none">
              {d.weight}<span className="text-xl text-slate-500 ml-0.5">%</span>
            </p>
            <p className={`text-base font-semibold ${s.accent} mt-2`}>{formatKRW(d.krw)}</p>
            <p className="text-[11px] text-slate-600 mt-1">{d.count}종목</p>
          </div>
        );
      })}
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 overflow-hidden">
        <div className="absolute inset-0 bg-white/[0.01] rounded-2xl pointer-events-none" />
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-500 mb-3">총 합계</p>
        <p className={`text-4xl font-light mb-1 leading-none ${totals.targetWeight === 100 ? 'text-white' : 'text-amber-400'}`}>
          {totals.targetWeight}<span className="text-xl text-slate-500 ml-0.5">%</span>
        </p>
        <p className="text-base font-semibold text-white mt-2">{formatKRW(totalInvestment)}</p>
        <p className="text-[11px] text-slate-600 mt-1">{calculatedPortfolio.length}종목</p>
      </div>
    </div>
  );

  // ─── Portfolio Tab ─────────────────────────────────────────────────────────
  const renderPortfolioTab = () => (
    <div className="space-y-5">
      {Object.entries(groupedPortfolio).map(([category, items]) => {
        const s = CAT_STYLE[category] ?? CAT_STYLE['미국 ETF'];
        const catWeight = items.reduce((sum, i) => sum + i.targetWeight, 0);
        const catKRW = items.reduce((sum, i) => sum + i.allocatedKRW, 0);
        return (
          <div key={category} className={`rounded-2xl border ${s.border} overflow-hidden`}>
            <div className={`px-6 py-4 bg-gradient-to-r ${s.gradFrom} to-transparent border-b ${s.border} flex justify-between items-center`}>
              <p className={`text-[10px] uppercase tracking-[0.18em] font-bold ${s.accent}`}>{category}</p>
              <div className="flex items-center gap-3">
                <span className="text-xl font-light text-white">
                  {catWeight}<span className="text-sm text-slate-500 ml-0.5">%</span>
                </span>
                <span className={`text-sm font-semibold ${s.accent}`}>{formatKRW(catKRW)}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-600 font-semibold">종목</th>
                    <th className="px-5 py-3 text-right text-[10px] uppercase tracking-wider text-slate-600 font-semibold">현재가</th>
                    <th className="px-5 py-3 text-right text-[10px] uppercase tracking-wider text-slate-600 font-semibold">비중</th>
                    <th className="px-5 py-3 text-right text-[10px] uppercase tracking-wider text-slate-600 font-semibold">월 할당액</th>
                    <th className="px-5 py-3 text-center text-[10px] uppercase tracking-wider text-slate-600 font-semibold">자동</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className={`border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors ${!item.autoTrade ? 'opacity-35' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className={sectorBadge(item.sector)}>{item.sector}</span>
                          <div>
                            <p className="text-white font-medium text-sm leading-tight">{item.name}</p>
                            <p className="text-slate-600 font-mono text-[10px]">{item.ticker}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-600 text-xs">{item.currency === 'USD' ? '$' : '₩'}</span>
                          <input
                            type="number"
                            value={item.currentPrice}
                            onChange={e => updateItem(item.id, 'currentPrice', Number(e.target.value))}
                            className="w-28 text-right bg-transparent border-b border-amber-500/30 text-amber-300 font-medium focus:outline-none focus:border-amber-400 py-0.5 text-sm"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <input
                            type="number"
                            value={item.targetWeight}
                            onChange={e => updateItem(item.id, 'targetWeight', Number(e.target.value))}
                            className="w-14 text-right bg-transparent border-b border-amber-500/30 text-amber-300 font-medium focus:outline-none focus:border-amber-400 py-0.5 text-sm"
                          />
                          <span className="text-slate-600 text-xs">%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <p className="text-white font-medium text-sm">{formatKRW(item.allocatedKRW)}</p>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => updateItem(item.id, 'autoTrade', !item.autoTrade)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto transition-all ${
                            item.autoTrade
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                              : 'bg-white/5 text-slate-600 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {item.autoTrade ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ─── Buy Tool Tab ──────────────────────────────────────────────────────────
  const renderBuyToolTab = () => {
    const activeItems = calculatedPortfolio.filter(i => i.autoTrade && i.buyShares > 0);
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-transparent p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-base font-medium text-white flex items-center gap-2">
                <ShoppingCart className="text-blue-400" size={18} />
                이번 달 매수 목록
              </h2>
              <p className="text-slate-500 text-xs mt-1">현재가와 할당 예산 기준 실제 매수 수량</p>
            </div>
            <div className="bg-white/[0.05] border border-white/10 rounded-xl p-4 text-right shrink-0">
              <p className="text-[10px] text-slate-600 mb-1 uppercase tracking-wider">예상 총 체결</p>
              <p className="text-2xl font-light text-white">{formatKRW(totals.expectedCostKRW)}</p>
              <p className="text-[10px] text-slate-600 mt-1">잔여: {formatKRW(totalInvestment - totals.expectedCostKRW)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-4 text-left text-[10px] uppercase tracking-wider text-slate-600">종목</th>
                  <th className="px-6 py-4 text-right text-[10px] uppercase tracking-wider text-slate-600">현재가</th>
                  <th className="px-6 py-4 text-right text-[10px] uppercase tracking-wider text-slate-600">비중 / 할당</th>
                  <th className="px-6 py-4 text-right text-[10px] uppercase tracking-wider text-blue-500">매수 수량</th>
                  <th className="px-6 py-4 text-right text-[10px] uppercase tracking-wider text-slate-600">체결 예상</th>
                </tr>
              </thead>
              <tbody>
                {activeItems.map(item => (
                  <tr key={item.id} className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className={sectorBadge(item.sector)}>{item.sector}</span>
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-slate-600 font-mono text-[10px]">{item.ticker}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400 text-sm">
                      {item.currency === 'USD' ? formatUSD(item.currentPrice) : formatKRW(item.currentPrice)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-white text-sm">{item.targetWeight}%</p>
                      <p className="text-[10px] text-slate-600">{formatKRW(item.allocatedKRW)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center justify-center bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold px-3 py-1 rounded-lg">
                        {item.buyShares.toLocaleString()}<span className="text-xs ml-1 font-normal">주</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-white font-medium text-sm">
                      {formatKRW(item.expectedCostKRW)}
                    </td>
                  </tr>
                ))}
                {activeItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-700 text-sm">
                      매수 가능한 종목이 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ─── Stock Management Modal ────────────────────────────────────────────────
  const renderManageModal = () => {
    if (!showManageModal) return null;
    const sections = [
      { key: '국내 성장주', items: portfolio.filter(i => i.category === '국내 성장주'), accent: 'text-amber-400', focus: 'focus:border-amber-400' },
      { key: '미국 ETF',    items: portfolio.filter(i => i.category === '미국 ETF'),    accent: 'text-blue-400',  focus: 'focus:border-blue-400'  },
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
          onClick={() => setShowManageModal(false)}
        />
        <div className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl">
          {/* Modal Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 shrink-0">
            <div>
              <h2 className="text-base font-semibold text-white">종목 관리</h2>
              <p className="text-[11px] text-slate-600 mt-0.5">추가 · 삭제 · 정보 수정 — 변경 즉시 반영</p>
            </div>
            <button
              onClick={() => setShowManageModal(false)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto p-6 space-y-8 flex-1">
            {sections.map(({ key, items, accent, focus }) => (
              <div key={key}>
                <p className={`text-[10px] uppercase tracking-[0.18em] font-bold ${accent} mb-3`}>{key}</p>
                <div className="space-y-1.5">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-2 items-center bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/[0.06] hover:border-white/10 transition-colors group">
                      {/* Sector */}
                      <input
                        value={item.sector}
                        onChange={e => updateItem(item.id, 'sector', e.target.value)}
                        placeholder="섹터"
                        title="섹터"
                        className={`w-16 bg-transparent border-b border-white/10 text-[10px] text-slate-500 focus:outline-none ${focus} py-0.5 shrink-0`}
                      />
                      {/* Name */}
                      <input
                        value={item.name}
                        onChange={e => updateItem(item.id, 'name', e.target.value)}
                        title="종목명"
                        className={`flex-1 min-w-0 bg-transparent border-b border-white/10 text-sm text-white focus:outline-none ${focus} py-0.5`}
                      />
                      {/* Yahoo Ticker */}
                      <input
                        value={item.yahooTicker}
                        onChange={e => updateItem(item.id, 'yahooTicker', e.target.value)}
                        placeholder="Yahoo 티커"
                        title="Yahoo Finance 티커"
                        className={`w-24 bg-transparent border-b border-white/10 text-[11px] text-slate-500 font-mono focus:outline-none ${focus} py-0.5 shrink-0`}
                      />
                      {/* Weight */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input
                          type="number"
                          value={item.targetWeight}
                          onChange={e => updateItem(item.id, 'targetWeight', Number(e.target.value))}
                          title="목표비중 (%)"
                          className={`w-10 text-right bg-transparent border-b border-white/10 text-amber-300 text-sm focus:outline-none ${focus} py-0.5`}
                        />
                        <span className="text-slate-600 text-xs">%</span>
                      </div>
                      {/* Price */}
                      <input
                        type="number"
                        value={item.currentPrice}
                        onChange={e => updateItem(item.id, 'currentPrice', Number(e.target.value))}
                        title="현재가"
                        className={`w-24 text-right bg-transparent border-b border-white/10 text-slate-400 text-xs font-mono focus:outline-none ${focus} py-0.5 shrink-0`}
                      />
                      {/* Delete */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500/60 hover:bg-red-500/20 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Add New Stock */}
            <div className="border border-dashed border-white/10 rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-500 mb-4 flex items-center gap-1.5">
                <Plus size={11} /> 종목 추가
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: '카테고리', field: 'category', type: 'select', options: ['국내 성장주', '미국 ETF'] },
                  { label: '섹터', field: 'sector', type: 'text', placeholder: '반도체' },
                  { label: '종목명', field: 'name', type: 'text', placeholder: '삼성전자' },
                  { label: '통화', field: 'currency', type: 'select', options: ['KRW', 'USD'] },
                  { label: '종목코드/티커', field: 'code', type: 'text', placeholder: '005930' },
                  { label: 'Yahoo Ticker', field: 'yahooTicker', type: 'text', placeholder: '005930.KS' },
                  { label: '목표비중 (%)', field: 'targetWeight', type: 'number' },
                  { label: '현재가', field: 'currentPrice', type: 'number' },
                ].map(({ label, field, type, placeholder, options }) => (
                  <div key={field}>
                    <label className="text-[9px] uppercase tracking-wider text-slate-600 mb-1 block">{label}</label>
                    {type === 'select' ? (
                      <select
                        value={newStock[field]}
                        onChange={e => {
                          const val = e.target.value;
                          setNewStock(s => ({
                            ...s,
                            [field]: val,
                            ...(field === 'category' ? { currency: val === '미국 ETF' ? 'USD' : 'KRW' } : {}),
                          }));
                        }}
                        className="w-full bg-white/[0.06] border border-white/15 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-400"
                      >
                        {options.map(o => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={type}
                        value={newStock[field]}
                        placeholder={placeholder}
                        onChange={e => setNewStock(s => ({ ...s, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                        className="w-full bg-white/[0.06] border border-white/15 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-400 placeholder-slate-700"
                      />
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addItem}
                disabled={!newStock.name || !newStock.yahooTicker}
                className="w-full py-2.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:bg-amber-500/25 disabled:opacity-25 disabled:cursor-not-allowed transition-all text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                종목 추가
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060a12] pb-20 font-sans text-white">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#060a12]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 py-3.5 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <PieChart size={17} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-base font-semibold text-white tracking-tight leading-tight">YS Portfolio</h1>
                <p className="text-[9px] text-slate-600 uppercase tracking-[0.15em]">Smart Investment</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">

              {/* Refresh */}
              <div className="flex flex-col items-end gap-0.5">
                <button
                  onClick={fetchPrices}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/15 text-amber-300 border border-amber-500/25 rounded-xl text-xs font-semibold hover:bg-amber-500/25 disabled:opacity-40 transition-all"
                >
                  <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} />
                  {isLoading ? '조회 중...' : '현재가 업데이트'}
                </button>
                {lastUpdated && !fetchError && (
                  <span className="text-[9px] text-slate-700">{lastUpdated.toLocaleTimeString('ko-KR')}</span>
                )}
                {fetchError && <span className="text-[9px] text-red-500/80">{fetchError}</span>}
              </div>

              <div className="h-7 w-px bg-white/10 hidden sm:block" />

              {/* Investment */}
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] px-3 py-2 rounded-xl">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">월 투자</span>
                <input
                  type="number"
                  value={totalInvestment}
                  onChange={e => setTotalInvestment(Number(e.target.value))}
                  className="w-28 text-right bg-transparent text-amber-300 font-semibold text-sm focus:outline-none"
                />
                <div className="flex gap-1">
                  {[[3000000, '300만'], [6500000, '650만']].map(([v, label]) => (
                    <button
                      key={v}
                      onClick={() => setTotalInvestment(v)}
                      className="text-[9px] bg-white/[0.05] border border-white/10 rounded-md px-1.5 py-0.5 text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exchange rate */}
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] px-3 py-2 rounded-xl">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">환율</span>
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={e => setExchangeRate(Number(e.target.value))}
                  className="w-20 text-right bg-transparent text-amber-300 font-semibold text-sm focus:outline-none"
                />
                <span className="text-[9px] text-slate-600">₩/$</span>
              </div>

              {/* Manage button */}
              <button
                onClick={() => setShowManageModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.04] text-slate-500 border border-white/[0.07] rounded-xl text-xs font-semibold hover:bg-white/[0.08] hover:text-slate-300 transition-all"
              >
                <SlidersHorizontal size={11} />
                종목 관리
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-7 sm:px-6">

        {/* Weight warning */}
        {totals.targetWeight !== 100 && (
          <div className="mb-6 px-5 py-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 flex items-center gap-3">
            <span className="shrink-0">⚠</span>
            <p className="text-sm">
              목표 비중 합계 <strong>{totals.targetWeight}%</strong> — 100%로 맞춰주세요
            </p>
          </div>
        )}

        {/* Hint */}
        <div className="mb-6 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-amber-400/60 shrink-0"></span>
          <p className="text-[11px] text-slate-600">황색 숫자를 탭하여 즉시 수정 가능 · 상단 <strong className="text-slate-500">현재가 업데이트</strong>로 Yahoo Finance 실시간 반영 · <strong className="text-slate-500">종목 관리</strong>로 구성 변경</p>
        </div>

        {/* Summary */}
        {renderSummary()}

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white/[0.03] border border-white/[0.06] p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'portfolio'
                ? 'bg-white/[0.08] text-white'
                : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            <Calculator size={13} />
            포트폴리오
          </button>
          <button
            onClick={() => setActiveTab('buyTool')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'buyTool'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20'
                : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            <ShoppingCart size={13} />
            매수 툴
          </button>
        </div>

        {activeTab === 'portfolio' ? renderPortfolioTab() : renderBuyToolTab()}
      </main>

      {renderManageModal()}
    </div>
  );
}
