import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-22')) {
    return null;
  }

  return (
    <footer className="border-t border-ink/10 bg-ink text-paper/70">
      <div className="page-shell grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1 space-y-3">
          <p className="font-display text-2xl font-bold text-paper">Maitri</p>
          <p className="text-sm leading-relaxed">
            Neighborhood cafe for slow coffees, shared plates, and evenings that stretch.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-moss-300">Visit</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/menu" className="hover:text-paper">Menu</Link></li>
            <li><Link to="/scan" className="hover:text-paper">Scan & order</Link></li>
            <li><Link to="/book-table" className="hover:text-paper">Book a table</Link></li>
            <li><Link to="/celebration" className="hover:text-paper">Celebrations</Link></li>
            <li><Link to="/feedback" className="hover:text-paper">Feedback</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-moss-300">Hours</p>
          <div className="flex gap-2 text-sm">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-moss-400" />
            <div>
              <p className="text-paper/90">Mon – Sun</p>
              <p>11:00 AM – 11:30 PM</p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-moss-300">Contact</p>
          <ul className="space-y-2.5 text-sm">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-moss-400" />
              <span>124 Sunshine Boulevard, Main Market Road</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-moss-400" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-moss-400" />
              <span>hello@maitricafe.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="page-shell flex flex-col gap-2 py-5 text-xs text-paper/45 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Maitri Cafe</p>
          <p>Good food. Quiet rooms. Shared tables.</p>
        </div>
      </div>
    </footer>
  );
};
