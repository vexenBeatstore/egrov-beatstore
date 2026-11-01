PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY, login TEXT UNIQUE COLLATE NOCASE, password_hash TEXT,
 telegram_id TEXT UNIQUE, telegram_username TEXT, role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
 created_at TEXT NOT NULL DEFAULT (datetime('now')), disabled_at TEXT
);
CREATE TABLE IF NOT EXISTS sessions (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS beats (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, genre TEXT, bpm INTEGER CHECK(bpm BETWEEN 1 AND 400), key TEXT,
 duration_seconds INTEGER, preview_path TEXT, cover_path TEXT, published INTEGER NOT NULL DEFAULT 0,
 archived_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_beats_published_created ON beats(published,created_at DESC);
CREATE TABLE IF NOT EXISTS licenses (
 id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, price INTEGER NOT NULL CHECK(price>=0),
 description TEXT, formats_json TEXT NOT NULL DEFAULT '[]', commercial_rights TEXT, restrictions TEXT,
 extra_terms TEXT, archived_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS beat_files (
 id TEXT PRIMARY KEY, beat_id TEXT NOT NULL REFERENCES beats(id), license_id TEXT NOT NULL REFERENCES licenses(id),
 file_kind TEXT NOT NULL CHECK(file_kind IN ('mp3','wav','stems')), storage_path TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_beat_files_lookup ON beat_files(beat_id,license_id,active);
CREATE TABLE IF NOT EXISTS orders (
 id TEXT PRIMARY KEY, order_number TEXT UNIQUE NOT NULL, user_id TEXT NOT NULL REFERENCES users(id),
 total_amount INTEGER NOT NULL CHECK(total_amount>=0), status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','cancelled')),
 payment_instructions TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), paid_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS order_items (
 id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), beat_id TEXT REFERENCES beats(id),
 license_id TEXT REFERENCES licenses(id), beat_title_snapshot TEXT NOT NULL, license_snapshot_json TEXT NOT NULL,
 unit_price INTEGER NOT NULL CHECK(unit_price>=0)
);
CREATE TABLE IF NOT EXISTS purchases (
 id TEXT PRIMARY KEY, order_item_id TEXT UNIQUE NOT NULL REFERENCES order_items(id),
 user_id TEXT NOT NULL REFERENCES users(id), beat_id TEXT REFERENCES beats(id),
 license_id TEXT REFERENCES licenses(id), created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_purchases_owner ON purchases(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value_json TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS admin_logs (
 id TEXT PRIMARY KEY, admin_user_id TEXT REFERENCES users(id), action TEXT NOT NULL, object_type TEXT, object_id TEXT,
 result TEXT NOT NULL, details_json TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
