
const json = (data, status = 200, extraHeaders = {}) => {
  const headers = new Headers({"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});
  for (const [key, value] of Object.entries(extraHeaders || {})) {
    if (key.toLowerCase() === "set-cookie" && Array.isArray(value)) value.forEach(v => headers.append("Set-Cookie", v));
    else headers.set(key, value);
  }
  return new Response(JSON.stringify(data), { status, headers });
};

const fail = (message, status = 400) => json({ error: message }, status);
const enc = new TextEncoder();

const b64url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const unb64url = (s) =>
  Uint8Array.from(
    atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)),
    (c) => c.charCodeAt(0)
  );

async function sha256(text) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", enc.encode(text))
  );
}

async function hmac(secret, text) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, enc.encode(text))
  );
}

function randomToken() {
  const a = new Uint8Array(32);
  crypto.getRandomValues(a);
  return b64url(a);
}

function cookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  const match = raw
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(name + "="));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

async function makeSession(env, telegramUser) {
  const payload = b64url(
    enc.encode(
      JSON.stringify({
        id: String(telegramUser.id),
        name: telegramUser.first_name || "Admin",
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      })
    )
  );

  return payload + "." + b64url(await hmac(env.SESSION_SECRET, payload));
}

async function readSession(request, env) {
  try {
    if (!env.SESSION_SECRET || !env.ADMIN_TELEGRAM_ID) return null;

    const token = cookie(request, "vexen_admin") || cookie(request, "vexen_user");
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;

    const expected = b64url(await hmac(env.SESSION_SECRET, payload));
    if (expected !== sig) return null;

    const obj = JSON.parse(
      new TextDecoder().decode(unb64url(payload))
    );

    if (
      obj.exp < Date.now() / 1000 ||
      obj.id !== String(env.ADMIN_TELEGRAM_ID)
    ) {
      return null;
    }

    return obj;
  } catch {
    return null;
  }
}

async function readUserSession(request, env) {
  try {
    if (!env.SESSION_SECRET) return null;
    const token = cookie(request, "vexen_user");
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = b64url(await hmac(env.SESSION_SECRET, payload));
    if (expected !== sig) return null;
    const obj = JSON.parse(new TextDecoder().decode(unb64url(payload)));
    if (obj.exp < Date.now() / 1000 || !obj.id) return null;
    return obj;
  } catch { return null; }
}

async function adminRequired(request, env) {
  return readSession(request, env);
}

/* ---------------- SUPABASE STORAGE ---------------- */

function supabaseConfig(env) {
  // SUPABASE_URL must be the project root, not /rest/v1 or /storage/v1.
  // Normalize common pasted endpoint suffixes to prevent malformed Storage URLs.
  const base = String(env.SUPABASE_URL || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/(?:rest\/v1|storage\/v1|auth\/v1)$/i, "");
  const secret = String(env.SUPABASE_SECRET_KEY || "").trim();

  if (!base || !secret) {
    throw new Error("Не настроены SUPABASE_URL или SUPABASE_SECRET_KEY.");
  }

  return { base, secret };
}

function bucketForKey(key) {
  // EGROV BeatStore uses one Supabase Storage bucket named "egrov".
  // Keep covers, demos and masters separated by folders inside that bucket.
  if (key.startsWith("covers/") || key.startsWith("demos/") || key.startsWith("masters/")) {
    return "egrov";
  }
  throw new Error("Недопустимый путь к файлу.");
}

function storageObjectUrl(base, bucket, key) {
  const safePath = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${base}/storage/v1/object/${bucket}/${safePath}`;
}

async function storageUpload(file, env, prefix) {
  if (!file || typeof file === "string" || !file.size) return null;

  // Ограничение бесплатного тарифа Supabase — до 50 МБ на файл.
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("Файл превышает лимит 50 МБ. Уменьши его размер.");
  }

  const { base, secret } = supabaseConfig(env);

  const safe = (file.name || "file")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-100);

  const key = `${prefix}/${crypto.randomUUID()}-${safe}`;
  const bucket = bucketForKey(key);

  const response = await fetch(
    storageObjectUrl(base, bucket, key),
    {
      method: "POST",
      headers: {
        apikey: secret,
        Authorization: `Bearer ${secret}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false",
      },
      body: await file.arrayBuffer(),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    console.error("Supabase upload error:", response.status, details);

    const safeDetails = String(details || "")
      .replace(/sb_secret_[A-Za-z0-9_-]+/g, "[redacted]")
      .slice(0, 500);

    throw new Error(
      response.status === 413
        ? "Файл слишком большой для Supabase."
        : `Supabase не смог загрузить файл (HTTP ${response.status}). ${safeDetails || "Проверь существование bucket и настройки хранилища."}`
    );
  }

  return key;
}

async function storageGet(key, env) {
  if (!key) return null;

  const { base, secret } = supabaseConfig(env);
  const bucket = bucketForKey(key);

  const response = await fetch(
    storageObjectUrl(base, bucket, key),
    {
      method: "GET",
      headers: {
        apikey: secret,
        Authorization: `Bearer ${secret}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) return null;

    const details = await response.text();
    console.error("Supabase download error:", response.status, details);
    throw new Error(`Ошибка чтения файла из Supabase: HTTP ${response.status}`);
  }

  return response;
}

/* ---------------- BEATS AND LICENSES ---------------- */

function licenseInfo(beat, license) {
  const map = {
    mp3: ["MP3", beat.mp3_price, beat.mp3_key],
    wav: ["WAV", beat.wav_price, beat.wav_key],
    stems: ["WAV + Stems", beat.stems_price, beat.stems_key],
  };
  const x = map[license];
  // A paid license is only offered when its actual master file is attached.
  if (!x || Number(x[1]) <= 0 || !x[2]) return null;
  return {
    label: x[0],
    price: Math.max(0, Math.round(Number(x[1]) || 0)),
    file_key: x[2],
  };
}

async function handle(request, env) {
  // Safe additive order-delivery migration; existing orders and statuses are preserved.
  try { await env.DB.prepare("ALTER TABLE orders ADD COLUMN delivery_method TEXT NOT NULL DEFAULT 'site'").run(); } catch (_) {}
  try { await env.DB.prepare("ALTER TABLE orders ADD COLUMN telegram_chat_id TEXT NOT NULL DEFAULT ''").run(); } catch (_) {}

  if (!env.DB) {
    return fail("Не настроена привязка D1 в Cloudflare.", 500);
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, "");

  const method = request.method;
  // Content tables are created idempotently so existing D1 installations upgrade automatically.
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS site_content (id INTEGER PRIMARY KEY CHECK (id = 1), licenses_description TEXT NOT NULL DEFAULT 'Выбери лицензию под свой релиз: MP3 — для быстрого старта, WAV — для высокого качества, STEMS — для гибкой работы со сведением.', services_description TEXT NOT NULL DEFAULT 'Помогаю подобрать звук и подготовить материал к релизу.')").run();
  await env.DB.prepare("INSERT OR IGNORE INTO site_content (id) VALUES (1)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS services (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  // Safe additive migrations for service pricing/covers and per-license content.
  for (const sql of [
    "ALTER TABLE services ADD COLUMN price INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE services ADD COLUMN cover_key TEXT NOT NULL DEFAULT ''"
  ]) { try { await env.DB.prepare(sql).run(); } catch (_) {} }
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS license_content (license TEXT PRIMARY KEY, description TEXT NOT NULL DEFAULT '', terms TEXT NOT NULL DEFAULT '', cover_key TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  for (const license of ['mp3','wav','stems']) await env.DB.prepare("INSERT OR IGNORE INTO license_content (license) VALUES (?)").bind(license).run();

  if (path === "content" && method === "GET") {
    const { results: rows = [] } = await env.DB.prepare("SELECT * FROM site_content WHERE id=1").all();
    const { results: services = [] } = await env.DB.prepare("SELECT id,title,description,price,cover_key,active FROM services WHERE active=1 ORDER BY id DESC").all();
    const { results: licenses = [] } = await env.DB.prepare("SELECT license,description,terms,cover_key FROM license_content").all();
    return json({ content: rows[0] || {}, services, licenses });
  }

  if (path.startsWith("admin/content")) {
    const session = await readUserSession(request, env);
    if (!session || !env.ADMIN_TELEGRAM_ID || String(session.id) !== String(env.ADMIN_TELEGRAM_ID)) return fail("Доступ запрещён.", 403);
    if (path === "admin/content" && method === "PUT") {
      const data = await request.json();
      await env.DB.prepare("UPDATE site_content SET licenses_description=?, services_description=? WHERE id=1")
        .bind(String(data.licenses_description || "").slice(0,10000), String(data.services_description || "").slice(0,10000)).run();
      return json({ok:true});
    }
    if (path === "admin/content/licenses" && method === "PUT") {
      const data = await request.json(), license=String(data.license||'');
      if (!['mp3','wav','stems'].includes(license)) return fail('Неизвестная лицензия.');
      await env.DB.prepare("INSERT INTO license_content (license,description,terms,cover_key,updated_at) VALUES (?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(license) DO UPDATE SET description=excluded.description,terms=excluded.terms,cover_key=excluded.cover_key,updated_at=CURRENT_TIMESTAMP").bind(license,String(data.description||'').slice(0,5000),String(data.terms||'').slice(0,10000),String(data.cover_key||'').slice(0,500)).run();
      return json({ok:true});
    }
    if (path === "admin/content/services" && method === "POST") {
      const data = await request.json(), title = String(data.title || "").trim();
      if (!title) return fail("Укажи название услуги.");
      await env.DB.prepare("INSERT INTO services (title,description,price,cover_key,active) VALUES (?,?,?,?,?)").bind(title.slice(0,200),String(data.description || "").slice(0,5000),Math.max(0,Math.round(Number(data.price)||0)),String(data.cover_key||'').slice(0,500),data.active===false?0:1).run();
      return json({ok:true});
    }
    const match = path.match(/^admin\/content\/services\/(\d+)$/);
    if (match && method === "PUT") {
      const data = await request.json(), title = String(data.title || "").trim();
      if (!title) return fail("Укажи название услуги.");
      await env.DB.prepare("UPDATE services SET title=?,description=?,price=?,cover_key=?,active=? WHERE id=?").bind(title.slice(0,200),String(data.description || "").slice(0,5000),Math.max(0,Math.round(Number(data.price)||0)),String(data.cover_key||'').slice(0,500),data.active===false?0:1,Number(match[1])).run();
      return json({ok:true});
    }
    if (match && method === "DELETE") {
      await env.DB.prepare("DELETE FROM services WHERE id=?").bind(Number(match[1])).run();
      return json({ok:true});
    }
  }


  if (path === "health" && method === "GET") {
    return json({
      ok: true,
      service: "EGROV BeatStore API",
      supabase_url_configured: Boolean(String(env.SUPABASE_URL || "").trim()),
      supabase_secret_configured: Boolean(String(env.SUPABASE_SECRET_KEY || "").trim()),
      d1_configured: Boolean(env.DB),
    });
  }

  if (path === "config" && method === "GET") {
    return json({
      bot_username: String(
        env.TELEGRAM_BOT_USERNAME || "EGROVBeatStoreBot"
      ).replace(/^@/, ""),
    });
  }

  /* ---------------- TELEGRAM ADMIN AUTH ---------------- */

  if (path === "auth/telegram" && method === "POST") {
    let data;

    try {
      data = await request.json();
    } catch {
      return fail("Некорректный JSON");
    }

    if (!env.BOT_TOKEN || !env.SESSION_SECRET) {
      return fail("Секреты авторизации не настроены в Cloudflare.", 500);
    }

    const id = String(data.id || "");
    if (!/^\d+$/.test(id)) return fail("Некорректный Telegram ID.", 401);
    const isAdmin = Boolean(env.ADMIN_TELEGRAM_ID) && id === String(env.ADMIN_TELEGRAM_ID);

    const authDate = Number(data.auth_date || 0);

    if (
      !authDate ||
      Math.abs(Date.now() / 1000 - authDate) > 300
    ) {
      return fail("Данные Telegram устарели. Войдите ещё раз.", 401);
    }

    const receivedHash = String(data.hash || "");

    const check = Object.keys(data)
      .filter(
        (k) => k !== "hash" && data[k] !== undefined && data[k] !== null
      )
      .sort()
      .map((k) => `${k}=${data[k]}`)
      .join("\n");

    const secret = await sha256(env.BOT_TOKEN);

    const key = await crypto.subtle.importKey(
      "raw",
      secret,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const digest = new Uint8Array(
      await crypto.subtle.sign("HMAC", key, enc.encode(check))
    );

    const expected = Array.from(digest, (b) =>
      b.toString(16).padStart(2, "0")
    ).join("");

    let diff = expected.length ^ receivedHash.length;

    for (
      let i = 0;
      i < Math.max(expected.length, receivedHash.length);
      i++
    ) {
      diff |=
        (expected.charCodeAt(i) || 0) ^
        (receivedHash.charCodeAt(i) || 0);
    }

    if (diff !== 0) {
      return fail("Не удалось проверить подпись Telegram.", 401);
    }

    const token = await makeSession(env, {
      id,
      first_name: data.first_name || data.username || "Пользователь",
    });
    const secure = url.protocol === "https:" ? "Secure; " : "";
    const setCookies = [
      `vexen_user=${encodeURIComponent(token)}; HttpOnly; ${secure}SameSite=Lax; Path=/; Max-Age=604800`,
      isAdmin
        ? `vexen_admin=${encodeURIComponent(token)}; HttpOnly; ${secure}SameSite=Lax; Path=/; Max-Age=604800`
        : `vexen_admin=; HttpOnly; ${secure}SameSite=Lax; Path=/; Max-Age=0`
    ];
    return json({ ok: true, name: data.first_name || data.username || "Пользователь", is_admin: isAdmin }, 200, { "Set-Cookie": setCookies });
  }

  if (path === "auth/me" && method === "GET") {
    const session = await readUserSession(request, env);
    if (!session) return json({ authenticated: false }, 401);
    return json({ authenticated: true, name: session.name, telegram_id: session.id, is_admin: Boolean(env.ADMIN_TELEGRAM_ID) && session.id === String(env.ADMIN_TELEGRAM_ID) });
  }

  if (path === "auth/logout" && method === "POST") {
    return json(
      { ok: true },
      200,
      {
        "Set-Cookie": [
          `vexen_user=; HttpOnly; ${url.protocol === "https:" ? "Secure; " : ""}SameSite=Lax; Path=/; Max-Age=0`,
          `vexen_admin=; HttpOnly; ${url.protocol === "https:" ? "Secure; " : ""}SameSite=Lax; Path=/; Max-Age=0`
        ],
      }
    );
  }

  /* ---------------- USER FAVORITES ---------------- */

  if (path === "favorites" && method === "GET") {
    const session = await readUserSession(request, env);
    if (!session) return fail("Войди через Telegram, чтобы пользоваться избранным на всех устройствах.", 401);
    const { results = [] } = await env.DB.prepare(
      `SELECT b.* FROM user_favorites f JOIN beats b ON b.id=f.beat_id
       WHERE f.telegram_id=? AND b.active=1 ORDER BY f.created_at DESC`
    ).bind(String(session.id)).all();
    return json({ beats: results.map((beat) => ({ ...beat, has_mp3: Boolean(beat.mp3_key), has_wav: Boolean(beat.wav_key), has_stems: Boolean(beat.stems_key) })) });
  }

  if (path === "favorites" && method === "POST") {
    const session = await readUserSession(request, env);
    if (!session) return fail("Войди через Telegram, чтобы сохранять избранное.", 401);
    let data; try { data = await request.json(); } catch { return fail("Некорректный JSON"); }
    const beatId = Number(data.beat_id);
    if (!Number.isInteger(beatId) || beatId < 1) return fail("Некорректный бит.");
    const beat = await env.DB.prepare("SELECT id FROM beats WHERE id=? AND active=1").bind(beatId).first();
    if (!beat) return fail("Бит не найден.", 404);
    await env.DB.prepare("INSERT OR IGNORE INTO user_favorites (telegram_id, beat_id) VALUES (?, ?)").bind(String(session.id), beatId).run();
    return json({ ok: true, beat_id: beatId });
  }

  const favoriteMatch = path.match(/^favorites\/(\d+)$/);
  if (favoriteMatch && method === "DELETE") {
    const session = await readUserSession(request, env);
    if (!session) return fail("Войди через Telegram, чтобы изменять избранное.", 401);
    await env.DB.prepare("DELETE FROM user_favorites WHERE telegram_id=? AND beat_id=?").bind(String(session.id), Number(favoriteMatch[1])).run();
    return json({ ok: true, beat_id: Number(favoriteMatch[1]) });
  }

  /* ---------------- PUBLIC MEDIA ---------------- */

  if (path === "media" && method === "GET") {
    const key = url.searchParams.get("key") || "";

    if (
      !(key.startsWith("covers/") || key.startsWith("demos/"))
    ) {
      return fail("Медиа не найдено.", 404);
    }

    const obj = await storageGet(key, env);

    if (!obj) return fail("Медиа не найдено.", 404);

    const headers = new Headers({
      "Content-Type":
        obj.headers.get("Content-Type") || "application/octet-stream",
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    });

    return new Response(obj.body, { headers });
  }

  /* ---------------- PUBLIC PLAYLISTS ---------------- */
  if (path === "playlists" && method === "GET") {
    const { results = [] } = await env.DB.prepare("SELECT id,title,genre,cover_key,description,created_at FROM playlists WHERE active=1 ORDER BY id DESC").all();
    const playlists = [];
    for (const playlist of results) {
      const { results: beatRows = [] } = await env.DB.prepare(`SELECT b.id,b.title,b.artist,b.genre,b.bpm,b.musical_key,b.description,b.cover_key,b.demo_key,b.mp3_price,b.wav_price,b.stems_price FROM playlist_beats pb JOIN beats b ON b.id=pb.beat_id WHERE pb.playlist_id=? AND b.active=1 ORDER BY pb.position ASC, b.id DESC`).bind(playlist.id).all();
      playlists.push({...playlist, beats: beatRows});
    }
    return json({playlists});
  }

  /* ---------------- CATALOG ---------------- */

  if (path === "catalog" && method === "GET") {
    const { results = [] } = await env.DB.prepare(
      `SELECT id,title,artist,genre,bpm,musical_key,description,created_at,
       cover_key,demo_key,mp3_price,wav_price,stems_price,discount,
       mp3_key,wav_key,stems_key
       FROM beats WHERE active=1 ORDER BY id DESC`
    ).all();

    return json({
      beats: results.map((beat) => {
        const licenses = ["mp3", "wav", "stems"]
          .map((k) => {
            const info = licenseInfo(beat, k);

            return info
              ? { id: k, label: info.label, price: info.price }
              : null;
          })
          .filter(Boolean);

        const {
          mp3_key,
          wav_key,
          stems_key,
          ...publicBeat
        } = beat;

        return {
          ...publicBeat,
          has_mp3: Number(beat.mp3_price) > 0 && Boolean(beat.mp3_key),
          has_wav: Number(beat.wav_price) > 0 && Boolean(beat.wav_key),
          has_stems: Number(beat.stems_price) > 0 && Boolean(beat.stems_key),
          licenses,
        };
      }),
    });
  }

  /* ---------------- CREATE ORDER ---------------- */

  if (path === "orders" && method === "POST") {
    let data;

    try {
      data = await request.json();
    } catch {
      return fail("Некорректный запрос");
    }

    const name = String(data.customer_name || "").trim().slice(0, 100);
    const deliveryMethod = data.delivery_method === "telegram" ? "telegram" : "site";
    const telegram = String(data.customer_telegram || "").trim().slice(0, 80);
    const items = Array.isArray(data.items) ? data.items : [];

    if (name.length < 2 || !items.length || items.length > 20) {
      return fail("Укажите имя и добавьте в корзину хотя бы один бит.");
    }
    if (deliveryMethod === "telegram" && !/^@[A-Za-z0-9_]{5,32}$/.test(telegram)) {
      return fail("Для выдачи в Telegram укажи корректный username в формате @username.");
    }
    if (deliveryMethod === "site") { /* Telegram is optional for website delivery. */ }

    const resolved = [];
    let total = 0;

    for (const item of items) {
      const beat = await env.DB.prepare(
        "SELECT * FROM beats WHERE id=? AND active=1"
      )
        .bind(Number(item.beat_id))
        .first();

      if (!beat) {
        return fail("Один из битов больше недоступен.");
      }

      const license = String(item.license);
      const info = licenseInfo(beat, license);

      if (!info) {
        return fail(`Лицензия ${license} для «${beat.title}» недоступна.`);
      }

      resolved.push({ beat, license, ...info });
      total += info.price;
    }

    const token = randomToken();

    const tokenHash = Array.from(
      await sha256(token),
      (b) => b.toString(16).padStart(2, "0")
    ).join("");

    const code = "VX-" + crypto.randomUUID().slice(0, 8).toUpperCase();

    const result = await env.DB.prepare(
      `INSERT INTO orders
       (public_code,access_token_hash,customer_name,customer_telegram,total_amount,status,delivery_method)
       VALUES (?,?,?,?,?,'pending',?)`
    )
      .bind(code, tokenHash, name, deliveryMethod === "telegram" ? telegram : "", total, deliveryMethod)
      .run();

    const orderId = result.meta.last_row_id;

    for (const item of resolved) {
      await env.DB.prepare(
        `INSERT INTO order_items
         (order_id,beat_id,beat_title,license,price,file_key)
         VALUES (?,?,?,?,?,?)`
      )
        .bind(
          orderId,
          item.beat.id,
          item.beat.title,
          item.license,
          item.price,
          item.file_key
        )
        .run();
    }

    return json({
      ok: true,
      order_id: orderId,
      code,
      access_token: token,
      total,
      bank_details: env.BANK_DETAILS || "2204321100976943\nБанк: Ozon Банк\nПолучатель: Ярослав",
      recipient: env.PAYMENT_RECIPIENT || "Ярослав",
      status: "pending",
      delivery_method: deliveryMethod,
    });
  }

  /* ---------------- ORDER LOOKUP ---------------- */

  if (path === "orders/lookup" && method === "POST") {
    let data;

    try {
      data = await request.json();
    } catch {
      return fail("Некорректный запрос");
    }

    const token = String(data.access_token || "");

    if (token.length < 20) {
      return fail("Не найден заказ.", 404);
    }

    const hash = Array.from(
      await sha256(token),
      (b) => b.toString(16).padStart(2, "0")
    ).join("");

    const order = await env.DB.prepare(
      `SELECT id,public_code,customer_name,customer_telegram,total_amount,status,
       created_at,paid_at,delivered_at
       FROM orders WHERE access_token_hash=?`
    )
      .bind(hash)
      .first();

    if (!order) return fail("Заказ не найден.", 404);

    const { results = [] } = await env.DB.prepare(
      "SELECT id,beat_title,license,price,file_key FROM order_items WHERE order_id=? ORDER BY id"
    ).bind(order.id).all();

    const downloads = ["paid", "delivered"].includes(order.status)
      ? results.filter(item => item.file_key).map(item => ({
          item_id: item.id,
          beat_title: item.beat_title,
          license: item.license,
          url: `/api/download/${order.id}/${item.id}?token=${encodeURIComponent(token)}`,
        }))
      : [];
    return json({ order, items: results.map(({ file_key, ...item }) => item), downloads });
  }

  /* ---------------- SECURE FILE DOWNLOAD ---------------- */

  const downloadMatch = path.match(/^download\/(\d+)\/(\d+)$/);

  if (downloadMatch && method === "GET") {
    const orderId = Number(downloadMatch[1]);
    const itemId = Number(downloadMatch[2]);
    const token = url.searchParams.get("token") || "";

    const hash = Array.from(
      await sha256(token),
      (b) => b.toString(16).padStart(2, "0")
    ).join("");

    const row = await env.DB.prepare(
      `SELECT o.status,o.access_token_hash,
       i.file_key,i.beat_title,i.license
       FROM orders o
       JOIN order_items i ON i.order_id=o.id
       WHERE o.id=? AND i.id=?`
    )
      .bind(orderId, itemId)
      .first();

    if (
      !row ||
      row.access_token_hash !== hash ||
      !["paid", "delivered"].includes(row.status)
    ) {
      return fail("Файл пока недоступен.", 403);
    }

    if (!row.file_key) {
      return fail("У этого товара не прикреплён файл.", 404);
    }

    const obj = await storageGet(row.file_key, env);

    if (!obj) return fail("Файл не найден в хранилище.", 404);

    const extension = row.license === "wav" ? ".wav" : row.license === "stems" ? ".zip" : ".mp3";
    const safeName = `${row.beat_title}-${row.license}`
      .replace(/[\\/"\r\n]/g, "_")
      .slice(0, 150);

    return new Response(obj.body, {
      headers: {
        "Content-Type": row.license === "wav" ? "audio/wav" : row.license === "stems" ? "application/zip" : (obj.headers.get("Content-Type") || "audio/mpeg"),
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(safeName + extension)}`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  /* ---------------- ADMIN ---------------- */

  const session = await adminRequired(request, env);

  if (path.startsWith("admin/") && !session) {
    return fail("Требуется вход администратора через Telegram.", 401);
  }

  if (path === "admin/playlists" && method === "GET") {
    const { results = [] } = await env.DB.prepare("SELECT * FROM playlists ORDER BY id DESC").all();
    const playlists=[];
    for (const playlist of results) {
      const {results: rows=[]}=await env.DB.prepare("SELECT beat_id FROM playlist_beats WHERE playlist_id=? ORDER BY position ASC").bind(playlist.id).all();
      playlists.push({...playlist, beat_ids: rows.map(r=>r.beat_id)});
    }
    return json({playlists});
  }
  if (path === "admin/playlists" && method === "POST") {
    let data; try { data=await request.json(); } catch { return fail("Некорректные данные плейлиста."); }
    const title=String(data.title||"").trim(), genre=String(data.genre||"").trim(), description=String(data.description||"").trim(), cover_key=String(data.cover_key||"").trim();
    const beatIds=[...new Set((Array.isArray(data.beat_ids)?data.beat_ids:[]).map(Number).filter(Number.isInteger))];
    if(!title) return fail("Укажи название плейлиста.");
    if(!beatIds.length) return fail("Выбери хотя бы один бит из каталога.");
    const placeholders=beatIds.map(()=>"?").join(",");
    const {results: valid=[]}=await env.DB.prepare(`SELECT id FROM beats WHERE active=1 AND id IN (${placeholders})`).bind(...beatIds).all();
    if(valid.length!==beatIds.length) return fail("Некоторые выбранные биты недоступны.");
    const ins=await env.DB.prepare("INSERT INTO playlists (title,genre,cover_key,description,active) VALUES (?,?,?,?,1)").bind(title,genre,cover_key,description).run();
    const id=ins.meta?.last_row_id;
    if(!id) return fail("Не удалось создать плейлист.",500);
    for(let i=0;i<beatIds.length;i++) await env.DB.prepare("INSERT INTO playlist_beats (playlist_id,beat_id,position) VALUES (?,?,?)").bind(id,beatIds[i],i).run();
    return json({ok:true,id});
  }
  const playlistEdit=path.match(/^admin\/playlists\/(\d+)$/);
  if(playlistEdit && method==="PUT") {
    let data; try { data=await request.json(); } catch { return fail("Некорректные данные плейлиста."); }
    const id=Number(playlistEdit[1]), title=String(data.title||"").trim(), genre=String(data.genre||"").trim(), description=String(data.description||"").trim(), cover_key=String(data.cover_key||"").trim();
    const beatIds=[...new Set((Array.isArray(data.beat_ids)?data.beat_ids:[]).map(Number).filter(Number.isInteger))];
    if(!title) return fail("Укажи название плейлиста.");
    if(!beatIds.length) return fail("Выбери хотя бы один бит из каталога.");
    const placeholders=beatIds.map(()=>"?").join(",");
    const {results: valid=[]}=await env.DB.prepare(`SELECT id FROM beats WHERE active=1 AND id IN (${placeholders})`).bind(...beatIds).all();
    if(valid.length!==beatIds.length) return fail("Некоторые выбранные биты недоступны.");
    await env.DB.prepare("UPDATE playlists SET title=?,genre=?,description=?,cover_key=? WHERE id=?").bind(title,genre,description,cover_key,id).run();
    await env.DB.prepare("DELETE FROM playlist_beats WHERE playlist_id=?").bind(id).run();
    for(let i=0;i<beatIds.length;i++) await env.DB.prepare("INSERT INTO playlist_beats (playlist_id,beat_id,position) VALUES (?,?,?)").bind(id,beatIds[i],i).run();
    return json({ok:true,id});
  }
  const playlistDelete=path.match(/^admin\/playlists\/(\d+)$/);
  if(playlistDelete && method==="DELETE") {
    const id=Number(playlistDelete[1]);
    await env.DB.prepare("DELETE FROM playlists WHERE id=?").bind(id).run();
    return json({ok:true});
  }

  if (path === "admin/beats" && method === "GET") {
    const { results = [] } = await env.DB.prepare(
      "SELECT * FROM beats ORDER BY id DESC"
    ).all();

    return json({ beats: results });
  }

  
  /* ---------------- UPLOAD ONE FILE ---------------- */

  if (path === "admin/upload" && method === "POST") {
    let form;

    try {
      form = await request.formData();
    } catch {
      return fail("Не удалось прочитать файл.");
    }

    const file = form.get("file");
    const type = String(form.get("type") || "");

    const allowed = { cover: "covers", demo: "demos", mp3: "masters", wav: "masters", stems: "masters" };
    if (!allowed[type]) return fail("Неизвестный тип файла.");
    if (!file || typeof file === "string" || !file.size) return fail("Файл не выбран.");
    const filename = String(file.name || "").toLowerCase();
    if (type === "mp3" && !filename.endsWith(".mp3")) return fail("Для лицензии MP3 загрузи файл с расширением .mp3.");
    if (type === "wav" && !filename.endsWith(".wav")) return fail("Для лицензии WAV загрузи файл с расширением .wav.");
    if (type === "stems" && !filename.endsWith(".zip")) return fail("Для STEMS загрузи ZIP-архив с дорожками.");

    try {
      const key = await storageUpload(file, env, allowed[type]);
      return json({ ok: true, key });
    } catch (error) {
      console.error("Single file upload error:", error);
      return fail(error.message || "Не удалось загрузить файл.");
    }
  }

  /* ---------------- ADD BEAT ---------------- */

  if (path === "admin/beats" && method === "POST") {
    let data;

    try {
      data = await request.json();
    } catch {
      return fail("Некорректные данные бита.");
    }

    const title = String(data.title || "").trim();

    if (!title) {
      return fail("Название бита обязательно.");
    }

    const prices = {
      mp3: Math.max(0, Math.round(Number(data.mp3_price) || 0)),
      wav: Math.max(0, Math.round(Number(data.wav_price) || 0)),
      stems: Math.max(0, Math.round(Number(data.stems_price) || 0)),
    };

    // Keep the legacy database column at zero; discounts are no longer used.
    const discount = 0;

    const fileKey = (value, prefix) => {
      if (!value) return null;
      const key = String(value);
      if (!key.startsWith(prefix + "/")) {
        throw new Error("Некорректный путь загруженного файла.");
      }
      return key;
    };

    let coverKey, demoKey, mp3Key, wavKey, stemsKey;

    try {
      coverKey = fileKey(data.cover_key, "covers");
      demoKey = fileKey(data.demo_key, "demos");
      mp3Key = fileKey(data.mp3_key, "masters");
      wavKey = fileKey(data.wav_key, "masters");
      stemsKey = fileKey(data.stems_key, "masters");
    } catch (error) {
      return fail(error.message);
    }

    await env.DB.prepare(
      `INSERT INTO beats
       (title,artist,genre,bpm,musical_key,description,
        cover_key,demo_key,mp3_key,wav_key,stems_key,
        mp3_price,wav_price,stems_price,discount,active)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`
    )
      .bind(
        title,
        String(data.artist || "EGROV"),
        String(data.genre || "Trap"),
        Math.max(1, Math.round(Number(data.bpm) || 140)),
        String(data.musical_key || "Am"),
        String(data.description || ""),
        coverKey,
        demoKey,
        mp3Key,
        wavKey,
        stemsKey,
        prices.mp3,
        prices.wav,
        prices.stems,
        discount
      )
      .run();

    return json({ ok: true });
  }


  /* ---------------- EDIT / DELETE BEAT ---------------- */

  const beatMatch = path.match(/^admin\/beats\/(\d+)$/);

  if (beatMatch && method === "DELETE") {
    const beatId=Number(beatMatch[1]);
    // Keep historical order references intact, but remove the beat from public listings and playlists.
    await env.DB.prepare("DELETE FROM playlist_beats WHERE beat_id=?").bind(beatId).run();
    await env.DB.prepare("UPDATE beats SET active=0 WHERE id=?").bind(beatId).run();
    return json({ ok: true });
  }

  if (beatMatch && method === "PUT") {
    let data;

    try {
      data = await request.json();
    } catch {
      return fail("Некорректный JSON");
    }

    await env.DB.prepare(
      `UPDATE beats SET
       title=?,artist=?,genre=?,bpm=?,musical_key=?,description=?,
       mp3_price=?,wav_price=?,stems_price=?,discount=?,active=?
       WHERE id=?`
    )
      .bind(
        String(data.title || ""),
        String(data.artist || "EGROV"),
        String(data.genre || "Trap"),
        Number(data.bpm) || 140,
        String(data.musical_key || "Am"),
        String(data.description || ""),
        Math.max(0, Math.round(Number(data.mp3_price) || 0)),
        Math.max(0, Math.round(Number(data.wav_price) || 0)),
        Math.max(0, Math.round(Number(data.stems_price) || 0)),
        0,
        data.active === false ? 0 : 1,
        Number(beatMatch[1])
      )
      .run();

    return json({ ok: true });
  }

  /* ---------------- ADMIN ORDERS ---------------- */

  if (path === "admin/orders" && method === "GET") {
    const { results = [] } = await env.DB.prepare(
      `SELECT id,public_code,customer_name,customer_telegram,
       total_amount,status,created_at
       FROM orders ORDER BY id DESC LIMIT 100`
    ).all();

    return json({ orders: results });
  }

  const paidMatch = path.match(/^admin\/orders\/(\d+)\/paid$/);

  if (paidMatch && method === "POST") {
    const id = Number(paidMatch[1]);

    const row = await env.DB.prepare(
      "SELECT id,status FROM orders WHERE id=?"
    )
      .bind(id)
      .first();

    if (!row) return fail("Заказ не найден.", 404);

    // После ручного подтверждения оплаты снимаем купленные биты с продажи.
    // Сам бит и его файлы остаются в базе, поэтому его можно вернуть в каталог без повторной загрузки.
    if (row.status === "pending") {
      const { results: items = [] } = await env.DB.prepare(
        "SELECT DISTINCT beat_id FROM order_items WHERE order_id=?"
      ).bind(id).all();

      await env.DB.prepare(
        "UPDATE orders SET status='delivered',paid_at=CURRENT_TIMESTAMP,delivered_at=CURRENT_TIMESTAMP WHERE id=?"
      ).bind(id).run();

      for (const item of items) {
        await env.DB.prepare("UPDATE beats SET active=0 WHERE id=?")
          .bind(item.beat_id).run();
      }
    }

    return json({ ok: true });
  }

  const deliveredMatch = path.match(/^admin\/orders\/(\d+)\/delivered$/);

  if (deliveredMatch && method === "POST") {
    await env.DB.prepare(
      `UPDATE orders SET status='delivered',delivered_at=CURRENT_TIMESTAMP
       WHERE id=? AND status IN ('paid','delivered')`
    )
      .bind(Number(deliveredMatch[1]))
      .run();

    return json({ ok: true });
  }

  return fail("Маршрут API не найден.", 404);
}

export async function onRequest(context) {
  try {
    return await handle(context.request, context.env);
  } catch (error) {
    console.error("EGROV API error:", error);

    return fail(
      "Внутренняя ошибка сервера. Проверьте настройки и журналы Cloudflare.",
      500
    );
  }
}
