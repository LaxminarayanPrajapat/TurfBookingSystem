import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Turf } from '../types';

export const turfService = {
  async getAllTurfs(filters?: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    isAvailable?: boolean;
  }): Promise<Turf[]> {
    const turfsCollection = collection(db, 'turfs');
    const constraints: QueryConstraint[] = [];

    if (filters?.isAvailable !== undefined) {
      constraints.push(where('isAvailable', '==', filters.isAvailable));
    }

    const q = constraints.length > 0 ? query(turfsCollection, ...constraints) : query(turfsCollection);
    const querySnapshot = await getDocs(q);
    let turfs: Turf[] = [];

    querySnapshot.forEach((doc) => {
      const turf = doc.data() as Turf;
      turfs.push(turf);
    });

    // Client-side filtering for price and location
    if (filters?.location) {
      turfs = turfs.filter((t) => t.location.toLowerCase().includes(filters.location!.toLowerCase()));
    }
    if (filters?.minPrice !== undefined) {
      turfs = turfs.filter((t) => t.pricePerHour >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      turfs = turfs.filter((t) => t.pricePerHour <= filters.maxPrice!);
    }

    return turfs;
  },

  async getTurfById(id: string): Promise<Turf | null> {
    const docSnap = await getDoc(doc(db, 'turfs', id));
    if (docSnap.exists()) {
      return docSnap.data() as Turf;
    }
    return null;
  },

  async createTurf(turf: Omit<Turf, 'id'>): Promise<string> {
    const newTurfRef = doc(collection(db, 'turfs'));
    const turfData: Turf = {
      ...turf,
      id: newTurfRef.id,
    };
    await setDoc(newTurfRef, turfData);
    return newTurfRef.id;
  },

  async updateTurf(id: string, data: Partial<Turf>): Promise<void> {
    await updateDoc(doc(db, 'turfs', id), data);
  },

  async deleteTurf(id: string): Promise<void> {
    await deleteDoc(doc(db, 'turfs', id));
  },

  async getTurfsByOwner(ownerId: string): Promise<Turf[]> {
    const turfsCollection = collection(db, 'turfs');
    const q = query(turfsCollection, where('ownerId', '==', ownerId));
    const querySnapshot = await getDocs(q);
    const turfs: Turf[] = [];

    querySnapshot.forEach((doc) => {
      turfs.push(doc.data() as Turf);
    });

    return turfs;
  },
};
