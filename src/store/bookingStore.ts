import { create } from 'zustand';
import type { Booking } from '../types';
import { bookingService } from '../services/bookingService';

interface BookingStore {
    bookings: Booking[];
    currentBooking: Booking | null;
    loading: boolean;
    error: string | null;

    // Actions
    fetchUserBookings: (userId: string) => Promise<void>;
    fetchTurfBookings: (turfId: string) => Promise<void>;
    createBooking: (booking: Omit<Booking, 'id'>) => Promise<string>;
    updateBooking: (id: string, booking: Partial<Booking>) => Promise<void>;
    cancelBooking: (id: string) => Promise<void>;
    setCurrentBooking: (booking: Booking | null) => void;
    getAvailableSlots: (turfId: string, date: Date) => Promise<any[]>;
    clearError: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
    bookings: [],
    currentBooking: null,
    loading: false,
    error: null,

    fetchUserBookings: async (userId) => {
        try {
            set({ loading: true, error: null });
            const bookings = await bookingService.getUserBookings(userId);
            set({ bookings, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    fetchTurfBookings: async (turfId) => {
        try {
            set({ loading: true, error: null });
            const bookings = await bookingService.getTurfBookings(turfId);
            set({ bookings, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    createBooking: async (booking) => {
        try {
            set({ loading: true, error: null });
            const id = await bookingService.createBooking(booking);
            set({ loading: false });
            return id;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateBooking: async (id, booking) => {
        try {
            set({ loading: true, error: null });
            await bookingService.updateBooking(id, booking);
            set({ loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    cancelBooking: async (id) => {
        try {
            set({ loading: true, error: null });
            await bookingService.cancelBooking(id);
            set((state) => ({
                bookings: state.bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)),
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    setCurrentBooking: (booking) => {
        set({ currentBooking: booking });
    },

    getAvailableSlots: async (turfId: string, date: Date) => {
        // This would generate available time slots based on existing bookings
        const bookings = await bookingService.getBookingsByTurfAndDate(turfId, date);
        const slots = [];
        const startHour = 6;
        const endHour = 22;

        for (let hour = startHour; hour < endHour; hour++) {
            const slotStart = new Date(date);
            slotStart.setHours(hour, 0, 0, 0);
            const slotEnd = new Date(date);
            slotEnd.setHours(hour + 1, 0, 0, 0);

            const isAvailable = !bookings.some(
                (booking) =>
                    new Date(booking.startTime) < slotEnd &&
                    new Date(booking.endTime) > slotStart &&
                    booking.status === 'confirmed'
            );

            slots.push({
                startTime: slotStart,
                endTime: slotEnd,
                isAvailable,
            });
        }

        return slots;
    },

    clearError: () => {
        set({ error: null });
    },
}));
