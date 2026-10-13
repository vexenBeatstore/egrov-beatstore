import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { getGetCurrentUserQueryKey, useGetCurrentUser, useLogout } from '@workspace/api-client-react';
import type { Beat } from '@workspace/api-client-react';
import { SiteShell } from '@/components/SiteShell';
import {
  AccountPage, AuthPage, BeatPage, CartPage, CatalogPage, ContactsPage, HomePage,
  LicensesPage, ServicesPage, type CartActions, type CartItem,
} from '@/pages/StorePages';

const CART_STORAGE_KEY = 'vexen-beatstore-cart';
const queryClient = new QueryClient();

function readCart(): CartItem[] {
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CartItem => (
      typeof item?.beatSlug === 'string' && typeof item?.licenseId === 'string'
      && Number.isInteger(item?.quantity) && item.quantity > 0
    ));
  } catch {
    return [];
  }
}

function RouterContent() {
  const [location, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>(readCart);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const queryClientInstance = useQueryClient();
  const currentUser = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey(),
      retry: (failureCount, error) => error.status !== 401 && failureCount < 2,
    },
  });
  const logout = useLogout();

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  const actions: CartActions = {
    add: (beat: Beat, licenseId: string) => setCart((items) => {
      const existing = items.find((item) => item.beatSlug === beat.slug && item.licenseId === licenseId);
      return existing
        ? items.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { beatSlug: beat.slug, licenseId, quantity: 1 }];
    }),
    remove: (beatSlug, licenseId) => setCart((items) => items.filter((item) => !(item.beatSlug === beatSlug && item.licenseId === licenseId))),
    quantity: (beatSlug, licenseId, value) => setCart((items) => items.map((item) => (
      item.beatSlug === beatSlug && item.licenseId === licenseId ? { ...item, quantity: Math.max(1, value) } : item
    ))),
  };

  const signOut = () => logout.mutate(undefined, {
    onSuccess: () => {
      queryClientInstance.setQueryData(getGetCurrentUserQueryKey(), null);
      queryClientInstance.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      if (location === '/account') setLocation('/login');
    },
  });

  return (
    <ErrorBoundary resetKey={location}>
      <SiteShell cartCount={cartCount} user={currentUser.data ?? null} onLogout={signOut} logoutPending={logout.isPending}>
        <Switch>
          <Route path="/"><HomePage /></Route>
          <Route path="/catalog"><CatalogPage /></Route>
          <Route path="/beat/:slug">{(params) => <BeatPage slug={params.slug} onAdd={actions.add} />}</Route>
          <Route path="/licenses"><LicensesPage /></Route>
          <Route path="/cart"><CartPage cart={cart} actions={actions} /></Route>
          <Route path="/services"><ServicesPage /></Route>
          <Route path="/contacts"><ContactsPage /></Route>
          <Route path="/login"><AuthPage mode="login" /></Route>
          <Route path="/register"><AuthPage mode="register" /></Route>
          <Route path="/account"><AccountPage user={currentUser.data ?? null} loading={currentUser.isLoading} error={currentUser.error} onRetry={() => currentUser.refetch()} onLogout={signOut} /></Route>
          <Route>
            <div className="page-container route-enter">
              <span className="eyebrow">404 · VEXEN</span>
              <h1 className="page-title">Эта страница не найдена</h1>
              <p className="page-subtitle">Похоже, адрес изменился. Вернитесь к каталогу и продолжайте поиск звука.</p>
              <Link href="/catalog" className="button-primary" style={{ marginTop: 22 }}>Открыть каталог</Link>
            </div>
          </Route>
        </Switch>
      </SiteShell>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <RouterContent />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
