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
    'Плейлисты':'Playlists','Каталог':'Catalog','Лицензии':'Licenses','Услуги':'Services','О магазине':'About','Избранное':'Favorites','Мой заказ':'My order','Вход':'Sign in','Профиль':'Profile','Админ-панель':'Admin panel','Корзина':'Cart','ПЛЕЙЛИСТЫ':'PLAYLISTS','КАТАЛОГ БИТОВ':'BEAT CATALOG','УСЛУГИ':'SERVICES','ОПИСАНИЕ':'LICENSE','ЛИЦЕНЗИЙ':'DESCRIPTIONS','Поиск плейлистов...':'Search playlists...','Все жанры':'All genres','Сначала новые':'Newest first','По названию':'By title','Плейлисты не найдены.':'No playlists found.','БИТОВ':'BEATS','ОБЗОР':'OVERVIEW','◈ Все биты':'◈ All beats','ЖАНРЫ':'GENRES','НОВЫЕ ДЕМО ДОБАВЛЯЮТСЯ РЕГУЛЯРНО':'NEW DEMOS ADDED REGULARLY','Поиск по названию или жанру...':'Search by title or genre...','Поиск битов':'Search beats','Фильтр плейлистов по жанру':'Filter playlists by genre','Сортировка плейлистов':'Sort playlists','Сортировка битов':'Sort beats','СОРТИРОВКА':'SORT BY','Сначала старые':'Oldest first','Сначала дешевле':'Price: low to high','Сначала дороже':'Price: high to low','ТРЕК':'TRACK','ДЕТАЛИ':'DETAILS','ЛИЦЕНЗИЯ':'LICENSE','По этому запросу битов не найдено. Попробуй изменить поиск или жанр.':'No beats found. Try changing your search or genre.','БИТЫ ДЛЯ ТВОЕГО':'BEATS FOR YOUR','СЛЕДУЮЩЕГО РЕЛИЗА.':'NEXT RELEASE.','EGROV BeatStore — авторские биты для твоей музыки. Прослушай демо, выбери подходящую лицензию и оформи заказ. После подтверждения оплаты полные файлы будут отправлены тебе в Telegram.':'EGROV BeatStore — original beats for your music. Listen to the demos, choose the right license, and place your order. Once payment is confirmed, the full files will be sent to you on Telegram.','Найди свой звук: слушай демо, выбирай бит и забирай лицензию для релиза.':'Find your sound: listen to demos, choose a beat, and get a license for your release.','ВЫБРАТЬ БИТ':'CHOOSE A BEAT','СНАЧАЛА СЛУШАЙ — ПОТОМ ПОКУПАЙ':'LISTEN FIRST — BUY LATER','MP3 · WAV · STEMS — В ЗАВИСИМОСТИ ОТ ЛИЦЕНЗИИ':'MP3 · WAV · STEMS — DEPENDING ON LICENSE','ЗВУК ДЛЯ ТВОЕГО РЕЛИЗА':'SOUND FOR YOUR RELEASE','НЕ ИЩИ ПОХОЖЕЕ.':'DON’T LOOK FOR SIMILAR.','СОЗДАВАЙ СВОЁ.':'CREATE YOUR OWN.','ВСЕ ПРАВА ЗАЩИЩЕНЫ.':'ALL RIGHTS RESERVED.','Итого':'Total','ОФОРМИТЬ ЗАКАЗ':'CHECKOUT','YOUR SELECTION':'YOUR SELECTION','ORDER DETAILS':'ORDER DETAILS','ORDER STATUS':'ORDER STATUS','YOUR COLLECTION':'YOUR COLLECTION','Заказ можно открыть на этом устройстве. Сохрани ссылку или код заказа.':'You can open this order on this device. Save the link or order code.','Твой звук. Твой аккаунт.':'Your sound. Your account.','ВЫЙТИ ИЗ АККАУНТА':'SIGN OUT','БЫСТРО И БЕЗ ПАРОЛЯ':'FAST AND PASSWORD-FREE','Войди через Telegram — никаких паролей и лишних форм.':'Sign in with Telegram — no passwords or extra forms.','Безопасный вход через Telegram. Мы не получаем доступ к твоим сообщениям.':'Secure sign-in via Telegram. We do not access your messages.','Если кнопка не появилась, привяжи домен сайта к боту через @BotFather командой /setdomain.':'If the button does not appear, link your site domain to the bot via @BotFather using /setdomain.','Добавить бит':'Add beat','Заказы':'Orders','Описания лицензий':'License descriptions','Добавить услугу':'Add service','Язык и регион':'Language and region','Выбери язык интерфейса и валюту цен.':'Choose the interface language and price currency.','Язык / регион':'Language / region','Применить':'Apply','Для этого бита демо пока не загружено.':'A demo has not been uploaded for this beat yet.','Не удалось воспроизвести демо. Проверь аудиофайл.':'Could not play demo. Check the audio file.','Сначала выбери бит в каталоге.':'Choose a beat from the catalog first.','Не удалось запустить демо.':'Could not start the demo.','Демо не загрузилось. Проверь файл в админ-панели.':'Demo failed to load. Check the file in the admin panel.','Без названия':'Untitled','Выбери бит':'Choose a beat','Громкость':'Volume','Пауза':'Pause','Воспроизвести':'Play','Продолжить':'Resume','Валюта':'Currency','Сохранить':'Save','Отмена':'Cancel','Удалить':'Delete','Редактировать':'Edit','Добавить':'Add','Описание':'Description','Цена':'Price','Название':'Title','Жанр':'Genre','Файл':'File','Загрузка':'Uploading','Загружаем каталог':'Loading catalog','Загружаем плейлисты':'Loading playlists','Загружаем коллекцию…':'Loading collection…','НЕТ ДЕМО':'NO DEMO','В КОРЗИНУ':'ADD TO CART','Добавить в избранное':'Add to favorites','Избранное':'Favorites','Корзина пуста':'Your cart is empty','Корзина':'Cart','Оформление заказа':'Checkout','Как к тебе обращаться':'Your name','Имя':'Name','Telegram для связи *':'Telegram contact *','@username':'@username','В комментарии к переводу обязательно укажи свой Telegram username, номер заказа и выбранную лицензию. Полные файлы отправляются вручную в Telegram после проверки оплаты.':'Include your Telegram username, order number and selected license in the payment note. Full files are sent manually via Telegram after payment is verified.','ПЕРЕЙТИ К ОПЛАТЕ':'PROCEED TO PAYMENT','Список услуг скоро появится.':'Services will be listed here soon.','Описание не добавлено':'No description added','Активна':'Active','Скрыта':'Hidden','Редактировать услугу':'Edit service','Добавить услугу':'Add service','Лицензия':'License','Сохранено':'Saved','Услуга удалена':'Service deleted','Услуга обновлена':'Service updated','Услуга добавлена':'Service added','Описание лицензии сохранено':'License description saved','Подтвердить оплату':'Confirm payment','Отметить выданным':'Mark as delivered','Заказов пока нет.':'No orders yet.','Подтвердить, что деньги реально поступили?':'Confirm that the money has actually arrived?','Оплата подтверждена · бит снят с продажи':'Payment confirmed · beat removed from sale','Заказ отмечен выданным':'Order marked as delivered','Сначала создай плейлист во вкладке «Плейлисты».':'Create a playlist in the “Playlists” tab first.','В какой плейлист добавить бит? Введи номер:':'Which playlist should this beat be added to? Enter the number:','Неверный номер плейлиста.':'Invalid playlist number.','Бит добавлен в':'Beat added to','Удалить бит из каталога? Он будет снят с продажи и исчезнет из плейлистов.':'Delete this beat from the catalog? It will be taken off sale and removed from playlists.','Бит удалён из каталога':'Beat removed from catalog','Бит восстановлен':'Beat restored','Бит скрыт из каталога':'Beat hidden from catalog','Бит обновлён':'Beat updated','Войди через Telegram, чтобы пользоваться избранным.':'Sign in with Telegram to use favorites.','Вы вышли из аккаунта':'You have signed out','Не удалось выйти':'Could not sign out','Файл не выбран':'No file selected','Сохранение карточки бита...':'Saving beat...','Бит сохранён.':'Beat saved.','Бит добавлен в каталог':'Beat added to catalog','Каталог пока пуст':'The catalog is empty','Добавь первый бит — он появится здесь отдельной строкой.':'Add the first beat — it will appear here.','Снять с продажи':'Take off sale','Выгрузить повторно':'Republish','В плейлист':'Add to playlist','Изменить':'Edit','Удалить':'Delete','Пока нет добавленных услуг.':'No services added yet.','MP3':'MP3','WAV':'WAV','WAV + STEMS':'WAV + STEMS','Стандартная лицензия MP3.':'Standard MP3 license.','Высокое качество звука в WAV.':'High-quality WAV audio.','Отдельные дорожки для гибкой работы со сведением.':'Separate stems for flexible mixing.','Все жанры':'All genres','Здесь пока пусто':'Nothing here yet','Ошибка':'Error','Применить':'Apply','Закрыть':'Close','Условия лицензии':'License terms','Показать условия лицензии':'Show license terms','Скрыть условия лицензии':'Hide license terms','ПОДРОБНЕЕ':'MORE DETAILS','ПРОДОЛЖИТЬ':'CONTINUE','НАЗАД':'BACK','ПОДТВЕРДИТЬ':'CONFIRM','ОТМЕНА':'CANCEL','ОБНОВИТЬ':'UPDATE','АКТИВНА':'ACTIVE','СКРЫТА':'HIDDEN','В ПРОДАЖЕ':'ON SALE','СНЯТ С ПРОДАЖИ':'OFF SALE','Нет доступных лицензий':'No licenses available','В избранное':'Add to favorites','Убрать из избранного':'Remove from favorites','СЛУШАТЬ ПОДБОРКУ':'PLAY COLLECTION','бита':'beat','битов':'beats','плейлистов':'playlists','Загрузка:':'Uploading:','загружен.':'uploaded.','Ошибка:':'Error:','Бит сохранён.':'Beat saved.','Услуга сохранена':'Service saved'
  };
  Object.assign(common, {
    'Оформить заказ':'Checkout','Удалить из корзины':'Remove from cart','Убрать':'Remove','Корзина пока пуста.':'Your cart is empty.','Плейлист':'Playlist','Биты':'Beats','Название бита':'Beat title','Описание и кому подойдёт':'Description and best use','Настрой цены':'Set prices','Цена MP3, ₽':'MP3 price, RUB','Цена WAV, ₽':'WAV price, RUB','Цена WAV + Stems, ₽':'WAV + Stems price, RUB','Загрузи демо':'Upload a demo','Загрузить бит':'Upload beat','Информация':'Information','Цены':'Prices','Аудио':'Audio','Далее к ценам':'Continue to prices','Далее к аудио':'Continue to audio','Назад':'Back','Публикация':'Publish','Выбери демо-файл':'Choose demo file','Файл не выбран':'No file selected','Описание услуги':'Service description','Обложка услуги':'Service cover','Название услуги':'Service name','Услуга активна':'Service is active','Редактировать описание':'Edit description','Условия использования':'Usage terms','Изображение лицензии':'License image','Создать плейлист':'Create playlist','Управление плейлистами':'Manage playlists','Биты из каталога':'Beats from catalog','Коротко о подборке':'Brief playlist description','Сохранить изменения':'Save changes','Снять с продажи':'Take off sale','Выгрузить повторно':'Republish','В плейлист':'Add to playlist','Изменить':'Edit','Удалить':'Delete','В продаже':'On sale','Снят с продажи':'Off sale','Список услуг скоро появится.':'Services will be listed here soon.','Пока нет добавленных услуг.':'No services have been added yet.','Описание не добавлено':'No description added','Условия лицензии':'License terms','Показать условия лицензии':'Show license terms','Скрыть условия лицензии':'Hide license terms','Найди свой звук':'Find your sound','Сначала слушай — потом покупай':'Listen first — buy later','Слушать всё':'Play all','Воспроизвести':'Play','Продолжить':'Resume','Пауза':'Pause','Громкость':'Volume','Открыть':'Open','Закрыть':'Close','Применить':'Apply','Отмена':'Cancel','Сохранить':'Save','Добавить':'Add','Редактировать':'Edit','Загрузка':'Loading','Загружаем каталог':'Loading catalog','Загружаем плейлисты':'Loading playlists','Заказов пока нет.':'There are no orders yet.','Подтвердить оплату':'Confirm payment','Отметить выданным':'Mark as delivered','Сохранено':'Saved','Сохранить':'Save','Вы вышли из аккаунта':'You have signed out','Не удалось выйти':'Could not sign out','Ошибка':'Error','В избранное':'Add to favorites','Убрать из избранного':'Remove from favorites','Все жанры':'All genres','Все биты':'All beats','Без жанра':'No genre','Разные жанры':'Various genres','Плейлист не найден':'Playlist not found','В плейлисте пока нет доступных битов.':'There are no available beats in this playlist yet.','Услуга удалена':'Service deleted','Услуга обновлена':'Service updated','Услуга добавлена':'Service added','Услуга сохранена':'Service saved','Описание лицензии сохранено':'License description saved','Бит сохранён.':'Beat saved.','Бит добавлен в каталог':'Beat added to catalog','Бит обновлён':'Beat updated','Бит удалён из каталога':'Beat removed from catalog','Бит восстановлен':'Beat restored','Бит скрыт из каталога':'Beat hidden from catalog','НЕТ ДЕМО':'NO DEMO','В КОРЗИНУ':'ADD TO CART','СЛУШАТЬ ПОДБОРКУ':'PLAY COLLECTION','ПЕРЕЙТИ К ОПЛАТЕ':'PROCEED TO PAYMENT','ОФОРМИТЬ ЗАКАЗ':'CHECKOUT','ВЫЙТИ ИЗ АККАУНТА':'SIGN OUT','ОПИСАНИЕ ЛИЦЕНЗИЙ':'LICENSE DESCRIPTIONS','ШАГ 01 / 03':'STEP 01 / 03','ШАГ 02 / 03':'STEP 02 / 03','ШАГ 03 / 03':'STEP 03 / 03','Информация':'Information','Скидок нет — у каждой лицензии своя постоянная цена.':'No discounts — each license has a fixed price.','Аудио-превью':'Audio preview','Выбери язык интерфейса и валюту цен.':'Choose the interface language and price currency.','Язык и регион':'Language and region','Язык / регион':'Language / region','Русский · Россия':'Russian · Russia','English · United States':'English · United States','English · United Kingdom':'English · United Kingdom','Deutsch · Deutschland':'German · Germany','Français · France':'French · France','Español · España':'Spanish · Spain'
  });
  const dictionaries = {
    en: common,
    de: Object.assign({}, common, {'Playlists':'Playlists','Catalog':'Katalog','Licenses':'Lizenzen','Services':'Dienstleistungen','About':'Über uns','Favorites':'Favoriten','My order':'Meine Bestellung','Sign in':'Anmelden','Profile':'Profil','Admin panel':'Adminbereich','Cart':'Warenkorb','PLAYLISTS':'PLAYLISTS','BEAT CATALOG':'BEAT-KATALOG','SERVICES':'DIENSTLEISTUNGEN','LICENSE DESCRIPTIONS':'LIZENZBESCHREIBUNGEN','BEATS FOR YOUR':'BEATS FÜR DEINEN','NEXT RELEASE.':'NÄCHSTEN RELEASE.','EGROV BeatStore — original beats for your music. Listen to the demos, choose the right license, and place your order. Once payment is confirmed, the full files will be sent to you on Telegram.':'EGROV BeatStore — originale Beats für deine Musik. Höre die Demos an, wähle die passende Lizenz und gib deine Bestellung auf. Nach bestätigter Zahlung werden dir die vollständigen Dateien über Telegram zugesendet.','Search playlists...':'Playlists suchen...','All genres':'Alle Genres','Newest first':'Neueste zuerst','By title':'Nach Titel','No playlists found.':'Keine Playlists gefunden.','BEATS':'BEATS','OVERVIEW':'ÜBERSICHT','GENRES':'GENRES','Search by title or genre...':'Nach Titel oder Genre suchen...','Oldest first':'Älteste zuerst','Price: low to high':'Preis aufsteigend','Price: high to low':'Preis absteigend','TRACK':'TRACK','DETAILS':'DETAILS','LICENSE':'LIZENZ','Total':'Gesamt','CHECKOUT':'ZUR KASSE','Language and region':'Sprache und Region','Choose the interface language and price currency.':'Sprache und Währung wählen.','Apply':'Anwenden','Add beat':'Beat hinzufügen','Orders':'Bestellungen','Sign out':'Abmelden','Untitled':'Ohne Titel','Choose a beat':'Beat auswählen','Description':'Beschreibung','Price':'Preis','Title':'Titel','Genre':'Genre','Loading catalog':'Katalog wird geladen','Loading playlists':'Playlists werden geladen','Your cart is empty':'Dein Warenkorb ist leer','Your name':'Dein Name','Name':'Name','Proceed to payment':'Weiter zur Zahlung','Checkout':'Zur Kasse','Remove':'Entfernen','Remove from cart':'Aus dem Warenkorb entfernen','Playlist':'Playlist','Beats':'Beats','Beat title':'Beat-Titel','Description and best use':'Beschreibung und Verwendung','Set prices':'Preise festlegen','Information':'Informationen','Prices':'Preise','Upload a demo':'Demo hochladen','Upload beat':'Beat hochladen','Continue to prices':'Weiter zu den Preisen','Continue to audio':'Weiter zum Audio','Back':'Zurück','Publish':'Veröffentlichen','Choose demo file':'Demo-Datei auswählen','No file selected':'Keine Datei ausgewählt','Service description':'Leistungsbeschreibung','Service cover':'Titelbild der Leistung','Service name':'Name der Leistung','Usage terms':'Nutzungsbedingungen','License image':'Lizenzbild','Create playlist':'Playlist erstellen','Manage playlists':'Playlists verwalten','Beats from catalog':'Beats aus dem Katalog','Brief playlist description':'Kurze Playlist-Beschreibung','Save changes':'Änderungen speichern','Take off sale':'Aus dem Verkauf nehmen','Republish':'Erneut veröffentlichen','Add to playlist':'Zur Playlist hinzufügen','On sale':'Im Verkauf','Off sale':'Nicht im Verkauf','There are no orders yet.':'Noch keine Bestellungen vorhanden.','Confirm payment':'Zahlung bestätigen','Mark as delivered':'Als ausgeliefert markieren','Various genres':'Verschiedene Genres','No genre':'Kein Genre','Play all':'Alles abspielen','Play collection':'Sammlung abspielen'}),
    fr: Object.assign({}, common, {'Playlists':'Playlists','Catalog':'Catalogue','Licenses':'Licences','Services':'Services','About':'À propos','Favorites':'Favoris','My order':'Ma commande','Sign in':'Connexion','Profile':'Profil','Admin panel':'Administration','Cart':'Panier','PLAYLISTS':'PLAYLISTS','BEAT CATALOG':'CATALOGUE DE BEATS','Search playlists...':'Rechercher des playlists...','All genres':'Tous les genres','Newest first':'Plus récents','By title':'Par titre','No playlists found.':'Aucune playlist trouvée.','BEATS':'BEATS','OVERVIEW':'APERÇU','GENRES':'GENRES','Search by title or genre...':'Rechercher par titre ou genre...','Oldest first':'Plus anciens','Price: low to high':'Prix croissant','Price: high to low':'Prix décroissant','TRACK':'PISTE','DETAILS':'DÉTAILS','LICENSE':'LICENCE','Total':'Total','CHECKOUT':'COMMANDER','Language and region':'Langue et région','Choose the interface language and price currency.':'Choisissez la langue et la devise.','Apply':'Appliquer','Add beat':'Ajouter un beat','Orders':'Commandes','Untitled':'Sans titre','Choose a beat':'Choisir un beat','Description':'Description','Price':'Prix','Title':'Titre','Genre':'Genre','Loading catalog':'Chargement du catalogue','Loading playlists':'Chargement des playlists','Your cart is empty':'Votre panier est vide','Your name':'Votre nom','Name':'Nom','Proceed to payment':'Passer au paiement','Checkout':'Commander','Remove':'Retirer','Remove from cart':'Retirer du panier','Playlist':'Playlist','Beats':'Beats','Beat title':'Titre du beat','Description and best use':'Description et utilisation','Set prices':'Définir les prix','Information':'Informations','Prices':'Prix','Upload a demo':'Téléverser une démo','Upload beat':'Ajouter un beat','Continue to prices':'Continuer vers les prix','Continue to audio':'Continuer vers l’audio','Back':'Retour','Publish':'Publier','Choose demo file':'Choisir le fichier démo','No file selected':'Aucun fichier sélectionné','Service description':'Description du service','Service cover':'Visuel du service','Service name':'Nom du service','Usage terms':'Conditions d’utilisation','License image':'Image de licence','Create playlist':'Créer une playlist','Manage playlists':'Gérer les playlists','Beats from catalog':'Beats du catalogue','Brief playlist description':'Brève description de la playlist','Save changes':'Enregistrer les modifications','Take off sale':'Retirer de la vente','Republish':'Republier','Add to playlist':'Ajouter à la playlist','On sale':'En vente','Off sale':'Hors vente','There are no orders yet.':'Aucune commande pour le moment.','Confirm payment':'Confirmer le paiement','Mark as delivered':'Marquer comme livré','Various genres':'Genres variés','No genre':'Aucun genre','Play all':'Tout lire','Play collection':'Écouter la sélection'}),
    es: Object.assign({}, common, {'Playlists':'Listas','Catalog':'Catálogo','Licenses':'Licencias','Services':'Servicios','About':'Acerca de','Favorites':'Favoritos','My order':'Mi pedido','Sign in':'Iniciar sesión','Profile':'Perfil','Admin panel':'Administración','Cart':'Carrito','PLAYLISTS':'LISTAS','BEAT CATALOG':'CATÁLOGO DE BEATS','Search playlists...':'Buscar listas...','All genres':'Todos los géneros','Newest first':'Más recientes','By title':'Por título','No playlists found.':'No se encontraron listas.','BEATS':'BEATS','OVERVIEW':'VISTA GENERAL','GENRES':'GÉNEROS','Search by title or genre...':'Buscar por título o género...','Oldest first':'Más antiguos','Price: low to high':'Precio: menor a mayor','Price: high to low':'Precio: mayor a menor','TRACK':'PISTA','DETAILS':'DETALLES','LICENSE':'LICENCIA','Total':'Total','CHECKOUT':'FINALIZAR COMPRA','Language and region':'Idioma y región','Choose the interface language and price currency.':'Elige el idioma y la moneda.','Apply':'Aplicar','Add beat':'Añadir beat','Orders':'Pedidos','Untitled':'Sin título','Choose a beat':'Elige un beat','Description':'Descripción','Price':'Precio','Title':'Título','Genre':'Género','Loading catalog':'Cargando catálogo','Loading playlists':'Cargando listas','Your cart is empty':'Tu carrito está vacío','Your name':'Tu nombre','Name':'Nombre','Proceed to payment':'Continuar al pago','Checkout':'Finalizar compra','Remove':'Quitar','Remove from cart':'Quitar del carrito','Playlist':'Lista','Beats':'Beats','Beat title':'Título del beat','Description and best use':'Descripción y uso recomendado','Set prices':'Configurar precios','Information':'Información','Prices':'Precios','Upload a demo':'Subir una demo','Upload beat':'Subir beat','Continue to prices':'Continuar a precios','Continue to audio':'Continuar al audio','Back':'Atrás','Publish':'Publicar','Choose demo file':'Elegir archivo de demo','No file selected':'Ningún archivo seleccionado','Service description':'Descripción del servicio','Service cover':'Portada del servicio','Service name':'Nombre del servicio','Usage terms':'Condiciones de uso','License image':'Imagen de licencia','Create playlist':'Crear lista','Manage playlists':'Gestionar listas','Beats from catalog':'Beats del catálogo','Brief playlist description':'Descripción breve de la lista','Save changes':'Guardar cambios','Take off sale':'Retirar de la venta','Republish':'Volver a publicar','Add to playlist':'Añadir a la lista','On sale':'A la venta','Off sale':'Fuera de venta','There are no orders yet.':'Todavía no hay pedidos.','Confirm payment':'Confirmar pago','Mark as delivered':'Marcar como entregado','Various genres':'Géneros variados','No genre':'Sin género','Play all':'Reproducir todo','Play collection':'Escuchar colección'})
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
      return new Intl.NumberFormat(locale,{style:'currency',currency:c.currency,maximumFractionDigits:0,minimumFractionDigits:0}).format(Math.ceil(n*c.rate));
    });
  }
  function processText(node) {
    if (node.nodeType !== Node.TEXT_NODE) return;
    if (node.parentElement?.closest('[data-remote-translated]') || node.parentElement?.closest(dynamicSelector)) return;
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
  const dynamicOriginals = new WeakMap();
  const remotePending = new WeakMap();
  const remoteLang = () => config().lang;
  const dynamicSelector = '.track-description,.playlist-description,.service-card p,.content-description,.license-description,.license-terms,.about-description,.public-license-card p,.about-section > p,.hero-text';
  function sourceForDynamic(el) {
    if (!dynamicOriginals.has(el)) dynamicOriginals.set(el, el.textContent || '');
    return dynamicOriginals.get(el);
  }
  async function translateRemoteText(text, target) {
    const source = (text || '').trim();
    if (!source || target === 'ru') return source;
    const cacheKey = `egrov_mt_${target}_${source}`;
    try { const cached = localStorage.getItem(cacheKey); if (cached) return cached; } catch (_) {}
    // Public descriptions are translated on demand; titles and genres are deliberately excluded.
    const chunks = source.length > 420 ? source.match(/[^.!?\n]+[.!?\n]*/g) || [source] : [source];
    const translated = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk.trim()) { translated.push(chunk); continue; }
      const sourceLang = /[А-Яа-яЁё]/.test(source) ? 'ru' : 'en';
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk.slice(0,480))}&langpair=${sourceLang}|${encodeURIComponent(target)}`;
      const response = await fetch(url, {headers:{'Accept':'application/json'}});
      if (!response.ok) throw new Error('Translation service unavailable');
      const data = await response.json();
      const value = data?.responseData?.translatedText;
      if (!value || data?.responseStatus >= 400) throw new Error('Translation unavailable');
      translated.push(value);
    }
    const result = translated.join('');
    try { localStorage.setItem(cacheKey, result); } catch (_) {}
    return result;
  }
  async function processDynamicContent(root=document) {
    const lang = remoteLang();
    const elements = [];
    if (root instanceof Element && root.matches(dynamicSelector)) elements.push(root);
    if (root.querySelectorAll) elements.push(...root.querySelectorAll(dynamicSelector));
    for (const el of elements) {
      const source = sourceForDynamic(el);
      el.dataset.remoteLocale = lang;
      if (lang === 'ru') { el.textContent = source; continue; }
      if (remotePending.get(el) === lang) continue;
      remotePending.set(el, lang);
      translateRemoteText(source, lang).then(value => {
        if (el.isConnected && remotePending.get(el) === lang && remoteLang() === lang) {
          el.textContent = value;
          el.dataset.remoteTranslated = lang;
        }
      }).catch(() => {
        // Keep original public text visible if the free translation provider is unavailable.
        if (el.isConnected && remotePending.get(el) === lang) el.dataset.remoteTranslated = '';
      });
    }
  }
  function applyLocale() {
    // Invalidate in-flight translations so an older language cannot overwrite the newly selected one.
    document.querySelectorAll(dynamicSelector).forEach(el => { if (dynamicOriginals.has(el)) el.textContent = dynamicOriginals.get(el); remotePending.delete(el); delete el.dataset.remoteTranslated; delete el.dataset.remoteLocale; });
    document.documentElement.lang = config().lang;
    document.querySelectorAll('body *').forEach(processElement);
    const button = document.getElementById('regionOpen');
    if (button) button.textContent = `🌐 ${config().flag} · ${config().symbol}`;
    const select = document.getElementById('regionLocale');
    if (select) select.value = locale;
    try { localStorage.setItem(STORAGE_KEY, locale); } catch (_) {}
    processDynamicContent(document);
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
        else if (node.nodeType === Node.ELEMENT_NODE) { processElement(node); node.querySelectorAll('*').forEach(processElement); processDynamicContent(node); }
      });
    }));
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    applyLocale();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
