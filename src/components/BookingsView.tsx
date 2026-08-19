import { useMemo, useState } from 'react';
import {
  Search,
  Clock,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Mail,
  MessageSquare,
  User,
  LayoutDashboard,
  RotateCcw,
} from 'lucide-react';
import { useSlots, useBookings } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { today, prettyDate, prettyDateLong, prettyTime } from '@/lib/date';
import type { Booking, Slot } from '@/lib/types';

type Filter = 'all' | 'upcoming' | 'past';

interface Row {
  booking: Booking;
  slot: Slot | undefined;
}

export function BookingsView() {
  const { slots, setSlotStatus } = useSlots();
  const { bookings, cancelBooking, toggleCompleted } = useBookings();
  const { notify } = useToast();

  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const rows: Row[] = useMemo(() => {
    const result = bookings.map((b) => ({
      booking: b,
      slot: slots.find((s) => s.id === b.slotId),
    }));

    const filtered = result.filter((r) => {
      const slotDate = r.slot?.date ?? '';
      if (filter === 'upcoming' && slotDate < today()) return false;
      if (filter === 'past' && slotDate >= today()) return false;

      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          r.booking.name.toLowerCase().includes(q) ||
          r.booking.email.toLowerCase().includes(q) ||
          r.booking.note.toLowerCase().includes(q)
        );
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const aDate = a.slot?.date ?? '';
      const bDate = b.slot?.date ?? '';
      if (aDate !== bDate) return aDate.localeCompare(bDate);
      return (a.slot?.startTime ?? '').localeCompare(b.slot?.startTime ?? '');
    });
  }, [bookings, slots, filter, query]);

  const counts = useMemo(() => {
    const upcoming = bookings.filter((b) => {
      const s = slots.find((sl) => sl.id === b.slotId);
      return s && s.date >= today();
    }).length;
    const past = bookings.length - upcoming;
    return { all: bookings.length, upcoming, past };
  }, [bookings, slots]);

  function handleCancel(booking: Booking, slot: Slot | undefined) {
    cancelBooking(booking.id);
    if (slot && slot.status === 'booked') {
      setSlotStatus(slot.id, 'open');
    }
    notify(`Cancelled booking with ${booking.name}. Slot reopened.`, 'info');
  }

  function handleToggleCompleted(booking: Booking) {
    toggleCompleted(booking.id);
    notify(
      booking.completed ? 'Marked as not completed.' : 'Marked as completed.',
      'success'
    );
  }

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'past', label: 'Past', count: counts.past },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-ink-900 tracking-tight">Bookings</h2>
        <p className="text-ink-500 mt-1.5 text-sm">
          See everyone who booked a slot and manage your schedule.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex items-center bg-white border border-ink-200 rounded-xl p-1 gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                filter === f.id
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-500 hover:text-ink-700 hover:bg-ink-50'
              }`}
            >
              {f.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-md ${
                  filter === f.id
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-ink-100 text-ink-500'
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or note..."
            className="input pl-10"
          />
        </div>
      </div>

      {/* Booking list */}
      {rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((row) => {
            const { booking, slot } = row;
            const isUpcoming = slot ? slot.date >= today() : false;
            return (
              <div
                key={booking.id}
                className={`card p-5 transition-all duration-200 ${
                  booking.completed ? 'opacity-70' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Date / time block */}
                  <div className="flex items-center gap-3 sm:w-48 shrink-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        booking.completed
                          ? 'bg-ink-100'
                          : isUpcoming
                          ? 'bg-brand-50'
                          : 'bg-ink-50'
                      }`}
                    >
                      <CalendarDays
                        className={`w-5 h-5 ${
                          booking.completed
                            ? 'text-ink-400'
                            : isUpcoming
                            ? 'text-brand-600'
                            : 'text-ink-400'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">
                        {slot ? prettyDate(slot.date) : 'Slot removed'}
                      </p>
                      <p className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {slot
                          ? `${prettyTime(slot.startTime)} — ${prettyTime(slot.endTime)}`
                          : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Person details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-ink-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-ink-400" />
                        {booking.name}
                      </span>
                      {booking.completed && (
                        <span className="badge bg-accent-50 text-accent-700">
                          <CheckCircle2 className="w-3 h-3" />
                          Done
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-ink-500 mt-1">
                      <Mail className="w-3.5 h-3.5 text-ink-400" />
                      <span className="truncate">{booking.email}</span>
                    </div>
                    {booking.note && (
                      <div className="flex items-start gap-1.5 text-xs text-ink-500 mt-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-ink-400 mt-0.5 shrink-0" />
                        <p className="line-clamp-2">{booking.note}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <button
                      onClick={() => handleToggleCompleted(booking)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        booking.completed
                          ? 'text-ink-500 hover:bg-ink-100'
                          : 'text-accent-700 hover:bg-accent-50'
                      }`}
                      title={booking.completed ? 'Mark as not done' : 'Mark as done'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {booking.completed ? 'Undo' : 'Done'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleCancel(booking, slot)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-err-600 hover:bg-err-50 transition-colors"
                      title="Cancel booking"
                    >
                      <XCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-ink-50 flex items-center justify-center mb-5">
            <LayoutDashboard className="w-8 h-8 text-ink-400" />
          </div>
          <h3 className="text-lg font-semibold text-ink-900">
            {query.trim() ? 'No bookings match your search' : 'No bookings yet'}
          </h3>
          <p className="text-ink-500 text-sm mt-2 max-w-sm">
            {query.trim()
              ? 'Try a different name, email, or note — or clear the search.'
              : 'When people book your slots, their bookings will appear here for you to review and manage.'}
          </p>
          {query.trim() && (
            <button
              onClick={() => setQuery('')}
              className="btn-secondary mt-5"
            >
              <RotateCcw className="w-4 h-4" />
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
