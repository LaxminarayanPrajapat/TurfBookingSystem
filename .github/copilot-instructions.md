# Turf Booking System - Copilot Instructions

## Project Overview
A React + Firebase turf booking system with user authentication, booking management, admin panel, and owner dashboard.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Components**: React Router, React Icons, React Calendar
- **Notifications**: React Toastify

## Project Structure
```
src/
├── components/       # Reusable React components
├── pages/           # Page components for routes
├── services/        # Firebase and API services
├── store/           # Zustand state management stores
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
├── hooks/           # Custom React hooks
├── App.tsx          # Main app component with routing
├── main.tsx         # React entry point
├── App.css          # App-level styles
└── index.css        # Global styles with Tailwind
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
1. Create a Firebase project at https://firebase.google.com
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Create a Storage bucket
5. Copy `.env.example` to `.env.local`
6. Fill in your Firebase configuration values

### 3. Run Development Server
```bash
npm run dev
```
The application will open at `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

## Key Features

### User Features
- User registration and authentication
- Browse available turfs
- Filter turfs by location and price
- View turf details with images and reviews
- Book turfs with date and time selection
- View booking history
- User profile management

### Turf Owner Features
- Add and manage turfs
- View bookings for their turfs
- Edit turf details
- Track revenue

### Admin Features
- Manage users
- Approve turf listings
- View system statistics
- Manage disputes

## Firestore Database Structure

### Collections
- **users**: User profiles and authentication data
- **turfs**: Turf/pitch information
- **bookings**: Booking records
- **reviews**: User reviews for turfs
- **payments**: Payment transaction records

## Component Architecture

### Protected Routes
- Routes requiring authentication redirect to `/login`
- Role-based route protection (admin, turf_owner, user)

### State Management
- `useAuthStore`: Authentication and user state
- `useTurfStore`: Turf data and operations
- `useBookingStore`: Booking operations

## Styling
- Tailwind CSS utility classes
- Custom CSS classes in `index.css` and `App.css`
- Responsive design with mobile-first approach

## Environment Variables
Create `.env.local` file with Firebase configuration:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Common Tasks

### Adding a New Page
1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Use components and stores as needed

### Adding a New Service
1. Create service file in `src/services/`
2. Export functions for Firebase operations
3. Use in stores or components

### Creating a New Store
1. Create file in `src/store/` using Zustand
2. Define interface and state
3. Export store hook
4. Use in components

## Deployment
- Build: `npm run build`
- Output: `dist/` folder
- Deploy to Vercel, Netlify, or Firebase Hosting

## Troubleshooting

### Firebase Connection Issues
- Verify Firebase credentials in `.env.local`
- Check Firestore rules allow read/write
- Ensure Auth providers are enabled

### State Issues
- Use Zustand hooks correctly
- Ensure stores are initialized
- Check browser console for errors

## Future Enhancements
- Payment gateway integration
- Email notifications
- Advanced search and filtering
- User reviews and ratings
- Analytics dashboard
- Mobile app with React Native
