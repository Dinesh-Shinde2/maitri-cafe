import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { tablesApi, bookingsApi } from '../../services/api';

export const BookTablePage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState(4);
  const [preference, setPreference] = useState('Indoor');
  const [selectedTable, setSelectedTable] = useState<any | null>(null);
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (step !== 2) return;
    setLoadingTables(true);
    tablesApi
      .getAll()
      .then((res) => {
        setAvailableTables(res.data.filter((t: any) => t.capacity >= guests));
        setLoadingTables(false);
      })
      .catch(() => setLoadingTables(false));
  }, [step, guests, preference]);

  const handleNextStep = () => {
    if (step === 1) setStep(2);
    else if (step === 2) {
      if (!selectedTable) {
        alert('Select a table');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      setErrorMsg('Name and phone required');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    bookingsApi
      .createTableBooking({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        booking_date: date,
        booking_time: time,
        guest_count: guests,
        seating_preference: preference,
        table_id: selectedTable?.id,
        special_notes: specialNotes,
      })
      .then((res) => {
        setBookingConfirmed(res.data);
        setSubmitting(false);
      })
      .catch(() => {
        setErrorMsg('Booking failed. Try again.');
        setSubmitting(false);
      });
  };

  if (bookingConfirmed) {
    return (
      <div className="page-shell max-w-lg py-16 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-moss-600" />
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">Booking confirmed</h1>
        <p className="mt-2 text-sm text-ink-mute">See you at Maitri.</p>
        <div className="mt-8 border border-paper-line bg-paper-card p-5 text-left text-sm space-y-3">
          <div className="flex justify-between border-b border-paper-line pb-3">
            <span className="text-xs uppercase tracking-wider text-ink-mute">Reference</span>
            <span className="font-display font-semibold text-moss-700">{bookingConfirmed.booking_reference}</span>
          </div>
          <p><span className="text-ink-mute">Guest</span> · {bookingConfirmed.customer_name}</p>
          <p><span className="text-ink-mute">When</span> · {bookingConfirmed.booking_date} at {bookingConfirmed.booking_time}</p>
          <p><span className="text-ink-mute">Party</span> · {bookingConfirmed.guest_count} guests</p>
          {selectedTable && (
            <p className="border-t border-paper-line pt-3 font-semibold text-ink">
              Table {selectedTable.table_number} · {selectedTable.location}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => { setBookingConfirmed(null); setStep(1); }}
          className="btn-primary mt-8"
        >
          Book another
        </button>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <section className="border-b border-paper-line bg-moss-900 text-paper">
        <div className="page-shell py-12">
          <p className="section-label text-moss-300">Reservations</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Book a table</h1>
          <p className="mt-2 max-w-md text-sm text-paper/65">Pick a time, choose a seat, leave your number. We hold the table.</p>
        </div>
      </section>

      <div className="page-shell max-w-3xl space-y-8 py-10">
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((n) => (
            <React.Fragment key={n}>
              <span className={`flex h-8 w-8 items-center justify-center text-xs font-bold ${step >= n ? 'bg-moss-600 text-paper' : 'bg-paper-line text-ink-mute'}`}>
                {n}
              </span>
              {n < 3 && <span className={`h-px flex-1 ${step > n ? 'bg-moss-500' : 'bg-paper-line'}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="border border-paper-line bg-paper-card p-6 sm:p-8 space-y-5">
            <h2 className="font-display text-xl font-semibold text-ink">Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-medium text-ink-mute">
                Date
                <input type="date" className="field mt-1" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              <label className="text-xs font-medium text-ink-mute">
                Time
                <select className="field mt-1" value={time} onChange={(e) => setTime(e.target.value)}>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:30">1:30 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="20:30">8:30 PM</option>
                  <option value="21:30">9:30 PM</option>
                </select>
              </label>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-ink-mute mb-2">Guests</p>
                <div className="flex gap-2">
                  {[2, 4, 6, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuests(num)}
                      className={`flex-1 py-2.5 text-sm font-semibold transition ${
                        guests === num ? 'bg-moss-600 text-paper' : 'border border-paper-line hover:border-moss-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <label className="text-xs font-medium text-ink-mute sm:col-span-2">
                Seating
                <select className="field mt-1" value={preference} onChange={(e) => setPreference(e.target.value)}>
                  <option value="Indoor">Indoor lounge</option>
                  <option value="Rooftop">Rooftop</option>
                  <option value="Garden">Garden patio</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end pt-2">
              <button type="button" onClick={handleNextStep} className="btn-primary">
                View tables <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="border border-paper-line bg-paper-card p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-semibold text-ink">Choose table</h2>
              <p className="text-xs text-ink-mute">{date} · {time} · {guests} guests</p>
            </div>
            {loadingTables ? (
              <p className="py-10 text-center text-sm text-ink-mute">Loading tables…</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {availableTables.map((t) => {
                  const selected = selectedTable?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTable(t)}
                      className={`border p-4 text-left transition ${
                        selected ? 'border-moss-600 bg-moss-50' : 'border-paper-line hover:border-moss-400'
                      }`}
                    >
                      <p className="font-display text-lg font-bold text-ink">{t.table_number}</p>
                      <p className="text-xs text-ink-mute">Up to {t.capacity}</p>
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-moss-600">{t.location}</p>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(1)} className="btn-ghost">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button type="button" onClick={handleNextStep} className="btn-primary">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmitBooking} className="border border-paper-line bg-paper-card p-6 sm:p-8 space-y-5">
            <h2 className="font-display text-xl font-semibold text-ink">Your details</h2>
            {errorMsg && <div className="border border-copper/40 bg-copper/10 px-3 py-2 text-xs">{errorMsg}</div>}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-medium text-ink-mute">
                Full name *
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
                Notes
                <textarea className="field mt-1" rows={2} value={specialNotes} onChange={(e) => setSpecialNotes(e.target.value)} />
              </label>
            </div>
            <div className="border border-paper-line bg-paper px-3 py-3 text-xs text-ink-soft space-y-1">
              <p>{date} at {time}</p>
              <p>Table {selectedTable?.table_number} ({selectedTable?.location}) · {guests} guests</p>
            </div>
            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(2)} className="btn-ghost">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button type="submit" disabled={submitting} className="btn-primary">
                <CheckCircle2 className="h-4 w-4" />
                {submitting ? 'Confirming…' : 'Confirm booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
