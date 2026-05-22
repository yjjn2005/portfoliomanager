import YahooFinance from 'yahoo-finance2'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '../public/prices.json')

const symbols = [
  'KRW=X',
  // 국내 성장주 (섹터별 코어 + 전자부품·자동차)
  '005930.KS', // 삼성전자 — 반도체
  '454910.KS', // 두산로보틱스 — 로봇
  '373220.KS', // LG에너지솔루션 — 2차전지
  '207940.KS', // 삼성바이오로직스 — 바이오
  '267260.KS', // HD현대일렉트릭 — 전력
  '012450.KS', // 한화에어로스페이스 — 방산
  '009540.KS', // HD한국조선해양 — 조선
  '034020.KS', // 두산에너빌리티 — 원자력
  '009150.KS', // 삼성전기 — 전자부품
  '011070.KS', // LG이노텍 — 전자부품
  '012330.KS', // 현대모비스 — 자동차
  // 미국 ETF
  'QQQM', 'SCHD', 'SPY',
]

const yf = new YahooFinance()

try {
  const raw = await yf.quote(symbols, {}, { validateResult: false })
  const quotes = Array.isArray(raw) ? raw : [raw]

  const prices = {}
  quotes.forEach(q => {
    if (q && q.symbol && q.regularMarketPrice != null)
      prices[q.symbol] = q.regularMarketPrice
  })

  const output = { prices, updatedAt: new Date().toISOString() }
  writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`✓ ${Object.keys(prices).length}개 종목 가격 업데이트`)
  console.log(`  환율: 1 USD = ${prices['KRW=X']} KRW`)
} catch (e) {
  console.error('가격 조회 실패 (캐시 유지):', e.message)
}
