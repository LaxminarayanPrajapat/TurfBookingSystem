import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from './firebase';
import type { User } from '../types';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const authService = {
  async register(email: string, password: string, displayName: string, phoneNumber: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, { displayName });

    // Save user data to Firestore
    const userData: User = {
      id: user.uid,
      email: user.email || '',
      displayName,
      phoneNumber,
      role: 'user',
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);
    return user;
  },

  async login(email: string, password: string) {
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async logout() {
    await signOut(auth);
  },

  async getUserData(uid: string): Promise<User | null> {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return null;
  },

  async updateUserProfile(uid: string, data: Partial<User>) {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  },
};
