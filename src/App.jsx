import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  PieChart, ShoppingCart, Calculator, RefreshCw, Plus, Trash2,
  SlidersHorizontal, X, Check, TrendingUp, TrendingDown, Clock, AlertTriangle,
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// DEFAULT PORTFOLIO DATA
// ──────────────────────────────────────────────────────────────────────────────
const DEFAULT_PORTFOLIO = [
  // 국내 배당주
  { id:'kr-div-1', category:'국내 배당주', sector:'통신',   name:'SK텔레콤',          code:'017670', ticker:'017670', yahooTicker:'017670.KS', targetWeight:5,  currentPrice:52000,   autoTrade:true, currency:'KRW' },
  { id:'kr-div-2', category:'국내 배당주', sector:'소비재', name:'KT&G',              code:'033780', ticker:'033780', yahooTicker:'033780.KS', targetWeight:5,  currentPrice:90000,   autoTrade:true, currency:'KRW' },
  { id:'kr-div-3', category:'국내 배당주', sector:'인프라', name:'맥쿼리인프라',      code:'088980', ticker:'088980', yahooTicker:'088980.KS', targetWeight:5,  currentPrice:14000,   autoTrade:true, currency:'KRW' },
  // 국내 성장주
  { id:'kr-gro-1', category:'국내 성장주', sector:'반도체', name:'삼성전자',          code:'005930', ticker:'005930', yahooTicker:'005930.KS', targetWeight:5,  currentPrice:55000,   autoTrade:true, currency:'KRW' },
  { id:'kr-gro-2', category:'국내 성장주', sector:'2차전지',name:'LG에너지솔루션',    code:'373220', ticker:'373220', yahooTicker:'373220.KS', targetWeight:5,  currentPrice:380000,  autoTrade:true, currency:'KRW' },
  { id:'kr-gro-3', category:'국내 성장주', sector:'바이오', name:'삼성바이오로직스',  code:'207940', ticker:'207940', yahooTicker:'207940.KS', targetWeight:5,  currentPrice:900000,  autoTrade:true, currency:'KRW' },
  { id:'kr-gro-4', category:'국내 성장주', sector:'IT',     name:'NAVER',             code:'035420', ticker:'035420', yahooTicker:'035420.KS', targetWeight:5,  currentPrice:280000,  autoTrade:true, currency:'KRW' },
  { id:'kr-gro-5', category:'국내 성장주', sector:'자동차', name:'현대차',            code:'005380', ticker:'005380', yahooTicker:'005380.KS', targetWeight:5,  currentPrice:270000,  autoTrade:true, currency:'KRW' },
  { id:'kr-gro-6', category:'국내 성장주', sector:'방산',   name:'한화에어로스페이스',code:'012450', ticker:'012450', yahooTicker:'012450.KS', targetWeight:5,  currentPrice:800000,  autoTrade:true, currency:'KRW' },
  { id:'kr-gro-7', category:'국내 성장주', sector:'철강',   name:'POSCO홀딩스',       code:'005490', ticker:'005490', yahooTicker:'005490.KS', targetWeight:5,  currentPrice:350000,  autoTrade:true, currency:'KRW' },
  // 미국 ETF
  { id:'us-1', category:'미국 ETF', sector:'기술',    name:'Invesco QQQM', code:'', ticker:'QQQM', yahooTicker:'QQQM', targetWeight:20, currentPrice:295.02, autoTrade:true, currency:'USD' },
  { id:'us-2', category:'미국 ETF', sector:'배당',    name:'Schwab Div.',  code:'', ticker:'SCHD', yahooTicker:'SCHD', targetWeight:20, currentPrice:32.71,  autoTrade:true, currency:'USD' },
  { id:'us-3', category:'미국 ETF', sector:'S&P500', name:'SPDR S&P 500', code:'', ticker:'SPY',  yahooTicker:'SPY',  targetWeight:10, currentPrice:540,    autoTrade:true, currency:'USD' },
];

const LOCAL_KEY = 'ys_portfolio_v3';
const EMPTY_STOCK = { name:'', code:'', yahooTicker:'', sector:'', category:'국내 성장주', targetWeight:3, currentPrice:0, currency:'KRW' };

// ──────────────────────────────────────────────────────────────────────────────
// STYLE CONSTANTS
// ──────────────────────────────────────────────────────────────────────────────
const SECTOR_COLORS = {
  '반도체':   'bg-blue-500/20 text-blue-300 border-blue-500/30',
  '2차전지':  'bg-lime-500/20 text-lime-300 border-lime-500/30',
  '바이오':   'bg-pink-500/20 text-pink-300 border-pink-500/30',
  '방산':     'bg-red-500/20 text-red-300 border-red-500/30',
  '자동차':   'bg-orange-500/20 text-orange-300 border-orange-500/30',
  '기술':     'bg-sky-500/20 text-sky-300 border-sky-500/30',
  '배당':     'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'S&P500':   'bg-slate-400/20 text-slate-300 border-slate-400/30',
  '통신':     'bg-purple-500/20 text-purple-300 border-purple-500/30',
  '소비재':   'bg-rose-500/20 text-rose-300 border-rose-500/30',
  '인프라':   'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'IT':       'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  '철강':     'bg-zinc-400/20 text-zinc-300 border-zinc-400/30',
};

const CAT_STYLE = {
  '국내 배당주': { accent:'text-emerald-400', gradFrom:'from-emerald-500/10', border:'border-emerald-500/20', badgeBg:'bg-emerald-500/20 text-emerald-300' },
  '국내 성장주': { accent:'text-amber-400',   gradFrom:'from-amber-500/10',   border:'border-amber-500/20',   badgeBg:'bg-amber-500/20 text-amber-300'   },
  '미국 ETF':    { accent:'text-blue-400',    gradFrom:'from-blue-500/10',    border:'border-blue-500/20',    badgeBg:'bg-blue-500/20 text-blue-300'     },
};

const PRESETS = [[1000000,'100만'], [3000000,'300만'], [5000000,'500만'], [6500000,'650만'], [10000000,'1000만']];

// ──────────────────────────────────────────────────────────────────────────────
// UTILS
// ──────────────────────────────────────────────────────────────────────────────
const fmtKRW = (n) => new Intl.NumberFormat('ko-KR', { style:'currency', currency:'KRW' }).format(Math.round(n));
const fmtUSD = (n) => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(n);
const sectorBadge = (s) => `text-[10px] px-2 py-0.5 rounded-full font-medium border ${SECTOR_COLORS[s] ?? 'bg-slate-500/20 text-slate-300 border-slate-400/30'}`;

function staleness(dateStr) {
  if (!dateStr) return null;
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000 / 60; // minutes
  if (diff < 60)    return { label: `${Math.round(diff)}분 전`, warn: false };
  if (diff < 1440)  return { label: `${Math.round(diff/60)}시간 전`, warn: false };
  const days = Math.round(diff / 1440);
  return { label: `${days}일 전`, warn: true };
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ──────────────────────────────────────────────────────────────────────────────
export default function App() {
  // ── Hydrate from localStorage ───────────────────────────────────────────────
  const [portfolio, setPortfolio] = useState(() => {
    try {
      const d = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
      return d.portfolio || DEFAULT_PORTFOLIO;
    } catch { return DEFAULT_PORTFOLIO; }
  });
  const [totalInvestment, setTotalInvestment] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}').totalInvestment || 6500000; } catch { return 6500000; }
  });
  const [exchangeRate, setExchangeRate] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}').exchangeRate || 1517; } catch { return 1517; }
  });
  const [pricesUpdatedAt, setPricesUpdatedAt] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}').pricesUpdatedAt || null; } catch { return null; }
  });

  const [activeTab, setActiveTab]         = useState('portfolio');
  const [isLoading, setIsLoading]         = useState(false);
  const [fetchError, setFetchError]       = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [newStock, setNewStock]           = useState(EMPTY_STOCK);

  // ── Persist to localStorage whenever state changes ─────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify({ portfolio, totalInvestment, exchangeRate, pricesUpdatedAt }));
    } catch {}
  }, [portfolio, totalInvestment, exchangeRate, pricesUpdatedAt]);

  // ── Portfolio mutations ────────────────────────────────────────────────────
  const updateItem = (id, field, value) =>
    setPortfolio(p => p.map(i => i.id === id ? { ...i, [field]: value } : i));

  const removeItem = (id) => setPortfolio(p => p.filter(i => i.id !== id));

  const addItem = () => {
    if (!newStock.name || !newStock.yahooTicker) return;
    setPortfolio(p => [...p, { ...newStock, id:`custom-${Date.now()}`, ticker: newStock.code || newStock.yahooTicker, autoTrade:true }]);
    setNewStock(EMPTY_STOCK);
  };

  const resetToDefault = () => {
    if (!window.confirm('기본 포트폴리오로 초기화하시겠습니까?')) return;
    setPortfolio(DEFAULT_PORTFOLIO);
    setTotalInvestment(6500000);
    setExchangeRate(1517);
  };

  // ── Price fetch ────────────────────────────────────────────────────────────
  const fetchPrices = useCallback(async () => {
    setIsLoading(true); setFetchError(null);
    try {
      let prices, updatedAt;
      if (import.meta.env.PROD) {
        const res = await fetch(`${import.meta.env.BASE_URL}prices.json?t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        prices = data.prices;
        updatedAt = data.updatedAt || new Date().toISOString();
      } else {
        const symbols = ['KRW=X', ...portfolio.map(i => i.yahooTicker)].join(',');
        const res = await fetch(`/api/fetch-prices?symbols=${symbols}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        prices = data.prices;
        updatedAt = new Date().toISOString();
      }
      if (prices['KRW=X']) {
        const fx = prices['KRW=X'];
        setExchangeRate(Math.round(fx > 100 ? fx : 1 / fx));
      }
      setPortfolio(p => p.map(i => {
        const price = prices[i.yahooTicker];
        return price != null ? { ...i, currentPrice: price } : i;
      }));
      setPricesUpdatedAt(updatedAt);
    } catch (e) {
      setFetchError('조회 실패: ' + e.message);
    }
    setIsLoading(false);
  }, [portfolio]);

  // ── Derived data ───────────────────────────────────────────────────────────
  const calculatedPortfolio = useMemo(() => portfolio.map(item => {
    const allocatedKRW = totalInvestment * (item.targetWeight / 100);
    const priceInKRW   = item.currency === 'USD' ? item.currentPrice * exchangeRate : item.currentPrice;
    const buyShares    = priceInKRW > 0 && item.autoTrade ? Math.floor(allocatedKRW / priceInKRW) : 0;
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
  }), { targetWeight:0, allocatedKRW:0, expectedCostKRW:0 }), [calculatedPortfolio]);

  const categorySummary = useMemo(() => {
    const g = {};
    calculatedPortfolio.forEach(i => {
      if (!g[i.category]) g[i.category] = { weight:0, krw:0, count:0 };
      g[i.category].weight += i.targetWeight;
      g[i.category].krw   += i.allocatedKRW;
      g[i.category].count++;
    });
    return g;
  }, [calculatedPortfolio]);

  const stale = staleness(pricesUpdatedAt);

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER — Summary Cards
  // ──────────────────────────────────────────────────────────────────────────
  const renderSummary = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {Object.entries(categorySummary).map(([cat, d]) => {
        const s = CAT_STYLE[cat] ?? CAT_STYLE['미국 ETF'];
        return (
          <div key={cat} className={`relative rounded-2xl border ${s.border} bg-gradient-to-br ${s.gradFrom} to-transparent p-4 sm:p-5 overflow-hidden`}>
            <div className="absolute inset-0 bg-white/[0.02] rounded-2xl pointer-events-none" />
            <p className={`text-[9px] uppercase tracking-[0.15em] font-bold ${s.accent} mb-2`}>{cat}</p>
            <p className="text-3xl sm:text-4xl font-light text-white mb-1 leading-none">
              {d.weight}<span className="text-lg text-slate-500 ml-0.5">%</span>
            </p>
            <p className={`text-sm font-semibold ${s.accent} mt-2 truncate`}>{fmtKRW(d.krw)}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{d.count}종목</p>
          </div>
        );
      })}
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-slate-500 mb-2">총 합계</p>
        <p className={`text-3xl sm:text-4xl font-light mb-1 leading-none ${totals.targetWeight === 100 ? 'text-white' : 'text-amber-400'}`}>
          {totals.targetWeight}<span className="text-lg text-slate-500 ml-0.5">%</span>
        </p>
        <p className="text-sm font-semibold text-white mt-2 truncate">{fmtKRW(totalInvestment)}</p>
        <p className="text-[10px] text-slate-600 mt-0.5">{calculatedPortfolio.length}종목</p>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER — Portfolio Tab (Desktop table + Mobile cards)
  // ──────────────────────────────────────────────────────────────────────────
  const renderPortfolioTab = () => (
    <div className="space-y-5">
      {Object.entries(groupedPortfolio).map(([category, items]) => {
        const s = CAT_STYLE[category] ?? CAT_STYLE['미국 ETF'];
        const catWeight = items.reduce((sum, i) => sum + i.targetWeight, 0);
        const catKRW    = items.reduce((sum, i) => sum + i.allocatedKRW, 0);
        return (
          <div key={category} className={`rounded-2xl border ${s.border} overflow-hidden`}>
            {/* Category header */}
            <div className={`px-4 sm:px-6 py-3.5 bg-gradient-to-r ${s.gradFrom} to-transparent border-b ${s.border} flex justify-between items-center`}>
              <p className={`text-[10px] uppercase tracking-[0.18em] font-bold ${s.accent}`}>{category}</p>
              <div className="flex items-center gap-3">
                <span className="text-xl font-light text-white">{catWeight}<span className="text-sm text-slate-500 ml-0.5">%</span></span>
                <span className={`text-sm font-semibold ${s.accent}`}>{fmtKRW(catKRW)}</span>
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm min-w-[620px]">
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
                            <p className="text-white font-medium leading-tight">{item.name}</p>
                            <p className="text-slate-600 font-mono text-[10px]">{item.ticker}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-600 text-xs">{item.currency === 'USD' ? '$' : '₩'}</span>
                          <input type="number" value={item.currentPrice}
                            onChange={e => updateItem(item.id, 'currentPrice', Number(e.target.value))}
                            className="w-28 text-right bg-transparent border-b border-amber-500/30 text-amber-300 font-medium focus:outline-none focus:border-amber-400 py-0.5 text-sm" />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <input type="number" value={item.targetWeight}
                            onChange={e => updateItem(item.id, 'targetWeight', Number(e.target.value))}
                            className="w-14 text-right bg-transparent border-b border-amber-500/30 text-amber-300 font-medium focus:outline-none focus:border-amber-400 py-0.5 text-sm" />
                          <span className="text-slate-600 text-xs">%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <p className="text-white font-medium text-sm">{fmtKRW(item.allocatedKRW)}</p>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button onClick={() => updateItem(item.id, 'autoTrade', !item.autoTrade)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto transition-all ${
                            item.autoTrade ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30' : 'bg-white/5 text-slate-600 border border-white/10 hover:bg-white/10'
                          }`}>
                          {item.autoTrade ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-white/[0.04]">
              {items.map(item => (
                <div key={item.id} className={`p-4 ${!item.autoTrade ? 'opacity-40' : ''}`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={sectorBadge(item.sector)}>{item.sector}</span>
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{item.name}</p>
                        <p className="text-slate-600 font-mono text-[10px]">{item.ticker}</p>
                      </div>
                    </div>
                    <button onClick={() => updateItem(item.id, 'autoTrade', !item.autoTrade)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        item.autoTrade ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-slate-600 border border-white/10'
                      }`}>
                      {item.autoTrade ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <p className="text-slate-600 mb-1">현재가</p>
                      <div className="flex items-center gap-0.5">
                        <span className="text-slate-600">{item.currency === 'USD' ? '$' : '₩'}</span>
                        <input type="number" value={item.currentPrice}
                          onChange={e => updateItem(item.id, 'currentPrice', Number(e.target.value))}
                          className="w-full bg-transparent border-b border-amber-500/30 text-amber-300 font-medium focus:outline-none text-xs" />
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">비중</p>
                      <div className="flex items-center gap-0.5">
                        <input type="number" value={item.targetWeight}
                          onChange={e => updateItem(item.id, 'targetWeight', Number(e.target.value))}
                          className="w-12 bg-transparent border-b border-amber-500/30 text-amber-300 font-medium focus:outline-none text-xs" />
                        <span className="text-slate-600">%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">월 할당</p>
                      <p className="text-white font-semibold">{fmtKRW(item.allocatedKRW)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER — Buy Tool Tab
  // ──────────────────────────────────────────────────────────────────────────
  const renderBuyToolTab = () => {
    const activeItems = calculatedPortfolio.filter(i => i.autoTrade && i.buyShares > 0);
    const remainder   = totalInvestment - totals.expectedCostKRW;
    return (
      <div className="space-y-5">
        {/* Summary banner */}
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-transparent p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-medium text-white flex items-center gap-2">
                <ShoppingCart className="text-blue-400" size={18} /> 이번 달 매수 목록
              </h2>
              <p className="text-slate-500 text-xs mt-1">현재가 · 할당 예산 기준 실제 매수 수량</p>
            </div>
            <div className="bg-white/[0.05] border border-white/10 rounded-xl p-4 text-right shrink-0">
              <p className="text-[10px] text-slate-600 mb-1 uppercase tracking-wider">예상 총 체결</p>
              <p className="text-2xl font-light text-white">{fmtKRW(totals.expectedCostKRW)}</p>
              <p className={`text-[10px] mt-1 ${remainder >= 0 ? 'text-slate-600' : 'text-red-400'}`}>
                잔여: {fmtKRW(remainder)}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[580px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-4 text-left   text-[10px] uppercase tracking-wider text-slate-600">종목</th>
                  <th className="px-6 py-4 text-right  text-[10px] uppercase tracking-wider text-slate-600">현재가</th>
                  <th className="px-6 py-4 text-right  text-[10px] uppercase tracking-wider text-slate-600">비중 / 할당</th>
                  <th className="px-6 py-4 text-right  text-[10px] uppercase tracking-wider text-blue-500">매수 수량</th>
                  <th className="px-6 py-4 text-right  text-[10px] uppercase tracking-wider text-slate-600">체결 예상</th>
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
                      {item.currency === 'USD' ? fmtUSD(item.currentPrice) : fmtKRW(item.currentPrice)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-white text-sm">{item.targetWeight}%</p>
                      <p className="text-[10px] text-slate-600">{fmtKRW(item.allocatedKRW)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center justify-center bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold px-3 py-1 rounded-lg">
                        {item.buyShares.toLocaleString()}<span className="text-xs ml-1 font-normal">주</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-white font-medium text-sm">{fmtKRW(item.expectedCostKRW)}</td>
                  </tr>
                ))}
                {activeItems.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-700 text-sm">매수 가능한 종목이 없습니다</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-2">
          {activeItems.map(item => (
            <div key={item.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={sectorBadge(item.sector)}>{item.sector}</span>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">{item.name}</p>
                    <p className="text-slate-600 font-mono text-[10px]">{item.ticker}</p>
                  </div>
                </div>
                <span className="inline-flex items-center shrink-0 bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold px-3 py-1 rounded-lg text-sm">
                  {item.buyShares.toLocaleString()}<span className="text-xs ml-1 font-normal">주</span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <p className="text-slate-600 mb-0.5">현재가</p>
                  <p className="text-slate-300 font-medium">{item.currency === 'USD' ? fmtUSD(item.currentPrice) : fmtKRW(item.currentPrice)}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-0.5">비중 / 할당</p>
                  <p className="text-white font-semibold">{item.targetWeight}%</p>
                  <p className="text-slate-600">{fmtKRW(item.allocatedKRW)}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-0.5">체결 예상</p>
                  <p className="text-white font-semibold">{fmtKRW(item.expectedCostKRW)}</p>
                </div>
              </div>
            </div>
          ))}
          {activeItems.length === 0 && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 text-center text-slate-700 text-sm">매수 가능한 종목이 없습니다</div>
          )}
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER — Manage Modal
  // ──────────────────────────────────────────────────────────────────────────
  const renderManageModal = () => {
    if (!showManageModal) return null;
    const sections = [
      { key:'국내 성장주', items: portfolio.filter(i => i.category === '국내 성장주'), accent:'text-amber-400', focus:'focus:border-amber-400' },
      { key:'미국 ETF',    items: portfolio.filter(i => i.category === '미국 ETF'),    accent:'text-blue-400',  focus:'focus:border-blue-400'  },
    ];
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={e => e.target === e.currentTarget && setShowManageModal(false)}>
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setShowManageModal(false)} />
        <div className="relative z-10 w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-[#0d1117] border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl">
          <div className="flex justify-between items-center px-5 py-4 border-b border-white/10 shrink-0">
            <div>
              <h2 className="text-base font-semibold text-white">종목 관리</h2>
              <p className="text-[11px] text-slate-600 mt-0.5">추가 · 삭제 · 정보 수정</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={resetToDefault} className="text-[10px] text-slate-600 hover:text-rose-400 transition-colors px-2 py-1 rounded border border-white/5 hover:border-rose-500/20">초기화</button>
              <button onClick={() => setShowManageModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 transition-colors"><X size={15}/></button>
            </div>
          </div>

          <div className="overflow-y-auto p-5 space-y-7 flex-1">
            {sections.map(({ key, items, accent, focus }) => (
              <div key={key}>
                <p className={`text-[10px] uppercase tracking-[0.18em] font-bold ${accent} mb-3`}>{key}</p>
                <div className="space-y-1.5">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-2 items-center bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/[0.06] hover:border-white/10 transition-colors group">
                      <input value={item.sector} onChange={e => updateItem(item.id, 'sector', e.target.value)}
                        placeholder="섹터" className={`w-14 sm:w-16 bg-transparent border-b border-white/10 text-[10px] text-slate-500 focus:outline-none ${focus} py-0.5 shrink-0`} />
                      <input value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)}
                        className={`flex-1 min-w-0 bg-transparent border-b border-white/10 text-sm text-white focus:outline-none ${focus} py-0.5`} />
                      <input value={item.yahooTicker} onChange={e => updateItem(item.id, 'yahooTicker', e.target.value)}
                        placeholder="Yahoo 티커" className={`w-20 sm:w-24 bg-transparent border-b border-white/10 text-[11px] text-slate-500 font-mono focus:outline-none ${focus} py-0.5 shrink-0`} />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input type="number" value={item.targetWeight}
                          onChange={e => updateItem(item.id, 'targetWeight', Number(e.target.value))}
                          className={`w-9 sm:w-10 text-right bg-transparent border-b border-white/10 text-amber-300 text-sm focus:outline-none ${focus} py-0.5`} />
                        <span className="text-slate-600 text-xs">%</span>
                      </div>
                      <input type="number" value={item.currentPrice}
                        onChange={e => updateItem(item.id, 'currentPrice', Number(e.target.value))}
                        className={`w-20 sm:w-24 text-right bg-transparent border-b border-white/10 text-slate-400 text-xs font-mono focus:outline-none ${focus} py-0.5 shrink-0`} />
                      <button onClick={() => removeItem(item.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500/60 hover:bg-red-500/20 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Add new */}
            <div className="border border-dashed border-white/10 rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-500 mb-4 flex items-center gap-1.5"><Plus size={11}/> 종목 추가</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label:'카테고리', field:'category', type:'select', options:['국내 성장주','미국 ETF'] },
                  { label:'섹터', field:'sector', type:'text', placeholder:'반도체' },
                  { label:'종목명', field:'name', type:'text', placeholder:'삼성전자' },
                  { label:'통화', field:'currency', type:'select', options:['KRW','USD'] },
                  { label:'종목코드', field:'code', type:'text', placeholder:'005930' },
                  { label:'Yahoo Ticker', field:'yahooTicker', type:'text', placeholder:'005930.KS' },
                  { label:'목표비중 (%)', field:'targetWeight', type:'number' },
                  { label:'현재가', field:'currentPrice', type:'number' },
                ].map(({ label, field, type, placeholder, options }) => (
                  <div key={field}>
                    <label className="text-[9px] uppercase tracking-wider text-slate-600 mb-1 block">{label}</label>
                    {type === 'select' ? (
                      <select value={newStock[field]}
                        onChange={e => setNewStock(s => ({ ...s, [field]: e.target.value, ...(field === 'category' ? { currency: e.target.value === '미국 ETF' ? 'USD' : 'KRW' } : {}) }))}
                        className="w-full bg-white/[0.06] border border-white/15 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-400">
                        {options.map(o => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
                      </select>
                    ) : (
                      <input type={type} value={newStock[field]} placeholder={placeholder}
                        onChange={e => setNewStock(s => ({ ...s, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                        className="w-full bg-white/[0.06] border border-white/15 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-400 placeholder-slate-700" />
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addItem} disabled={!newStock.name || !newStock.yahooTicker}
                className="w-full py-2.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:bg-amber-500/25 disabled:opacity-25 disabled:cursor-not-allowed transition-all text-sm font-medium flex items-center justify-center gap-2">
                <Plus size={14}/> 종목 추가
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060a12] pb-24 font-sans text-white">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#060a12]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">

            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <PieChart size={15} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight leading-tight">YS Portfolio</h1>
                <p className="text-[8px] sm:text-[9px] text-slate-600 uppercase tracking-[0.15em]">Smart Investment</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Price update button */}
              <div className="flex flex-col items-start sm:items-end gap-0.5">
                <button onClick={fetchPrices} disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-amber-500/15 text-amber-300 border border-amber-500/25 rounded-xl text-xs font-semibold hover:bg-amber-500/25 disabled:opacity-40 transition-all">
                  <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} />
                  {isLoading ? '조회 중...' : '현재가 업데이트'}
                </button>
                {stale && (
                  <span className={`text-[9px] flex items-center gap-1 ${stale.warn ? 'text-amber-500' : 'text-slate-700'}`}>
                    {stale.warn ? <AlertTriangle size={9}/> : <Clock size={9}/>}
                    {stale.label}
                  </span>
                )}
                {fetchError && <span className="text-[9px] text-red-500/80">{fetchError}</span>}
              </div>

              <div className="h-6 w-px bg-white/10 hidden sm:block" />

              {/* Monthly investment */}
              <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.07] px-2.5 py-1.5 rounded-xl">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">월 투자</span>
                <input type="number" value={totalInvestment}
                  onChange={e => setTotalInvestment(Number(e.target.value))}
                  className="w-24 sm:w-28 text-right bg-transparent text-amber-300 font-semibold text-sm focus:outline-none" />
                <div className="hidden sm:flex gap-1">
                  {PRESETS.map(([v, label]) => (
                    <button key={v} onClick={() => setTotalInvestment(v)}
                      className="text-[9px] bg-white/[0.05] border border-white/10 rounded-md px-1.5 py-0.5 text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exchange rate */}
              <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.07] px-2.5 py-1.5 rounded-xl">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">환율</span>
                <input type="number" value={exchangeRate}
                  onChange={e => setExchangeRate(Number(e.target.value))}
                  className="w-16 sm:w-20 text-right bg-transparent text-amber-300 font-semibold text-sm focus:outline-none" />
                <span className="text-[9px] text-slate-600">₩/$</span>
              </div>

              {/* Manage */}
              <button onClick={() => setShowManageModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/[0.04] text-slate-500 border border-white/[0.07] rounded-xl text-xs font-semibold hover:bg-white/[0.08] hover:text-slate-300 transition-all">
                <SlidersHorizontal size={11}/> 종목 관리
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-7">

        {/* Weight warning */}
        {totals.targetWeight !== 100 && (
          <div className="mb-5 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 flex items-center gap-3">
            <AlertTriangle size={15} className="shrink-0" />
            <p className="text-sm">
              목표 비중 합계 <strong>{totals.targetWeight}%</strong> — 100%로 맞춰주세요
              <span className={`ml-2 text-xs ${totals.targetWeight > 100 ? 'text-red-400' : 'text-slate-400'}`}>
                ({totals.targetWeight > 100 ? '+' : ''}{totals.targetWeight - 100}%)
              </span>
            </p>
          </div>
        )}

        {/* Hint (mobile: compact) */}
        <div className="mb-5 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          <p className="text-[11px] text-slate-600">
            <span className="hidden sm:inline">황색 숫자를 탭하여 즉시 수정 · 상단 <strong className="text-slate-500">현재가 업데이트</strong>로 Yahoo Finance 실시간 반영 · </span>
            <strong className="text-slate-500">종목 관리</strong>로 포트폴리오 구성 변경 · <strong className="text-slate-500">변경 내용은 자동 저장</strong>됩니다
          </p>
        </div>

        {/* Monthly presets (mobile only) */}
        <div className="sm:hidden mb-5 flex gap-1.5 flex-wrap">
          <span className="text-[10px] text-slate-600 self-center">빠른 설정:</span>
          {PRESETS.map(([v, label]) => (
            <button key={v} onClick={() => setTotalInvestment(v)}
              className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${totalInvestment === v ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-white/[0.05] border-white/10 text-slate-500 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Summary */}
        {renderSummary()}

        {/* Tab switcher */}
        <div className="flex gap-1 mb-5 bg-white/[0.03] border border-white/[0.06] p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'portfolio' ? 'bg-white/[0.08] text-white' : 'text-slate-600 hover:text-slate-400'}`}>
            <Calculator size={13}/> 포트폴리오
          </button>
          <button onClick={() => setActiveTab('buyTool')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'buyTool' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20' : 'text-slate-600 hover:text-slate-400'}`}>
            <ShoppingCart size={13}/> 매수 툴
          </button>
        </div>

        {activeTab === 'portfolio' ? renderPortfolioTab() : renderBuyToolTab()}
      </main>

      {renderManageModal()}
    </div>
  );
}
