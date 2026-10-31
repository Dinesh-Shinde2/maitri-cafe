import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Menu as MenuIcon, QrCode, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/book-table', label: 'Book table' },
  { to: '/celebration', label: 'Celebrations' },
];

export const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { totalItems, tableNumber } = useCart();

  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-22')) {
    return null;
  }

  const orderHref = tableNumber ? `/order/${tableNumber}` : '/scan';

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-ink/95 text-paper backdrop-blur-md">
      <div className="page-shell flex h-16 items-center justify-between sm:h-[4.25rem]">
        <Link to="/" className="group flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="font-display text-xl font-bold tracking-tight text-paper sm:text-2xl">
            Maitri
          </span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-moss-300 sm:inline">
            Cafe
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm transition ${
                  active ? 'text-paper' : 'text-paper/65 hover:text-paper'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {tableNumber && (
            <span className="hidden items-center gap-1.5 border border-moss-400/30 bg-moss-800/40 px-2.5 py-1 text-[11px] text-moss-100 sm:inline-flex">
              <span className="h-1.5 w-1.5 bg-moss-300" />
              Table {tableNumber}
            </span>
          )}

          <Link
            to="/scan"
            className="hidden items-center gap-1.5 border border-paper/20 px-3 py-2 text-xs font-semibold text-paper transition hover:border-moss-300 hover:text-moss-200 sm:inline-flex"
          >
            <QrCode className="h-3.5 w-3.5" />
            Scan QR
          </Link>

          <Link
            to="/book-table"
            className="hidden items-center gap-1.5 bg-moss-500 px-3 py-2 text-xs font-semibold text-paper transition hover:bg-moss-400 lg:inline-flex"
          >
            <Calendar className="h-3.5 w-3.5" />
            Reserve
          </Link>

          <Link to={orderHref} className="relative p-2 text-paper/80 transition hover:text-paper" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-moss-400 px-1 text-[10px] font-bold text-ink">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="p-2 text-paper md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-paper/10 bg-ink px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="px-2 py-2.5 text-sm text-paper/80"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/scan" onClick={() => setOpen(false)} className="px-2 py-2.5 text-sm text-moss-300">
              Scan table QR
            </Link>
            <Link to="/book-table" onClick={() => setOpen(false)} className="mt-2 btn-primary w-full">
              Book a table
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
