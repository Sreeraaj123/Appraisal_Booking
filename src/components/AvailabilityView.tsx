import { useMemo, useState } from 'react';
import { CalendarPlus, Clock, Plus, Trash2, CalendarDays } from 'lucide-react';
import { useSlots } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { today, tomorrow, prettyDate, prettyDateLong, prettyTime, isPast } from '@/lib/date';
import type { Slot } from '@/lib/types';

const statusConfig: Record<Slot['status'], { label: string; className: string; dot: string }> = {
  open: { label: 'Open', className: 'bg-brand-50 text-brand-700', dot: 'bg-brand-500' },
  booked: { label: 'Booked', className: 'bg-accent-50 text-accent-700', dot: 'bg-accent-500' },
  cancelled: { label: 'Cancelled', className: 'bg-ink-100 text-ink-500', dot: 'bg-ink-400' },
};

export function AvailabilityView() {
  const { slots, addSlot, removeSlot } = useSlots();
  const { notify } = useToast();

  const [date, setDate] = useState(today());
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:30');

  const grouped = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const slot of slots) {
      if (!map.has(slot.date)) map.set(slot.date, []);
      map.get(slot.date)!.push(slot);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

  function handleAdd() {
    if (!date) {
      notify('Please pick a date.', 'error');
      return;
    }
    if (startTime >= endTime) {
      notify('End time must be after start time.', 'error');
      return;
    }
    const overlap = slots.some(
      (s) =>
        s.date === date &&
        s.status !== 'cancelled' &&
        startTime < s.endTime &&
        endTime > s.startTime
    );
    if (overlap) {
      notify('That time overlaps an existing slot.', 'error');
      return;
    }
    addSlot(date, startTime, endTime);
    notify(`Slot added for ${prettyDate(date)} at ${prettyTime(startTime)}.`, 'success');
  }

  function handleRemove(id: string, slot: Slot) {
    removeSlot(id);
    notify(`Removed ${prettyDate(slot.date)} ${prettyTime(slot.startTime)} slot.`, 'info');
  }

  const hasSlots = grouped.length > 0;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-ink-900 tracking-tight">Your availability</h2>
        <p className="text-ink-500 mt-1.5 text-sm">
          Publish free time slots for any day so people can book you.
        </p>
      </div>

      {/* Add slot form */}
      <div className="card p-5 sm:p-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <Plus className="w-4.5 h-4.5 text-brand-600" />
          </div>
          <h3 className="text-base font-semibold text-ink-900">Add a new slot</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              value={date}
              min={today()}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
            <div className="flex gap-1.5 mt-2">
              <button
                onClick={() => setDate(today())}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  date === today()
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDate(tomorrow())}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  date === tomorrow()
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                }`}
              >
                Tomorrow
              </button>
            </div>
          </div>

          <div>
            <label className="label">Start time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">End time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button onClick={handleAdd} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add slot
          </button>
        </div>
      </div>

      {/* Slot list */}
      {hasSlots ? (
        <div className="space-y-6">
          {grouped.map(([date, daySlots]) => {
            const past = isPast(date);
            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="w-4 h-4 text-ink-400" />
                  <h3 className="text-sm font-semibold text-ink-700">
                    {prettyDateLong(date)}
                  </h3>
                  {past && (
                    <span className="text-xs text-ink-400 font-medium">(past)</span>
                  )}
                  <span className="text-xs text-ink-400 ml-1">
                    {daySlots.length} slot{daySlots.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {daySlots.map((slot) => {
                    const cfg = statusConfig[slot.status];
                    return (
                      <div
                        key={slot.id}
                        className="card p-4 flex items-center justify-between group hover:shadow-card-hover transition-shadow duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-ink-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-ink-900">
                              {prettyTime(slot.startTime)} — {prettyTime(slot.endTime)}
                            </p>
                            <span className={`badge mt-1 ${cfg.className}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemove(slot.id, slot)}
                          className="p-2 rounded-lg text-ink-300 hover:text-err-600 hover:bg-err-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-ink-50 flex items-center justify-center mb-5">
            <CalendarPlus className="w-8 h-8 text-ink-400" />
          </div>
          <h3 className="text-lg font-semibold text-ink-900">No slots yet</h3>
          <p className="text-ink-500 text-sm mt-2 max-w-sm">
            Add your first free slot using the form above. Once published, people can
            book time with you instantly.
          </p>
        </div>
      )}
    </div>
  );
}
