import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Mail,
  User,
  MessageSquare,
  CalendarPlus,
  X,
} from 'lucide-react';
import { useSlots, useBookings } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { today, prettyDate, prettyDateLong, prettyTime, isPast } from '@/lib/date';
import type { Slot } from '@/lib/types';

type Phase = 'browse' | 'form' | 'confirmed';

export function PublicView() {
  const { slots, setSlotStatus } = useSlots();
  const { bookings, addBooking } = useBookings();
  const { notify } = useToast();

  const [phase, setPhase] = useState<Phase>('browse');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<{
    slot: Slot;
    name: string;
    email: string;
  } | null>(null);

  const openSlots = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const slot of slots) {
      if (slot.status !== 'open' || isPast(slot.date)) continue;
      if (!map.has(slot.date)) map.set(slot.date, []);
      map.get(slot.date)!.push(slot);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

  function startBooking(slot: Slot) {
    // Re-check freshness in case it was booked since the list rendered
    const fresh = slots.find((s) => s.id === slot.id);
    if (!fresh || fresh.status !== 'open') {
      notify('That slot was just taken — please pick another.', 'error');
      return;
    }
    setSelectedSlot(slot);
    setName('');
    setEmail('');
    setNote('');
    setPhase('form');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    if (!name.trim() || !email.trim()) {
      notify('Please enter your name and email.', 'error');
      return;
    }
    // Final freshness check before committing
    const fresh = slots.find((s) => s.id === selectedSlot.id);
    if (!fresh || fresh.status !== 'open') {
      notify('That slot was just taken — please pick another.', 'error');
      setPhase('browse');
      setSelectedSlot(null);
      return;
    }
    addBooking(selectedSlot.id, name.trim(), email.trim(), note.trim());
    setSlotStatus(selectedSlot.id, 'booked');
    setConfirmedBooking({ slot: selectedSlot, name: name.trim(), email: email.trim() });
    setPhase('confirmed');
    notify('Your slot is booked!', 'success');
  }

  function resetToBrowse() {
    setPhase('browse');
    setSelectedSlot(null);
    setConfirmedBooking(null);
  }

  // -- Confirmed screen --
  if (phase === 'confirmed' && confirmedBooking) {
    const { slot, name: cname, email: cemail } = confirmedBooking;
    const dateObj = new Date(`${slot.date}T${slot.startTime}:00`);
    const calendarStart = dateObj.toISOString().replace(/[-:]/g, '').split('.')[0];
    const endObj = new Date(`${slot.date}T${slot.endTime}:00`);
    const calendarEnd = endObj.toISOString().replace(/[-:]/g, '').split('.')[0];
    const calLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=1:1%20with%20${encodeURIComponent('your manager')}&dates=${calendarStart}/${calendarEnd}&details=Booked%20via%20Slot%20Keeper`;

    return (
      <div className="animate-fade-in max-w-xl mx-auto">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 text-accent-500" />
          </div>
          <h2 className="text-2xl font-semibold text-ink-900">You're booked!</h2>
          <p className="text-ink-500 text-sm mt-2">
            A confirmation has been saved. See you at the scheduled time.
          </p>

          <div className="mt-6 rounded-xl bg-ink-50 border border-ink-100 p-5 text-left">
            <div className="flex items-center gap-3 mb-3">
              <CalendarDays className="w-5 h-5 text-brand-500" />
              <div>
                <p className="text-sm font-semibold text-ink-900">{prettyDateLong(slot.date)}</p>
                <p className="text-sm text-ink-500">
                  {prettyTime(slot.startTime)} — {prettyTime(slot.endTime)}
                </p>
              </div>
            </div>
            <div className="border-t border-ink-100 pt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-ink-600">
                <User className="w-4 h-4 text-ink-400" />
                {cname}
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-600">
                <Mail className="w-4 h-4 text-ink-400" />
                {cemail}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <a href={calLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <CalendarPlus className="w-4 h-4" />
              Add to Google Calendar
            </a>
            <button onClick={resetToBrowse} className="btn-secondary">
              Book another slot
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -- Booking form --
  if (phase === 'form' && selectedSlot) {
    return (
      <div className="animate-fade-in max-w-xl mx-auto">
        <button
          onClick={resetToBrowse}
          className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to slots
        </button>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-ink-100">
            <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center">
              <Clock className="w-5.5 h-5.5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">
                {prettyDateLong(selectedSlot.date)}
              </p>
              <p className="text-sm text-ink-500">
                {prettyTime(selectedSlot.startTime)} — {prettyTime(selectedSlot.endTime)}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Your name</label>
              <div className="relative">
                <User className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="input pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label">
                Note <span className="text-ink-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What would you like to discuss?"
                  rows={3}
                  className="input pl-10 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={resetToBrowse} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Confirm booking
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // -- Browse / slot list --
  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
          Book a 1:1 slot
        </h2>
        <p className="text-ink-500 mt-2 text-sm max-w-md mx-auto">
          Pick a time that works for you. Available slots are shown below — reserve
          yours in seconds.
        </p>
      </div>

      {openSlots.length > 0 ? (
        <div className="space-y-6">
          {openSlots.map(([date, daySlots]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="w-4 h-4 text-ink-400" />
                <h3 className="text-sm font-semibold text-ink-700">{prettyDateLong(date)}</h3>
                <span className="text-xs text-ink-400 ml-1">
                  {daySlots.length} slot{daySlots.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {daySlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => startBooking(slot)}
                    className="card p-4 flex items-center justify-between text-left hover:shadow-card-hover hover:border-brand-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                        <Clock className="w-5 h-5 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink-900">
                          {prettyTime(slot.startTime)} — {prettyTime(slot.endTime)}
                        </p>
                        <p className="text-xs text-ink-400 mt-0.5">{prettyDate(date)}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-brand-600 group-hover:text-brand-700 flex items-center gap-1">
                      Book
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-ink-50 flex items-center justify-center mb-5">
            <CalendarDays className="w-8 h-8 text-ink-400" />
          </div>
          <h3 className="text-lg font-semibold text-ink-900">No slots available right now</h3>
          <p className="text-ink-500 text-sm mt-2 max-w-sm">
            New time slots may be published soon. Please check back in a little while.
          </p>
        </div>
      )}
    </div>
  );
}
