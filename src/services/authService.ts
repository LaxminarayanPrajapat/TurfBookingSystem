import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    setPersistence,
    browserLocalPersistence,
    updateProfile,
    sendEmailVerification,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    type ConfirmationResult,
} from 'firebase/auth';
import { auth, db } from './firebase';
import type { User } from '../types';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

// Holds the phone confirmation result between steps
let phoneConfirmationResult: ConfirmationResult | null = null;

export const authService = {
    // ── Standard registration (role: user) ───────────────────────────────────
    async register(email: string, password: string, displayName: string, phoneNumber: string) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName });

        const userData: User = {
            id: user.uid,
            email: user.email || '',
            displayName,
            phoneNumber,
            role: 'user',
            emailVerified: false,
            phoneVerified: false,
            createdAt: new Date(),
        };
        await setDoc(doc(db, 'users', user.uid), userData);
        return user;
    },

    // ── Turf owner registration — step 1: create account + send email OTP ───
    async registerTurfOwner(email: string, password: string, displayName: string, phoneNumber: string) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName });

        // Send Firebase email verification
        await sendEmailVerification(user);

        // Save as turf_owner but unverified — admin approval still needed
        const userData: User = {
            id: user.uid,
            email: user.email || '',
            displayName,
            phoneNumber,
            role: 'turf_owner',
            emailVerified: false,
            phoneVerified: false,
            suspended: true, // suspended until both verified + admin approves
            createdAt: new Date(),
        };
        await setDoc(doc(db, 'users', user.uid), userData);
        return user;
    },

    // ── Check if Firebase email is verified and update Firestore ─────────────
    async checkAndUpdateEmailVerification(uid: string): Promise<boolean> {
        await auth.currentUser?.reload();
        const verified = auth.currentUser?.emailVerified ?? false;
        if (verified) {
            await setDoc(doc(db, 'users', uid), { emailVerified: true }, { merge: true });
        }
        return verified;
    },

    // ── Send phone OTP via Firebase Phone Auth ────────────────────────────────
    async sendPhoneOtp(phoneNumber: string, recaptchaContainerId: string): Promise<void> {
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
        const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
            size: 'invisible',
        });
        phoneConfirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    },

    // ── Verify phone OTP and update Firestore ─────────────────────────────────
    async verifyPhoneOtp(uid: string, otp: string): Promise<boolean> {
        if (!phoneConfirmationResult) throw new Error('No OTP session found. Please request OTP again.');
        await phoneConfirmationResult.confirm(otp);
        await setDoc(doc(db, 'users', uid), { phoneVerified: true }, { merge: true });
        phoneConfirmationResult = null;
        return true;
    },

    // ── Login ─────────────────────────────────────────────────────────────────
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
        if (docSnap.exists()) return docSnap.data() as User;
        return null;
    },

    async updateUserProfile(uid: string, data: Partial<User>) {
        await setDoc(doc(db, 'users', uid), data, { merge: true });
    },

    async getAllUsers(): Promise<User[]> {
        const snapshot = await getDocs(collection(db, 'users'));
        return snapshot.docs.map((d) => d.data() as User);
    },

    async updateUserSuspension(uid: string, suspended: boolean) {
        await setDoc(doc(db, 'users', uid), { suspended }, { merge: true });
    },

    async deleteUser(uid: string) {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'users', uid));
    },
};
