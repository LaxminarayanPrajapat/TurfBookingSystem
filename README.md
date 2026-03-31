# 🏟️ Turf Booking System

A modern React + Firebase web application for booking sports turfs/grounds. Users can browse available turfs, make bookings, manage their reservations, and turf owners can manage their properties.

## Features

### 👥 User Features
- **User Registration & Authentication** - Email/password signup and login
- **Browse Turfs** - Search and filter sports grounds by location and price
- **Booking Management** - Book turfs with date and time selection
- **Booking History** - View all past and upcoming bookings
- **User Profile** - Manage personal information
- **Real-time Availability** - Check available time slots

### 🏟️ Turf Owner Features
- **Manage Listings** - Add, edit, and delete turf listings
- **Booking Overview** - View all bookings for owned turfs
- **Revenue Tracking** - Monitor earnings from bookings
- **Owner Dashboard** - Central management hub

### 🛡️ Admin Features
- **User Management** - Manage platform users
- **Turf Approvals** - Approve new turf listings
- **Analytics Dashboard** - View platform statistics
- **System Monitoring** - Check payment and email services status

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **UI Components**: React Icons, React Calendar
- **Notifications**: React Toastify

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Navbar.tsx      # Navigation bar
│   └── ProtectedRoute.tsx # Route protection
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── BrowseTurfsPage.tsx
│   ├── TurfDetailsPage.tsx
│   ├── BookingPage.tsx
│   ├── MyBookingsPage.tsx
│   ├── UserProfilePage.tsx
│   ├── AdminDashboardPage.tsx
│   └── OwnerDashboardPage.tsx
├── services/           # Firebase services
│   ├── firebase.ts     # Firebase config
│   ├── authService.ts
│   ├── turfService.ts
│   └── bookingService.ts
├── store/              # Zustand stores
│   ├── authStore.ts
│   ├── turfStore.ts
│   └── bookingStore.ts
├── types/              # TypeScript types
│   └── index.ts
├── utils/              # Helper functions
│   └── helpers.ts
├── hooks/              # Custom React hooks
├── App.tsx             # Main app component
├── main.tsx            # Entry point
├── App.css             # App styles
└── index.css           # Global styles

public/                # Static assets
.env.example           # Environment variables template
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Firebase project account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd turf-booking-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (Email/Password provider)
   - Create a Firestore database (start in test mode for development)
   - Create a Cloud Storage bucket
   - Copy `.env.example` to `.env.local`
   - Add your Firebase configuration values:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:3000`

## Firestore Database Schema

### Collections

#### `users`
```typescript
{
  id: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  role: 'user' | 'turf_owner' | 'admin';
  createdAt: Timestamp;
  avatar?: string;
}
```

#### `turfs`
```typescript
{
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `bookings`
```typescript
{
  id: string;
  turfId: string;
  userId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'completed' | 'failed';
  specialRequests?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `reviews`
```typescript
{
  id: string;
  turfId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}
```

## Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server

# Build
npm run build            # Build for production

# Linting
npm run lint             # Run ESLint

# Preview
npm run preview          # Preview production build locally
```

## Styling

The project uses **Tailwind CSS** for styling with utility-first approach. Custom styles are defined in:
- `src/index.css` - Global styles and custom components
- `src/App.css` - App-level styles
- Component-level Tailwind classes

## State Management

Using **Zustand** for simple and scalable state management:

### `useAuthStore`
- Manages user authentication and profile
- Methods: `login()`, `register()`, `logout()`, `initializeAuth()`

### `useTurfStore`
- Manages turf listings and data
- Methods: `fetchAllTurfs()`, `fetchTurfById()`, `addTurf()`, `updateTurf()`, `deleteTurf()`

### `useBookingStore`
- Manages bookings and reservations
- Methods: `createBooking()`, `fetchUserBookings()`, `cancelBooking()`, `getAvailableSlots()`

## Firebase Security Rules

### Firestore Rules (Development)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /turfs/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null;
    }
    match /bookings/{document=**} {
      allow read, write: if request.auth.uid != null;
    }
    match /reviews/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null;
    }
  }
}
```

## Environment Variables

Create `.env.local` file:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Future Enhancements

- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced search with map integration
- [ ] User reviews and ratings system
- [ ] Invoice generation
- [ ] Analytics dashboard
- [ ] Mobile app with React Native
- [ ] Multi-language support
- [ ] Chat support system

## Troubleshooting

### Firebase Connection Issues
- Verify Firebase credentials in `.env.local`
- Check Firestore rules in Firebase Console
- Ensure Auth providers are enabled
- Test API key permissions

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf dist`
- Check TypeScript errors: `npm run build`

### Development Server Issues
- Port 3000 already in use: Change port in `vite.config.ts`
- Hot Module Replacement (HMR) issues: Check VS Code Vite extension

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub or contact support@turfbooking.com

## Changelog

### v0.1.0 (Initial Release)
- User authentication system
- Browse and search turfs
- Booking management
- User profile management
- Admin and owner dashboards
- Responsive design
- Firebase integration
