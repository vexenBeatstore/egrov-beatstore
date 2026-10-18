(() => {
  const settings = {
    'ru-RU': { lang:'ru', currency:'RUB', symbol:'₽', rate:1, flag:'RU' },
    'en-US': { lang:'en', currency:'USD', symbol:'$', rate:0.011, flag:'US' },
    'en-GB': { lang:'en', currency:'GBP', symbol:'£', rate:0.0087, flag:'GB' },
    'de-DE': { lang:'de', currency:'EUR', symbol:'€', rate:0.010, flag:'DE' },
    'fr-FR': { lang:'fr', currency:'EUR', symbol:'€', rate:0.010, flag:'FR' },
    'es-ES': { lang:'es', currency:'EUR', symbol:'€', rate:0.010, flag:'ES' }
  };
  const dictionaries = {
    en: {
      'Плейлисты':'Playlists','Каталог':'Catalog','Лицензии':'Licenses','Услуги':'Services','О магазине':'About','Избранное':'Favorites','Мой заказ':'My order','Вход':'Sign in','Профиль':'Profile','Админ-панель':'Admin panel','Корзина':'Cart',
      'ПЛЕЙЛИСТЫ':'PLAYLISTS','КАТАЛОГ БИТОВ':'BEAT CATALOG','УСЛУГИ':'SERVICES','ОПИСАНИЕ':'LICENSE','ЛИЦЕНЗИЙ':'DESCRIPTIONS','Поиск плейлистов...':'Search playlists...','Все жанры':'All genres','Сначала новые':'Newest first','По названию':'By title','Плейлисты не найдены.':'No playlists found.','БИТОВ':'BEATS','ОБЗОР':'OVERVIEW','◈ Все биты':'◈ All beats','ЖАНРЫ':'GENRES','НОВЫЕ ДЕМО ДОБАВЛЯЮТСЯ РЕГУЛЯРНО':'NEW DEMOS ADDED REGULARLY','Поиск по названию или жанру...':'Search by title or genre...','Сортировка':'Sort','СОРТИРОВКА':'SORT BY','Сначала старые':'Oldest first','Сначала дешевле':'Price: low to high','Сначала дороже':'Price: high to low','ТРЕК':'TRACK','ДЕТАЛИ':'DETAILS','ЛИЦЕНЗИЯ':'LICENSE','По этому запросу битов не найдено. Попробуй изменить поиск или жанр.':'No beats found. Try changing your search or genre.',
      'Найди свой звук: слушай демо, выбирай бит и забирай лицензию для релиза.':'Find your sound: listen to demos, choose a beat, and get a license for your release.','ВЫБРАТЬ БИТ':'CHOOSE A BEAT','СНАЧАЛА СЛУШАЙ — ПОТОМ ПОКУПАЙ':'LISTEN FIRST — BUY LATER','Итого':'Total','ОФОРМИТЬ ЗАКАЗ':'CHECKOUT','YOUR SELECTION':'YOUR SELECTION','ORDER STATUS':'ORDER STATUS','Заказ можно открыть на этом устройстве. Сохрани ссылку или код заказа.':'You can open this order on this device. Save the link or order code.','Твой звук. Твой аккаунт.':'Your sound. Your account.','ВЫЙТИ ИЗ АККАУНТА':'SIGN OUT','БЫСТРО И БЕЗ ПАРОЛЯ':'FAST AND PASSWORD-FREE','Войди через Telegram — никаких паролей и лишних форм.':'Sign in with Telegram — no passwords or extra forms.','Безопасный вход через Telegram. Мы не получаем доступ к твоим сообщениям.':'Secure sign-in via Telegram. We do not access your messages.','Добавить бит':'Add beat','Заказы':'Orders','Плейлисты':'Playlists','Описания лицензий':'License descriptions','Добавить услугу':'Add service','Язык и регион':'Language and region','Выбери язык интерфейса и валюту цен.':'Choose the interface language and price currency.','Язык / регион':'Language / region','Применить':'Apply','Для этого бита демо пока не загружено.':'A demo has not been uploaded for this beat yet.','Не удалось воспроизвести демо. Проверь аудиофайл.':'Could not play demo. Check the audio file.','Сначала выбери бит в каталоге.':'Choose a beat from the catalog first.','Не удалось запустить демо.':'Could not start the demo.','Демо не загрузилось. Проверь файл в админ-панели.':'Demo failed to load. Check the file in the admin panel.','Без названия':'Untitled','Выбери бит':'Choose a beat','Громкость':'Volume','Пауза':'Pause','Воспроизвести':'Play','Продолжить':'Resume','Валюта':'Currency','Сохранить':'Save','Отмена':'Cancel','Удалить':'Delete','Редактировать':'Edit','Добавить':'Add','Описание':'Description','Цена':'Price','Название':'Title','Жанр':'Genre','Файл':'File','Загрузка':'Loading','Загружаем каталог':'Loading catalog','Загружаем плейлисты':'Loading playlists'
    },
    de: {
      'Плейлисты':'Playlists','Каталог':'Katalog','Лицензии':'Lizenzen','Услуги':'Services','О магазине':'Über den Shop','Избранное':'Favoriten','Мой заказ':'Meine Bestellung','Вход':'Anmelden','Профиль':'Profil','Админ-панель':'Adminbereich','Корзина':'Warenkorb','ПЛЕЙЛИСТЫ':'PLAYLISTS','КАТАЛОГ БИТОВ':'BEAT-KATALOG','УСЛУГИ':'SERVICES','Поиск плейлистов...':'Playlists suchen...','Все жанры':'Alle Genres','Сначала новые':'Neueste zuerst','По названию':'Nach Titel','Плейлисты не найдены.':'Keine Playlists gefunden.','БИТОВ':'BEATS','ОБЗОР':'ÜBERSICHT','◈ Все биты':'◈ Alle Beats','ЖАНРЫ':'GENRES','Поиск по названию или жанру...':'Nach Titel oder Genre suchen...','Сначала старые':'Älteste zuerst','Сначала дешевле':'Preis aufsteigend','Сначала дороже':'Preis absteigend','ТРЕК':'TRACK','ДЕТАЛИ':'DETAILS','ЛИЦЕНЗИЯ':'LIZENZ','Итого':'Gesamt','ОФОРМИТЬ ЗАКАЗ':'BESTELLEN','Язык и регион':'Sprache und Region','Выбери язык интерфейса и валюту цен.':'Wähle die Sprache und Währung.','Язык / регион':'Sprache / Region','Применить':'Anwenden','Добавить бит':'Beat hinzufügen','Заказы':'Bestellungen','Профиль':'Profil','ВЫЙТИ ИЗ АККАУНТА':'ABMELDEN','Без названия':'Ohne Titel','Выбери бит':'Beat auswählen'
    },
    fr: {
      'Плейлисты':'Playlists','Каталог':'Catalogue','Лицензии':'Licences','Услуги':'Services','О магазине':'À propos','Избранное':'Favoris','Мой заказ':'Ma commande','Вход':'Connexion','Профиль':'Profil','Админ-панель':'Administration','Корзина':'Panier','ПЛЕЙЛИСТЫ':'PLAYLISTS','КАТАЛОГ БИТОВ':'CATALOGUE DE BEATS','УСЛУГИ':'SERVICES','Поиск плейлистов...':'Rechercher des playlists...','Все жанры':'Tous les genres','Сначала новые':'Plus récents','По названию':'Par titre','Плейлисты не найдены.':'Aucune playlist trouvée.','БИТОВ':'BEATS','ОБЗОР':'APERÇU','◈ Все биты':'◈ Tous les beats','ЖАНРЫ':'GENRES','Поиск по названию или жанру...':'Rechercher par titre ou genre...','Сначала старые':'Plus anciens','Сначала дешевле':'Prix croissant','Сначала дороже':'Prix décroissant','ТРЕК':'PISTE','ДЕТАЛИ':'DÉTAILS','ЛИЦЕНЗИЯ':'LICENCE','Итого':'Total','ОФОРМИТЬ ЗАКАЗ':'COMMANDER','Язык и регион':'Langue et région','Выбери язык интерфейса и валюту цен.':'Choisissez la langue et la devise.','Язык / регион':'Langue / région','Применить':'Appliquer','Добавить бит':'Ajouter un beat','Заказы':'Commandes','Без названия':'Sans titre','Выбери бит':'Choisir un beat'
    },
    es: {
      'Плейлисты':'Listas','Каталог':'Catálogo','Лицензии':'Licencias','Услуги':'Servicios','О магазине':'Acerca de','Избранное':'Favoritos','Мой заказ':'Mi pedido','Вход':'Iniciar sesión','Профиль':'Perfil','Админ-панель':'Administración','Корзина':'Carrito','ПЛЕЙЛИСТЫ':'LISTAS','КАТАЛОГ БИТОВ':'CATÁLOGO DE BEATS','УСЛУГИ':'SERVICIOS','Поиск плейлистов...':'Buscar listas...','Все жанры':'Todos los géneros','Сначала новые':'Más recientes','По названию':'Por título','Плейлисты не найдены.':'No se encontraron listas.','БИТОВ':'BEATS','ОБЗОР':'VISTA GENERAL','◈ Все биты':'◈ Todos los beats','ЖАНРЫ':'GÉNEROS','Поиск по названию или жанру...':'Buscar por título o género...','Сначала старые':'Más antiguos','Сначала дешевле':'Precio: menor a mayor','Сначала дороже':'Precio: mayor a menor','ТРЕК':'PISTA','ДЕТАЛИ':'DETALLES','ЛИЦЕНЗИЯ':'LICENCIA','Итого':'Total','ОФОРМИТЬ ЗАКАЗ':'FINALIZAR COMPRA','Язык и регион':'Idioma y región','Выбери язык интерфейса и валюту цен.':'Elige el idioma y la moneda.','Язык / регион':'Idioma / región','Применить':'Aplicar','Добавить бит':'Añadir beat','Заказы':'Pedidos','Без названия':'Sin título','Выбери бит':'Elige un beat'
    }
  };
  const key = 'egrov_locale';
  let locale = localStorage.getItem(key) || 'ru-RU';
  const originalText = new WeakMap(), originalAttrs = new WeakMap(), convertedNodes = new WeakMap();
  const config = () => settings[locale] || settings['ru-RU'];
  const dict = () => dictionaries[config().lang] || {};
  function translateString(source) {
    if (!source || !source.trim()) return source;
    const d=dict(); const trimmed=source.trim();
    if (d[trimmed]) return source.replace(trimmed,d[trimmed]);
    // Translate combined labels without disturbing counts or markup-generated fragments.
    let out=source;
    Object.keys(d).sort((a,b)=>b.length-a.length).forEach(k=>{ if(k.length>2 && out.includes(k)) out=out.split(k).join(d[k]); });
    return out;
  }
  function convertPrice(source) {
    const c=config();
    if(c.currency==='RUB') return source.replace(/\s*₽/g,' ₽');
    if(!source.includes('₽')) return source;
    const numMatch=source.match(/-?\d[\d\s.,]*/);
    if(!numMatch) return source.replace(/₽/g,c.symbol);
    const raw=numMatch[0].replace(/\s/g,'').replace(/,(?=\d{1,2}$)/,'.').replace(/\.(?=.*\.)/g,'');
    const n=Number(raw); if(!Number.isFinite(n)) return source.replace(/₽/g,c.symbol);
    const formatted=new Intl.NumberFormat(locale,{style:'currency',currency:c.currency,maximumFractionDigits:2}).format(n*c.rate);
    return source.replace(numMatch[0],formatted).replace(/\s*₽/g,'').replace(/[₽]/g,'');
  }
  function processTextNode(node) {
    if(!node || node.nodeType!==Node.TEXT_NODE) return;
    if(!originalText.has(node)) originalText.set(node,node.nodeValue);
    const original=originalText.get(node);
    let value=translateString(original);
    value=convertPrice(value);
    if(node.nodeValue!==value) node.nodeValue=value;
  }
  function processElement(el) {
    if(el.nodeType!==Node.ELEMENT_NODE) return;
    for(const attr of ['placeholder','aria-label','title']) {
      if(el.hasAttribute(attr)) {
        let map=originalAttrs.get(el); if(!map){map={};originalAttrs.set(el,map)}
        if(!(attr in map)) map[attr]=el.getAttribute(attr);
        const v=translateString(map[attr]); if(el.getAttribute(attr)!==v)el.setAttribute(attr,v);
      }
    }
    if(el.matches('input,textarea,select,option,button,a,label,p,span,strong,small,h1,h2,h3,h4,div')) {
      for(const n of el.childNodes) if(n.nodeType===Node.TEXT_NODE) processTextNode(n);
    }
  }
  function applyLocale() {
    document.documentElement.lang=config().lang;
    document.querySelectorAll('body *').forEach(processElement);
    const button=document.getElementById('regionOpen'); if(button) button.textContent=`🌐 ${config().flag} · ${config().symbol}`;
    const select=document.getElementById('regionLocale'); if(select)select.value=locale;
    localStorage.setItem(key,locale);
  }
  function init() {
    const open=document.getElementById('regionOpen'), modal=document.getElementById('regionModal'), select=document.getElementById('regionLocale');
    if(!open||!modal||!select)return;
    select.value=locale;
    open.addEventListener('click',()=>modal.classList.remove('hidden'));
    modal.querySelectorAll('[data-close="region"]').forEach(el=>el.addEventListener('click',()=>modal.classList.add('hidden')));
    document.getElementById('regionApply').addEventListener('click',()=>{locale=settings[select.value]?select.value:'ru-RU';applyLocale();modal.classList.add('hidden');});
    const observer=new MutationObserver(records=>{for(const record of records){if(record.type==='characterData')processTextNode(record.target);else record.addedNodes.forEach(n=>{if(n.nodeType===Node.TEXT_NODE)processTextNode(n);else if(n.nodeType===Node.ELEMENT_NODE){processElement(n);n.querySelectorAll?.('*').forEach(processElement)}})}});
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    applyLocale();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
