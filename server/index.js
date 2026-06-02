import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import Database from 'better-sqlite3'
import { rateLimit } from 'express-rate-limit'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// bad-words es CJS — lo importamos con createRequire
const require = createRequire(import.meta.url)
const BadWordsFilter = require('bad-words')
const profanity = new BadWordsFilter()

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.DB_PATH ?? join(__dirname, 'flowers.db')
const db = new Database(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS purchases (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_name  TEXT    NOT NULL,
    flower_name TEXT    NOT NULL,
    emoji       TEXT    NOT NULL,
    price       INTEGER NOT NULL,
    bought_at   TEXT    DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  )
`)

// Catálogo canónico de flores — debe coincidir con data.flowers en los locales
const FLOWER_CATALOG = new Map([
  ['Alpine Rose', { emoji: '🌹', price: 12 }],
  ['Blue Iris',   { emoji: '🪻', price: 9  }],
  ['Sunbloom',    { emoji: '🌻', price: 7  }],
  ['Ghost Lily',  { emoji: '🌷', price: 18 }],
])

// Regex: letras unicode, espacios, guiones, apóstrofes, puntos
const VALID_NAME_RE = /^[\p{L}\s'\-.]{2,40}$/u

function validateName(raw) {
  const name = raw?.trim() ?? ''
  if (name.length < 2)             return 'Name must be at least 2 characters.'
  if (name.length > 40)            return 'Name is too long (max 40 characters).'
  if (!VALID_NAME_RE.test(name))   return 'Name can only contain letters, spaces, hyphens and apostrophes.'
  if (profanity.isProfane(name))   return 'Please use an appropriate name.'
  return null
}

const app = express()

// En producción, detrás de nginx. trust proxy hace que express-rate-limit
// use la IP real del visitante (X-Forwarded-For) en lugar de 127.0.0.1.
app.set('trust proxy', 1)

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      connectSrc: ["'self'"],
    },
  },
}))

// En producción (NODE_ENV=production) se requiere ALLOWED_ORIGIN explícito;
// sin él CORS queda deshabilitado (nginx sirve frontend y API en el mismo origen).
// En desarrollo se permite '*' para el proxy de Vite.
const corsOrigin = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGIN ?? false)
  : '*'
app.use(cors({ origin: corsOrigin }))

app.use(express.json())

// Rate limit: máx 5 compras por IP cada 15 minutos
const buyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many purchases. Please wait a few minutes before buying again.' },
})

// Rate limit para consultas: máx 30 por minuto por IP
const queryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment.' },
})

app.get('/api/flowers', queryLimiter, (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM purchases ORDER BY bought_at DESC LIMIT 200')
    .all()
  res.json(rows)
})

app.post('/api/flowers', buyLimiter, (req, res) => {
  const { buyer_name, flower_name, emoji, price } = req.body ?? {}

  const nameError = validateName(buyer_name)
  if (nameError) return res.status(400).json({ error: nameError })

  const catalogEntry = FLOWER_CATALOG.get(flower_name)
  if (!catalogEntry) {
    return res.status(400).json({ error: 'Invalid flower.' })
  }
  if (emoji !== catalogEntry.emoji || Number(price) !== catalogEntry.price) {
    return res.status(400).json({ error: 'Invalid flower data.' })
  }

  const info = db
    .prepare('INSERT INTO purchases (buyer_name, flower_name, emoji, price) VALUES (?, ?, ?, ?)')
    .run(buyer_name.trim(), flower_name, catalogEntry.emoji, catalogEntry.price)

  res.status(201).json({
    id: info.lastInsertRowid,
    buyer_name: buyer_name.trim(),
    flower_name,
    emoji: catalogEntry.emoji,
    price: catalogEntry.price,
    bought_at: new Date().toISOString(),
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Bloom API → http://localhost:${PORT}`))
