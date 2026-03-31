import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../services/authService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthStore {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;

    // Actions
    register: (email: string, password: string, displayName: string, phoneNumber: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    initializeAuth: () => void;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,

    register: async (email, password, displayName, phoneNumber) => {
        try {
            set({ loading: true, error: null });
            const firebaseUser = await authService.register(email, password, displayName, phoneNumber);
            const userData = await authService.getUserData(firebaseUser.uid);
            set({ user: userData, isAuthenticated: true, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    login: async (email, password) => {
        try {
            set({ loading: true, error: null });
            const firebaseUser = await authService.login(email, password);
            const userData = await authService.getUserData(firebaseUser.uid);
            set({ user: userData, isAuthenticated: true, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            set({ loading: true, error: null });
            await authService.logout();
            set({ user: null, isAuthenticated: false, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    initializeAuth: () => {
        try {
            onAuthStateChanged(auth, async (firebaseUser) => {
                if (firebaseUser) {
                    try {
                        const userData = await authService.getUserData(firebaseUser.uid);
                        set({ user: userData, isAuthenticated: true, loading: false });
                    } catch (error) {
                        set({ loading: false });
                    }
                } else {
                    set({ user: null, isAuthenticated: false, loading: false });
                }
            });
        } catch (error) {
            console.warn('Auth initialization warning:', error);
            set({ loading: false });
        }
    },

    setUser: (user) => {
        set({ user, isAuthenticated: user !== null });
    },
}));
