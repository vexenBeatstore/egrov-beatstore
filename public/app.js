
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const state = { beats: [], cart: [], botUsername: "VEXENBeatStoreBot", admin: false, orderToken: localStorage.getItem("vexen_order_token") || "", lastOrder: null };
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
  const d=Math.min(90,Math.max(0,Number(beat.discount)||0));
  return Math.round(p*(100-d)/100);
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
    ctx.fillStyle=(i/count)<=progress?'#c5ff3d':'#65705e';ctx.globalAlpha=(i/count)<=progress?1:.78;
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
  audio.addEventListener('ended',()=>{$('#globalPlayerStatus').textContent='';$('#globalPlay').textContent='▶';document.querySelectorAll('.card-play').forEach(b=>{b.classList.remove('is-playing');b.textContent='▶';b.setAttribute('aria-label','Воспроизвести')});drawWaveform()});
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
    return `<article class="beat-row"><div class="track-identity"><span class="track-number">${String(i+1).padStart(2,'0')}</span><div class="track-copy"><h3 class="beat-title">${esc(b.title)}</h3><div class="track-mobile-meta">${esc(b.genre||'Beat')} · ${esc(b.bpm)} BPM</div></div></div><div class="track-details"><span>${esc(b.genre||'—')}</span><b>${esc(b.bpm||'—')} BPM</b><span>${esc(b.musical_key||'—')}</span></div><div class="track-license"><select class="license-select" aria-label="Лицензия для ${esc(b.title)}" data-beat="${b.id}" ${licenses.length?'':'disabled'}>${licenses.map(k=>`<option value="${k}">${({mp3:'MP3',wav:'WAV',stems:'WAV + STEMS'})[k]} · ${rub(finalPrice(b,k))}</option>`).join('')}</select></div><div class="track-actions">${b.demo_key?`<button class="card-play" type="button" data-play-beat="${b.id}" aria-label="Воспроизвести ${esc(b.title)}" title="Воспроизвести">▶</button>`:`<span class="no-demo">НЕТ ДЕМО</span>`}<button class="add-btn" data-add="${b.id}" ${licenses.length?'':'disabled'}>＋ <span>В КОРЗИНУ</span></button></div></article>`
  }).join('');
  $$('[data-play-beat]',grid).forEach(btn=>btn.addEventListener('click',()=>{const b=state.beats.find(x=>x.id===Number(btn.dataset.playBeat));selectBeatForPlayer(b,true)}));
  $$('[data-add]',grid).forEach(btn=>btn.addEventListener('click',()=>{const b=state.beats.find(x=>x.id===Number(btn.dataset.add));const select=$(`.license-select[data-beat="${b.id}"]`,grid);addToCart(b,select.value);}));
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
function openAdmin(){showModal('adminModal');loadTelegramLogin();checkAdmin()}
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
    await checkAdmin();
  }catch(e){toast(e.message,true)}
};
async function checkAdmin(){
  try{
    await api('auth/me');
    state.admin=true;
    $('#adminLogin').classList.add('hidden');
    $('#adminApp').classList.remove('hidden');
    loadAdminBeats();
  }catch{
    state.admin=false;
    $('#adminLogin').classList.remove('hidden');
    $('#adminApp').classList.add('hidden');
  }
}
function switchAdminTab(tab){
  $$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  $$('.admin-pane').forEach(p=>p.classList.add('hidden'));
  $('#admin'+tab[0].toUpperCase()+tab.slice(1)).classList.remove('hidden');
  if(tab==='orders')loadAdminOrders();
  if(tab==='manage')loadAdminBeats();
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
    $('#adminManage').innerHTML=d.beats.length?'<div class="admin-beat-list">'+d.beats.map(b=>`<div class="admin-beat"><div><strong>#${b.id} · ${esc(b.title)}</strong><small>${esc(b.genre)} · ${b.bpm} BPM · скидка ${b.discount}% · ${b.active?'в продаже':'снят с продажи'}</small></div><div class="admin-actions"><button class="small-btn" data-edit="${b.id}">Изменить</button>${b.active?`<button class="small-btn danger" data-hide="${b.id}">Скрыть</button>`:`<button class="small-btn relist-btn" data-show="${b.id}">Выгрузить повторно ↗</button>`}</div></div>`).join('')+'</div>':'<p class="hint">Битов пока нет. Добавь первый бит во вкладке «Добавить бит».</p>';
    $$('[data-edit]').forEach(b=>b.onclick=()=>editBeat(d.beats.find(x=>x.id===Number(b.dataset.edit))));
    $$('[data-hide]').forEach(b=>b.onclick=()=>toggleBeat(b.dataset.hide,false));
    $$('[data-show]').forEach(b=>b.onclick=()=>toggleBeat(b.dataset.show,true));
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
  const discount=prompt('Скидка % (0–90):',b.discount);if(discount===null)return;
  const description=prompt('Описание:',b.description||'');if(description===null)return;
  try{
    await api(`admin/beats/${b.id}`,{method:'PUT',body:JSON.stringify({...b,title,genre,bpm:Number(bpm),musical_key:key,mp3_price:Number(mp3),wav_price:Number(wav),stems_price:Number(stems),discount:Number(discount),description})});
    toast('Бит обновлён');
    loadAdminBeats();
    loadCatalog();
  }catch(e){toast(e.message,true)}
}
$('#search').addEventListener('input',renderCatalog);$('#sortOrder')?.addEventListener('change',renderCatalog);
$('#genreFilter').addEventListener('change',renderCatalog);
$('#cartOpen').onclick=()=>$('#cartDrawer').classList.remove('hidden');
$('#checkoutOpen').onclick=()=>{
  if(!cartResolved().length)return;
  $('#checkoutResult').classList.add('hidden');
  $('#checkoutForm').classList.remove('hidden');
  showModal('checkoutModal');
};
$('#checkoutForm').addEventListener('submit',checkout);
$('#adminOpen').onclick=openAdmin;
$('#myOrderOpen').onclick=showOrder;
$('#footerOrderOpen').onclick=showOrder;


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
      artist: 'VEXEN',
      genre: getValue('genre') || 'Trap',
      bpm: Number(getValue('bpm')) || 140,
      musical_key: getValue('musical_key') || 'Am',
      description: getValue('description'),
      mp3_price: Number(getValue('mp3_price')) || 0,
      wav_price: Number(getValue('wav_price')) || 0,
      stems_price: Number(getValue('stems_price')) || 0,
      discount: Number(getValue('discount')) || 0
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
    const defaults = {genre:'Trap',bpm:140,musical_key:'Am',mp3_price:500,wav_price:1000,stems_price:2000,discount:0};
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

$('#adminLogout').onclick=async()=>{
  await api('auth/logout',{method:'POST',body:'{}'});
  state.admin=false;
  checkAdmin();
  toast('Вы вышли из админ-панели');
};
$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>switchAdminTab(b.dataset.tab)));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>{
  const x=b.dataset.close;
  if(x==='cart')hideModal('cartDrawer');
  else hideModal(({checkout:'checkoutModal',order:'orderModal',admin:'adminModal'})[x]);
}));
$('#year').textContent=new Date().getFullYear();

renderCart();
initGlobalPlayer();
loadCatalog();
