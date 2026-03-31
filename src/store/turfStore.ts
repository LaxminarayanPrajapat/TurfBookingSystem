import { create } from 'zustand';
import type { Turf } from '../types';
import { turfService } from '../services/turfService';

interface TurfStore {
    turfs: Turf[];
    selectedTurf: Turf | null;
    loading: boolean;
    error: string | null;
    myTurfs: Turf[];

    // Actions
    fetchAllTurfs: (filters?: any) => Promise<void>;
    fetchTurfById: (id: string) => Promise<void>;
    fetchMyTurfs: (ownerId: string) => Promise<void>;
    setSelectedTurf: (turf: Turf | null) => void;
    addTurf: (turf: Omit<Turf, 'id'>) => Promise<void>;
    updateTurf: (id: string, turf: Partial<Turf>) => Promise<void>;
    deleteTurf: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useTurfStore = create<TurfStore>((set) => ({
    turfs: [],
    selectedTurf: null,
    loading: false,
    error: null,
    myTurfs: [],

    fetchAllTurfs: async (filters) => {
        try {
            set({ loading: true, error: null });
            const turfs = await turfService.getAllTurfs(filters);
            set({ turfs, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    fetchTurfById: async (id) => {
        try {
            set({ loading: true, error: null });
            const turf = await turfService.getTurfById(id);
            set({ selectedTurf: turf, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    fetchMyTurfs: async (ownerId) => {
        try {
            set({ loading: true, error: null });
            const turfs = await turfService.getTurfsByOwner(ownerId);
            set({ myTurfs: turfs, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    setSelectedTurf: (turf) => {
        set({ selectedTurf: turf });
    },

    addTurf: async (turf) => {
        try {
            set({ loading: true, error: null });
            await turfService.createTurf(turf);
            set({ loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateTurf: async (id, turf) => {
        try {
            set({ loading: true, error: null });
            await turfService.updateTurf(id, turf);
            set({ loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteTurf: async (id) => {
        try {
            set({ loading: true, error: null });
            await turfService.deleteTurf(id);
            set({ loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));
