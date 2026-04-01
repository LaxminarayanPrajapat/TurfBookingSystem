// Seed script — populates Firestore with sample turfs
// Usage: node scripts/seed-db.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyDeL7cOBwF46yBT5nI7XPjuc-XSKjbY1yY',
    authDomain: 'studio-s0dug.firebaseapp.com',
    projectId: 'studio-s0dug',
    storageBucket: 'studio-s0dug.firebasestorage.app',
    messagingSenderId: '1093905399968',
    appId: '1:1093905399968:web:16945bdf82fa2de70d09c5',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const turfs = [
    {
        name: 'Green Valley Cricket Ground',
        location: 'Koramangala, Bangalore',
        description: 'Premium cricket turf with floodlights and professional pitch maintenance.',
        pricePerHour: 800,
        dayRate: 800,
        nightRate: 1000,
        rating: 4.8,
        reviewCount: 124,
        isAvailable: true,
        featured: true,
        pitchType: 'Natural Grass',
        amenities: ['Floodlights', 'Changing Rooms', 'Parking', 'Refreshments'],
        images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80'],
        ownerId: 'seed-owner-1',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Champions Arena',
        location: 'Indiranagar, Bangalore',
        description: 'State-of-the-art synthetic turf with 24/7 availability.',
        pricePerHour: 1200,
        dayRate: 1200,
        nightRate: 1500,
        rating: 4.6,
        reviewCount: 89,
        isAvailable: true,
        featured: false,
        pitchType: 'Synthetic',
        amenities: ['Floodlights', 'Parking', 'Equipment Rental', 'Cafeteria'],
        images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80'],
        ownerId: 'seed-owner-1',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Sunrise Cricket Club',
        location: 'HSR Layout, Bangalore',
        description: 'Budget-friendly turf perfect for casual matches and practice sessions.',
        pricePerHour: 500,
        dayRate: 500,
        nightRate: 700,
        rating: 4.3,
        reviewCount: 56,
        isAvailable: true,
        featured: false,
        pitchType: 'Artificial',
        amenities: ['Parking', 'Changing Rooms'],
        images: ['https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80'],
        ownerId: 'seed-owner-2',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Elite Sports Hub',
        location: 'Whitefield, Bangalore',
        description: 'Professional-grade turf used for corporate tournaments and league matches.',
        pricePerHour: 1500,
        dayRate: 1500,
        nightRate: 1800,
        rating: 4.9,
        reviewCount: 203,
        isAvailable: true,
        featured: false,
        pitchType: 'Natural Grass',
        amenities: ['Floodlights', 'Changing Rooms', 'Parking', 'Refreshments', 'Equipment Rental'],
        images: ['https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=800&q=80'],
        ownerId: 'seed-owner-2',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'City Cricket Ground',
        location: 'MG Road, Bangalore',
        description: 'Centrally located turf with easy access and ample parking.',
        pricePerHour: 900,
        dayRate: 900,
        nightRate: 1100,
        rating: 4.5,
        reviewCount: 78,
        isAvailable: false,
        featured: false,
        pitchType: 'Synthetic',
        amenities: ['Floodlights', 'Parking'],
        images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80'],
        ownerId: 'seed-owner-1',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

let seeded = 0;
for (const turf of turfs) {
    const ref = doc(collection(db, 'turfs'));
    await setDoc(ref, { ...turf, id: ref.id });
    console.log(`✅ Created: ${turf.name} (${ref.id})`);
    seeded++;
}

console.log(`\n🎉 Seeded ${seeded} turfs successfully!`);
process.exit(0);
