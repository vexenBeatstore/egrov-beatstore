PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS beats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT 'VEXEN',
  genre TEXT NOT NULL DEFAULT 'Trap',
  bpm INTEGER NOT NULL DEFAULT 140,
  musical_key TEXT NOT NULL DEFAULT 'Am',
  description TEXT NOT NULL DEFAULT '',
  cover_key TEXT,
  demo_key TEXT,
  mp3_key TEXT,
  wav_key TEXT,
  stems_key TEXT,
  mp3_price INTEGER NOT NULL DEFAULT 500,
  wav_price INTEGER NOT NULL DEFAULT 1000,
  stems_price INTEGER NOT NULL DEFAULT 2000,
  discount INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_code TEXT NOT NULL UNIQUE,
  access_token_hash TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_telegram TEXT NOT NULL DEFAULT '',
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  receipt_key TEXT,
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at TEXT,
  delivered_at TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  beat_id INTEGER NOT NULL,
  beat_title TEXT NOT NULL,
  license TEXT NOT NULL CHECK (license IN ('mp3','wav','stems')),
  price INTEGER NOT NULL,
  file_key TEXT,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(beat_id) REFERENCES beats(id)
);

CREATE INDEX IF NOT EXISTS idx_beats_active ON beats(active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
