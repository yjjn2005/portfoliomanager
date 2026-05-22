import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import YahooFinance from 'yahoo-finance2'

const yf = new YahooFinance()

export default defineConfig({
  // GitHub Actions가 VITE_REPO_BASE=/reponame/ 로 주입 → 로컬은 /
  base: process.env.VITE_REPO_BASE || '/',
  plugins: [
    react(),
    {
      name: 'yahoo-finance-middleware',
      configureServer(server) {
        server.middlewares.use('/api/fetch-prices', async (req, res) => {
          try {
            const url = new URL(req.url, 'http://localhost')
            const symbols = (url.searchParams.get('symbols') || '').split(',').filter(Boolean)

            const raw = await yf.quote(symbols, {}, { validateResult: false })
            const quotes = Array.isArray(raw) ? raw : [raw]

            const prices = {}
            quotes.forEach(q => {
              if (q && q.symbol) prices[q.symbol] = q.regularMarketPrice
            })

            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify({ prices, updatedAt: new Date().toISOString() }))
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      },
    },
  ],
})
