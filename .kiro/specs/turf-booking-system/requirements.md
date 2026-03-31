# Requirements Document

## Introduction

CricTurf is a full-stack cricket turf booking platform built with React 18, TypeScript, Vite, Tailwind CSS v3, and Firebase (Auth, Firestore, Storage). The system enables players to discover and book cricket turfs, turf owners to manage their grounds and bookings, and administrators to oversee the entire platform. The UI must implement the "Kinetic Arena" design system exactly as specified in `stadia_sprint/DESIGN.md`, with all pages matching their corresponding reference HTML files in `cricket_player_index_page/`, `explore_turfs/`, `booking_details/`, `dashboard_overview/`, `ground_availability_dashboard/`, `super_admin_panel/`, `turf_owner_management_portal/`, `user_profile_history/`, and `tournament_booking_flow/`.

---

## Glossary

- **System**: The CricTurf web application as a whole
- **App**: The React SPA entry point (`src/App.tsx`)
- **AuthService**: The Firebase Authentication service (`src/services/authService.ts`)
- **TurfService**: The Firestore turf CRUD service (`src/services/turfService.ts`)
- **BookingService**: The Firestore booking CRUD service (`src/services/bookingService.ts`)
- **AuthStore**: The Zustand authentication state store (`src/store/authStore.ts`)
- **TurfStore**: The Zustand turf state store (`src/store/turfStore.ts`)
- **BookingStore**: The Zustand booking state store (`src/store/bookingStore.ts`)
- **Navbar**: The glassmorphism sticky navigation component (`src/components/Navbar.tsx`)
- **ProtectedRoute**: The role-aware route guard component (`src/components/ProtectedRoute.tsx`)
- **HomePage**: The public landing page (`src/pages/HomePage.tsx`)
- **BrowseTurfsPage**: The turf discovery and filtering page (`src/pages/BrowseTurfsPage.tsx`)
- **TurfDetailsPage**: The individual turf detail page (`src/pages/TurfDetailsPage.tsx`)
- **BookingPage**: The slot selection and booking confirmation page (`src/pages/BookingPage.tsx`)
- **UserDashboardPage**: The authenticated user dashboard (`src/pages/UserDashboardPage.tsx`)
- **MyBookingsPage**: The user booking history page (`src/pages/MyBookingsPage.tsx`)
- **UserProfilePage**: The user profile and match history page (`src/pages/UserProfilePage.tsx`)
- **OwnerDashboardPage**: The turf owner management dashboard (`src/pages/OwnerDashboardPage.tsx`)
- **AdminDashboardPage**: The super admin control panel (`src/pages/AdminDashboardPage.tsx`)
- **TournamentBookingPage**: The tournament booking flow page (`src/pages/TournamentBookingPage.tsx`)
- **User**: An authenticated person with role `user`
- **TurfOwner**: An authenticated person with role `turf_owner`
- **Admin**: An authenticated person with role `admin`
- **Turf**: A cricket ground entity stored in Firestore `turfs` collection
- **Booking**: A reservation entity stored in Firestore `bookings` collection
- **TimeSlot**: A one-hour interval on a specific date for a specific Turf
- **KineticArena**: The design system defined in `stadia_sprint/DESIGN.md`
- **ActionOrange**: Primary brand color `#a04100` / container `#ff6b00`
- **CricketGreen**: Secondary brand color `#3b6934`
- **PitchWhite**: Surface color `#f8f9fa`
- **Glassmorphism**: `backdrop-blur-[20px]` with surface color at 70% opacity, used for the floating Navbar
- **GradientButton**: `linear-gradient(135deg, #a04100, #ff6b00)` with full border-radius

---

## Requirements

### Requirement 1: Design System Implementation

**User Story:** As a developer, I want a consistent KineticArena design system applied across all pages, so that the UI matches the reference HTML files exactly.

#### Acceptance Criteria

1. THE System SHALL configure Tailwind CSS with the KineticArena color tokens: `primary: #a04100`, `primary-container: #ff6b00`, `secondary: #3b6934`, `surface: #f8f9fa`, `surface-low: #f3f4f5`, `surface-lowest: #ffffff`, and `on-surface: #191c1d`.
2. THE System SHALL load the Lexend font (for display and headline text) and Inter font (for body and label text) via Google Fonts in `index.html`.
3. THE System SHALL define a `btn-gradient` CSS utility that applies `background: linear-gradient(135deg, #a04100, #ff6b00)`, `border-radius: 9999px`, and white text.
4. THE System SHALL define a `glass-nav` CSS utility that applies `background: rgba(248,249,250,0.7)`, `backdrop-filter: blur(20px)`, and `-webkit-backdrop-filter: blur(20px)`.
5. THE System SHALL prohibit 1px solid borders for section separation; background color shifts between `surface`, `surface-low`, and `surface-lowest` SHALL be used instead.
6. THE System SHALL use `on-surface` (`#191c1d`) for all primary text, never pure `#000000`.
7. THE System SHALL apply `border-radius: 0.75rem` (xl) to cards and `border-radius: 9999px` (full) to buttons, as specified in the KineticArena design.

---

### Requirement 2: Authentication

**User Story:** As a visitor, I want to register and log in with email and password, so that I can access role-specific features of the platform.

#### Acceptance Criteria

1. WHEN a visitor submits the registration form with a valid email, password of at least 6 characters, display name, and 10-digit phone number, THE AuthService SHALL create a Firebase Auth account and write a user document to Firestore `users/{uid}` with role `user`.
2. WHEN a visitor submits the login form with valid credentials, THE AuthService SHALL authenticate via Firebase Auth and THE AuthStore SHALL set `isAuthenticated` to `true` and populate the `user` object with Firestore profile data including `role`.
3. WHEN a User clicks logout, THE AuthService SHALL call Firebase `signOut` and THE AuthStore SHALL set `user` to `null` and `isAuthenticated` to `false`.
4. WHEN the App mounts, THE AuthStore SHALL call `onAuthStateChanged` to restore session state from Firebase Auth persistence.
5. IF a visitor submits the login form with invalid credentials, THEN THE System SHALL display a descriptive error toast notification without navigating away.
6. IF a visitor submits the registration form with a password shorter than 6 characters, THEN THE System SHALL display a validation error before submitting to Firebase.
7. IF a visitor submits the registration form with a phone number that does not match 10 digits, THEN THE System SHALL display a validation error before submitting to Firebase.
8. THE ProtectedRoute SHALL redirect unauthenticated visitors to `/login` when they attempt to access any protected route.
9. WHEN a TurfOwner attempts to access `/admin`, THE ProtectedRoute SHALL redirect them to `/` because the route requires role `admin`.
10. WHEN a User attempts to access `/owner`, THE ProtectedRoute SHALL redirect them to `/` because the route requires role `turf_owner`.
11. THE LoginPage SHALL render a form styled to match the KineticArena design system with ActionOrange GradientButton for the submit action.
12. THE RegisterPage SHALL render a form styled to match the KineticArena design system with ActionOrange GradientButton for the submit action.

---

### Requirement 3: Navbar

**User Story:** As a visitor or authenticated user, I want a sticky navigation bar that reflects my authentication state, so that I can navigate the platform from any page.

#### Acceptance Criteria

1. THE Navbar SHALL be sticky at the top of the viewport and apply the `glass-nav` Glassmorphism style as defined in the KineticArena design system.
2. THE Navbar SHALL display the "CricTurf" brand name in Lexend font with ActionOrange color.
3. WHEN a visitor is unauthenticated, THE Navbar SHALL display "Login" and "Register" buttons styled per the KineticArena component spec (Login: ghost/outline, Register: `surface_container_highest` background).
4. WHEN a User is authenticated, THE Navbar SHALL display the user's display name or avatar, a link to "My Bookings", a link to "Profile", and a "Logout" button.
5. WHEN a TurfOwner is authenticated, THE Navbar SHALL display a link to the Owner Dashboard in addition to the standard authenticated links.
6. WHEN an Admin is authenticated, THE Navbar SHALL display a link to the Admin Dashboard in addition to the standard authenticated links.
7. THE Navbar SHALL include navigation links to "Home" (`/`) and "Browse Turfs" (`/browse`) visible to all visitors.
8. WHEN the viewport width is below 768px, THE Navbar SHALL collapse the navigation links into a hamburger menu or mobile-friendly layout.

---

### Requirement 4: Home Page

**User Story:** As a visitor, I want to see an engaging landing page, so that I understand the platform's value and can search for turfs.

#### Acceptance Criteria

1. THE HomePage SHALL render a hero section with a cricket player background image, the headline "Book Your Perfect Cricket Turf" in Lexend display-lg (3.5rem) with tight letter-spacing, and a subheadline in Inter body text.
2. THE HomePage SHALL render a hero search bar with a city/location text input and a date picker input, and a "Search" GradientButton that navigates to `/browse` with the search parameters as query string.
3. THE HomePage SHALL render a features section with exactly 5 amenity cards (e.g., Floodlights, Changing Rooms, Parking, Refreshments, Equipment Rental) using CricketGreen icons on `surface-low` background cards.
4. THE HomePage SHALL render a "Top Rated Arenas" section displaying a grid of 4 turf cards, each showing a turf image, name, location, star rating, review count, and price per hour.
5. THE HomePage SHALL render a testimonials section with 3 user review cards showing avatar, name, rating stars, and comment text.
6. THE HomePage SHALL render a CTA section with ActionOrange background, a headline, and a GradientButton linking to `/browse`.
7. THE HomePage SHALL render a footer with the CricTurf brand, navigation links, and contact information.
8. THE HomePage SHALL match the layout, colors, typography, and component styles of `cricket_player_index_page/code.html` exactly.
9. WHEN a visitor clicks a turf card in the "Top Rated Arenas" section, THE HomePage SHALL navigate to `/turf/{id}`.

---

### Requirement 5: Browse Turfs Page

**User Story:** As a visitor, I want to search and filter available turfs, so that I can find a ground that matches my preferences.

#### Acceptance Criteria

1. THE BrowseTurfsPage SHALL fetch all turfs from Firestore via TurfStore on mount and display them in a responsive 3-column grid (1-column on mobile).
2. THE BrowseTurfsPage SHALL render a search input in the page header that filters turfs by name or location in real time on the client side.
3. THE BrowseTurfsPage SHALL render filter chips for: Location, Price Range, Availability, Pitch Type, and Sort By, matching the chip style in `explore_turfs/code.html`.
4. WHEN a visitor selects the "Availability" filter chip, THE BrowseTurfsPage SHALL show only turfs where `isAvailable` is `true`.
5. WHEN a visitor selects a Price Range filter, THE BrowseTurfsPage SHALL filter turfs to those with `pricePerHour` within the selected range.
6. WHEN a visitor selects a Sort By option, THE BrowseTurfsPage SHALL re-order the turf list by the selected criterion (rating, price ascending, price descending, or newest).
7. THE BrowseTurfsPage SHALL render a "Featured" turf card in a wide single-column layout above the grid, showing a large image, name, location, amenities, rating, and a "Book Now" GradientButton.
8. EACH turf card in the grid SHALL display: turf image, name, location, star rating, price per hour, an "Open Now" badge when `isAvailable` is `true`, and a "View Details" button.
9. WHEN a visitor clicks "View Details" on a turf card, THE BrowseTurfsPage SHALL navigate to `/turf/{id}`.
10. WHEN a visitor clicks "Book Now" on a turf card, THE BrowseTurfsPage SHALL navigate to `/booking/{turfId}` if authenticated, or to `/login` if unauthenticated.
11. THE BrowseTurfsPage SHALL match the layout, colors, and component styles of `explore_turfs/code.html` exactly.
12. WHEN the viewport width is below 768px, THE BrowseTurfsPage SHALL display a mobile bottom navigation bar matching the design in `explore_turfs/code.html`.

---

### Requirement 6: Turf Details Page

**User Story:** As a visitor, I want to view detailed information about a specific turf, so that I can decide whether to book it.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/turf/{id}`, THE TurfDetailsPage SHALL fetch the turf document from Firestore via TurfStore and display the turf's name, description, location, images, amenities, rating, and price per hour.
2. THE TurfDetailsPage SHALL render a hero section with a full-width turf image, a gradient overlay, and the turf name in Lexend display text overlaid on the image, matching `booking_details/code.html`.
3. THE TurfDetailsPage SHALL render an amenities section with exactly 4 icon cards (e.g., Floodlights, Changing Rooms, Parking, Pitch Type) on a `surface-low` background.
4. THE TurfDetailsPage SHALL render a sticky right sidebar containing a booking summary card and a map location card, matching the layout in `booking_details/code.html`.
5. THE TurfDetailsPage SHALL render a "Turf Rules" section listing the ground rules below the calendar.
6. IF the turf document does not exist in Firestore, THEN THE TurfDetailsPage SHALL display a "Turf not found" message and a link back to `/browse`.
7. WHEN a visitor clicks "Proceed to Booking" in the sidebar, THE TurfDetailsPage SHALL navigate to `/booking/{id}` if authenticated, or to `/login` if unauthenticated.

---

### Requirement 7: Booking Page (Slot Selection)

**User Story:** As a User, I want to select a date and time slot for a turf, so that I can confirm a booking.

#### Acceptance Criteria

1. THE BookingPage SHALL render a custom calendar UI (not the `react-calendar` library component) matching the design in `booking_details/code.html`, showing the current month with navigable previous/next month controls.
2. WHEN a User selects a date on the calendar, THE BookingPage SHALL fetch available time slots for that date via BookingStore's `getAvailableSlots` and render them in a time slot grid.
3. THE BookingPage SHALL render time slots from 06:00 to 22:00 in one-hour intervals, with each slot displaying its start time and one of three visual states: available (selectable), booked (disabled, greyed out), or selected (ActionOrange highlight).
4. WHEN a User clicks an available time slot, THE BookingPage SHALL mark it as selected and update the booking summary in the sidebar with the selected date, time, duration, and calculated total price.
5. WHEN a User clicks "Proceed to Payment" with at least one slot selected, THE BookingPage SHALL call BookingStore's `createBooking` with status `pending` and paymentStatus `pending`, then display a booking confirmation toast.
6. IF a User clicks "Proceed to Payment" with no slot selected, THEN THE BookingPage SHALL display a validation error toast without creating a booking.
7. THE BookingPage SHALL display a sticky booking summary sidebar showing: turf name, selected date, selected time slots, duration in hours, price per hour, and total price.
8. THE BookingPage SHALL match the layout, calendar UI, slot grid, and sidebar design of `booking_details/code.html` exactly.
9. WHEN a booking is successfully created, THE BookingPage SHALL navigate to `/my-bookings`.

---

### Requirement 8: User Dashboard

**User Story:** As a User, I want a personal dashboard showing my upcoming matches and featured turfs, so that I can manage my activity at a glance.

#### Acceptance Criteria

1. THE UserDashboardPage SHALL render a sidebar navigation with links to: Dashboard, My Bookings, Payments, Favorites, and Settings, matching `dashboard_overview/code.html`.
2. THE UserDashboardPage SHALL render a hero banner section with a flash sale or promotional message styled with ActionOrange.
3. THE UserDashboardPage SHALL render an "Upcoming Matches" table showing the User's confirmed bookings with columns: Turf Name, Date, Time, Duration, Status, and an action button.
4. THE UserDashboardPage SHALL fetch the User's bookings from Firestore via BookingStore on mount, filtered to status `confirmed` and start time in the future.
5. THE UserDashboardPage SHALL render a "Featured Turfs" grid of 3 turf cards fetched from TurfStore, each with a "Book Now" link.
6. THE UserDashboardPage SHALL match the layout, sidebar, table, and card styles of `dashboard_overview/code.html` exactly.
7. WHEN the viewport width is below 768px, THE UserDashboardPage SHALL display a mobile bottom navigation bar.

---

### Requirement 9: My Bookings Page

**User Story:** As a User, I want to view all my past and upcoming bookings, so that I can track and manage my reservations.

#### Acceptance Criteria

1. THE MyBookingsPage SHALL fetch all bookings for the authenticated User from Firestore via BookingStore on mount.
2. THE MyBookingsPage SHALL display bookings grouped into "Upcoming" (status `confirmed`, future date) and "Past" (status `completed` or `cancelled`, or past date) tabs.
3. EACH booking card SHALL display: turf name, date, start time, end time, total price, payment status, and booking status badge.
4. WHEN a User clicks "Cancel" on an upcoming booking, THE MyBookingsPage SHALL call BookingStore's `cancelBooking` and update the booking status to `cancelled` in Firestore.
5. IF a User has no bookings, THEN THE MyBookingsPage SHALL display an empty state message with a "Browse Turfs" link.
6. THE booking status badge SHALL use CricketGreen for `confirmed`, ActionOrange for `pending`, and a neutral grey for `cancelled` or `completed`.

---

### Requirement 10: User Profile Page

**User Story:** As a User, I want to view and edit my profile, see my match history, and track my reward points, so that I can manage my account.

#### Acceptance Criteria

1. THE UserProfilePage SHALL render a left sidebar with the User's avatar, display name, "Gold Member" badge, and navigation links to profile sections, matching `user_profile_history/code.html`.
2. THE UserProfilePage SHALL display stats: Matches Played (count of completed bookings), Reward Points (calculated as bookings × 10), and Win Rate (static display or configurable).
3. THE UserProfilePage SHALL render a "Match History" tab showing booking cards with turf name, date, time, duration, and total price for all past bookings.
4. THE UserProfilePage SHALL render a "Rewards" banner with ActionOrange gradient background showing the User's current reward points and a redemption CTA.
5. WHEN a User updates their display name or phone number in the profile edit form, THE UserProfilePage SHALL call AuthService's `updateUserProfile` and update the Firestore `users/{uid}` document.
6. THE UserProfilePage SHALL match the layout, sidebar, stats, and tab styles of `user_profile_history/code.html` exactly.

---

### Requirement 11: Turf Owner Dashboard

**User Story:** As a TurfOwner, I want to manage my grounds, view bookings, and control availability, so that I can operate my business efficiently.

#### Acceptance Criteria

1. THE OwnerDashboardPage SHALL render a sidebar with CricTurf branding and navigation links matching `ground_availability_dashboard/code.html` and `turf_owner_management_portal/code.html`.
2. THE OwnerDashboardPage SHALL render a "Ground Availability" grid of cards for each of the TurfOwner's turfs, each card showing the turf name, current status (Available / Occupied / Maintenance), and a toggle to change availability.
3. THE OwnerDashboardPage SHALL render a stats row showing: Daily Revenue (sum of today's confirmed booking prices), Total Bookings (count of all bookings for owner's turfs), and Peak Hours (most frequently booked hour).
4. THE OwnerDashboardPage SHALL render a "Pending Approvals" section showing booking requests with status `pending`, each with "Accept" and "Reject" action buttons.
5. WHEN a TurfOwner clicks "Accept" on a pending booking, THE OwnerDashboardPage SHALL call BookingStore's `updateBooking` to set status to `confirmed`.
6. WHEN a TurfOwner clicks "Reject" on a pending booking, THE OwnerDashboardPage SHALL call BookingStore's `updateBooking` to set status to `cancelled`.
7. THE OwnerDashboardPage SHALL render a "Price Management" section allowing the TurfOwner to set Day Rate and Night Rate per hour for each turf, calling TurfStore's `updateTurf` on save.
8. THE OwnerDashboardPage SHALL render an "Active Sessions" table showing currently active bookings (start time ≤ now ≤ end time) with turf name, user, start time, and end time.
9. THE OwnerDashboardPage SHALL fetch the TurfOwner's turfs via TurfStore's `fetchMyTurfs` and their bookings via BookingStore's `fetchTurfBookings` on mount.
10. THE OwnerDashboardPage SHALL match the layout and component styles of both `ground_availability_dashboard/code.html` and `turf_owner_management_portal/code.html` exactly.

---

### Requirement 12: Admin Dashboard

**User Story:** As an Admin, I want a super admin panel to manage turf owners, monitor platform health, and approve or suspend accounts, so that I can maintain platform integrity.

#### Acceptance Criteria

1. THE AdminDashboardPage SHALL render a sidebar with "Super Admin Panel" label and navigation links matching `super_admin_panel/code.html`.
2. THE AdminDashboardPage SHALL render a stats grid showing: Total Revenue (sum of all completed booking prices), Active Owners (count of users with role `turf_owner`), Total Bookings (count of all bookings), and Pending Approvals (count of bookings with status `pending`).
3. THE AdminDashboardPage SHALL render an "Owner Management" table with columns: Owner Name, Email, Turfs Count, Status, and Actions (Approve / Suspend / Reactivate).
4. THE AdminDashboardPage SHALL render a search input above the Owner Management table that filters owners by name or email in real time on the client side.
5. WHEN an Admin clicks "Suspend" on an owner row, THE AdminDashboardPage SHALL update the owner's Firestore `users/{uid}` document to set a `suspended: true` field.
6. WHEN an Admin clicks "Reactivate" on a suspended owner row, THE AdminDashboardPage SHALL update the owner's Firestore `users/{uid}` document to set `suspended: false`.
7. THE AdminDashboardPage SHALL render a "Recent Platform Activity" feed showing the 10 most recent bookings across all turfs with turf name, user, time, and status.
8. THE AdminDashboardPage SHALL render a "Platform Health" card showing uptime status, active sessions count, and error rate (static or Firestore-backed).
9. THE AdminDashboardPage SHALL match the layout, table, stats grid, and activity feed styles of `super_admin_panel/code.html` exactly.

---

### Requirement 13: Tournament Booking

**User Story:** As a User, I want to book a turf for a tournament with multi-day or single-day format options, so that I can organize competitive cricket events.

#### Acceptance Criteria

1. THE TournamentBookingPage SHALL render a tournament details form with fields: Tournament Name, Team Count, Format (Single Day / Multi-Day toggle), and Special Requirements text area.
2. WHEN a User selects "Single Day" format, THE TournamentBookingPage SHALL show a single date picker and time slot grid.
3. WHEN a User selects "Multi-Day" format, THE TournamentBookingPage SHALL show a date range picker (start date and end date) and a daily time slot selection.
4. THE TournamentBookingPage SHALL render a booking summary sidebar showing: tournament name, format, selected dates, selected slots, total duration, and total price.
5. WHEN a User submits the tournament booking form with all required fields and at least one slot selected, THE TournamentBookingPage SHALL call BookingStore's `createBooking` with the tournament details stored in `specialRequests`.
6. IF a User submits the tournament booking form with missing required fields, THEN THE TournamentBookingPage SHALL display field-level validation errors without submitting.
7. THE TournamentBookingPage SHALL match the layout, form, format selector, and sidebar styles of `tournament_booking_flow/code.html` exactly.

---

### Requirement 14: Firebase Integration

**User Story:** As a developer, I want all data operations to use Firebase services, so that the application has real-time persistence and secure authentication.

#### Acceptance Criteria

1. THE System SHALL initialize Firebase using environment variables `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID` from the `.env` file.
2. THE AuthService SHALL use Firebase Auth `browserLocalPersistence` so that user sessions persist across browser refreshes.
3. THE TurfService SHALL read and write turf documents to the Firestore `turfs` collection using the `Turf` type defined in `src/types/index.ts`.
4. THE BookingService SHALL read and write booking documents to the Firestore `bookings` collection using the `Booking` type defined in `src/types/index.ts`.
5. WHEN a TurfOwner uploads a turf image, THE System SHALL store the image in Firebase Storage under `turfs/{turfId}/{filename}` and save the download URL to the Turf document's `images` array.
6. IF a Firestore operation fails due to a network error, THEN THE System SHALL display an error toast notification with a descriptive message and set the relevant store's `error` field.
7. THE System SHALL use Firestore composite queries with `where` clauses for filtering bookings by `turfId`, `userId`, `status`, and date range as implemented in BookingService.

---

### Requirement 15: Responsive Design and Mobile Navigation

**User Story:** As a mobile user, I want the application to be fully usable on small screens, so that I can book turfs from my phone.

#### Acceptance Criteria

1. THE System SHALL implement responsive layouts using Tailwind CSS breakpoints: single-column on mobile (< 768px), two-column on tablet (768px–1024px), and multi-column on desktop (> 1024px).
2. WHEN the viewport width is below 768px, THE BrowseTurfsPage SHALL display a fixed bottom navigation bar with icons for Home, Browse, Bookings, and Profile, matching `explore_turfs/code.html`.
3. WHEN the viewport width is below 768px, THE UserDashboardPage SHALL display a fixed bottom navigation bar matching `dashboard_overview/code.html`.
4. THE Navbar SHALL be fully functional on mobile with a collapsible menu for navigation links.
5. THE BookingPage calendar and time slot grid SHALL reflow to a single-column layout on mobile viewports.
6. THE OwnerDashboardPage and AdminDashboardPage sidebars SHALL collapse to a top navigation bar or hamburger menu on mobile viewports.
7. ALL touch targets (buttons, links, slots) SHALL have a minimum height of 44px on mobile viewports to meet touch accessibility standards.
