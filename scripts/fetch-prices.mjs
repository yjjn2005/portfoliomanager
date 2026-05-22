import YahooFinance from 'yahoo-finance2'
import { writeFileSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '../public/prices.json')

const symbols = [
  'KRW=X',
  '017670.KS', '033780.KS', '088980.KS',
  '005930.KS', '373220.KS', '207940.KS', '035420.KS',
  '005380.KS', '012450.KS', '005490.KS',
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
  // 빌드는 계속 진행 — 기존 prices.json 유지
}
