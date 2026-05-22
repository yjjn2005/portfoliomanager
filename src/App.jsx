import React, { useState, useMemo } from 'react';
import { Settings, PieChart, ShoppingCart, Calculator, DollarSign, Check, X, RefreshCw } from 'lucide-react';

const initialPortfolio = [
  // 국내 배당주 (통신 · 소비재 · 인프라)
  { id: 'kr-div-1', category: '국내 배당주', name: 'SK텔레콤',        code: '017670', ticker: '017670', yahooTicker: '017670.KS', targetWeight: 5, currentPrice: 52000,  autoTrade: true, currency: 'KRW' },
  { id: 'kr-div-2', category: '국내 배당주', name: 'KT&G',            code: '033780', ticker: '033780', yahooTicker: '033780.KS', targetWeight: 5, currentPrice: 90000,  autoTrade: true, currency: 'KRW' },
  { id: 'kr-div-3', category: '국내 배당주', name: '맥쿼리인프라',    code: '088980', ticker: '088980', yahooTicker: '088980.KS', targetWeight: 5, currentPrice: 14000,  autoTrade: true, currency: 'KRW' },

  // 국내 성장주 코어 (섹터별 1종목)
  { id: 'kr-gro-1', category: '국내 성장주', name: '삼성전자',         code: '005930', ticker: '005930', yahooTicker: '005930.KS', targetWeight: 5, currentPrice: 78000,  autoTrade: true, currency: 'KRW' },
  { id: 'kr-gro-2', category: '국내 성장주', name: 'LG에너지솔루션',  code: '373220', ticker: '373220', yahooTicker: '373220.KS', targetWeight: 5, currentPrice: 380000, autoTrade: true, currency: 'KRW' },
  { id: 'kr-gro-3', category: '국내 성장주', name: '삼성바이오로직스', code: '207940', ticker: '207940', yahooTicker: '207940.KS', targetWeight: 5, currentPrice: 900000, autoTrade: true, currency: 'KRW' },
  { id: 'kr-gro-4', category: '국내 성장주', name: 'NAVER',            code: '035420', ticker: '035420', yahooTicker: '035420.KS', targetWeight: 5, currentPrice: 280000, autoTrade: true, currency: 'KRW' },
  { id: 'kr-gro-5', category: '국내 성장주', name: '현대차',           code: '005380', ticker: '005380', yahooTicker: '005380.KS', targetWeight: 5, currentPrice: 270000, autoTrade: true, currency: 'KRW' },
  { id: 'kr-gro-6', category: '국내 성장주', name: '한화에어로스페이스', code: '012450', ticker: '012450', yahooTicker: '012450.KS', targetWeight: 5, currentPrice: 800000, autoTrade: true, currency: 'KRW' },
  { id: 'kr-gro-7', category: '국내 성장주', name: 'POSCO홀딩스',     code: '005490', ticker: '005490', yahooTicker: '005490.KS', targetWeight: 5, currentPrice: 350000, autoTrade: true, currency: 'KRW' },

  // 미국 ETF
  { id: 'us-1', category: '미국 ETF', name: 'Invesco QQQM',  code: '', ticker: 'QQQM', yahooTicker: 'QQQM', targetWeight: 20, currentPrice: 480, autoTrade: true, currency: 'USD' },
  { id: 'us-2', category: '미국 ETF', name: 'Schwab Dividend', code: '', ticker: 'SCHD', yahooTicker: 'SCHD', targetWeight: 20, currentPrice: 85,  autoTrade: true, currency: 'USD' },
  { id: 'us-3', category: '미국 ETF', name: 'SPDR S&P 500',  code: '', ticker: 'SPY',  yahooTicker: 'SPY',  targetWeight: 10, currentPrice: 540, autoTrade: true, currency: 'USD' },
];

const CATEGORY_COLORS = {
  '국내 배당주': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
  '국내 성장주': { bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  badge: 'bg-violet-100 text-violet-700'  },
  '미국 ETF':    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    badge: 'bg-blue-100 text-blue-700'     },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [totalInvestment, setTotalInvestment] = useState(6500000);
  const [exchangeRate, setExchangeRate] = useState(1350);
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const updateItem = (id, field, value) => {
    setPortfolio(portfolio.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const formatKRW = (num) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(Math.round(num));
  const formatUSD = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

  // Yahoo Finance 현재가 + 환율 자동 연동
  // - 개발(로컬): Vite 미들웨어 → 실시간 조회
  // - 프로덕션(GitHub Pages): 빌드 시 생성된 prices.json 읽기
  const fetchPrices = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      let prices, updatedAt;

      if (import.meta.env.PROD) {
        // GitHub Pages: 정적 파일에서 로드 (GitHub Actions가 매일 갱신)
        const res = await fetch(`${import.meta.env.BASE_URL}prices.json?t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        prices = data.prices;
        updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
      } else {
        // 로컬 개발: Vite 미들웨어 → 실시간
        const allSymbols = ['KRW=X', ...portfolio.map(i => i.yahooTicker)].join(',');
        const res = await fetch(`/api/fetch-prices?symbols=${allSymbols}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        prices = data.prices;
        updatedAt = new Date();
      }

      // 환율 업데이트 (KRW=X: 1 USD = X KRW)
      const rawFx = prices['KRW=X'];
      if (rawFx) {
        const rate = rawFx > 100 ? rawFx : Math.round(1 / rawFx);
        setExchangeRate(Math.round(rate));
      }

      // 주가 업데이트
      setPortfolio(prev => prev.map(item => {
        const price = prices[item.yahooTicker];
        return price != null ? { ...item, currentPrice: price } : item;
      }));

      setLastUpdated(updatedAt);
    } catch (e) {
      setFetchError('조회 실패: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatedPortfolio = useMemo(() => {
    return portfolio.map(item => {
      const allocatedKRW = totalInvestment * (item.targetWeight / 100);
      const priceInKRW = item.currency === 'USD' ? item.currentPrice * exchangeRate : item.currentPrice;
      let buyShares = 0;
      let expectedCostKRW = 0;
      if (priceInKRW > 0 && item.autoTrade) {
        buyShares = Math.floor(allocatedKRW / priceInKRW);
        expectedCostKRW = buyShares * priceInKRW;
      }
      return { ...item, allocatedKRW, buyShares, expectedCostKRW };
    });
  }, [portfolio, totalInvestment, exchangeRate]);

  const groupedPortfolio = useMemo(() => {
    const groups = {};
    calculatedPortfolio.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [calculatedPortfolio]);

  const totals = useMemo(() => {
    return calculatedPortfolio.reduce((acc, item) => {
      acc.targetWeight += item.targetWeight;
      if (item.autoTrade) {
        acc.allocatedKRW += item.allocatedKRW;
        acc.expectedCostKRW += item.expectedCostKRW;
      }
      return acc;
    }, { targetWeight: 0, allocatedKRW: 0, expectedCostKRW: 0 });
  }, [calculatedPortfolio]);

  // 카테고리별 비중/금액 요약
  const categorySummary = useMemo(() => {
    const groups = {};
    calculatedPortfolio.forEach(item => {
      if (!groups[item.category]) groups[item.category] = { weight: 0, krw: 0, count: 0 };
      groups[item.category].weight += item.targetWeight;
      groups[item.category].krw += item.allocatedKRW;
      groups[item.category].count++;
    });
    return groups;
  }, [calculatedPortfolio]);

  const renderSummary = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {Object.entries(categorySummary).map(([cat, d]) => {
        const c = CATEGORY_COLORS[cat] ?? { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-700' };
        return (
          <div key={cat} className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
            <p className={`text-xs font-bold ${c.text} mb-1 truncate`}>{cat}</p>
            <p className="text-2xl font-extrabold text-slate-800 leading-tight">{d.weight}%</p>
            <p className="text-sm font-bold text-slate-700 mt-0.5">{formatKRW(d.krw)}</p>
            <p className="text-xs text-slate-400 mt-1">{d.count}종목</p>
          </div>
        );
      })}
      <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold text-slate-500 mb-1">총 합계</p>
        <p className={`text-2xl font-extrabold leading-tight ${totals.targetWeight === 100 ? 'text-slate-800' : 'text-amber-600'}`}>
          {totals.targetWeight}%
        </p>
        <p className="text-sm font-bold text-slate-700 mt-0.5">{formatKRW(totalInvestment)}</p>
        <p className="text-xs text-slate-400 mt-1">{calculatedPortfolio.length}종목</p>
      </div>
    </div>
  );

  const renderPortfolioTab = () => (
    <div className="space-y-8 animate-fade-in">
      {Object.entries(groupedPortfolio).map(([category, items]) => {
        const c = CATEGORY_COLORS[category] ?? { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-600' };
        const categoryWeight = items.reduce((sum, item) => sum + item.targetWeight, 0);
        const categoryKRW = items.reduce((sum, item) => sum + item.allocatedKRW, 0);
        return (
          <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className={`px-6 py-4 border-b border-slate-200 flex justify-between items-center ${c.bg}`}>
              <h2 className="text-lg font-bold text-slate-800">{category}</h2>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.badge}`}>
                  {categoryWeight}%
                </span>
                <span className="text-sm font-semibold text-slate-600">{formatKRW(categoryKRW)}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-white border-b border-slate-200 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">종목명</th>
                    <th className="px-6 py-4 font-semibold">종목번호/티커</th>
                    <th className="px-6 py-4 font-semibold text-right">현재가</th>
                    <th className="px-6 py-4 font-semibold text-right">목표비중 (%)</th>
                    <th className="px-6 py-4 font-semibold text-right">월 할당액</th>
                    <th className="px-6 py-4 font-semibold text-center">자동매매</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className={`border-b last:border-b-0 hover:bg-slate-50 transition-colors ${!item.autoTrade ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-3 font-medium text-slate-900">{item.name}</td>
                      <td className="px-6 py-3 text-slate-400 font-mono text-xs">{item.ticker}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.currency === 'USD'
                            ? <DollarSign size={13} className="text-slate-400" />
                            : <span className="text-slate-400 text-xs">₩</span>}
                          <input
                            type="number"
                            value={item.currentPrice}
                            onChange={(e) => updateItem(item.id, 'currentPrice', Number(e.target.value))}
                            className="w-28 text-right bg-transparent border-b border-blue-300 text-blue-600 font-bold focus:outline-none focus:border-blue-600 p-1"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <input
                          type="number"
                          value={item.targetWeight}
                          onChange={(e) => updateItem(item.id, 'targetWeight', Number(e.target.value))}
                          className="w-16 text-right bg-transparent border-b border-blue-300 text-blue-600 font-bold focus:outline-none focus:border-blue-600 p-1"
                        />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="text-slate-700 font-semibold">{formatKRW(item.allocatedKRW)}</div>
                        <div className="text-xs text-slate-400">{item.targetWeight}% of {formatKRW(totalInvestment)}</div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => updateItem(item.id, 'autoTrade', !item.autoTrade)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                            item.autoTrade ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {item.autoTrade ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
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

  const renderBuyToolTab = () => {
    const activeItems = calculatedPortfolio.filter(i => i.autoTrade && i.buyShares > 0);
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <ShoppingCart className="text-blue-600" />
                이번 달 매수 목록
              </h2>
              <p className="text-blue-700 text-sm mt-1">현재가와 할당 예산(KRW)을 바탕으로 계산된 실제 매수 수량입니다.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 text-right w-full md:w-auto min-w-48">
              <p className="text-xs text-slate-500 mb-1">예상 총 체결 금액</p>
              <p className="text-2xl font-bold text-blue-700">{formatKRW(totals.expectedCostKRW)}</p>
              <p className="text-xs text-slate-400 mt-1">잔여 현금: {formatKRW(totalInvestment - totals.expectedCostKRW)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">종목명</th>
                  <th className="px-6 py-4 font-semibold">티커</th>
                  <th className="px-6 py-4 font-semibold text-right">현재가</th>
                  <th className="px-6 py-4 font-semibold text-right">비중 / 할당액</th>
                  <th className="px-6 py-4 font-semibold text-right text-blue-600">매수 가능 주수</th>
                  <th className="px-6 py-4 font-semibold text-right">예상 체결액</th>
                </tr>
              </thead>
              <tbody>
                {activeItems.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0 hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{item.ticker}</td>
                    <td className="px-6 py-4 text-right text-slate-600 font-medium">
                      {item.currency === 'USD' ? formatUSD(item.currentPrice) : formatKRW(item.currentPrice)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-semibold text-slate-700">{item.targetWeight}%</div>
                      <div className="text-xs text-slate-400">{formatKRW(item.allocatedKRW)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-md text-base">
                        {item.buyShares.toLocaleString()} 주
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-700">
                      {formatKRW(item.expectedCostKRW)}
                    </td>
                  </tr>
                ))}
                {activeItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      매수 가능한 종목이 없습니다. 목표 비중과 현재가를 확인해주세요.
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

  return (
    <div className="min-h-screen bg-slate-100 pb-20 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <PieChart className="text-blue-600" />
              스마트 적립식 투자
            </h1>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* 현재가 자동 업데이트 버튼 */}
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={fetchPrices}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
                >
                  <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                  {isLoading ? '조회 중...' : '현재가 자동 업데이트'}
                </button>
                {lastUpdated && !fetchError && (
                  <span className="text-[10px] text-slate-400">
                    업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
                  </span>
                )}
                {fetchError && (
                  <span className="text-[10px] text-red-500">{fetchError}</span>
                )}
              </div>

              <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>

              {/* 월 투자액 */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">월 투자액</span>
                <input
                  type="number"
                  value={totalInvestment}
                  onChange={(e) => setTotalInvestment(Number(e.target.value))}
                  className="w-32 text-right bg-white border border-blue-200 text-blue-600 font-bold rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-1">
                  <button onClick={() => setTotalInvestment(3000000)} className="text-[10px] bg-white border border-slate-300 rounded px-1.5 py-0.5 hover:bg-slate-100">300만</button>
                  <button onClick={() => setTotalInvestment(6500000)} className="text-[10px] bg-white border border-slate-300 rounded px-1.5 py-0.5 hover:bg-slate-100">650만</button>
                </div>
              </div>

              {/* 환율 */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">환율</span>
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value))}
                  className="w-20 text-right bg-white border border-blue-200 text-blue-600 font-bold rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-400">₩/USD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6">

        {totals.targetWeight !== 100 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-center gap-3 shadow-sm">
            <Settings className="text-amber-500 animate-spin-slow shrink-0" size={20} />
            <p className="text-sm font-medium">
              목표 비중 합계가 <strong>{totals.targetWeight}%</strong>입니다. 가급적 100%에 맞추어 설계해주세요.
            </p>
          </div>
        )}

        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 bg-blue-50/50 p-3 rounded-md border border-blue-100">
          <span className="flex h-3 w-3 rounded-full bg-blue-500 shrink-0"></span>
          파란색 숫자는 탭하여 즉시 수정 가능합니다. 우측 상단 버튼으로 Yahoo Finance 현재가를 자동 반영합니다.
        </div>

        {/* 카테고리별 비중·금액 요약 */}
        {renderSummary()}

        {/* 탭 */}
        <div className="flex space-x-1 mb-6 bg-slate-200/50 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'portfolio' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calculator size={18} />
            포트폴리오 설계
          </button>
          <button
            onClick={() => setActiveTab('buyTool')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'buyTool' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShoppingCart size={18} />
            앱 매수 툴
          </button>
        </div>

        {activeTab === 'portfolio' ? renderPortfolioTab() : renderBuyToolTab()}
      </main>
    </div>
  );
}
