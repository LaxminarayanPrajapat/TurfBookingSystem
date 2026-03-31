# Design Document: CricTurf Turf Booking System

## Overview

CricTurf is a React 18 + TypeScript SPA for discovering and booking cricket turfs. The system serves three user roles — players (`user`), ground operators (`turf_owner`), and platform administrators (`admin`) — backed by Firebase Auth, Firestore, and Storage.

The primary goal of this design phase is to specify how the existing codebase skeleton is transformed into a fully-featured, pixel-accurate implementation of the "Kinetic Arena" design system. Every page must match its corresponding reference HTML file. The design decisions below prioritise minimal new abstractions: we extend what exists rather than replace it.

**Primary color used throughout**: `#ec5b13` (matches all reference HTML files). The `tailwind.config.js` will expose this as `primary` and `primary-container` tokens alongside the full KineticArena palette.

---

## Architecture

The application follows a layered client-side architecture:

```
┌─────────────────────────────────────────────────────┐
│                    React Pages / UI                  │
│  (HomePage, BrowseTurfsPage, BookingPage, …)         │
├─────────────────────────────────────────────────────┤
│               Zustand Stores (State)                 │
│  authStore  │  turfStore  │  bookingStore            │
├─────────────────────────────────────────────────────┤
│               Service Layer (Firebase SDK)           │
│  authService │ turfService │ bookingService          │
├─────────────────────────────────────────────────────┤
│          Firebase Platform                           │
│  Auth  │  Firestore  │  Storage                     │
└─────────────────────────────────────────────────────┘
```

### Routing (App.tsx)

Two new routes are added to the existing router:

| Path | Component | Guard |
|---|---|---|
| `/dashboard` | `UserDashboardPage` | `ProtectedRoute` (user) |
| `/tournament/:turfId` | `TournamentBookingPage` | `ProtectedRoute` (user) |

All existing routes remain unchanged.

### Design System Bootstrap

Three files are modified before any page work begins:

1. **`index.html`** — adds Google Fonts link for Lexend + Inter + Material Symbols Outlined
2. **`tailwind.config.js`** — extends theme with KineticArena color tokens
3. **`src/index.css`** — adds `glass-nav`, `btn-gradient`, and `loading-spinner` utilities

---

## Components and Interfaces

### Global Utilities (index.css additions)

```css
.glass-nav {
  background: rgba(248, 249, 250, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.btn-gradient {
  background: linear-gradient(135deg, #a04100, #ec5b13);
  border-radius: 9999px;
  color: #ffffff;
}
```

### Navbar (`src/components/Navbar.tsx`)

Complete redesign. Props: none (reads from `useAuthStore`).

- Sticky, `glass-nav` class, `z-50`
- Brand: "CricTurf" in Lexend, color `#ec5b13`
- Desktop links: Home, Browse Turfs (always visible)
- Unauthenticated: Login (ghost outline), Register (filled)
- Authenticated `user`: My Bookings, Dashboard, Profile, Logout
- Authenticated `turf_owner`: + Owner Dashboard link
- Authenticated `admin`: + Admin Panel link
- Mobile (< 768px): hamburger toggle, slide-down menu

### Custom Calendar (`src/components/CustomCalendar.tsx`) — new

Standalone component, no external calendar library.

```typescript
interface CustomCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  disabledDates?: Date[];
}
```

Renders a month grid with prev/next navigation. Selected date highlighted with `btn-gradient`. Used by `BookingPage` and `TournamentBookingPage`.

### TimeSlotGrid (`src/components/TimeSlotGrid.tsx`) — new

```typescript
interface TimeSlotGridProps {
  slots: TimeSlot[];           // 06:00–22:00 hourly
  selectedSlots: string[];     // slot ids
  onSlotToggle: (slotId: string) => void;
}
```

Three visual states per slot: available (white card), booked (grey, `cursor-not-allowed`), selected (ActionOrange border + background tint).

### BookingSidebar (`src/components/BookingSidebar.tsx`) — new

Sticky sidebar used by `TurfDetailsPage`, `BookingPage`, and `TournamentBookingPage`. Displays turf name, selected date/slots, duration, price breakdown, and CTA button.

### ProtectedRoute (`src/components/ProtectedRoute.tsx`) — keep as-is

Already handles `requiredRole` prop. No changes needed.

---

## Data Models

All types are defined in `src/types/index.ts`. The existing types cover all requirements. The following additions/extensions are needed:

### Extended `User` type

```typescript
export interface User {
  // existing fields …
  suspended?: boolean;          // admin can set true to suspend owner
  rewardPoints?: number;        // calculated: completedBookings × 10
}
```

### Extended `Booking` type

```typescript
export interface Booking {
  // existing fields …
  turfName?: string;            // denormalised for display performance
  bookingType?: 'regular' | 'tournament';
  tournamentDetails?: {
    tournamentName: string;
    teamCount: number;
    format: 'single_day' | 'multi_day';
  };
}
```

### Extended `Turf` type

```typescript
export interface Turf {
  // existing fields …
  dayRate?: number;             // owner-configurable day rate
  nightRate?: number;           // owner-configurable night rate
  pitchType?: string;           // e.g. "Natural Grass", "Artificial"
  featured?: boolean;           // admin can mark as featured
}
```

### Firestore Collections

| Collection | Document ID | Key fields |
|---|---|---|
| `users` | Firebase UID | `role`, `suspended`, `rewardPoints` |
| `turfs` | auto-id | `ownerId`, `isAvailable`, `featured` |
| `bookings` | auto-id | `userId`, `turfId`, `status`, `startTime`, `endTime` |

### Firestore Indexes Required

- `bookings`: composite index on `(turfId, startTime)` for slot availability queries
- `bookings`: composite index on `(userId, status)` for user dashboard queries
- `bookings`: composite index on `(turfId, status)` for owner pending approvals

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Registration round-trip

*For any* valid registration input (unique email, password ≥ 6 characters, non-empty displayName, 10-digit phone), after calling `authService.register()`, querying Firestore `users/{uid}` should return a document with the same email, displayName, phoneNumber, and role `user`.

**Validates: Requirements 2.1**

### Property 2: Auth session round-trip (login → logout)

*For any* valid credential pair, after `authStore.login()` the store should have `isAuthenticated === true` and a non-null `user` object; after a subsequent `authStore.logout()` the store should have `isAuthenticated === false` and `user === null`.

**Validates: Requirements 2.2, 2.3**

### Property 3: Role-based route protection

*For any* protected route that requires role R, a user whose `role` field is not R should be redirected away from that route (to `/login` if unauthenticated, to `/` if authenticated with wrong role).

**Validates: Requirements 2.8, 2.9, 2.10**

### Property 4: Client-side search filter correctness

*For any* non-empty search string and any list of turfs, every turf returned by the client-side filter should have its `name` or `location` field contain the search string (case-insensitive), and no turf whose name and location both exclude the string should appear in the result.

**Validates: Requirements 5.2**

### Property 5: Availability filter invariant

*For any* list of turfs, after applying the availability filter, every turf in the result should have `isAvailable === true`, and no turf with `isAvailable === false` should appear.

**Validates: Requirements 5.4**

### Property 6: Price range filter invariant

*For any* price range `[min, max]` and any list of turfs, every turf in the filtered result should satisfy `min ≤ pricePerHour ≤ max`.

**Validates: Requirements 5.5**

### Property 7: Sort order invariant

*For any* sort criterion (rating, price-asc, price-desc, newest) and any list of turfs, the returned list should be ordered such that for every adjacent pair `(a, b)`, `a` compares ≤ `b` according to the selected criterion.

**Validates: Requirements 5.6**

### Property 8: Time slot count invariant

*For any* turf and any selected date, the slot grid rendered by `BookingPage` should contain exactly 16 slots (one per hour from 06:00 to 21:00 inclusive, representing the 06:00–22:00 range).

**Validates: Requirements 7.3**

### Property 9: Slot selection state transition

*For any* available time slot, toggling it once should add its id to `selectedSlots`; toggling it again should remove it (idempotent toggle).

**Validates: Requirements 7.4**

### Property 10: Booking creation round-trip

*For any* non-empty selection of available slots on a given date, after `bookingStore.createBooking()` succeeds, querying Firestore `bookings/{id}` should return a document with `status === 'pending'`, `userId` matching the current user, and `turfId` matching the current turf.

**Validates: Requirements 7.5**

### Property 11: Booking list partition invariant

*For any* list of a user's bookings, the union of the "Upcoming" tab (future `startTime`, status `confirmed`) and the "Past" tab (past `startTime` or status `completed`/`cancelled`) should equal the full booking list with no duplicates and no omissions.

**Validates: Requirements 9.2**

### Property 12: Cancel booking state transition

*For any* booking with status `confirmed`, after `bookingStore.cancelBooking()`, the booking's status in Firestore should be `cancelled`.

**Validates: Requirements 9.4**

### Property 13: Reward points computed invariant

*For any* user with N bookings in status `completed`, the displayed "Matches Played" count should equal N and "Reward Points" should equal N × 10.

**Validates: Requirements 10.2**

### Property 14: Owner approval state transitions

*For any* booking with status `pending`, after the owner clicks "Accept" the booking status should be `confirmed`; after the owner clicks "Reject" the booking status should be `cancelled`. These transitions are mutually exclusive.

**Validates: Requirements 11.5, 11.6**

### Property 15: Admin suspend/reactivate round-trip

*For any* turf_owner user, after an admin suspends them (`suspended: true`) and then reactivates them (`suspended: false`), the user's `suspended` field should be `false` — restoring the original state.

**Validates: Requirements 12.5, 12.6**

### Property 16: Store error set on service failure

*For any* service call (auth, turf, booking) that rejects with an error, the corresponding Zustand store's `error` field should be set to a non-null, non-empty string describing the failure.

**Validates: Requirements 14.6**

---

## Error Handling

### Service Layer

All service functions (`authService`, `turfService`, `bookingService`) throw on failure. Stores catch these and set `error` state. Pages read `error` from stores and display `react-toastify` notifications.

| Error scenario | User-facing message |
|---|---|
| Login with wrong password | "Invalid email or password. Please try again." |
| Registration with existing email | "An account with this email already exists." |
| Firestore network failure | "Connection error. Please check your internet and retry." |
| Turf not found | "This turf could not be found." |
| Booking slot already taken | "This slot was just booked by someone else. Please choose another." |

### Form Validation (client-side, before Firebase)

- Password < 6 chars → inline error, no Firebase call
- Phone not matching `/^\d{10}$/` → inline error, no Firebase call
- Empty tournament form fields → field-level errors, no `createBooking` call
- No slot selected on booking submit → toast error, no `createBooking` call

### Route-level Error Boundaries

`TurfDetailsPage` handles missing turf document with a "Turf not found" UI and a back link. All other pages show a generic error state with a retry button when Firestore fetch fails.

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:

- **Unit tests** verify specific examples, integration points, and edge cases
- **Property tests** verify universal properties across many generated inputs

### Property-Based Testing

**Library**: [fast-check](https://github.com/dubzzz/fast-check) (TypeScript-native, works with Vitest)

**Configuration**: Each property test runs a minimum of 100 iterations (`numRuns: 100`).

**Tag format**: Each test file includes a comment:
```
// Feature: turf-booking-system, Property N: <property_text>
```

Each correctness property from the design document maps to exactly one property-based test:

| Property | Test file | Arbitraries used |
|---|---|---|
| P1: Registration round-trip | `authService.test.ts` | `fc.emailAddress()`, `fc.string({minLength:6})`, `fc.string()`, `fc.stringMatching(/^\d{10}$/)` |
| P2: Auth session round-trip | `authStore.test.ts` | `fc.emailAddress()`, `fc.string({minLength:6})` |
| P3: Role-based redirect | `ProtectedRoute.test.tsx` | `fc.constantFrom('user','turf_owner','admin')`, `fc.string()` (route path) |
| P4: Search filter | `turfFilters.test.ts` | `fc.array(fc.record({name:fc.string(), location:fc.string(), …}))`, `fc.string()` |
| P5: Availability filter | `turfFilters.test.ts` | `fc.array(fc.record({isAvailable:fc.boolean(), …}))` |
| P6: Price range filter | `turfFilters.test.ts` | `fc.array(fc.record({pricePerHour:fc.float({min:0}), …}))`, `fc.tuple(fc.float(), fc.float())` |
| P7: Sort order | `turfFilters.test.ts` | `fc.array(fc.record({rating:fc.float(), pricePerHour:fc.float(), …}))` |
| P8: Slot count invariant | `TimeSlotGrid.test.tsx` | `fc.date()` |
| P9: Slot selection toggle | `TimeSlotGrid.test.tsx` | `fc.string()` (slot id) |
| P10: Booking creation round-trip | `bookingService.test.ts` | `fc.array(fc.string(), {minLength:1})` (slot ids), `fc.date()` |
| P11: Booking partition | `MyBookingsPage.test.tsx` | `fc.array(fc.record({status:fc.constantFrom(…), startTime:fc.date(), …}))` |
| P12: Cancel booking | `bookingService.test.ts` | `fc.string()` (booking id) |
| P13: Reward points | `UserProfilePage.test.tsx` | `fc.integer({min:0, max:100})` (completed booking count) |
| P14: Owner approval | `bookingStore.test.ts` | `fc.string()` (booking id) |
| P15: Admin suspend/reactivate | `authService.test.ts` | `fc.string()` (uid) |
| P16: Store error on failure | `authStore.test.ts`, `turfStore.test.ts`, `bookingStore.test.ts` | `fc.string()` (error message) |

### Unit Tests

Unit tests focus on:
- Specific examples: rendering a known turf card, displaying a known booking
- Integration: `App.tsx` route rendering with mocked stores
- Edge cases: empty booking list, turf not found, zero reward points
- Error conditions: network failure toast display

**Framework**: Vitest + React Testing Library

Run tests with:
```bash
npx vitest --run
```

### Test File Structure

```
src/
  __tests__/
    authService.test.ts
    authStore.test.ts
    bookingService.test.ts
    bookingStore.test.ts
    turfFilters.test.ts
    turfStore.test.ts
    ProtectedRoute.test.tsx
    TimeSlotGrid.test.tsx
    MyBookingsPage.test.tsx
    UserProfilePage.test.tsx
```

