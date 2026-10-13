import { useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight, Disc3, Headphones, Layers3, Mic2, Minus, Plus, Search, Settings2,
  ShoppingBag, Trash2, WandSparkles,
} from 'lucide-react';
import {
  getGetCurrentUserQueryKey, useGetBeat, useListBeats, useListLicenses, useLogin, useRegister,
} from '@workspace/api-client-react';
import type { AuthUser, Beat, LicenseSummary, ListBeatsParams } from '@workspace/api-client-react';
import { BeatCard, CoverArt } from '../components/BeatCard';

export type CartItem = { beatSlug: string; licenseId: string; quantity: number };
export type CartActions = {
  add: (beat: Beat, licenseId: string) => void;
  remove: (beatSlug: string, licenseId: string) => void;
  quantity: (beatSlug: string, licenseId: string, value: number) => void;
};

function formatPrice(minor: number | null | undefined, currency = 'USD') {
  if (minor == null) return 'Цена не указана';
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 2 }).format(minor / 100);
  } catch {
    return `${(minor / 100).toFixed(2)} ${currency}`;
  }
}

function QueryError({ retry }: { retry: () => void }) {
  return <div className="no-results"><h3>Не удалось загрузить данные</h3><p>Проверьте соединение и попробуйте ещё раз.</p><button className="button-secondary" type="button" onClick={retry}>Повторить</button></div>;
}

function BeatSkeletons() {
  return <div className="beat-grid" aria-label="Загрузка каталога">{[0, 1, 2, 3].map((item) => <div className="beat-card skeleton-card" key={item}><div className="skeleton-cover" /><div className="skeleton-lines"><i /><i /><i /></div></div>)}</div>;
}

export function HomePage() {
  const featuredQuery = useListBeats({ sort: 'featured' });
  const featured = featuredQuery.data?.slice(0, 4) ?? [];
  const bars = [14, 23, 31, 19, 37, 27, 46, 33, 19, 42, 28, 48, 36, 22, 40, 27, 17, 34, 22, 44, 31, 18, 39, 24, 14, 33, 20, 39, 26, 17, 31, 21, 40, 25, 13];
  return (
    <div className="page-container route-enter">
      <section className="hero">
        <div className="hero-copy"><span className="eyebrow">Инструменталы от VEXEN</span><h1>Find your<br /><span>next sound.</span></h1><p>Продуманные биты для независимых артистов. Исследуйте звук, выберите лицензию и создайте своё.</p><div className="hero-actions"><Link href="/catalog" className="button-primary">Открыть каталог <ArrowRight size={15} /></Link><Link href="/licenses" className="button-secondary">Как это работает</Link></div></div>
        <div className="hero-art" aria-hidden="true"><div className="art-disc" /><div className="art-wave">{bars.map((height, index) => <i key={index} style={{ height }} />)}</div></div>
      </section>
      <section>
        <div className="section-heading"><div><span className="eyebrow">Опубликовано в каталоге</span><h2>Популярные биты</h2></div><Link href="/catalog" className="text-link">Весь каталог <ArrowRight size={13} /></Link></div>
        {featuredQuery.isLoading ? <BeatSkeletons /> : featuredQuery.isError ? <QueryError retry={() => featuredQuery.refetch()} /> : featured.length ? <div className="beat-grid">{featured.map((beat) => <BeatCard key={beat.slug} beat={beat} />)}</div> : <div className="no-results"><h3>Каталог пока пуст</h3><p>Опубликованные позиции появятся здесь после добавления в каталог.</p><Link className="button-secondary" href="/catalog">Перейти в каталог</Link></div>}
      </section>
      <section className="service-feature" style={{ marginTop: 72 }}><div><span className="eyebrow">Звук под задачу</span><h2>Не нашли точное настроение?</h2><p>VEXEN также работает над индивидуальными битами, аранжировками и продакшн-задачами. Расскажите, куда вы хотите прийти со своим звучанием.</p><Link href="/services" className="button-secondary">Услуги продакшна <ArrowRight size={14} /></Link></div><div className="service-list"><div className="service-item"><WandSparkles size={16} /><h3>Индивидуальный бит</h3><p>Идея и референсы превращаются в уникальный инструментал.</p></div><div className="service-item"><Layers3 size={16} /><h3>Аранжировка</h3><p>Новая динамика и структура для вашей демо-записи.</p></div><div className="service-item"><Mic2 size={16} /><h3>Вокальный продакшн</h3><p>Редактура и подготовка вокала к следующему этапу.</p></div><div className="service-item"><Settings2 size={16} /><h3>Звук под ключ</h3><p>Обсудим задачи, формат и доступный рабочий процесс.</p></div></div></section>
      <section className="contact-panel"><div><h2>Есть идея для трека?</h2><p>Напишите о референсах, сроках и желаемом звучании.</p></div><Link className="button-quiet" href="/contacts">Контактная информация <ArrowRight size={13} /></Link></section>
    </div>
  );
}

export function CatalogPage() {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBpm, setMinBpm] = useState('');
  const [maxBpm, setMaxBpm] = useState('');
  const [sort, setSort] = useState<ListBeatsParams['sort']>('featured');
  const params = useMemo<ListBeatsParams>(() => ({
    q: search.trim() || undefined,
    genre: genre || undefined,
    maxPriceMinor: maxPrice ? Math.round(Number(maxPrice) * 100) : undefined,
    minBpm: minBpm ? Number(minBpm) : undefined,
    maxBpm: maxBpm ? Number(maxBpm) : undefined,
    sort,
  }), [search, genre, maxPrice, minBpm, maxBpm, sort]);
  const query = useListBeats(params);
  const genresQuery = useListBeats({ sort: 'featured' });
  const beats = query.data ?? [];
  const genres = [...new Set((genresQuery.data ?? []).map((beat) => beat.genre))].sort();
  const clear = () => { setSearch(''); setGenre(''); setMaxPrice(''); setMinBpm(''); setMaxBpm(''); setSort('featured'); };
  return (
    <div className="page-container route-enter"><span className="eyebrow">VEXEN sound library</span><h1 className="page-title">Каталог битов</h1><p className="page-subtitle">Только опубликованные позиции из каталога. Все цены — примеры; аудиофайлы в этой витрине не загружены.</p>
      <div className="catalog-layout">
        <aside className="filter-panel"><div className="filter-heading"><span>Фильтры</span><button type="button" className="remove-button" onClick={clear}>Сбросить</button></div>
          <div className="filter-group"><label className="filter-label" htmlFor="filter-genre">Жанр</label><select className="filter-select" id="filter-genre" value={genre} onChange={(event) => setGenre(event.target.value)}><option value="">Все жанры</option>{genres.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
          <div className="filter-group"><label className="filter-label" htmlFor="filter-price">Цена до · пример</label><input className="filter-input" id="filter-price" type="number" min="0" placeholder="Без ограничений" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} /></div>
          <div className="filter-group"><span className="filter-label">Темп · BPM</span><div className="range-pair"><input className="filter-input" aria-label="Минимальный BPM" type="number" min="20" max="300" placeholder="От" value={minBpm} onChange={(event) => setMinBpm(event.target.value)} /><input className="filter-input" aria-label="Максимальный BPM" type="number" min="20" max="300" placeholder="До" value={maxBpm} onChange={(event) => setMaxBpm(event.target.value)} /></div></div>
        </aside>
        <section><div className="catalog-toolbar"><div className="search-wrap"><Search size={16} /><input className="search-input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Название, жанр, описание..." aria-label="Поиск по каталогу" /></div><select className="sort-select" value={sort} onChange={(event) => setSort(event.target.value as ListBeatsParams['sort'])} aria-label="Сортировка каталога"><option value="featured">По подборке</option><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option><option value="bpm-asc">Темп: по возрастанию</option></select></div>
          <p className="results-count">{query.isLoading ? 'Загружаем каталог…' : `${beats.length} опубликованных примеров`}</p>
          {query.isLoading ? <BeatSkeletons /> : query.isError ? <QueryError retry={() => query.refetch()} /> : beats.length ? <div className="beat-grid">{beats.map((beat) => <BeatCard key={beat.slug} beat={beat} />)}</div> : <div className="no-results"><h3>В каталоге пока нет опубликованных битов</h3><p>Позиции будут показаны здесь после публикации. Фильтры используют данные сервера, а не локальные демо-записи.</p><button className="button-secondary" type="button" onClick={clear}>Сбросить фильтры</button></div>}
        </section>
      </div>
    </div>
  );
}

export function BeatPage({ slug, onAdd }: { slug?: string; onAdd: CartActions['add'] }) {
  const query = useGetBeat(slug ?? '');
  const [selectedLicense, setSelectedLicense] = useState('');
  const detail = query.data;
  const license = detail?.licenses.find((item) => item.id === selectedLicense) ?? detail?.licenses[0];
  if (query.isLoading) return <div className="page-container"><div className="skeleton-cover detail-skeleton" /><div className="skeleton-lines"><i /><i /><i /></div></div>;
  if (query.isError || !detail) return <div className="page-container route-enter"><span className="eyebrow">Каталог</span><h1 className="page-title">{query.isError ? 'Не удалось открыть бит' : 'Бит не найден'}</h1><p className="page-subtitle">{query.isError ? 'Проверьте соединение и попробуйте ещё раз.' : 'Этот бит отсутствует или больше не опубликован.'}</p>{query.isError && <button className="button-secondary" style={{ marginTop: 18 }} onClick={() => query.refetch()}>Повторить</button>}<Link href="/catalog" className="button-primary" style={{ marginTop: 18 }}>Вернуться в каталог</Link></div>;
  const { beat, licenses } = detail;
  return <div className="page-container route-enter"><Link href="/catalog" className="text-link"><ArrowRight size={13} style={{ transform: 'rotate(180deg)' }} /> Назад к битам</Link><div className="detail-grid"><section><div className="detail-cover"><CoverArt beat={beat} large /></div><h1 className="detail-title">{beat.title}</h1><p className="detail-producer">Демонстрационный пример · VEXEN</p><div className="detail-tags"><span className="tag">{beat.genre}</span><span className="tag">{beat.bpm} BPM</span><span className="tag">{beat.key}</span></div><p className="detail-description">{beat.description}</p></section><aside className="detail-panel"><h2>Выберите лицензию</h2><p>Лицензии и цены — демонстрационные примеры. Покупка и передача файлов не подключены.</p>{licenses.length ? licenses.map((item) => <label key={item.id} className={`license-choice ${license?.id === item.id ? 'selected' : ''}`}><span><strong>{item.name}</strong><small>{item.description}</small></span><b>Пример · {formatPrice(item.priceMinor, item.currency)}</b><input type="radio" name="license" checked={license?.id === item.id} onChange={() => setSelectedLicense(item.id)} /></label>) : <div className="notice">Для этого бита пока нет активных лицензий.</div>}<button className="button-primary full-width" type="button" disabled={!license} onClick={() => license && onAdd(beat, license.id)}><ShoppingBag size={15} /> Добавить в корзину</button><div className="notice" style={{ marginTop: 13 }}>Аудиопревью не загружено. Воспроизведение звука недоступно.</div></aside></div></div>;
}

export function LicensesPage() {
  const query = useListLicenses();
  return <div className="page-container route-enter"><span className="eyebrow">Прозрачные условия</span><h1 className="page-title">Лицензии</h1><p className="page-subtitle">Наглядные примеры форматов лицензирования. Это не юридический договор: финальные условия нужно согласовать отдельно.</p>{query.isLoading ? <div className="license-grid">{[0, 1, 2, 3].map((x) => <div className="license-card skeleton-license" key={x} />)}</div> : query.isError ? <QueryError retry={() => query.refetch()} /> : query.data?.length ? <div className="license-grid">{query.data.map((item: LicenseSummary, index) => <article className={`license-card ${index === 1 ? 'featured' : ''}`} key={item.name}><span className="tier">VEXEN · пример</span><h2>{item.name}</h2><p className="price">{formatPrice(item.startingPriceMinor, item.currency)}<small> / пример</small></p><p>{item.description}</p><div className="notice">Файлы, оплата и оформление лицензии не подключены.</div><Link href="/catalog" className={index === 1 ? 'button-primary full-width' : 'button-secondary full-width'}>Выбрать бит <ArrowRight size={13} /></Link></article>)}</div> : <div className="no-results"><h3>Примеры лицензий пока не опубликованы</h3><p>Список будет доступен после добавления условий в систему.</p></div>}<div className="notice" style={{ marginTop: 18 }}>Все цены — примеры. Доступ к файлам, оплата и передача лицензии не подключены.</div></div>;
}

function CartEntry({ item, actions }: { item: CartItem; actions: CartActions }) {
  const query = useGetBeat(item.beatSlug);
  const detail = query.data;
  const license = detail?.licenses.find((value) => value.id === item.licenseId);
  if (query.isLoading) return <div className="cart-row"><div className="skeleton-cover cart-skeleton" /><div className="skeleton-lines"><i /><i /></div></div>;
  if (query.isError || !detail || !license) return <article className="cart-row cart-unavailable"><div><h3>{query.isError ? 'Не удалось загрузить позицию' : 'Позиция больше недоступна'}</h3><p>{item.beatSlug} · лицензия недоступна</p></div><button type="button" className="remove-button" onClick={() => actions.remove(item.beatSlug, item.licenseId)} aria-label="Удалить недоступную позицию"><Trash2 size={14} /></button></article>;
  const { beat } = detail;
  return <article className="cart-row"><Link className="cart-thumb" href={`/beat/${beat.slug}`}><CoverArt beat={beat} /></Link><div><h3>{beat.title}</h3><p>{license.name} · пример условий</p></div><div className="quantity-control" aria-label={`Количество ${beat.title}`}><button type="button" aria-label="Уменьшить количество" onClick={() => item.quantity === 1 ? actions.remove(beat.slug, license.id) : actions.quantity(beat.slug, license.id, item.quantity - 1)}><Minus size={12} /></button><span>{item.quantity}</span><button type="button" aria-label="Увеличить количество" onClick={() => actions.quantity(beat.slug, license.id, item.quantity + 1)}><Plus size={12} /></button></div><span className="cart-row-price">Пример<br />{formatPrice(license.priceMinor * item.quantity, license.currency)}</span><button type="button" className="remove-button" aria-label={`Удалить ${beat.title}`} onClick={() => actions.remove(beat.slug, license.id)}><Trash2 size={14} /></button></article>;
}

export function CartPage({ cart, actions }: { cart: CartItem[]; actions: CartActions }) {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return <div className="page-container route-enter"><span className="eyebrow">Ваш выбор</span><h1 className="page-title">Корзина</h1><p className="page-subtitle">Список хранится только в этом браузере. Цены запрашиваются заново с сервера и не используются для покупки.</p><div className="cart-layout"><section className="cart-list">{cart.length === 0 ? <div className="cart-empty"><Disc3 size={28} /><h2>Пока здесь тихо</h2><p>Добавьте опубликованный бит из каталога — он появится в этой корзине.</p><Link href="/catalog" className="button-primary">Открыть каталог <ArrowRight size={14} /></Link></div> : cart.map((item) => <CartEntry key={`${item.beatSlug}-${item.licenseId}`} item={item} actions={actions} />)}</section><aside className="cart-summary"><h2>Сводка · пример</h2><div className="summary-line"><span>Позиции</span><b>{count}</b></div><div className="summary-line"><span>Цена</span><b>Серверный пример</b></div><button className="button-primary full-width" type="button" disabled title="Оформление заказа не подключено"><ShoppingBag size={15} /> Оформление отключено</button><p className="notice" style={{ marginTop: 13 }}>Оплата и оформление заказа не подключены. Сумма корзины не является предложением купить товар.</p></aside></div></div>;
}

export function AccountPage({ user, loading, error, onRetry, onLogout }: { user: AuthUser | null; loading: boolean; error: unknown; onRetry: () => void; onLogout: () => void }) {
  if (loading) return <div className="page-container"><div className="skeleton-lines"><i /><i /><i /></div></div>;
  const status = (error as { status?: number } | null)?.status;
  if (error && status !== 401) return <div className="page-container route-enter"><span className="eyebrow">Аккаунт VEXEN</span><h1 className="page-title">Аккаунт недоступен</h1><p className="page-subtitle">Не удалось проверить сессию. Попробуйте ещё раз.</p><button className="button-secondary" type="button" onClick={onRetry} style={{ marginTop: 22 }}>Повторить</button></div>;
  if (status === 401 || !user) return <div className="page-container route-enter"><span className="eyebrow">Аккаунт VEXEN</span><h1 className="page-title">Вы не вошли</h1><p className="page-subtitle">Для просмотра аккаунта войдите по email и паролю.</p><Link className="button-primary" href="/login" style={{ marginTop: 22 }}>Войти</Link></div>;
  return <div className="page-container route-enter"><span className="eyebrow">Аккаунт VEXEN</span><h1 className="page-title">Ваш профиль</h1><section className="account-panel"><span className="account-label">Вы вошли как</span><strong data-testid="text-account-email">{user.email}</strong><dl><div><dt>Роль</dt><dd>{user.role}</dd></div><div><dt>Email подтверждён</dt><dd>{user.emailVerifiedAt ? 'Да' : 'Нет'}</dd></div><div><dt>Создан</dt><dd>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</dd></div></dl><button className="button-secondary" type="button" onClick={onLogout}>Выйти из аккаунта</button></section></div>;
}

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const login = useLogin();
  const register = useRegister();
  const pending = login.isPending || register.isPending;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      const authenticatedUser = isRegister
        ? await register.mutateAsync({ data: { email: email.trim(), password } })
        : await login.mutateAsync({ data: { email: email.trim(), password } });
      queryClient.setQueryData(getGetCurrentUserQueryKey(), authenticatedUser);
      setLocation('/account');
    } catch {
      setMessage(isRegister ? 'Не удалось создать аккаунт. Проверьте данные и попробуйте ещё раз.' : 'Не удалось войти. Проверьте email и пароль и попробуйте ещё раз.');
    }
  };
  return <div className="page-container auth-page route-enter"><div className="auth-card"><span className="eyebrow">{isRegister ? 'Новый аккаунт' : 'Возвращение'}</span><h1 className="page-title">{isRegister ? 'Создать аккаунт' : 'Войти в VEXEN'}</h1><p className="page-subtitle">{isRegister ? 'Аккаунт нужен только для входа в витрину. Покупки и заказы не подключены.' : 'Используйте email и пароль, связанные с вашим аккаунтом.'}</p>
    <form className="auth-form" onSubmit={submit}>
      <label htmlFor="auth-email">Email</label><input id="auth-email" data-testid="input-email" type="email" autoComplete="email" required minLength={3} maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
      <label htmlFor="auth-password">Пароль</label><input id="auth-password" data-testid="input-password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={isRegister ? 12 : 1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isRegister ? 'Не менее 12 символов' : 'Ваш пароль'} />
      {isRegister && <p className="auth-hint">Минимум 12 символов, максимум 128.</p>}
      {message && <div className="auth-error" role="alert" data-testid="status-auth-error">{message}</div>}
      <button className="button-primary full-width" data-testid="button-auth-submit" type="submit" disabled={pending || !email.trim() || password.length < (isRegister ? 12 : 1)}>{pending ? 'Подождите…' : isRegister ? 'Создать аккаунт' : 'Войти'}</button>
    </form>
    <p className="auth-switch">{isRegister ? 'Уже зарегистрированы?' : 'Впервые здесь?'} <Link href={isRegister ? '/login' : '/register'}>{isRegister ? 'Войти' : 'Создать аккаунт'}</Link></p>
  </div></div>;
}

export function ServicesPage() {
  const serviceRows = [{ icon: <WandSparkles size={17} />, title: 'Бит на заказ', body: 'Инструментал под вашу идею, референсы и творческую задачу.' }, { icon: <Layers3 size={17} />, title: 'Аранжировка', body: 'Работа с демо: развитие формы, динамики и музыкальных деталей.' }, { icon: <Mic2 size={17} />, title: 'Вокальный продакшн', body: 'Подготовка записи, компинг и аккуратная работа с вокальными слоями.' }, { icon: <Headphones size={17} />, title: 'Сведение и финализация', body: 'Обсудим техническое состояние проекта и нужный формат результата.' }];
  return <div className="page-container route-enter"><span className="eyebrow">За пределами каталога</span><h1 className="page-title">Продакшн-услуги</h1><p className="page-subtitle">Если готового инструментала недостаточно, можно обсудить проект напрямую. Детали и стоимость зависят от задачи — прайс и бронирование пока не подключены.</p><section className="service-feature"><div><span className="eyebrow">VEXEN studio</span><h2>От первой идеи до цельного звучания.</h2><p>Расскажите о проекте, приложите музыкальные ориентиры и обозначьте сроки. Сначала согласуем объём работы, затем — формат и условия.</p><Link className="button-primary" href="/contacts">Контактная информация <ArrowRight size={14} /></Link></div><div className="service-list">{serviceRows.map((service) => <article className="service-item" key={service.title}>{service.icon}<h3>{service.title}</h3><p>{service.body}</p></article>)}</div></section><div className="contact-panel"><div><h2>Что написать в запросе</h2><p>Жанр, ссылки на референсы, текущий статус трека и желаемый срок.</p></div><Link className="button-quiet" href="/contacts">Контакты VEXEN</Link></div></div>;
}

export function ContactsPage() {
  return <div className="page-container route-enter"><span className="eyebrow">Связь с VEXEN</span><h1 className="page-title">Контакты</h1><p className="page-subtitle">Контактный адрес и форма заявок пока не настроены. Здесь не отправляются сообщения — перед запуском добавьте актуальные контактные данные.</p><div className="contact-panel contacts-placeholder"><div><h2>Раздел подготовлен к настройке</h2><p>Добавьте рабочий email или подключите форму заявок на следующем этапе. Демонстрационная витрина не содержит вымышленных контактов.</p></div><Link className="button-secondary" href="/catalog">Вернуться в каталог <ArrowRight size={13} /></Link></div></div>;
}
