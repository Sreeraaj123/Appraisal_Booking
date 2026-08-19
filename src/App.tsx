import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import type { View } from '@/components/Navbar';
import { ToastProvider } from '@/components/Toast';
import { AvailabilityView } from '@/components/AvailabilityView';
import { PublicView } from '@/components/PublicView';
import { BookingsView } from '@/components/BookingsView';
import { useSlots, useBookings } from '@/lib/store';
import type { Role } from '@/lib/types';

function App() {
  const [role, setRole] = useState<Role>('admin');
  const [view, setView] = useState<View>('availability');

  const { slots } = useSlots();
  const { bookings } = useBookings();

  const openCount = slots.filter((s) => s.status === 'open').length;
  const bookedCount = slots.filter((s) => s.status === 'booked').length;
  const completedCount = bookings.filter((b) => b.completed).length;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-ink-50">
        <Navbar role={role} view={view} onRoleChange={setRole} onViewChange={setView} />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {role === 'admin' && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
              <StatCard label="Open slots" value={openCount} tone="brand" />
              <StatCard label="Booked" value={bookedCount} tone="accent" />
              <StatCard label="Completed" value={completedCount} tone="ink" />
            </div>
          )}

          {role === 'admin' && view === 'availability' && (
            <AvailabilityView />
          )}

          {role === 'admin' && view === 'bookings' && (
            <BookingsView />
          )}

          {role === 'public' && (
            <PublicView />
          )}
        </main>

        <footer className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
          <p className="text-center text-xs text-ink-400">
            Slot Keeper — your data is saved on this device.
          </p>
        </footer>
      </div>
    </ToastProvider>
  );
}

const toneStyles: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-700',
  accent: 'bg-accent-50 text-accent-700',
  ink: 'bg-ink-100 text-ink-700',
};

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'brand' | 'accent' | 'ink';
}) {
  return (
    <div className="card p-4 sm:p-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl sm:text-3xl font-semibold text-ink-900 mt-1">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toneStyles[tone]}`}>
        <span className="text-lg font-bold">{value}</span>
      </div>
    </div>
  );
}

export default App;
