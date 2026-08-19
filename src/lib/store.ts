import { useEffect, useState, useCallback } from 'react';
import type { Slot, Booking } from './types';

const SLOTS_KEY = 'slotkeeper:slots';
const BOOKINGS_KEY = 'slotkeeper:bookings';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useSlots() {
  const [slots, setSlots] = useState<Slot[]>(() => read<Slot[]>(SLOTS_KEY, []));

  useEffect(() => {
    write(SLOTS_KEY, slots);
  }, [slots]);

  const addSlot = useCallback((date: string, startTime: string, endTime: string) => {
    const slot: Slot = {
      id: uid(),
      date,
      startTime,
      endTime,
      status: 'open',
      createdAt: Date.now(),
    };
    setSlots((prev) => [...prev, slot]);
    return slot;
  }, []);

  const removeSlot = useCallback((id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const setSlotStatus = useCallback((id: string, status: Slot['status']) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }, []);

  return { slots, addSlot, removeSlot, setSlotStatus };
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>(() =>
    read<Booking[]>(BOOKINGS_KEY, [])
  );

  useEffect(() => {
    write(BOOKINGS_KEY, bookings);
  }, [bookings]);

  const addBooking = useCallback(
    (slotId: string, name: string, email: string, note: string) => {
      const booking: Booking = {
        id: uid(),
        slotId,
        name,
        email,
        note,
        createdAt: Date.now(),
        completed: false,
      };
      setBookings((prev) => [...prev, booking]);
      return booking;
    },
    []
  );

  const cancelBooking = useCallback((id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const toggleCompleted = useCallback((id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b))
    );
  }, []);

  return { bookings, addBooking, cancelBooking, toggleCompleted };
}
