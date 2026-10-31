import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { celebrationsApi } from '../../services/api';

export const CelebrationPage: React.FC = () => {
  const [eventType, setEventType] = useState('Birthday');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:30');
  const [guests, setGuests] = useState(8);
  const [decorRequired, setDecorRequired] = useState(true);
  const [cakeRequired, setCakeRequired] = useState(true);
  const [foodPackage, setFoodPackage] = useState('Gold');
  const [specialRequests, setSpecialRequests] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [submittedRef, setSubmittedRef] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      setErrorMsg('Name and phone required');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    celebrationsApi
      .createCelebrationBooking({
        event_type: eventType,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        event_date: date,
        event_time: time,
        guest_count: guests,
        decor_required: decorRequired,
        cake_required: cakeRequired,
        food_package: foodPackage,
        special_requests: specialRequests,
      })
      .then((res) => {
        setSubmittedRef(res.data);
        setSubmitting(false);
      })
      .catch(() => {
        setErrorMsg('Could not submit. Try again.');
        setSubmitting(false);
      });
  };

  if (submittedRef) {
    return (
      <div className="page-shell max-w-lg py-16 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-moss-600" />
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">Enquiry received</h1>
        <p className="mt-2 text-sm text-ink-mute">Our events lead will call you shortly.</p>
        <div className="mt-8 border border-paper-line bg-paper-card p-5 text-left text-sm space-y-2">
          <div className="flex justify-between border-b border-paper-line pb-3">
            <span className="text-xs uppercase tracking-wider text-ink-mute">Reference</span>
            <span className="font-display font-semibold text-moss-700">{submittedRef.booking_reference}</span>
          </div>
          <p>{submittedRef.event_type}</p>
          <p>{submittedRef.event_date} · {submittedRef.event_time}</p>
          <p>{submittedRef.guest_count} guests · {submittedRef.food_package} package</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <section className="relative min-h-[42vh] overflow-hidden bg-ink text-paper">
        <img
          src="https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=1600&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        <div className="page-shell relative flex min-h-[42vh] flex-col justify-end pb-12 pt-20">
          <p className="section-label text-moss-300">Private events</p>
          <h1 className="mt-2 max-w-xl font-display text-4xl font-bold sm:text-5xl">Celebrations</h1>
          <p className="mt-3 max-w-md text-sm text-paper/70">
            Birthdays, anniversaries, quiet proposals. Decor, cake, and set menus — planned with you.
          </p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="page-shell max-w-2xl space-y-6 py-10">
        {errorMsg && <div className="border border-copper/40 bg-copper/10 px-3 py-2 text-xs">{errorMsg}</div>}

        <div className="border border-paper-line bg-paper-card p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold">Event</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-ink-mute">
              Type
              <select className="field mt-1" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                <option>Birthday</option>
                <option>Anniversary</option>
                <option>Proposal</option>
                <option>Corporate</option>
                <option>Other</option>
              </select>
            </label>
            <label className="text-xs font-medium text-ink-mute">
              Guests
              <input className="field mt-1" type="number" min={2} max={40} value={guests} onChange={(e) => setGuests(parseInt(e.target.value) || 2)} />
            </label>
            <label className="text-xs font-medium text-ink-mute">
              Date
              <input className="field mt-1" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="text-xs font-medium text-ink-mute">
              Time
              <input className="field mt-1" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </label>
            <label className="text-xs font-medium text-ink-mute sm:col-span-2">
              Food package
              <select className="field mt-1" value={foodPackage} onChange={(e) => setFoodPackage(e.target.value)}>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={decorRequired} onChange={(e) => setDecorRequired(e.target.checked)} className="accent-moss-600" />
              Decor
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={cakeRequired} onChange={(e) => setCakeRequired(e.target.checked)} className="accent-moss-600" />
              Cake
            </label>
          </div>
        </div>

        <div className="border border-paper-line bg-paper-card p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold">Contact</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-ink-mute">
              Name *
              <input className="field mt-1" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </label>
            <label className="text-xs font-medium text-ink-mute">
              Phone *
              <input className="field mt-1" type="tel" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </label>
            <label className="text-xs font-medium text-ink-mute sm:col-span-2">
              Email
              <input className="field mt-1" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
            </label>
            <label className="text-xs font-medium text-ink-mute sm:col-span-2">
              Special requests
              <textarea className="field mt-1" rows={3} placeholder="Theme, message on cake, timing…" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
            </label>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
            {submitting ? 'Sending…' : 'Send enquiry'}
          </button>
        </div>
      </form>
    </div>
  );
};
