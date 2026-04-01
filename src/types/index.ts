// User types
export interface User {
    id: string;
    email: string;
    displayName: string;
    phoneNumber: string;
    role: 'user' | 'turf_owner' | 'admin';
    createdAt: Date;
    avatar?: string;
    suspended?: boolean;
    rewardPoints?: number;
    emailVerified?: boolean;
    phoneVerified?: boolean;
}

// Turf types
export interface Turf {
    id: string;
    name: string;
    description: string;
    location: string;
    latitude: number;
    longitude: number;
    ownerId: string;
    pricePerHour: number;
    capacity: number;
    amenities: string[];
    images: string[];
    rating: number;
    reviewCount: number;
    isAvailable: boolean;
    dayRate?: number;
    nightRate?: number;
    pitchType?: string;
    featured?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Booking types
export interface Booking {
    id: string;
    turfId: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    paymentStatus: 'pending' | 'completed' | 'failed';
    specialRequests?: string;
    turfName?: string;
    bookingType?: 'regular' | 'tournament';
    tournamentDetails?: {
        tournamentName: string;
        teamCount: number;
        format: 'single_day' | 'multi_day';
    };
    createdAt: Date;
    updatedAt: Date;
}

// Review types
export interface Review {
    id: string;
    turfId: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: Date;
}

// Payment types
export interface Payment {
    id: string;
    bookingId: string;
    userId: string;
    amount: number;
    paymentMethod: 'card' | 'upi' | 'wallet';
    transactionId: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
}

// Slot types
export interface TimeSlot {
    id: string;
    turfId: string;
    date: Date;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    price: number;
}
