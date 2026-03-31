# Tasks

## Task List

- [x] 1. Design System Bootstrap
  - [x] 1.1 Update `index.html` to load Lexend, Inter, and Material Symbols Outlined from Google Fonts
  - [x] 1.2 Update `tailwind.config.js` with KineticArena color tokens (`primary: #ec5b13`, `primary-container: #ff6b00`, `secondary: #3b6934`, `surface: #f8f9fa`, `surface-low: #f3f4f5`, `surface-lowest: #ffffff`, `on-surface: #191c1d`)
  - [x] 1.3 Update `src/index.css` to replace existing utilities with `glass-nav`, `btn-gradient`, `loading-spinner`, and KineticArena badge/card utilities

- [x] 2. Type Extensions
  - [x] 2.1 Extend `User` interface in `src/types/index.ts` with `suspended?: boolean` and `rewardPoints?: number`
  - [x] 2.2 Extend `Booking` interface with `turfName?: string`, `bookingType?: 'regular' | 'tournament'`, and `tournamentDetails?` object
  - [x] 2.3 Extend `Turf` interface with `dayRate?: number`, `nightRate?: number`, `pitchType?: string`, and `featured?: boolean`

- [x] 3. Shared Components
  - [x] 3.1 Redesign `src/components/Navbar.tsx` — glassmorphism sticky nav, role-aware links, mobile hamburger
  - [x] 3.2 Create `src/components/CustomCalendar.tsx` — month grid with prev/next navigation, no react-calendar dependency
  - [x] 3.3 Create `src/components/TimeSlotGrid.tsx` — 06:00–22:00 hourly slots with available/booked/selected states
  - [x] 3.4 Create `src/components/BookingSidebar.tsx` — sticky summary sidebar with turf name, date, slots, price breakdown, CTA

- [x] 4. App Router Update
  - [x] 4.1 Add `/dashboard` route (UserDashboardPage, ProtectedRoute) and `/tournament/:turfId` route (TournamentBookingPage, ProtectedRoute) to `src/App.tsx`
  - [x] 4.2 Import and register `UserDashboardPage` and `TournamentBookingPage` in `src/App.tsx`

- [x] 5. Authentication Pages
  - [x] 5.1 Redesign `src/pages/LoginPage.tsx` — KineticArena styling, ActionOrange GradientButton, error toast on invalid credentials
  - [x] 5.2 Redesign `src/pages/RegisterPage.tsx` — KineticArena styling, client-side validation for password length and 10-digit phone, GradientButton

- [x] 6. Home Page
  - [x] 6.1 Redesign `src/pages/HomePage.tsx` — hero section with search bar (location + date inputs, Search GradientButton navigating to `/browse`)
  - [x] 6.2 Add features section with 5 amenity cards (CricketGreen icons, surface-low background)
  - [x] 6.3 Add "Top Rated Arenas" section with 4 turf cards fetched from TurfStore, each linking to `/turf/{id}`
  - [x] 6.4 Add testimonials section (3 review cards), CTA section (ActionOrange background, Browse link), and footer

- [x] 7. Browse Turfs Page
  - [x] 7.1 Redesign `src/pages/BrowseTurfsPage.tsx` — fetch turfs from TurfStore on mount, 3-column responsive grid
  - [x] 7.2 Add filter chips (Location, Price Range, Availability, Pitch Type, Sort By) with client-side filtering logic
  - [x] 7.3 Add featured turf card (wide single-column layout above grid)
  - [x] 7.4 Add mobile bottom navigation bar (visible below 768px)

- [x] 8. Turf Details Page
  - [x] 8.1 Redesign `src/pages/TurfDetailsPage.tsx` — hero image with gradient overlay and turf name, fetch turf from TurfStore
  - [x] 8.2 Add amenities section (4 icon cards, surface-low background)
  - [x] 8.3 Add sticky right sidebar using BookingSidebar component with "Proceed to Booking" CTA
  - [x] 8.4 Add Turf Rules section and "Turf not found" error state

- [ ] 9. Booking Page
  - [ ] 9.1 Redesign `src/pages/BookingPage.tsx` — integrate CustomCalendar component for date selection
  - [ ] 9.2 Integrate TimeSlotGrid component, fetch available slots via BookingStore on date change
  - [ ] 9.3 Integrate BookingSidebar with live price calculation; implement "Proceed to Payment" with validation (no slot → error toast), createBooking call, and navigate to `/my-bookings`

- [ ] 10. User Dashboard Page
  - [ ] 10.1 Create `src/pages/UserDashboardPage.tsx` — sidebar navigation (Dashboard, My Bookings, Payments, Favorites, Settings)
  - [ ] 10.2 Add hero banner (ActionOrange promotional section), Upcoming Matches table (fetch confirmed future bookings from BookingStore)
  - [ ] 10.3 Add Featured Turfs grid (3 cards from TurfStore) and mobile bottom navigation bar

- [ ] 11. My Bookings Page
  - [ ] 11.1 Redesign `src/pages/MyBookingsPage.tsx` — fetch all user bookings from BookingStore on mount
  - [ ] 11.2 Implement Upcoming / Past tab partition with booking cards showing status badges (CricketGreen for confirmed, ActionOrange for pending, grey for cancelled/completed)
  - [ ] 11.3 Implement Cancel action calling BookingStore.cancelBooking, and empty state with "Browse Turfs" link

- [ ] 12. User Profile Page
  - [ ] 12.1 Redesign `src/pages/UserProfilePage.tsx` — left sidebar with avatar, display name, Gold Member badge, section links
  - [ ] 12.2 Add stats row (Matches Played = completed bookings count, Reward Points = count × 10)
  - [ ] 12.3 Add Match History tab (past booking cards) and Rewards banner (ActionOrange gradient, redemption CTA)
  - [ ] 12.4 Implement profile edit form calling AuthService.updateUserProfile on save

- [ ] 13. Owner Dashboard Page
  - [ ] 13.1 Redesign `src/pages/OwnerDashboardPage.tsx` — sidebar navigation, fetch owner's turfs via TurfStore.fetchMyTurfs and bookings via BookingStore.fetchTurfBookings on mount
  - [ ] 13.2 Add Ground Availability grid (turf cards with status toggle calling TurfStore.updateTurf)
  - [ ] 13.3 Add stats row (Daily Revenue, Total Bookings, Peak Hours)
  - [ ] 13.4 Add Pending Approvals section with Accept (→ confirmed) and Reject (→ cancelled) actions
  - [ ] 13.5 Add Price Management section (Day Rate / Night Rate inputs, save calls TurfStore.updateTurf) and Active Sessions table

- [ ] 14. Admin Dashboard Page
  - [ ] 14.1 Redesign `src/pages/AdminDashboardPage.tsx` — sidebar with "Super Admin Panel" label, stats grid (Total Revenue, Active Owners, Total Bookings, Pending Approvals)
  - [ ] 14.2 Add Owner Management table with real-time search filter, Approve/Suspend/Reactivate actions (update Firestore users/{uid}.suspended)
  - [ ] 14.3 Add Recent Platform Activity feed (10 most recent bookings) and Platform Health card

- [ ] 15. Tournament Booking Page
  - [ ] 15.1 Create `src/pages/TournamentBookingPage.tsx` — tournament details form (Tournament Name, Team Count, Format toggle, Special Requirements)
  - [ ] 15.2 Implement Single Day / Multi-Day conditional date picker using CustomCalendar
  - [ ] 15.3 Integrate TimeSlotGrid and BookingSidebar; implement form validation and createBooking call with tournamentDetails in specialRequests

- [ ] 16. Firebase Service Enhancements
  - [ ] 16.1 Add `fetchMyTurfs(ownerId)` to TurfStore and `fetchTurfBookings(turfId)` to BookingStore if not already present
  - [ ] 16.2 Add `getAllUsers()` and `updateUserSuspension(uid, suspended)` to AuthService for admin operations
  - [ ] 16.3 Ensure all service errors are caught in stores and set the `error` field, triggering toast notifications in pages

- [ ] 17. Responsive Design Polish
  - [ ] 17.1 Verify and fix mobile bottom navigation bars on BrowseTurfsPage and UserDashboardPage (visible below 768px)
  - [ ] 17.2 Verify OwnerDashboardPage and AdminDashboardPage sidebars collapse to hamburger on mobile
  - [ ] 17.3 Verify all touch targets (buttons, slots, links) have minimum height 44px on mobile viewports
