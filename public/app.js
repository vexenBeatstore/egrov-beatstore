
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const state = { beats: [], cart: [], botUsername: "EGROVBeatStoreBot", admin: false, user: null, orderToken: localStorage.getItem("vexen_order_token") || "", lastOrder: null, favorites: [], favoriteQueue: [], favoriteQueueIndex: -1 };
const rub = n => new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(Number(n)||0);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(path, options={}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type','application/json');
  const r = await fetch('/api/'+path,{...options,headers,credentials:'same-origin'});
  const data = (r.headers.get('content-type')||'').includes('application/json') ? await r.json() : {};
  if(!r.ok) throw new Error(data.error || `Ошибка ${r.status}`);
  return data;
}
function toast(message,error=false){
  const t=$('#toast');
  t.textContent=message;
  t.classList.toggle('error',error);
  t.classList.remove('hidden');
  clearTimeout(toast.timer);
  toast.timer=setTimeout(()=>t.classList.add('hidden'),3200);
}
function media(key){return key?'/api/media?key='+encodeURIComponent(key):''}
function finalPrice(beat,license){
  const p=Number(beat[license+'_price'])||0;
  return p;
}
function available(beat){return ['mp3','wav','stems'].filter(k=>beat['has_'+k] || beat[k+'_key'])}
function timeLabel(value){
  if(!Number.isFinite(value)||value<0)return '0:00';
  const m=Math.floor(value/60),s=Math.floor(value%60);
  return `${m}:${String(s).padStart(2,'0')}`;
}
const audioUI = { beatId: null, peaks: [], waveformLoading: false, waveformToken: 0 };
function drawWaveform(){
  const canvas=$('#globalWaveform'); if(!canvas)return;
  const rect=canvas.getBoundingClientRect(); if(!rect.width||!rect.height)return;
  const dpr=Math.min(window.devicePixelRatio||1,2),w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,w,h);
  const count=Math.max(40,Math.floor(rect.width/3.2));
  const peaks=audioUI.peaks;const audio=$('#globalAudio');const progress=audio.duration>0?audio.currentTime/audio.duration:0;
  const gap=Math.max(1,Math.round(dpr)),barW=Math.max(1,(w-gap*(count-1))/count);
  for(let i=0;i<count;i++){
    const ix=peaks.length?Math.floor(i/count*peaks.length):0;const seed=((i*37+13)%29)/100;
    const amp=peaks.length?peaks[ix]:(.12+Math.abs(Math.sin(i*.73))*.18+seed);
    const bh=Math.max(3*dpr,amp*(h*.86));const x=i*(barW+gap),y=(h-bh)/2;
    ctx.fillStyle=(i/count)<=progress?'#A0A0A0':'#555555';ctx.globalAlpha=(i/count)<=progress?1:.78;
    ctx.beginPath();ctx.roundRect(x,y,barW,bh,Math.min(barW/2,bh/2));ctx.fill();
  }
  ctx.globalAlpha=1;
}
async function loadWaveform(url){
  const token=++audioUI.waveformToken;audioUI.peaks=[];audioUI.waveformLoading=true;drawWaveform();
  try{
    const response=await fetch(url,{credentials:'same-origin'});if(!response.ok)throw new Error('waveform fetch failed');
    const buffer=await response.arrayBuffer();const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)throw new Error('Web Audio unavailable');
    const context=new AudioContextClass();const decoded=await context.decodeAudioData(buffer.slice(0));const channel=decoded.getChannelData(0),bucketSize=Math.max(1,Math.floor(channel.length/900)),peaks=[];
    for(let i=0;i<channel.length;i+=bucketSize){let peak=0;for(let j=i;j<Math.min(i+bucketSize,channel.length);j++)peak=Math.max(peak,Math.abs(channel[j]));peaks.push(peak)}
    const max=Math.max(...peaks,0.001);audioUI.peaks=peaks.map(v=>Math.max(.035,v/max));await context.close();
  }catch(e){/* visual fallback if the browser cannot decode the preview */}
  if(token===audioUI.waveformToken){audioUI.waveformLoading=false;drawWaveform()}
}
function selectBeatForPlayer(beat,autoplay=true){
  if(!beat||!beat.demo_key){toast('Для этого бита демо пока не загружено.',true);return}
  const audio=$('#globalAudio'),url=media(beat.demo_key);const same=audioUI.beatId===beat.id;
  if(!same){audio.pause();audioUI.beatId=beat.id;audio.src=url;audio.load();
    $('#globalTrackTitle').textContent=beat.title||'Без названия';
    
    $('#globalPlayer').classList.add('has-track');$('#globalPlayerStatus').textContent='';$('#globalCurrent').textContent='0:00';$('#globalDuration').textContent='--:--';
    loadWaveform(url);
  }
  if(autoplay){document.querySelectorAll('.audio-source').forEach(a=>a.pause());audio.play().then(()=>{$('#globalPlayerStatus').textContent='' }).catch(()=>{$('#globalPlayerStatus').textContent='' ;toast('Не удалось воспроизвести демо. Проверь аудиофайл.',true)});}
  drawWaveform();
}
function initGlobalPlayer(){
  const audio=$('#globalAudio'),canvas=$('#globalWaveform');if(!audio||audio.dataset.bound)return;audio.dataset.bound='1';
  $('#globalPlay').addEventListener('click',async()=>{if(!audio.src){toast('Сначала выбери бит в каталоге.');return}if(audio.paused){try{await audio.play()}catch{toast('Не удалось запустить демо.',true)}}else audio.pause()});
  audio.addEventListener('play',()=>{$('#globalPlayer').classList.add('is-visible');document.body.classList.add('player-visible');$('#globalPlay').textContent='Ⅱ';$('#globalPlay').setAttribute('aria-label','Пауза');$('#globalPlayerStatus').textContent='' ;document.querySelectorAll('.card-play').forEach(b=>{const playing=Number(b.dataset.playBeat)===audioUI.beatId;b.classList.toggle('is-playing',playing);b.textContent=playing?'Ⅱ':'▶';b.setAttribute('aria-label',playing?'Пауза':'Воспроизвести')})});
  audio.addEventListener('pause',()=>{$('#globalPlay').textContent='▶';$('#globalPlay').setAttribute('aria-label','Продолжить');document.querySelectorAll('.card-play').forEach(b=>{b.classList.remove('is-playing');b.textContent='▶';b.setAttribute('aria-label','Воспроизвести')});if(audio.src&&audio.currentTime>0)$('#globalPlayerStatus').textContent='' });
  audio.addEventListener('loadedmetadata',()=>{$('#globalDuration').textContent=timeLabel(audio.duration);drawWaveform()});
  audio.addEventListener('timeupdate',()=>{$('#globalCurrent').textContent=timeLabel(audio.currentTime);drawWaveform()});
  audio.addEventListener('ended',()=>{if(state.favoriteQueue.length&&state.favoriteQueueIndex<state.favoriteQueue.length-1){state.favoriteQueueIndex++;selectBeatForPlayer(state.favoriteQueue[state.favoriteQueueIndex],true);return;}state.favoriteQueue=[];state.favoriteQueueIndex=-1;$('#globalPlayerStatus').textContent='';$('#globalPlay').textContent='▶';document.querySelectorAll('.card-play').forEach(b=>{b.classList.remove('is-playing');b.textContent='▶';b.setAttribute('aria-label','Воспроизвести')});drawWaveform()});
  audio.addEventListener('error',()=>{$('#globalPlayerStatus').textContent='';toast('Демо не загрузилось. Проверь файл в админ-панели.',true)});
  canvas.addEventListener('click',e=>{if(audio.duration>0){const r=canvas.getBoundingClientRect();audio.currentTime=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width))*audio.duration;drawWaveform()}});
  $('#globalVolume').addEventListener('input',e=>{audio.volume=Number(e.target.value);audio.muted=audio.volume===0});audio.volume=.85;window.addEventListener('resize',drawWaveform);
}
function renderCatalog(){
  const q=$('#search').value.trim().toLowerCase(),g=$('#genreFilter').value;
  const sort=$('#sortOrder')?.value||'newest';
  const list=state.beats.filter(b=>(!g||b.genre===g)&&(!q||`${b.title} ${b.genre} ${b.description}`.toLowerCase().includes(q)));
  const priceOf=b=>Math.min(...available(b).map(k=>finalPrice(b,k)),Number.POSITIVE_INFINITY);
  list.sort((a,b)=>{
    if(sort==='oldest'){const da=Date.parse(a.created_at||'')||Number(a.id);const db=Date.parse(b.created_at||'')||Number(b.id);return da-db||Number(a.id)-Number(b.id);}
    if(sort==='title')return String(a.title||'').localeCompare(String(b.title||''),'ru');
    if(sort==='price-low')return priceOf(a)-priceOf(b);
    if(sort==='price-high')return priceOf(b)-priceOf(a);
    const da=Date.parse(a.created_at||'')||Number(a.id);const db=Date.parse(b.created_at||'')||Number(b.id);return db-da||Number(b.id)-Number(a.id);
  });
  const grid=$('#beatGrid');
  $('#emptyState').classList.toggle('hidden',list.length>0);
  $('#beatCount').textContent=String(list.length).padStart(2,'0');
  if(!list.length){grid.innerHTML='';return}
  grid.innerHTML=list.map((b,i)=>{
    const licenses=available(b);
    return `<article class="beat-row"><div class="track-identity"><span class="track-number">${String(i+1).padStart(2,'0')}</span><div class="track-copy"><h3 class="beat-title">${esc(b.title)}</h3><div class="track-mobile-meta">${esc(b.genre||'Beat')} · ${esc(b.bpm)} BPM</div>${b.description&&String(b.description).trim()?`<p class="track-description">${esc(b.description)}</p>`:''}</div></div><div class="track-details"><span>${esc(b.genre||'—')}</span><b>${esc(b.bpm||'—')} BPM</b><span>${esc(b.musical_key||'—')}</span></div><div class="track-license"><select class="license-select" aria-label="Лицензия для ${esc(b.title)}" data-beat="${b.id}" ${licenses.length?'':'disabled'}>${licenses.map(k=>`<option value="${k}">${({mp3:'MP3',wav:'WAV',stems:'WAV + STEMS'})[k]} · ${rub(finalPrice(b,k))}</option>`).join('')}</select></div><div class="track-actions"><button class="favorite-btn ${state.favorites.includes(Number(b.id))?'is-favorite':''}" type="button" data-favorite="${b.id}" aria-label="Добавить в избранное" title="Избранное">${state.favorites.includes(Number(b.id))?'♥':'♡'}</button>${b.demo_key?`<button class="card-play" type="button" data-play-beat="${b.id}" aria-label="Воспроизвести ${esc(b.title)}" title="Воспроизвести">▶</button>`:`<span class="no-demo">НЕТ ДЕМО</span>`}<button class="add-btn" data-add="${b.id}" ${licenses.length?'':'disabled'}>＋ <span>В КОРЗИНУ</span></button></div></article>`
  }).join('');
  $$('[data-play-beat]',grid).forEach(btn=>btn.addEventListener('click',()=>{const b=state.beats.find(x=>x.id===Number(btn.dataset.playBeat));selectBeatForPlayer(b,true)}));
  $$('[data-add]',grid).forEach(btn=>btn.addEventListener('click',()=>{const b=state.beats.find(x=>x.id===Number(btn.dataset.add));const select=$(`.license-select[data-beat="${b.id}"]`,grid);addToCart(b,select.value);}));
  $$('[data-favorite]',grid).forEach(btn=>btn.addEventListener('click',()=>toggleFavorite(Number(btn.dataset.favorite))));
}
async function loadFavorites(silent=false){
  if(!state.user){state.favorites=[];updateFavoriteCount();return;}
  try{const data=await api('favorites');state.favorites=(data.beats||[]).map(b=>Number(b.id));renderCatalog();renderFavorites(data.beats||[]);updateFavoriteCount();}
  catch(e){if(!silent&&e.message)toast(e.message,true)}
}
function updateFavoriteCount(){const el=$('#favoritesCount');if(el)el.textContent=String(state.favorites.length)}
async function toggleFavorite(id){
  if(!state.user){toast('Сначала войди через Telegram, чтобы сохранять избранное.',true);openProfile();return;}
  const isSaved=state.favorites.includes(id);
  try{
    if(isSaved)await api(`favorites/${id}`,{method:'DELETE'});
    else await api('favorites',{method:'POST',body:JSON.stringify({beat_id:id})});
    await loadFavorites(true);toast(isSaved?'Бит удалён из избранного':'Бит добавлен в избранное');
  }catch(e){toast(e.message||'Не удалось обновить избранное',true)}
}
function renderFavorites(beats){
  const list=$('#favoritesList');if(!list)return;
  $('#favoritesSummary').textContent=`${beats.length} ${beats.length===1?'бит':beats.length>1&&beats.length<5?'бита':'битов'}`;
  if(!beats.length){list.innerHTML='<div class="empty">Коллекция пока пуста. Нажми ♡ у понравившегося бита в каталоге.</div>';return;}
  list.innerHTML=beats.map((b,i)=>`<div class="favorite-item"><span class="favorite-index">${String(i+1).padStart(2,'0')}</span><div class="favorite-copy"><strong>${esc(b.title)}</strong><small>${esc(b.genre||'Beat')} · ${esc(b.bpm)} BPM · ${esc(b.musical_key||'—')}</small></div><button class="card-play" type="button" data-favorite-play="${b.id}" ${b.demo_key?'':'disabled'} aria-label="Слушать ${esc(b.title)}">▶</button><button class="favorite-btn is-favorite" type="button" data-favorite-remove="${b.id}" aria-label="Убрать из избранного">♥</button></div>`).join('');
  $$('[data-favorite-play]',list).forEach(btn=>btn.addEventListener('click',()=>{const b=beats.find(x=>Number(x.id)===Number(btn.dataset.favoritePlay));selectBeatForPlayer(b,true)}));
  $$('[data-favorite-remove]',list).forEach(btn=>btn.addEventListener('click',()=>toggleFavorite(Number(btn.dataset.favoriteRemove))));
}
function playFavoritesQueue(){
  if(!state.user){toast('Войди через Telegram, чтобы открыть свою коллекцию.',true);openProfile();return;}
  const queue=state.beats.filter(b=>state.favorites.includes(Number(b.id))&&b.demo_key);
  if(!queue.length){toast('В избранном пока нет битов с демо.',true);return;}
  state.favoriteQueue=queue;state.favoriteQueueIndex=0;selectBeatForPlayer(queue[0],true);toast(`Запущена подборка: ${queue.length} битов`);
}

async function loadCatalog(){
  try{
    const data=await api('catalog');
    state.beats=data.beats||[];
    const genres=[...new Set(state.beats.map(b=>b.genre).filter(Boolean))].sort();
    $('#genreFilter').innerHTML='<option value="">Все жанры</option>'+genres.map(g=>`<option>${esc(g)}</option>`).join('');
    $('#genreSidebar').innerHTML=genres.map(g=>`<button class="genre-nav" data-genre="${esc(g)}">${esc(g)}<span>↗</span></button>`).join('')||'<span class="sidebar-empty">Жанры появятся после загрузки битов</span>';
    $$('[data-genre]').forEach(btn=>btn.addEventListener('click',()=>{ $('#genreFilter').value=btn.dataset.genre;$$('[data-genre]').forEach(x=>x.classList.toggle('active',x===btn));renderCatalog();}));
    renderCatalog();
  }catch(e){
    $('#beatGrid').innerHTML=`<div class="empty">Не удалось загрузить каталог: ${esc(e.message)}. Проверь, создана ли база D1 и применена ли schema.sql.</div>`;
  }
}
function addToCart(beat,license){
  const item=state.cart.find(i=>i.beat_id===beat.id);
  if(item)item.license=license;else state.cart.push({beat_id:beat.id,license});
  renderCart();
  $('#cartDrawer').classList.remove('hidden');
  toast('Бит добавлен в корзину');
}
function cartResolved(){
  return state.cart.map(i=>{
    const b=state.beats.find(x=>x.id===i.beat_id);
    return b?{...i,beat:b,price:finalPrice(b,i.license)}:null;
  }).filter(Boolean);
}
function renderCart(){
  const items=cartResolved();
  $('#cartCount').textContent=items.length;
  $('#cartItems').innerHTML=items.length?items.map(i=>`<div class="cart-item"><div><strong>${esc(i.beat.title)}</strong><small>${esc(i.beat.genre)} · ${i.beat.bpm} BPM</small><select data-cart-license="${i.beat_id}">${available(i.beat).map(k=>`<option value="${k}" ${i.license===k?'selected':''}>${({mp3:'MP3',wav:'WAV',stems:'WAV + Stems'})[k]} — ${rub(finalPrice(i.beat,k))}</option>`).join('')}</select></div><div><strong>${rub(i.price)}</strong><button class="remove-btn" data-remove="${i.beat_id}">Убрать ✕</button></div></div>`).join(''):'<div class="empty">Корзина пока пуста.</div>';
  $('#cartTotal').textContent=rub(items.reduce((s,i)=>s+i.price,0));
  $$('[data-cart-license]').forEach(s=>s.addEventListener('change',()=>{
    const item=state.cart.find(i=>i.beat_id===Number(s.dataset.cartLicense));
    if(item)item.license=s.value;
    renderCart();
  }));
  $$('[data-remove]').forEach(b=>b.addEventListener('click',()=>{
    state.cart=state.cart.filter(i=>i.beat_id!==Number(b.dataset.remove));
    renderCart();
  }));
  $('#checkoutOpen').disabled=!items.length;
}
function showModal(id){$('#'+id).classList.remove('hidden')}
function hideModal(id){$('#'+id).classList.add('hidden')}
async function checkout(event){
  event.preventDefault();
  const items=cartResolved();
  if(!items.length)return toast('Сначала добавь бит в корзину',true);
  const btn=$('button[type="submit"]',event.currentTarget);
  btn.disabled=true;
  btn.textContent='СОЗДАЁМ ЗАКАЗ...';
  try{
    const order=await api('orders',{method:'POST',body:JSON.stringify({customer_name:$('#customerName').value,customer_telegram:$('#customerTelegram').value,items:items.map(i=>({beat_id:i.beat_id,license:i.license}))})});
    state.orderToken=order.access_token;
    state.lastOrder=order;
    localStorage.setItem('vexen_order_token',order.access_token);
    $('#checkoutResult').classList.remove('hidden');
    const paymentComment = `${$('#customerTelegram').value.trim()} ${order.code} ${items.map(i=>({mp3:'MP3',wav:'WAV',stems:'STEMS'})[i.license]).join(', ')}`;
    $('#checkoutResult').innerHTML=`<div class="order-status">ЗАКАЗ ${esc(order.code)} · ОЖИДАЕТ ОПЛАТЫ</div><p class="hint">Переведи <strong>${rub(order.total)}</strong> получателю <strong>Ярослав</strong>. После проверки оплаты полные файлы будут отправлены вручную в Telegram: <strong>${esc($('#customerTelegram').value)}</strong>.</p><div class="pay-box">${esc(order.bank_details)}\n\nКомментарий к переводу (обязательно):\n${esc(paymentComment)}</div><button class="copy-btn" id="copyComment">КОПИРОВАТЬ КОММЕНТАРИЙ</button><p class="hint"><strong>Важно:</strong> скопируй комментарий полностью. В нём должны быть твой Telegram, номер заказа и выбранная лицензия.</p><button class="copy-btn" id="copyBank">КОПИРОВАТЬ РЕКВИЗИТЫ</button> <button class="copy-btn" id="openOrder">ОТКРЫТЬ СТАТУС ЗАКАЗА</button> <button class="copy-btn" id="copyOrderToken">КОПИРОВАТЬ КЛЮЧ ДОСТУПА</button><p class="hint">Сохрани код заказа ${esc(order.code)} и ключ доступа отдельно. Не отправляй ключ посторонним. На этом устройстве статус можно открыть через «Мой заказ» внизу сайта.</p>`;
    $('#copyBank').onclick=()=>navigator.clipboard.writeText(order.bank_details).then(()=>toast('Реквизиты скопированы')).catch(()=>toast('Не удалось скопировать',true));
    $('#copyComment').onclick=()=>navigator.clipboard.writeText(paymentComment).then(()=>toast('Комментарий скопирован')).catch(()=>toast('Не удалось скопировать',true));
    $('#openOrder').onclick=()=>{hideModal('checkoutModal');showOrder()};
    $('#copyOrderToken').onclick=()=>navigator.clipboard.writeText(order.access_token).then(()=>toast('Ключ доступа скопирован — сохрани его в надёжном месте')).catch(()=>toast('Не удалось скопировать ключ',true));
    state.cart=[];
    renderCart();
    $('#checkoutForm').classList.add('hidden');
    toast('Заказ создан');
  }catch(e){toast(e.message,true)}
  finally{btn.disabled=false;btn.textContent='ПЕРЕЙТИ К ОПЛАТЕ ↗'}
}
async function showOrder(){
  if(!state.orderToken){toast('На этом устройстве ещё нет сохранённого заказа',true);return}
  try{
    const d=await api('orders/lookup',{method:'POST',body:JSON.stringify({access_token:state.orderToken})});
    const status=({pending:'Ожидает оплаты',paid:'Оплата подтверждена · готовится отправка',delivered:'Файлы отправлены в Telegram'})[d.order.status]||d.order.status;
    $('#orderDetails').innerHTML=`<div class="order-status">${esc(status)}</div><p class="hint">Заказ ${esc(d.order.public_code)} · ${rub(d.order.total_amount)}<br>Telegram: <strong>${esc(d.order.customer_telegram||'не указан')}</strong></p>${d.items.map(i=>`<div class="order-item-line"><span>${esc(i.beat_title)}<br><small>${esc(({mp3:'MP3',wav:'WAV',stems:'WAV + Stems'})[i.license]||i.license)}</small></span><strong>${rub(i.price)}</strong></div>`).join('')}${d.downloads.length?'<h4>Твои файлы</h4>'+d.downloads.map(x=>`<a class="download-link" href="${x.url}">↓ ${esc(x.beat_title)} — ${esc(x.license)}</a>`).join(''):'<p class="hint">Файлы не скачиваются автоматически. После ручной проверки оплаты администратор отправит выбранные файлы на указанный Telegram.</p>'}`;
    showModal('orderModal');
  }catch(e){toast(e.message,true)}
}
function openProfile(){showModal('adminModal');$('#authModalTitle').textContent=state.user?'Профиль':'Вход';$('#adminApp').classList.add('hidden');$('#profileApp').classList.add('hidden');$('#adminLogin').classList.remove('hidden');loadTelegramLogin();checkAuth()} 
function openAdmin(){showModal('adminModal');$('#authModalTitle').textContent='Админ-панель';$('#profileApp').classList.add('hidden');$('#adminLogin').classList.add('hidden');checkAdmin()}
async function loadTelegramLogin(){
  try{
    const c=await api('config');
    state.botUsername=c.bot_username||state.botUsername;
    const target=$('#telegramLogin');
    if(target.dataset.loaded)return;
    target.dataset.loaded='1';
    const script=document.createElement('script');
    script.src='https://telegram.org/js/telegram-widget.js?22';
    script.async=true;
    script.setAttribute('data-telegram-login',state.botUsername);
    script.setAttribute('data-size','large');
    script.setAttribute('data-userpic','false');
    script.setAttribute('data-onauth','onTelegramAuth(user)');
    script.setAttribute('data-request-access','write');
    target.appendChild(script);
  }catch(e){$('#telegramLogin').textContent=e.message}
}
window.onTelegramAuth=async user=>{
  try{
    await api('auth/telegram',{method:'POST',body:JSON.stringify(user)});
    toast('Вход выполнен');
    await checkAuth();
    if(document.body.classList.contains('admin-page')) { await checkAdmin(); }
    else { hideModal('adminModal'); window.scrollTo({top:0,behavior:'smooth'}); }
  }catch(e){toast(e.message,true)}
};
async function checkAuth(){
  try{
    const user=await api('auth/me');
    state.user=user; state.admin=Boolean(user.is_admin);
    $('#authModalTitle').textContent='Профиль';
    $('#profileName').textContent=user.name||'Профиль';
    $('#profileTelegram').textContent=user.is_admin?'Вы вошли как администратор Telegram.':'Вы вошли через Telegram.';
    $('#profileApp').classList.remove('hidden'); $('#adminLogin').classList.add('hidden'); $('#adminApp').classList.add('hidden');
    $('#profileOpen').textContent='Профиль';
    $('#adminPanelOpen').classList.toggle('hidden',!state.admin);
    await loadFavorites(true);
  }catch{
    state.user=null;state.admin=false;
    $('#profileOpen').textContent='Вход';
    $('#adminPanelOpen').classList.add('hidden');
    $('#profileApp').classList.add('hidden');$('#adminApp').classList.add('hidden');$('#adminLogin').classList.remove('hidden');
  }
}
async function checkAdmin(){
  try{
    const user=await api('auth/me');
    if(!user.is_admin)throw new Error('Нет прав администратора');
    state.user=user;state.admin=true;
    $('#authModalTitle').textContent='Админ-панель';
    $('#adminLogin').classList.add('hidden');$('#profileApp').classList.add('hidden');$('#adminApp').classList.remove('hidden');
    $('#profileOpen').textContent='Профиль';$('#adminPanelOpen').classList.remove('hidden');
    loadAdminBeats();
    loadAdminPlaylists();
  }catch{
    state.admin=false;$('#adminApp').classList.add('hidden');$('#adminLogin').classList.remove('hidden');
    toast('Войди через Telegram-аккаунт администратора.',true);
  }
}


let playlistData = [];
let editingPlaylistId = null;
function renderPlaylists(){
  const search=($('#playlistSearch')?.value||'').trim().toLowerCase(), genre=$('#playlistGenre')?.value||'', sort=$('#playlistSort')?.value||'newest';
  let items=playlistData.filter(p=>(!search||`${p.title} ${p.genre} ${p.description}`.toLowerCase().includes(search))&&(!genre||p.genre===genre));
  if(sort==='title')items.sort((a,b)=>a.title.localeCompare(b.title,'ru'));else items.sort((a,b)=>Number(b.id)-Number(a.id));
  $('#playlistCount').textContent=`${items.length} ${items.length===1?'ПЛЕЙЛИСТ':items.length>1&&items.length<5?'ПЛЕЙЛИСТА':'ПЛЕЙЛИСТОВ'}`;
  $('#playlistGrid').innerHTML=items.map(p=>`<article class="playlist-card"><button type="button" class="playlist-cover" data-open-playlist="${p.id}" ${p.cover_key?`style="background-image:url('${media(p.cover_key)}')"`:''}><span class="playlist-cover-mark">EGROV<br><b>SELECTED</b></span><span class="playlist-cover-play">▶</span></button><div class="playlist-card-copy"><div><h3>${esc(p.title)}</h3><span class="playlist-genre">${esc(p.genre||'Разные жанры')}</span></div><span class="playlist-track-count">${p.beats.length} бит${p.beats.length===1?'':p.beats.length<5?'а':'ов'}</span></div><button class="playlist-listen" data-play-playlist="${p.id}" type="button">▶ СЛУШАТЬ ПЛЕЙЛИСТ</button></article>`).join('');
  $('#playlistEmpty').classList.toggle('hidden',items.length>0);
  $$('[data-open-playlist]').forEach(b=>b.onclick=()=>openPlaylist(Number(b.dataset.openPlaylist)));
  $$('[data-play-playlist]').forEach(b=>b.onclick=()=>playPlaylist(Number(b.dataset.playPlaylist)));
}
function openPlaylist(id){
  const p=playlistData.find(x=>Number(x.id)===id);if(!p)return;
  const list=p.beats.map((b,i)=>`<div class="favorite-item"><span class="favorite-index">${String(i+1).padStart(2,'0')}</span><div class="favorite-copy"><strong>${esc(b.title)}</strong><small>${esc(b.genre||'Beat')} · ${b.bpm||'—'} BPM · ${esc(b.musical_key||'—')}</small></div><button class="card-play" type="button" data-playlist-beat="${b.id}" ${b.demo_key?'':'disabled'}>▶</button></div>`).join('');
  const modal=$('#playlistModal');modal.innerHTML=`<div class="modal-backdrop" data-close-playlist="1"></div><div class="modal-card favorites-card playlist-detail"><button class="icon-btn modal-close" data-close-playlist="1">✕</button><p class="eyebrow">EGROV / PLAYLIST</p><h3>${esc(p.title)}</h3><p class="hint">${esc(p.genre||'Разные жанры')} · ${p.beats.length} битов</p>${p.description?`<p class="playlist-description">${esc(p.description)}</p>`:''}<button class="primary-btn full" id="playlistDetailPlay" type="button">▶ СЛУШАТЬ ВСЁ</button><div class="favorites-list">${list||'<p class="hint">В плейлисте пока нет доступных битов.</p>'}</div></div>`;
  modal.classList.remove('hidden');modal.querySelectorAll('[data-close-playlist]').forEach(b=>b.onclick=()=>modal.classList.add('hidden'));
  $('#playlistDetailPlay').onclick=()=>playPlaylist(id);
  modal.querySelectorAll('[data-playlist-beat]').forEach(b=>b.onclick=()=>{const beat=p.beats.find(x=>Number(x.id)===Number(b.dataset.playlistBeat));if(beat)selectBeatForPlayer(beat,true)});
}
function playPlaylist(id){const p=playlistData.find(x=>Number(x.id)===id);if(!p)return;const queue=p.beats.filter(b=>b.demo_key);if(!queue.length){toast('В этом плейлисте пока нет демо для прослушивания.',true);return;}state.favoriteQueue=queue;state.favoriteQueueIndex=0;selectBeatForPlayer(queue[0],true);toast(`Запущен плейлист «${p.title}» · ${queue.length} битов`)}
async function loadPlaylists(){
  try{const d=await api('playlists');playlistData=d.playlists||[];const genres=[...new Set(playlistData.map(p=>p.genre).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ru'));$('#playlistGenre').innerHTML='<option value="">Все жанры</option>'+genres.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join('');renderPlaylists();}
  catch(e){$('#playlistGrid').innerHTML=`<div class="empty">Не удалось загрузить плейлисты: ${esc(e.message)}. Возможно, нужно применить миграцию базы.</div>`;}
}
async function loadAdminPlaylists(){
  try{const [d,beats]=await Promise.all([api('admin/playlists'),api('admin/beats')]);
    $('#plBeats').innerHTML=beats.beats.filter(b=>b.active).map(b=>`<option value="${b.id}">${esc(b.title)} · ${esc(b.genre||'Без жанра')} · #${b.id}</option>`).join('');
    $('#adminPlaylistList').innerHTML=d.playlists.length?d.playlists.map(p=>`<article class="admin-playlist"><div><strong>${esc(p.title)}</strong><small>${esc(p.genre||'Без жанра')} · ${p.beat_ids.length} битов · ${p.active?'Опубликован':'Скрыт'}</small></div><div class="admin-actions"><button class="small-btn" data-edit-playlist="${p.id}">Редактировать</button><button class="small-btn danger" data-delete-playlist="${p.id}">Удалить</button></div></article>`).join(''):'<p class="hint">Плейлистов пока нет. Создай первый слева.</p>';
    $$('[data-edit-playlist]').forEach(b=>b.onclick=()=>{const p=d.playlists.find(x=>Number(x.id)===Number(b.dataset.editPlaylist));if(!p)return;editingPlaylistId=Number(p.id);$('#plTitle').value=p.title||'';$('#plGenre').value=p.genre||'';$('#plDescription').value=p.description||'';$('#plCover').value='';[...$('#plBeats').options].forEach(o=>o.selected=(p.beat_ids||[]).includes(Number(o.value)));$('#playlistForm').querySelector('[type="submit"]').textContent='СОХРАНИТЬ ИЗМЕНЕНИЯ ↗';$('#playlistForm').scrollIntoView({behavior:'smooth',block:'start'});});
    $$('[data-delete-playlist]').forEach(b=>b.onclick=async()=>{if(!confirm('Удалить этот плейлист?'))return;try{await api(`admin/playlists/${b.dataset.deletePlaylist}`,{method:'DELETE'});toast('Плейлист удалён');loadAdminPlaylists();loadPlaylists()}catch(e){toast(e.message,true)}});
  }catch(e){$('#adminPlaylistList').innerHTML=`<p class="hint">${esc(e.message)}</p>`;}
}
async function createPlaylist(event){
  event.preventDefault();const status=$('#playlistFormStatus'),btn=$('#playlistForm').querySelector('[type="submit"]');btn.disabled=true;status.textContent='Создаём плейлист…';
  try{let cover_key='';const file=$('#plCover').files[0];if(file){const body=new FormData();body.append('file',file);body.append('type','cover');const uploaded=await api('admin/upload',{method:'POST',body});cover_key=uploaded.key;}
    const beat_ids=[$$('#plBeats option:checked')].flat().map(o=>Number(o.value));
    await api(editingPlaylistId?`admin/playlists/${editingPlaylistId}`:'admin/playlists',{method:editingPlaylistId?'PUT':'POST',body:JSON.stringify({title:$('#plTitle').value,genre:$('#plGenre').value,description:$('#plDescription').value,cover_key,beat_ids})});
    const wasEditing=Boolean(editingPlaylistId);editingPlaylistId=null;$('#playlistForm').reset();$('#playlistForm').querySelector('[type="submit"]').textContent='СОЗДАТЬ ПЛЕЙЛИСТ ↗';status.textContent='';toast(wasEditing?'Плейлист обновлён':'Плейлист создан');await loadAdminPlaylists();await loadPlaylists();
  }catch(e){status.textContent=e.message;toast(e.message,true)}finally{btn.disabled=false;}
}


async function loadSiteContent(){
  try{
    const d=await api('content');
    const license=$('#licensesDescriptionText'), serviceDesc=$('#servicesDescriptionText'), list=$('#servicesList');
    if(license)license.textContent=d.content?.licenses_description||'';
    if(serviceDesc)serviceDesc.textContent=d.content?.services_description||'';
    if(list)list.innerHTML=(d.services||[]).length?d.services.map(s=>`<article class="service-card"><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></article>`).join(''):'<p class="content-description">Список услуг скоро появится.</p>';
  }catch(e){console.warn('Не удалось загрузить описания:',e.message)}
}
async function loadAdminContent(){
  try{
    const d=await api('content'), f=$('#siteContentForm');
    f.elements.namedItem('licenses_description').value=d.content?.licenses_description||'';
    f.elements.namedItem('services_description').value=d.content?.services_description||'';
    const list=$('#adminServicesList');
    list.innerHTML=(d.services||[]).map(s=>`<form class="admin-service-item" data-service-id="${s.id}"><label>Название<input name="title" required value="${esc(s.title)}"></label><label>Описание<textarea name="description" rows="3">${esc(s.description)}</textarea></label><div class="admin-service-actions"><button class="small-btn" type="submit">Сохранить</button><button class="danger-btn" type="button" data-delete-service="${s.id}">Удалить</button></div></form>`).join('')||'<p class="hint">Пока нет добавленных услуг.</p>';
    list.querySelectorAll('[data-service-id]').forEach(form=>form.addEventListener('submit',async e=>{e.preventDefault();try{await api(`admin/content/services/${form.dataset.serviceId}`,{method:'PUT',body:JSON.stringify({title:form.elements.title.value,description:form.elements.description.value})});toast('Услуга обновлена');await loadAdminContent();await loadSiteContent()}catch(err){toast(err.message,true)}}));
    list.querySelectorAll('[data-delete-service]').forEach(btn=>btn.addEventListener('click',async()=>{if(!confirm('Удалить эту услугу?'))return;try{await api(`admin/content/services/${btn.dataset.deleteService}`,{method:'DELETE'});toast('Услуга удалена');await loadAdminContent();await loadSiteContent()}catch(err){toast(err.message,true)}}));
  }catch(e){toast(e.message,true)}
}
$('#siteContentForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;try{await api('admin/content',{method:'PUT',body:JSON.stringify({licenses_description:f.elements.licenses_description.value,services_description:f.elements.services_description.value})});toast('Описания сохранены');await loadSiteContent()}catch(err){toast(err.message,true)}});
$('#serviceForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;try{await api('admin/content/services',{method:'POST',body:JSON.stringify({title:f.elements.title.value,description:f.elements.description.value})});f.reset();toast('Услуга добавлена');await loadAdminContent();await loadSiteContent()}catch(err){toast(err.message,true)}});
function switchAdminTab(tab){
  const paneTab = tab==='services'||tab==='licenses' ? 'content' : tab==='beats' ? 'manage' : tab;
  $$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  $$('.admin-pane').forEach(p=>p.classList.add('hidden'));
  const pane=$('#admin'+paneTab[0].toUpperCase()+paneTab.slice(1));
  if(pane)pane.classList.remove('hidden');
  const licenseField=$('#siteContentForm label.license-description-field');
  const servicesDescriptionField=$('#siteContentForm label.services-description-field');
  const serviceCreate=$('.service-create-form'), serviceList=$('#adminServicesList');
  if(licenseField)licenseField.classList.toggle('hidden',tab!=='licenses');
  if(servicesDescriptionField)servicesDescriptionField.classList.toggle('hidden',tab!=='services');
  if(licenseField)licenseField.querySelector('textarea').required=tab==='licenses';
  if(servicesDescriptionField)servicesDescriptionField.querySelector('textarea').required=tab==='services';
  if(serviceCreate)serviceCreate.classList.toggle('hidden',tab!=='services');
  if(serviceList)serviceList.classList.toggle('hidden',tab!=='services');
  if(tab==='orders')loadAdminOrders();
  if(tab==='beats')loadAdminBeats();
  if(tab==='playlists')loadAdminPlaylists();
  if(tab==='services'||tab==='licenses')loadAdminContent();
}
async function loadAdminOrders(){
  try{
    const d=await api('admin/orders');
    $('#adminOrders').innerHTML=d.orders.length?'<div class="admin-orders-list">'+d.orders.map(o=>`<div class="admin-order"><div><strong>${esc(o.public_code)} · ${rub(o.total_amount)}</strong><small>${esc(o.customer_name)} ${esc(o.customer_telegram)} · ${esc(o.created_at)} · ${esc(o.status)}</small></div><div class="admin-actions">${o.status==='pending'?`<button class="small-btn" data-paid="${o.id}">Подтвердить оплату</button>`:''}${o.status==='paid'?`<button class="small-btn" data-delivered="${o.id}">Отметить выданным</button>`:''}</div></div>`).join('')+'</div>':'<p class="hint">Заказов пока нет.</p>';
    $$('[data-paid]').forEach(b=>b.onclick=async()=>{
      if(!confirm('Подтвердить, что деньги реально поступили?'))return;
      try{await api(`admin/orders/${b.dataset.paid}/paid`,{method:'POST',body:'{}'});toast('Оплата подтверждена · бит снят с продажи');loadAdminOrders();loadAdminBeats();loadCatalog()}
      catch(e){toast(e.message,true)}
    });
    $$('[data-delivered]').forEach(b=>b.onclick=async()=>{
      try{await api(`admin/orders/${b.dataset.delivered}/delivered`,{method:'POST',body:'{}'});toast('Заказ отмечен выданным');loadAdminOrders()}
      catch(e){toast(e.message,true)}
    });
  }catch(e){$('#adminOrders').innerHTML=`<p class="hint">${esc(e.message)}</p>`}
}
async function loadAdminBeats(){
  try{
    const d=await api('admin/beats');
    $('#adminManage').innerHTML=d.beats.length?'<div class="admin-beat-list">'+d.beats.map((b,i)=>`<article class="admin-beat"><div class="admin-beat-art" aria-hidden="true"><span>${String(i+1).padStart(2,'0')}</span><i class="mini-wave"><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b></i></div><div class="admin-beat-main"><div class="admin-beat-titleline"><strong>${esc(b.title)}</strong><span class="admin-beat-status ${b.active?'is-live':'is-hidden'}"><i></i>${b.active?'В продаже':'Снят с продажи'}</span></div><small>${esc(b.genre||'Без жанра')} <span class="meta-dot">·</span> ${b.bpm||'—'} BPM <span class="meta-dot">·</span> ${esc(b.musical_key||'—')} <span class="meta-dot">·</span> #${b.id}</small>${b.description&&String(b.description).trim()?`<p class="admin-beat-description">${esc(b.description)}</p>`:''}<div class="admin-beat-prices"><span>MP3 <b>${Number(b.mp3_price||0).toLocaleString('ru-RU')} ₽</b></span><span>WAV <b>${Number(b.wav_price||0).toLocaleString('ru-RU')} ₽</b></span><span>STEMS <b>${Number(b.stems_price||0).toLocaleString('ru-RU')} ₽</b></span></div></div><div class="admin-actions"><button class="small-btn" data-edit="${b.id}">Изменить</button>${b.active?`<button class="small-btn danger" data-hide="${b.id}">Снять с продажи</button>`:`<button class="small-btn relist-btn" data-show="${b.id}">Выгрузить повторно ↗</button>`}<button class="small-btn" data-add-to-playlist="${b.id}">В плейлист</button><button class="small-btn danger" data-delete-beat="${b.id}">Удалить</button></div></article>`).join('')+'</div>':'<div class="admin-empty"><span>♪</span><strong>Каталог пока пуст</strong><p>Добавь первый бит — он появится здесь отдельной строкой.</p></div>';
    $$('[data-edit]').forEach(b=>b.onclick=()=>editBeat(d.beats.find(x=>x.id===Number(b.dataset.edit))));
    $$('[data-hide]').forEach(b=>b.onclick=()=>toggleBeat(b.dataset.hide,false));
    $$('[data-show]').forEach(b=>b.onclick=()=>toggleBeat(b.dataset.show,true));
    $$('[data-add-to-playlist]').forEach(b=>b.onclick=async()=>{try{const d=await api('admin/playlists');if(!d.playlists.length){toast('Сначала создай плейлист во вкладке «Плейлисты».',true);return;}const menu=d.playlists.map((p,i)=>`${i+1}. ${p.title}`).join('\n');const choice=prompt(`В какой плейлист добавить бит? Введи номер:\n${menu}`);if(choice===null)return;const index=Number(choice)-1;const p=d.playlists[index];if(!p){toast('Неверный номер плейлиста.',true);return;}const ids=[...new Set([...(p.beat_ids||[]).map(Number),Number(b.dataset.addToPlaylist)])];await api(`admin/playlists/${p.id}`,{method:'PUT',body:JSON.stringify({title:p.title,genre:p.genre,description:p.description,cover_key:p.cover_key,beat_ids:ids})});toast(`Бит добавлен в «${p.title}»`);await loadAdminPlaylists();await loadPlaylists();}catch(e){toast(e.message,true)}});
    $$('[data-delete-beat]').forEach(b=>b.onclick=async()=>{if(!confirm('Удалить бит из каталога? Он будет снят с продажи и исчезнет из плейлистов.'))return;try{await api(`admin/beats/${b.dataset.deleteBeat}`,{method:'DELETE'});toast('Бит удалён из каталога');await loadAdminBeats();await loadAdminPlaylists();await loadCatalog()}catch(e){toast(e.message,true)}});
  }catch(e){$('#adminManage').innerHTML=`<p class="hint">${esc(e.message)}</p>`}
}
async function toggleBeat(id,active){
  try{
    const b=(await api('admin/beats')).beats.find(x=>x.id===Number(id));
    await api(`admin/beats/${id}`,{method:'PUT',body:JSON.stringify({...b,active})});
    toast(active?'Бит восстановлен':'Бит скрыт из каталога');
    loadAdminBeats();
    loadCatalog();
  }catch(e){toast(e.message,true)}
}
async function editBeat(b){
  const title=prompt('Название бита:',b.title);if(title===null)return;
  const genre=prompt('Жанр:',b.genre);if(genre===null)return;
  const bpm=prompt('BPM:',b.bpm);if(bpm===null)return;
  const key=prompt('Тональность:',b.musical_key);if(key===null)return;
  const mp3=prompt('Цена MP3 (₽):',b.mp3_price);if(mp3===null)return;
  const wav=prompt('Цена WAV (₽):',b.wav_price);if(wav===null)return;
  const stems=prompt('Цена WAV + Stems (₽):',b.stems_price);if(stems===null)return;
  const description=prompt('Описание и кому подойдёт (вайб, звучание, тип вокала, темы текста):',b.description||'');if(description===null)return;
  try{
    await api(`admin/beats/${b.id}`,{method:'PUT',body:JSON.stringify({...b,title,genre,bpm:Number(bpm),musical_key:key,mp3_price:Number(mp3),wav_price:Number(wav),stems_price:Number(stems),description})});
    toast('Бит обновлён');
    loadAdminBeats();
    loadCatalog();
  }catch(e){toast(e.message,true)}
}
$('#search').addEventListener('input',renderCatalog);$('#sortOrder')?.addEventListener('change',renderCatalog);
$('#genreFilter').addEventListener('change',renderCatalog);
$('#cartOpen').onclick=()=>$('#cartDrawer').classList.remove('hidden');
$('#favoritesOpen').onclick=async()=>{if(!state.user){toast('Войди через Telegram, чтобы пользоваться избранным.',true);openProfile();return;}await loadFavorites();showModal('favoritesModal');};
$('#playFavorites').onclick=playFavoritesQueue;
$('#checkoutOpen').onclick=()=>{
  if(!cartResolved().length)return;
  $('#checkoutResult').classList.add('hidden');
  $('#checkoutForm').classList.remove('hidden');
  showModal('checkoutModal');
};
$('#checkoutForm').addEventListener('submit',checkout);
$('#profileOpen').onclick=openProfile;
$('#adminPanelOpen').onclick=()=>{window.location.href='/admin.html'};
$('#myOrderOpen').onclick=showOrder;
$('#footerOrderOpen').onclick=showOrder;


function setUploadStep(step){
  const current=Math.min(3,Math.max(1,Number(step)||1));
  $$('[data-step-panel]').forEach(panel=>{const active=Number(panel.dataset.stepPanel)===current;panel.classList.toggle('hidden',!active);$$('input,textarea,select',panel).forEach(field=>{if(field.dataset.stepRequired==='1'||field.required)field.dataset.stepRequired='1';field.required=active&&field.dataset.stepRequired==='1'});});
  $$('[data-step-indicator]').forEach(item=>{const n=Number(item.dataset.stepIndicator);item.classList.toggle('active',n===current);item.classList.toggle('complete',n<current)});
  const form=$('#beatForm');if(form)form.dataset.currentStep=String(current);
}
$$('[data-next-step]').forEach(btn=>btn.addEventListener('click',()=>{
  const current=Number($('#beatForm')?.dataset.currentStep||1);
  const panel=$(`[data-step-panel="${current}"]`);
  const fields=$$('input,textarea,select',panel).filter(el=>el.required);
  for(const field of fields){if(!field.checkValidity()){field.reportValidity();return}}
  setUploadStep(btn.dataset.nextStep);
}));
$$('[data-prev-step]').forEach(btn=>btn.addEventListener('click',()=>setUploadStep(btn.dataset.prevStep)));
setUploadStep(1);

const demoInput = document.querySelector('#beatForm input[name=demo]');
if (demoInput) demoInput.addEventListener('change', () => {
  const file = demoInput.files && demoInput.files[0];
  const output = document.querySelector('#demoFileName');
  if (output) output.textContent = file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} МБ` : 'Файл не выбран';
});

/* Загрузка файлов по одному, затем сохранение карточки */
$('#beatForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.currentTarget;
  if(Number(form.dataset.currentStep||1)!==3){setUploadStep(3);return;}
  const msg = $('#beatFormMessage');
  const submitButton = $('button[type="submit"]', form);
  submitButton.disabled = true;

  const getValue = name => {
    const field = form.elements.namedItem(name);
    return field ? field.value.trim() : '';
  };
  const getFile = name => {
    const field = form.elements.namedItem(name);
    return field && field.files && field.files.length ? field.files[0] : null;
  };

  try {
    const fields = {
      title: getValue('title'),
      artist: 'EGROV',
      genre: getValue('genre') || 'Trap',
      bpm: Number(getValue('bpm')) || 140,
      musical_key: getValue('musical_key') || 'Am',
      description: getValue('description'),
      mp3_price: Number(getValue('mp3_price')) || 0,
      wav_price: Number(getValue('wav_price')) || 0,
      stems_price: Number(getValue('stems_price')) || 0
    };

    if (!fields.title) throw new Error('Укажи название бита.');
    if (!getFile('demo')) throw new Error('Загрузи демо-файл. Полные MP3/WAV/STEMS загружать не нужно.');

    const uploads = [
      {field:'demo', type:'demo', key:'demo_key', label:'Демо'}
    ];
    const uploaded = {};

    for (const item of uploads) {
      const file = getFile(item.field);
      if (!file) continue;
      msg.textContent = `Загрузка: ${item.label} (${(file.size/1024/1024).toFixed(1)} МБ)...`;
      const body = new FormData();
      body.append('type', item.type);
      body.append('file', file, file.name);
      const result = await api('admin/upload', {method:'POST', body});
      if (!result.key) throw new Error(`Сервер не вернул путь файла: ${item.label}`);
      uploaded[item.key] = result.key;
      msg.textContent = `${item.label} загружен.`;
    }

    msg.textContent = 'Сохранение карточки бита...';
    await api('admin/beats', {method:'POST', body:JSON.stringify({...fields,...uploaded})});

    form.reset();
    setUploadStep(1);
    const defaults = {genre:'Trap',bpm:140,musical_key:'Am',mp3_price:500,wav_price:1000,stems_price:2000};
    for (const [name,value] of Object.entries(defaults)) {
      const field = form.elements.namedItem(name);
      if (field) field.value = value;
    }
    msg.textContent = 'Бит сохранён.';
    toast('Бит добавлен в каталог');
    await loadCatalog();
    switchAdminTab('manage');
  } catch(err) {
    msg.textContent = `Ошибка: ${err.message}`;
    toast(err.message,true);
  } finally {
    submitButton.disabled = false;
  }
});

$('#profileLogout').onclick=async()=>{try{await api('auth/logout',{method:'POST',body:'{}'});state.user=null;state.admin=false;state.favorites=[];updateFavoriteCount();$('#profileOpen').textContent='Вход';$('#adminPanelOpen').classList.add('hidden');$('#profileApp').classList.add('hidden');$('#adminApp').classList.add('hidden');$('#adminLogin').classList.remove('hidden');hideModal('adminModal');toast('Вы вышли из аккаунта');}catch(e){toast(e.message||'Не удалось выйти',true)}};
$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>switchAdminTab(b.dataset.tab)));
$('#playlistForm')?.addEventListener('submit',createPlaylist);
['playlistSearch','playlistGenre','playlistSort'].forEach(id=>$('#'+id)?.addEventListener(id==='playlistSearch'?'input':'change',renderPlaylists));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>{
  const x=b.dataset.close;
  if(x==='cart')hideModal('cartDrawer');
  else if(x==='favorites')hideModal('favoritesModal');
  else hideModal(({checkout:'checkoutModal',order:'orderModal',admin:'adminModal'})[x]);
}));
$('#year').textContent=new Date().getFullYear();
loadSiteContent();
if(document.body.classList.contains('admin-page')){openAdmin();} else {checkAuth();}
loadPlaylists();

renderCart();
initGlobalPlayer();
loadCatalog();
