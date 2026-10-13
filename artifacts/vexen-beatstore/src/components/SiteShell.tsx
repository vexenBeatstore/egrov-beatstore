import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { LogOut, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import type { AuthUser } from '@workspace/api-client-react';

type SiteShellProps = {
  children: ReactNode;
  cartCount: number;
  user: AuthUser | null;
  onLogout: () => void;
  logoutPending: boolean;
};

const navItems = [
  { label: 'Главная', href: '/' },
  { label: 'Биты', href: '/catalog' },
  { label: 'Лицензии', href: '/licenses' },
  { label: 'Услуги', href: '/services' },
  { label: 'Контакты', href: '/contacts' },
];

export function SiteShell({ children, cartCount, user, onLogout, logoutPending }: SiteShellProps) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="wordmark" aria-label="VEXEN — главная">
            <span className="wordmark-symbol">V</span>
            <span>VEXEN</span>
          </Link>
          <nav className="main-nav" aria-label="Основная навигация">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`nav-link ${location === item.href ? 'active' : ''}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-right">
            {user ? (
              <div className="signed-in-nav">
                <Link href="/account" className="account-link" aria-label="Открыть аккаунт"><UserRound size={15} /><span>{user.email}</span></Link>
                <button type="button" className="shell-logout" onClick={onLogout} disabled={logoutPending} aria-label="Выйти из аккаунта"><LogOut size={15} /></button>
              </div>
            ) : (
              <Link href="/login" className="auth-header-link">Войти</Link>
            )}
            <Link href="/cart" className="cart-link" aria-label={`Корзина, ${cartCount} позиций`}>
              <ShoppingBag size={16} strokeWidth={1.7} />
              <span>Корзина</span>
              <span className="cart-count">{cartCount}</span>
            </Link>
            <button
              className="menu-toggle"
              type="button"
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="mobile-menu" aria-label="Мобильная навигация">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${location === item.href ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="footer-inner">
          <span>© {new Date().getFullYear()} VEXEN · Демонстрационная витрина</span>
          <div className="footer-links">
            <Link href="/catalog">Каталог</Link>
            <Link href="/licenses">Лицензии</Link>
            <a href="mailto:hello@vexen.example">Связаться</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
