// One-time script to create an admin user using Firebase Admin SDK
// Usage: node scripts/create-admin.mjs
//
// Prerequisites:
//   1. npm install firebase-admin --save-dev
//   2. Download service account key from Firebase Console:
//      Project Settings → Service Accounts → Generate new private key
//      Save as scripts/serviceAccount.json

import { readFileSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// ── Change these if needed ───────────────────────────────────────────────────
const ADMIN_EMAIL = 'admin@cricturf.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME = 'Super Admin';
// ─────────────────────────────────────────────────────────────────────────────

let serviceAccount;
try {
    serviceAccount = JSON.parse(readFileSync('./scripts/serviceAccount.json', 'utf8'));
} catch {
    console.error('❌ Could not read scripts/serviceAccount.json');
    console.error('   Download it from: Firebase Console → Project Settings → Service Accounts → Generate new private key');
    process.exit(1);
}

if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount) });
}

const adminAuth = getAuth();
const adminDb = getFirestore();

try {
    let uid;

    try {
        const existing = await adminAuth.getUserByEmail(ADMIN_EMAIL);
        uid = existing.uid;
        console.log(`ℹ️  Auth user already exists (${uid}), updating Firestore document...`);
    } catch {
        const user = await adminAuth.createUser({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            displayName: ADMIN_NAME,
            emailVerified: true,
        });
        uid = user.uid;
        console.log(`✅ Firebase Auth user created: ${uid}`);
    }

    await adminDb.collection('users').doc(uid).set({
        id: uid,
        email: ADMIN_EMAIL,
        displayName: ADMIN_NAME,
        phoneNumber: '0000000000',
        role: 'admin',
        emailVerified: true,
        phoneVerified: true,
        suspended: false,
        createdAt: new Date(),
    }, { merge: true });

    console.log('✅ Admin user ready!');
    console.log('');
    console.log('  Email:    ' + ADMIN_EMAIL);
    console.log('  Password: ' + ADMIN_PASSWORD);
    console.log('');
    console.log('Log in at /login to access the Admin Dashboard.');
    process.exit(0);
} catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
}
