import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Booking } from '../types';

export const bookingService = {
  async createBooking(booking: Omit<Booking, 'id'>): Promise<string> {
    const newBookingRef = doc(collection(db, 'bookings'));
    const bookingData: Booking = {
      ...booking,
      id: newBookingRef.id,
    };
    await setDoc(newBookingRef, bookingData);
    return newBookingRef.id;
  },

  async getBookingById(id: string): Promise<Booking | null> {
    const docSnap = await getDoc(doc(db, 'bookings', id));
    if (docSnap.exists()) {
      return docSnap.data() as Booking;
    }
    return null;
  },

  async getUserBookings(userId: string): Promise<Booking[]> {
    const bookingsCollection = collection(db, 'bookings');
    const q = query(bookingsCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push(doc.data() as Booking);
    });

    return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getTurfBookings(turfId: string): Promise<Booking[]> {
    const bookingsCollection = collection(db, 'bookings');
    const q = query(bookingsCollection, where('turfId', '==', turfId));
    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push(doc.data() as Booking);
    });

    return bookings;
  },

  async updateBooking(id: string, data: Partial<Booking>): Promise<void> {
    await updateDoc(doc(db, 'bookings', id), data);
  },

  async cancelBooking(id: string): Promise<void> {
    await updateDoc(doc(db, 'bookings', id), {
      status: 'cancelled',
      updatedAt: new Date(),
    });
  },

  async getBookingsByTurfAndDate(
    turfId: string,
    date: Date
  ): Promise<Booking[]> {
    const bookingsCollection = collection(db, 'bookings');
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      bookingsCollection,
      where('turfId', '==', turfId),
      where('startTime', '>=', startOfDay),
      where('startTime', '<=', endOfDay),
      where('status', '!=', 'cancelled')
    );

    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push(doc.data() as Booking);
    });

    return bookings;
  },
};
