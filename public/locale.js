/* EGROV BeatStore locale layer. Display-only currency conversion; server prices remain RUB. */
(() => {
  'use strict';
  const LOCALES = {
    'ru-RU': { lang:'ru', currency:'RUB', symbol:'₽', rate:1, flag:'RU' },
    'en-US': { lang:'en', currency:'USD', symbol:'$', rate:0.011, flag:'US' },
    'en-GB': { lang:'en', currency:'GBP', symbol:'£', rate:0.0087, flag:'GB' },
    'de-DE': { lang:'de', currency:'EUR', symbol:'€', rate:0.010, flag:'DE' },
    'fr-FR': { lang:'fr', currency:'EUR', symbol:'€', rate:0.010, flag:'FR' },
    'es-ES': { lang:'es', currency:'EUR', symbol:'€', rate:0.010, flag:'ES' }
  };
  const common = {
    'Плейлисты':'Playlists','Каталог':'Catalog','Лицензии':'Licenses','Услуги':'Services','О магазине':'About','Избранное':'Favorites','Мой заказ':'My order','Вход':'Sign in','Профиль':'Profile','Админ-панель':'Admin panel','Корзина':'Cart','ПЛЕЙЛИСТЫ':'PLAYLISTS','КАТАЛОГ БИТОВ':'BEAT CATALOG','УСЛУГИ':'SERVICES','ОПИСАНИЕ':'LICENSE','ЛИЦЕНЗИЙ':'DESCRIPTIONS','Поиск плейлистов...':'Search playlists...','Все жанры':'All genres','Сначала новые':'Newest first','По названию':'By title','Плейлисты не найдены.':'No playlists found.','БИТОВ':'BEATS','ОБЗОР':'OVERVIEW','◈ Все биты':'◈ All beats','ЖАНРЫ':'GENRES','НОВЫЕ ДЕМО ДОБАВЛЯЮТСЯ РЕГУЛЯРНО':'NEW DEMOS ADDED REGULARLY','Поиск по названию или жанру...':'Search by title or genre...','Поиск битов':'Search beats','Фильтр плейлистов по жанру':'Filter playlists by genre','Сортировка плейлистов':'Sort playlists','Сортировка битов':'Sort beats','СОРТИРОВКА':'SORT BY','Сначала старые':'Oldest first','Сначала дешевле':'Price: low to high','Сначала дороже':'Price: high to low','ТРЕК':'TRACK','ДЕТАЛИ':'DETAILS','ЛИЦЕНЗИЯ':'LICENSE','По этому запросу битов не найдено. Попробуй изменить поиск или жанр.':'No beats found. Try changing your search or genre.','Найди свой звук: слушай демо, выбирай бит и забирай лицензию для релиза.':'Find your sound: listen to demos, choose a beat, and get a license for your release.','ВЫБРАТЬ БИТ':'CHOOSE A BEAT','СНАЧАЛА СЛУШАЙ — ПОТОМ ПОКУПАЙ':'LISTEN FIRST — BUY LATER','MP3 · WAV · STEMS — В ЗАВИСИМОСТИ ОТ ЛИЦЕНЗИИ':'MP3 · WAV · STEMS — DEPENDING ON LICENSE','ЗВУК ДЛЯ ТВОЕГО РЕЛИЗА':'SOUND FOR YOUR RELEASE','НЕ ИЩИ ПОХОЖЕЕ.':'DON’T LOOK FOR SIMILAR.','СОЗДАВАЙ СВОЁ.':'CREATE YOUR OWN.','ВСЕ ПРАВА ЗАЩИЩЕНЫ.':'ALL RIGHTS RESERVED.','Итого':'Total','ОФОРМИТЬ ЗАКАЗ':'CHECKOUT','YOUR SELECTION':'YOUR SELECTION','ORDER DETAILS':'ORDER DETAILS','ORDER STATUS':'ORDER STATUS','YOUR COLLECTION':'YOUR COLLECTION','Заказ можно открыть на этом устройстве. Сохрани ссылку или код заказа.':'You can open this order on this device. Save the link or order code.','Твой звук. Твой аккаунт.':'Your sound. Your account.','ВЫЙТИ ИЗ АККАУНТА':'SIGN OUT','БЫСТРО И БЕЗ ПАРОЛЯ':'FAST AND PASSWORD-FREE','Войди через Telegram — никаких паролей и лишних форм.':'Sign in with Telegram — no passwords or extra forms.','Безопасный вход через Telegram. Мы не получаем доступ к твоим сообщениям.':'Secure sign-in via Telegram. We do not access your messages.','Если кнопка не появилась, привяжи домен сайта к боту через @BotFather командой /setdomain.':'If the button does not appear, link your site domain to the bot via @BotFather using /setdomain.','Добавить бит':'Add beat','Заказы':'Orders','Описания лицензий':'License descriptions','Добавить услугу':'Add service','Язык и регион':'Language and region','Выбери язык интерфейса и валюту цен.':'Choose the interface language and price currency.','Язык / регион':'Language / region','Применить':'Apply','Для этого бита демо пока не загружено.':'A demo has not been uploaded for this beat yet.','Не удалось воспроизвести демо. Проверь аудиофайл.':'Could not play demo. Check the audio file.','Сначала выбери бит в каталоге.':'Choose a beat from the catalog first.','Не удалось запустить демо.':'Could not start the demo.','Демо не загрузилось. Проверь файл в админ-панели.':'Demo failed to load. Check the file in the admin panel.','Без названия':'Untitled','Выбери бит':'Choose a beat','Громкость':'Volume','Пауза':'Pause','Воспроизвести':'Play','Продолжить':'Resume','Валюта':'Currency','Сохранить':'Save','Отмена':'Cancel','Удалить':'Delete','Редактировать':'Edit','Добавить':'Add','Описание':'Description','Цена':'Price','Название':'Title','Жанр':'Genre','Файл':'File','Загрузка':'Uploading','Загружаем каталог':'Loading catalog','Загружаем плейлисты':'Loading playlists','Загружаем коллекцию…':'Loading collection…','НЕТ ДЕМО':'NO DEMO','В КОРЗИНУ':'ADD TO CART','Добавить в избранное':'Add to favorites','Избранное':'Favorites','Корзина пуста':'Your cart is empty','Корзина':'Cart','Оформление заказа':'Checkout','Как к тебе обращаться':'Your name','Имя':'Name','Telegram для связи *':'Telegram contact *','@username':'@username','В комментарии к переводу обязательно укажи свой Telegram username, номер заказа и выбранную лицензию. Полные файлы отправляются вручную в Telegram после проверки оплаты.':'Include your Telegram username, order number and selected license in the payment note. Full files are sent manually via Telegram after payment is verified.','ПЕРЕЙТИ К ОПЛАТЕ':'PROCEED TO PAYMENT','Список услуг скоро появится.':'Services will be listed here soon.','Описание не добавлено':'No description added','Активна':'Active','Скрыта':'Hidden','Редактировать услугу':'Edit service','Добавить услугу':'Add service','Лицензия':'License','Сохранено':'Saved','Услуга удалена':'Service deleted','Услуга обновлена':'Service updated','Услуга добавлена':'Service added','Описание лицензии сохранено':'License description saved','Подтвердить оплату':'Confirm payment','Отметить выданным':'Mark as delivered','Заказов пока нет.':'No orders yet.','Подтвердить, что деньги реально поступили?':'Confirm that the money has actually arrived?','Оплата подтверждена · бит снят с продажи':'Payment confirmed · beat removed from sale','Заказ отмечен выданным':'Order marked as delivered','Сначала создай плейлист во вкладке «Плейлисты».':'Create a playlist in the “Playlists” tab first.','В какой плейлист добавить бит? Введи номер:':'Which playlist should this beat be added to? Enter the number:','Неверный номер плейлиста.':'Invalid playlist number.','Бит добавлен в':'Beat added to','Удалить бит из каталога? Он будет снят с продажи и исчезнет из плейлистов.':'Delete this beat from the catalog? It will be taken off sale and removed from playlists.','Бит удалён из каталога':'Beat removed from catalog','Бит восстановлен':'Beat restored','Бит скрыт из каталога':'Beat hidden from catalog','Бит обновлён':'Beat updated','Войди через Telegram, чтобы пользоваться избранным.':'Sign in with Telegram to use favorites.','Вы вышли из аккаунта':'You have signed out','Не удалось выйти':'Could not sign out','Файл не выбран':'No file selected','Сохранение карточки бита...':'Saving beat...','Бит сохранён.':'Beat saved.','Бит добавлен в каталог':'Beat added to catalog','Каталог пока пуст':'The catalog is empty','Добавь первый бит — он появится здесь отдельной строкой.':'Add the first beat — it will appear here.','Снять с продажи':'Take off sale','Выгрузить повторно':'Republish','В плейлист':'Add to playlist','Изменить':'Edit','Удалить':'Delete','Пока нет добавленных услуг.':'No services added yet.','MP3':'MP3','WAV':'WAV','WAV + STEMS':'WAV + STEMS','Стандартная лицензия MP3.':'Standard MP3 license.','Высокое качество звука в WAV.':'High-quality WAV audio.','Отдельные дорожки для гибкой работы со сведением.':'Separate stems for flexible mixing.','Все жанры':'All genres','Здесь пока пусто':'Nothing here yet','Ошибка':'Error','Применить':'Apply','Закрыть':'Close','Условия лицензии':'License terms','Показать условия лицензии':'Show license terms','Скрыть условия лицензии':'Hide license terms','ПОДРОБНЕЕ':'MORE DETAILS','ПРОДОЛЖИТЬ':'CONTINUE','НАЗАД':'BACK','ПОДТВЕРДИТЬ':'CONFIRM','ОТМЕНА':'CANCEL','ОБНОВИТЬ':'UPDATE','АКТИВНА':'ACTIVE','СКРЫТА':'HIDDEN','В ПРОДАЖЕ':'ON SALE','СНЯТ С ПРОДАЖИ':'OFF SALE','Нет доступных лицензий':'No licenses available','В избранное':'Add to favorites','Убрать из избранного':'Remove from favorites','СЛУШАТЬ ПОДБОРКУ':'PLAY COLLECTION','бита':'beat','битов':'beats','плейлистов':'playlists','Загрузка:':'Uploading:','загружен.':'uploaded.','Ошибка:':'Error:','Бит сохранён.':'Beat saved.','Услуга сохранена':'Service saved'
  };
  const dictionaries = {
    en: common,
    de: Object.assign({}, common, {'Playlists':'Playlists','Catalog':'Katalog','Licenses':'Lizenzen','Services':'Dienstleistungen','About':'Über uns','Favorites':'Favoriten','My order':'Meine Bestellung','Sign in':'Anmelden','Profile':'Profil','Admin panel':'Adminbereich','Cart':'Warenkorb','PLAYLISTS':'PLAYLISTS','BEAT CATALOG':'BEAT-KATALOG','SERVICES':'DIENSTLEISTUNGEN','LICENSE DESCRIPTIONS':'LIZENZBESCHREIBUNGEN','Search playlists...':'Playlists suchen...','All genres':'Alle Genres','Newest first':'Neueste zuerst','By title':'Nach Titel','No playlists found.':'Keine Playlists gefunden.','BEATS':'BEATS','OVERVIEW':'ÜBERSICHT','GENRES':'GENRES','Search by title or genre...':'Nach Titel oder Genre suchen...','Oldest first':'Älteste zuerst','Price: low to high':'Preis aufsteigend','Price: high to low':'Preis absteigend','TRACK':'TRACK','DETAILS':'DETAILS','LICENSE':'LIZENZ','Total':'Gesamt','CHECKOUT':'ZUR KASSE','Language and region':'Sprache und Region','Choose the interface language and price currency.':'Sprache und Währung wählen.','Apply':'Anwenden','Add beat':'Beat hinzufügen','Orders':'Bestellungen','Sign out':'Abmelden','Untitled':'Ohne Titel','Choose a beat':'Beat auswählen','Description':'Beschreibung','Price':'Preis','Title':'Titel','Genre':'Genre','Loading catalog':'Katalog wird geladen','Loading playlists':'Playlists werden geladen','Your cart is empty':'Dein Warenkorb ist leer','Your name':'Dein Name','Name':'Name','Proceed to payment':'Weiter zur Zahlung'}),
    fr: Object.assign({}, common, {'Playlists':'Playlists','Catalog':'Catalogue','Licenses':'Licences','Services':'Services','About':'À propos','Favorites':'Favoris','My order':'Ma commande','Sign in':'Connexion','Profile':'Profil','Admin panel':'Administration','Cart':'Panier','PLAYLISTS':'PLAYLISTS','BEAT CATALOG':'CATALOGUE DE BEATS','Search playlists...':'Rechercher des playlists...','All genres':'Tous les genres','Newest first':'Plus récents','By title':'Par titre','No playlists found.':'Aucune playlist trouvée.','BEATS':'BEATS','OVERVIEW':'APERÇU','GENRES':'GENRES','Search by title or genre...':'Rechercher par titre ou genre...','Oldest first':'Plus anciens','Price: low to high':'Prix croissant','Price: high to low':'Prix décroissant','TRACK':'PISTE','DETAILS':'DÉTAILS','LICENSE':'LICENCE','Total':'Total','CHECKOUT':'COMMANDER','Language and region':'Langue et région','Choose the interface language and price currency.':'Choisissez la langue et la devise.','Apply':'Appliquer','Add beat':'Ajouter un beat','Orders':'Commandes','Untitled':'Sans titre','Choose a beat':'Choisir un beat','Description':'Description','Price':'Prix','Title':'Titre','Genre':'Genre','Loading catalog':'Chargement du catalogue','Loading playlists':'Chargement des playlists','Your cart is empty':'Votre panier est vide','Your name':'Votre nom','Name':'Nom','Proceed to payment':'Passer au paiement'}),
    es: Object.assign({}, common, {'Playlists':'Listas','Catalog':'Catálogo','Licenses':'Licencias','Services':'Servicios','About':'Acerca de','Favorites':'Favoritos','My order':'Mi pedido','Sign in':'Iniciar sesión','Profile':'Perfil','Admin panel':'Administración','Cart':'Carrito','PLAYLISTS':'LISTAS','BEAT CATALOG':'CATÁLOGO DE BEATS','Search playlists...':'Buscar listas...','All genres':'Todos los géneros','Newest first':'Más recientes','By title':'Por título','No playlists found.':'No se encontraron listas.','BEATS':'BEATS','OVERVIEW':'VISTA GENERAL','GENRES':'GÉNEROS','Search by title or genre...':'Buscar por título o género...','Oldest first':'Más antiguos','Price: low to high':'Precio: menor a mayor','Price: high to low':'Precio: mayor a menor','TRACK':'PISTA','DETAILS':'DETALLES','LICENSE':'LICENCIA','Total':'Total','CHECKOUT':'FINALIZAR COMPRA','Language and region':'Idioma y región','Choose the interface language and price currency.':'Elige el idioma y la moneda.','Apply':'Aplicar','Add beat':'Añadir beat','Orders':'Pedidos','Untitled':'Sin título','Choose a beat':'Elige un beat','Description':'Descripción','Price':'Precio','Title':'Título','Genre':'Género','Loading catalog':'Cargando catálogo','Loading playlists':'Cargando listas','Your cart is empty':'Tu carrito está vacío','Your name':'Tu nombre','Name':'Nombre','Proceed to payment':'Continuar al pago'})
  };
  const STORAGE_KEY = 'egrov_locale';
  let locale = localStorage.getItem(STORAGE_KEY) || 'ru-RU';
  const originals = new WeakMap();
  const originalAttrs = new WeakMap();
  const config = () => LOCALES[locale] || LOCALES['ru-RU'];
  const dictionary = () => dictionaries[config().lang] || {};
  function replaceFrom(out, d) {
    Object.keys(d).sort((a,b)=>b.length-a.length).forEach(k => {
      if (k.length > 1 && out.includes(k)) out = out.split(k).join(d[k]);
    });
    return out;
  }
  function translate(source) {
    if (!source || !source.trim()) return source;
    // First map Russian source strings to English keys, then localize those English strings.
    let out = replaceFrom(source, common);
    if (config().lang !== 'en') out = replaceFrom(out, dictionaries[config().lang] || {});
    return out;
  }
  function convertPrices(source) {
    const c = config();
    if (!source.includes('₽') || c.currency === 'RUB') return source;
    return source.replace(/([−-]?\d[\d\u00a0\u202f\s]*(?:[.,]\d{1,2})?)\s*₽/g, (whole, number) => {
      const n = Number(number.replace(/[\u00a0\u202f\s]/g,'').replace(',','.'));
      if (!Number.isFinite(n)) return whole.replace('₽', c.symbol);
      return new Intl.NumberFormat(locale,{style:'currency',currency:c.currency,maximumFractionDigits:2}).format(n*c.rate);
    });
  }
  function processText(node) {
    if (node.nodeType !== Node.TEXT_NODE) return;
    if (!originals.has(node)) originals.set(node, node.nodeValue);
    const source = originals.get(node);
    const value = convertPrices(translate(source));
    if (node.nodeValue !== value) node.nodeValue = value;
  }
  function processElement(el) {
    if (el.nodeType !== Node.ELEMENT_NODE) return;
    const attrs = ['placeholder','aria-label','title','alt'];
    let saved = originalAttrs.get(el);
    if (!saved) { saved = {}; originalAttrs.set(el,saved); }
    attrs.forEach(attr => {
      if (el.hasAttribute(attr)) {
        if (!(attr in saved)) saved[attr] = el.getAttribute(attr);
        const value = translate(saved[attr]);
        if (el.getAttribute(attr) !== value) el.setAttribute(attr,value);
      }
    });
    if (el.tagName === 'INPUT' && ['button','submit'].includes(el.type) && el.value) {
      if (!('value' in saved)) saved.value = el.value;
      el.value = translate(saved.value);
    }
    [...el.childNodes].forEach(n => { if (n.nodeType === Node.TEXT_NODE) processText(n); });
  }
  function applyLocale() {
    document.documentElement.lang = config().lang;
    document.querySelectorAll('body *').forEach(processElement);
    const button = document.getElementById('regionOpen');
    if (button) button.textContent = `🌐 ${config().flag} · ${config().symbol}`;
    const select = document.getElementById('regionLocale');
    if (select) select.value = locale;
    localStorage.setItem(STORAGE_KEY, locale);
  }
  function init() {
    const open = document.getElementById('regionOpen');
    const modal = document.getElementById('regionModal');
    const select = document.getElementById('regionLocale');
    if (!open || !modal || !select) return;
    select.value = locale;
    open.addEventListener('click', () => modal.classList.remove('hidden'));
    modal.querySelectorAll('[data-close="region"]').forEach(el => el.addEventListener('click', () => modal.classList.add('hidden')));
    document.getElementById('regionApply').addEventListener('click', () => {
      locale = LOCALES[select.value] ? select.value : 'ru-RU';
      applyLocale(); modal.classList.add('hidden');
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.add('hidden'); });
    const observer = new MutationObserver(records => records.forEach(record => {
      if (record.type === 'characterData') processText(record.target);
      else record.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) processText(node);
        else if (node.nodeType === Node.ELEMENT_NODE) { processElement(node); node.querySelectorAll('*').forEach(processElement); }
      });
    }));
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    applyLocale();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
