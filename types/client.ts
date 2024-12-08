export interface TimeSlot {
  id: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  days: number[]; // 0-6 for Sunday-Saturday
}

export interface Client {
  id: string;
  name: string;
  address: string;
  timeSlots: TimeSlot[];
  isActive: boolean;
}
