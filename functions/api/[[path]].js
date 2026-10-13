const json = (data, status = 200, extraHeaders = {}) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extraHeaders } });
const fail = (message, status = 400) => json({ error: message }, status);
const enc = new TextEncoder();
const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
const unb64url = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0));
async function sha256(text) { return new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(text))); }
async function hmac(secret, text) { const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]); return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(text))); }
function randomToken() { const a = new Uint8Array(32); crypto.getRandomValues(a); return b64url(a); }
function cookie(request, name) { const raw = request.headers.get("Cookie") || ""; const match = raw.split(";").map(x => x.trim()).find(x => x.startsWith(name + "=")); return match ? decodeURIComponent(match.slice(name.length + 1)) : ""; }
async function makeSession(env, telegramUser) { const payload = b64url(enc.encode(JSON.stringify({ id: String(telegramUser.id), name: telegramUser.first_name || "Admin", exp: Math.floor(Date.now()/1000) + 60*60*24*7 }))); return payload + "." + b64url(await hmac(env.SESSION_SECRET, payload)); }
async function readSession(request, env) { try { const token = cookie(request, "vexen_admin"); const [payload, sig] = token.split("."); if (!payload || !sig) return null; const expected = b64url(await hmac(env.SESSION_SECRET, payload)); if (expected !== sig) return null; const obj = JSON.parse(new TextDecoder().decode(unb64url(payload))); if (obj.exp < Date.now()/1000 || obj.id !== String(env.ADMIN_TELEGRAM_ID)) return null; return obj; } catch { return null; } }
async function adminRequired(request, env) { return await readSession(request, env); }
function licenseInfo(beat, license) { const map = { mp3: ["MP3", beat.mp3_price, beat.mp3_key], wav: ["WAV", beat.wav_price, beat.wav_key], stems: ["WAV + Stems", beat.stems_price, beat.stems_key] }; const x = map[license]; if (!x || !x[2]) return null; const discount = Math.min(90, Math.max(0, Number(beat.discount) || 0)); return { label: x[0], price: Math.max(0, Math.round(Number(x[1]) * (100 - discount) / 100)), file_key: x[2] }; }
async function saveUpload(file, env, prefix) { if (!file || typeof file === "string" || !file.size) return null; if (file.size > 80 * 1024 * 1024) throw new Error("Файл слишком большой (лимит 80 МБ)"); const safe = (file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100); const key = `${prefix}/${crypto.randomUUID()}-${safe}`; await env.AUDIO.put(key, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream" } }); return key; }
async function handle(request, env) {
  if (!env.DB || !env.AUDIO) return fail("Не настроены привязки D1 или R2 в Cloudflare.", 500);
  const url = new URL(request.url); const path = url.pathname.replace(/^\/api\/?/, ""); const method = request.method;
  if (path === "health" && method === "GET") return json({ ok: true, service: "VEXEN BeatStore API" });
  if (path === "config" && method === "GET") return json({ bot_username: String(env.TELEGRAM_BOT_USERNAME || "VEXENBeatStoreBot").replace(/^@/, "") });

  if (path === "auth/telegram" && method === "POST") {
    let data; try { data = await request.json(); } catch { return fail("Некорректный JSON"); }
    if (!env.BOT_TOKEN || !env.ADMIN_TELEGRAM_ID || !env.SESSION_SECRET) return fail("Секреты авторизации не настроены в Cloudflare.", 500);
    const id = String(data.id || ""); if (id !== String(env.ADMIN_TELEGRAM_ID)) return fail("Этот Telegram-аккаунт не является администратором.", 403);
    const authDate = Number(data.auth_date || 0); if (!authDate || Math.abs(Date.now()/1000 - authDate) > 300) return fail("Данные Telegram устарели. Войдите ещё раз.", 401);
    const receivedHash = String(data.hash || ""); const check = Object.keys(data).filter(k => k !== "hash" && data[k] !== undefined && data[k] !== null).sort().map(k => `${k}=${data[k]}`).join("\n");
    const secret = await sha256(env.BOT_TOKEN); const key = await crypto.subtle.importKey("raw", secret, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]); const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(check))); const expected = Array.from(digest, b => b.toString(16).padStart(2,"0")).join("");
    if (expected.length !== receivedHash.length || !crypto.subtle.timingSafeEqual) { /* constant-time compare below */ }
    let diff = expected.length ^ receivedHash.length; for (let i=0; i<Math.max(expected.length, receivedHash.length); i++) diff |= (expected.charCodeAt(i)||0) ^ (receivedHash.charCodeAt(i)||0); if (diff !== 0) return fail("Не удалось проверить подпись Telegram.", 401);
    const token = await makeSession(env, { id, first_name: data.first_name }); return json({ ok: true, name: data.first_name || "Admin" }, 200, { "Set-Cookie": `vexen_admin=${encodeURIComponent(token)}; HttpOnly; ${url.protocol === "https:" ? "Secure; " : ""}SameSite=Lax; Path=/; Max-Age=604800` });
  }
  if (path === "auth/me" && method === "GET") { const s = await readSession(request, env); return s ? json({ authenticated: true, name: s.name }) : json({ authenticated: false }, 401); }
  if (path === "auth/logout" && method === "POST") return json({ ok: true }, 200, { "Set-Cookie": `vexen_admin=; HttpOnly; ${url.protocol === "https:" ? "Secure; " : ""}SameSite=Lax; Path=/; Max-Age=0` });

  if (path === "media" && method === "GET") { const key=url.searchParams.get("key")||""; if (!(key.startsWith("covers/") || key.startsWith("demos/"))) return fail("Медиа не найдено.",404); const obj=await env.AUDIO.get(key); if(!obj) return fail("Медиа не найдено.",404); return new Response(obj.body,{headers:{"Content-Type":obj.httpMetadata?.contentType||"application/octet-stream","Cache-Control":"public, max-age=300","X-Content-Type-Options":"nosniff"}}); }
  if (path === "catalog" && method === "GET") {
    const { results = [] } = await env.DB.prepare("SELECT id,title,artist,genre,bpm,musical_key,description,cover_key,demo_key,mp3_price,wav_price,stems_price,discount,mp3_key,wav_key,stems_key FROM beats WHERE active=1 ORDER BY id DESC").all();
    return json({ beats: results.map(b => { const licenses = ["mp3","wav","stems"].map(k => { const i=licenseInfo(b,k); return i ? { id:k,label:i.label,price:i.price } : null; }).filter(Boolean); const {mp3_key,wav_key,stems_key,...publicBeat}=b; return { ...publicBeat, has_mp3:!!mp3_key, has_wav:!!wav_key, has_stems:!!stems_key, licenses }; }) });
  }
  if (path === "orders" && method === "POST") {
    let data; try { data = await request.json(); } catch { return fail("Некорректный запрос"); }
    const name = String(data.customer_name || "").trim().slice(0,100); const telegram = String(data.customer_telegram || "").trim().slice(0,80); const items = Array.isArray(data.items) ? data.items : [];
    if (name.length < 2 || !items.length || items.length > 20) return fail("Укажите имя и добавьте в корзину хотя бы один бит.");
    const resolved = []; let total = 0;
    for (const item of items) { const beat = await env.DB.prepare("SELECT * FROM beats WHERE id=? AND active=1").bind(Number(item.beat_id)).first(); if (!beat) return fail("Один из битов больше недоступен."); const lic = licenseInfo(beat, String(item.license)); if (!lic) return fail(`Лицензия ${item.license} для «${beat.title}» недоступна.`); resolved.push({ beat, license: String(item.license), ...lic }); total += lic.price; }
    const token = randomToken(); const tokenHash = Array.from(await sha256(token), b=>b.toString(16).padStart(2,"0")).join(""); const code = "VX-" + crypto.randomUUID().slice(0,8).toUpperCase();
    const result = await env.DB.prepare("INSERT INTO orders (public_code,access_token_hash,customer_name,customer_telegram,total_amount,status) VALUES (?,?,?,?,?,'pending')").bind(code, tokenHash, name, telegram, total).run(); const orderId = result.meta.last_row_id;
    for (const item of resolved) await env.DB.prepare("INSERT INTO order_items (order_id,beat_id,beat_title,license,price,file_key) VALUES (?,?,?,?,?,?)").bind(orderId,item.beat.id,item.beat.title,item.license,item.price,item.file_key).run();
    return json({ ok:true, order_id:orderId, code, access_token:token, total, bank_details:env.BANK_DETAILS || "Реквизиты ещё не настроены администратором.", recipient:env.PAYMENT_RECIPIENT || "", status:"pending" });
  }
  if (path === "orders/lookup" && method === "POST") {
    let data; try { data = await request.json(); } catch { return fail("Некорректный запрос"); } const token = String(data.access_token || ""); if (token.length < 20) return fail("Не найден заказ.",404); const hash = Array.from(await sha256(token), b=>b.toString(16).padStart(2,"0")).join(""); const order = await env.DB.prepare("SELECT id,public_code,customer_name,total_amount,status,created_at,paid_at,delivered_at FROM orders WHERE access_token_hash=?").bind(hash).first(); if (!order) return fail("Заказ не найден.",404); const {results=[]}=await env.DB.prepare("SELECT beat_title,license,price FROM order_items WHERE order_id=?").bind(order.id).all(); let downloads=[]; if (order.status === "paid" || order.status === "delivered") { for (const item of await env.DB.prepare("SELECT id,beat_title,license FROM order_items WHERE order_id=?").bind(order.id).all().then(x=>x.results)) downloads.push({ ...item, url:`/api/download/${order.id}/${item.id}?token=${encodeURIComponent(token)}` }); }
    return json({ order, items:results, downloads });
  }
  const downloadMatch = path.match(/^download\/(\d+)\/(\d+)$/);
  if (downloadMatch && method === "GET") { const orderId=Number(downloadMatch[1]), itemId=Number(downloadMatch[2]), token=url.searchParams.get("token")||""; const hash=Array.from(await sha256(token),b=>b.toString(16).padStart(2,"0")).join(""); const row=await env.DB.prepare("SELECT o.status,o.access_token_hash,i.file_key,i.beat_title,i.license FROM orders o JOIN order_items i ON i.order_id=o.id WHERE o.id=? AND i.id=?").bind(orderId,itemId).first(); if(!row||row.access_token_hash!==hash||!['paid','delivered'].includes(row.status)) return fail("Файл пока недоступен.",403); const obj=await env.AUDIO.get(row.file_key); if(!obj) return fail("Файл не найден в хранилище.",404); return new Response(obj.body,{headers:{"Content-Type":obj.httpMetadata?.contentType||"application/octet-stream","Content-Disposition":`attachment; filename="${encodeURIComponent(row.beat_title+'-'+row.license)}.bin"`,"Cache-Control":"no-store"}}); }

  const session = await adminRequired(request, env);
  if (path.startsWith("admin/") && !session) return fail("Требуется вход администратора через Telegram.",401);
  if (path === "admin/beats" && method === "GET") { const {results=[]}=await env.DB.prepare("SELECT * FROM beats ORDER BY id DESC").all(); return json({beats:results}); }
  if (path === "admin/beats" && method === "POST") {
    let form; try { form=await request.formData(); } catch { return fail("Ожидалась форма с файлами."); }
    const title=String(form.get("title")||"").trim(); if(!title) return fail("Название бита обязательно."); let cover_key=null,demo_key=null,mp3_key=null,wav_key=null,stems_key=null;
    try { cover_key=await saveUpload(form.get("cover"),env,"covers"); demo_key=await saveUpload(form.get("demo"),env,"demos"); mp3_key=await saveUpload(form.get("mp3_file"),env,"masters"); wav_key=await saveUpload(form.get("wav_file"),env,"masters"); stems_key=await saveUpload(form.get("stems_file"),env,"masters"); } catch(e) { return fail(e.message); }
    const prices={mp3:Math.max(0,Math.round(Number(form.get("mp3_price")||500))),wav:Math.max(0,Math.round(Number(form.get("wav_price")||1000))),stems:Math.max(0,Math.round(Number(form.get("stems_price")||2000)))}; const discount=Math.min(90,Math.max(0,Math.round(Number(form.get("discount")||0))));
    await env.DB.prepare("INSERT INTO beats (title,artist,genre,bpm,musical_key,description,cover_key,demo_key,mp3_key,wav_key,stems_key,mp3_price,wav_price,stems_price,discount,active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)").bind(title,String(form.get("artist")||"VEXEN"),String(form.get("genre")||"Trap"),Math.max(1,Math.round(Number(form.get("bpm")||140))),String(form.get("musical_key")||"Am"),String(form.get("description")||""),cover_key,demo_key,mp3_key,wav_key,stems_key,prices.mp3,prices.wav,prices.stems,discount).run(); return json({ok:true});
  }
  const beatMatch=path.match(/^admin\/beats\/(\d+)$/);
  if(beatMatch&&method==="DELETE"){await env.DB.prepare("UPDATE beats SET active=0 WHERE id=?").bind(Number(beatMatch[1])).run();return json({ok:true});}
  if(beatMatch&&method==="PUT") { let d;try{d=await request.json()}catch{return fail("Некорректный JSON");} await env.DB.prepare("UPDATE beats SET title=?,artist=?,genre=?,bpm=?,musical_key=?,description=?,mp3_price=?,wav_price=?,stems_price=?,discount=?,active=? WHERE id=?").bind(String(d.title||""),String(d.artist||"VEXEN"),String(d.genre||"Trap"),Number(d.bpm)||140,String(d.musical_key||"Am"),String(d.description||""),Math.max(0,Math.round(Number(d.mp3_price)||0)),Math.max(0,Math.round(Number(d.wav_price)||0)),Math.max(0,Math.round(Number(d.stems_price)||0)),Math.min(90,Math.max(0,Math.round(Number(d.discount)||0))),d.active===false?0:1,Number(beatMatch[1])).run();return json({ok:true});}
  if(path==="admin/orders"&&method==="GET"){const {results=[]}=await env.DB.prepare("SELECT id,public_code,customer_name,customer_telegram,total_amount,status,created_at FROM orders ORDER BY id DESC LIMIT 100").all();return json({orders:results});}
  const paidMatch=path.match(/^admin\/orders\/(\d+)\/paid$/);
  if(paidMatch&&method==="POST"){const id=Number(paidMatch[1]);const row=await env.DB.prepare("SELECT id,status FROM orders WHERE id=?").bind(id).first();if(!row)return fail("Заказ не найден.",404);await env.DB.prepare("UPDATE orders SET status='paid',paid_at=CURRENT_TIMESTAMP WHERE id=?").bind(id).run();return json({ok:true});}
  const deliveredMatch=path.match(/^admin\/orders\/(\d+)\/delivered$/);
  if(deliveredMatch&&method==="POST"){await env.DB.prepare("UPDATE orders SET status='delivered',delivered_at=CURRENT_TIMESTAMP WHERE id=? AND status IN ('paid','delivered')").bind(Number(deliveredMatch[1])).run();return json({ok:true});}
  return fail("Маршрут API не найден.",404);
}
export async function onRequest(context) { try { return await handle(context.request,context.env); } catch (e) { console.error(e); return fail("Внутренняя ошибка сервера. Проверьте настройки и журналы Cloudflare.",500); } }
