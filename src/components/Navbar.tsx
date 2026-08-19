import { CalendarDays, CalendarPlus, LayoutDashboard, UserRound, Users } from 'lucide-react';
import type { Role } from '@/lib/types';

export type View = 'availability' | 'bookings' | 'public';

interface NavbarProps {
  role: Role;
  view: View;
  onRoleChange: (role: Role) => void;
  onViewChange: (view: View) => void;
}

export function Navbar({ role, view, onRoleChange, onViewChange }: NavbarProps) {
  const adminTabs: { id: View; label: string; icon: typeof CalendarPlus }[] = [
    { id: 'availability', label: 'Availability', icon: CalendarPlus },
    { id: 'bookings', label: 'Bookings', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-ink-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-semibold text-ink-900">Slot Keeper</h1>
              <p className="text-xs text-ink-400 hidden sm:block">1:1 booking, simplified</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {role === 'admin' && (
              <nav className="hidden sm:flex items-center gap-1 mr-2">
                {adminTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = view === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onViewChange(tab.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        active
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-ink-500 hover:text-ink-800 hover:bg-ink-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            )}

            <div className="flex items-center bg-ink-100 rounded-xl p-1">
              <button
                onClick={() => {
                  onRoleChange('admin');
                  onViewChange('availability');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  role === 'admin'
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                <UserRound className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
              <button
                onClick={() => {
                  onRoleChange('public');
                  onViewChange('public');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  role === 'public'
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Book a slot</span>
              </button>
            </div>
          </div>
        </div>

        {role === 'admin' && (
          <nav className="flex sm:hidden items-center gap-1 pb-3 -mx-1">
            {adminTabs.map((tab) => {
              const Icon = tab.icon;
              const active = view === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onViewChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-500 hover:text-ink-800 hover:bg-ink-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
