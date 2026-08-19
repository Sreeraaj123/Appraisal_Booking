export type SlotStatus = 'open' | 'booked' | 'cancelled';

export interface Slot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endTime: string; // HH:mm (24h)
  status: SlotStatus;
  createdAt: number;
}

export interface Booking {
  id: string;
  slotId: string;
  name: string;
  email: string;
  note: string;
  createdAt: number;
  completed: boolean;
}

export type Role = 'admin' | 'public';
