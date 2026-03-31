# Design System Document

## 1. Overview & Creative North Star: "The Kinetic Arena"

This design system is built to move. It rejects the static, boxy constraints of traditional booking platforms in favor of **The Kinetic Arena**—a creative North Star that treats the digital interface as a high-performance sporting environment. 

The system breaks the "template" look through **intentional asymmetry** and **tonal depth**. We lean into the energy of cricket—the explosive sprint, the precise swing, and the pristine turf. By using aggressive typography scales and overlapping layout elements (e.g., player imagery breaking out of container bounds), we create a premium, editorial feel that conveys both the adrenaline of the sport and the reliability of a high-end service.

---

## 2. Colors: High-Performance Palette

We utilize a Material Design-inspired logic to ensure color serves a functional purpose while maintaining a vibrant, athletic soul.

### Core Palette
- **Primary (`#a04100` / `primary_container: #ff6b00`):** Our "Action Orange." This is the kinetic energy of the brand. Use it sparingly for critical interactions to maintain its "high-signal" impact.
- **Secondary (`#3b6934`):** Our "Cricket Green." Used for success states, turf-related iconography, and subtle professional accents that ground the orange.
- **Surface (`#f8f9fa`):** Our "Pitch White." The foundation of the experience. It must feel airy and expansive.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** To define boundaries, use background color shifts. A feature section should transition from `surface` to `surface_container_low` (`#f3f4f5`) to create a natural, sophisticated break.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers:
- **Level 0 (Base):** `surface` (`#f8f9fa`)
- **Level 1 (Cards/Sections):** `surface_container_low` (`#f3f4f5`)
- **Level 2 (Active Elements/Nested Cards):** `surface_container_lowest` (`#ffffff`)
By nesting a "Lowest" (brightest white) card inside a "Low" section, you create a soft, natural lift that feels premium rather than "pasted on."

### The "Glass & Gradient" Rule
To elevate the "Action Orange," do not use flat fills alone. Apply a subtle linear gradient from `primary` (`#a04100`) to `primary_container` (`#ff6b00`) at a 135-degree angle. For floating navigation or overlays, use **Glassmorphism**: `surface` color at 70% opacity with a `20px` backdrop-blur.

---

## 3. Typography: Editorial Authority

We pair the geometric precision of **Lexend** for displays with the hyper-readability of **Inter** for functional data.

- **Display (Lexend):** Use `display-lg` (3.5rem) for hero headlines. Use tight letter-spacing (-0.02em) to create a bold, "stadium billboard" impact.
- **Headline (Lexend):** Use `headline-lg` (2rem) for section titles. These should be "On Surface" and feel authoritative.
- **Title & Body (Inter):** Use `title-lg` (1.375rem) for card headings and `body-md` (0.875rem) for descriptions. 
- **The "Athletic Contrast":** Always pair a large, bold `display-sm` headline with a much smaller, uppercase `label-md` "kicker" above it (e.g., "PREMIUM TURFS" in Green over "The Best Grounds in London" in Black).

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are often too heavy for a modern athletic brand. We achieve depth through **The Layering Principle**.

- **Ambient Shadows:** When a card requires a floating effect (e.g., a "Featured Turf" card), use an extra-diffused shadow: `Y: 8px, Blur: 24px, Color: on_surface @ 6%`. This mimics natural stadium lighting.
- **The Ghost Border:** If a form input or card needs a boundary for accessibility, use `outline_variant` at **20% opacity**. Avoid high-contrast 100% opaque borders at all costs.
- **Motion-Blur Depth:** For background accents, use large, low-opacity blobs of `secondary_fixed` (`#bcf0ae`) with a 100px blur to simulate the periphery of a cricket field.

---

## 5. Components

### Buttons (The "Power Hitters")
- **Primary:** Gradient fill (`primary` to `primary_container`), `full` roundedness, `headline-sm` type. Add a subtle `primary_fixed` outer glow on hover.
- **Secondary:** Transparent background with a `Ghost Border` and `primary` text. Use for "View Details" or "Compare."
- **Navigation (Login/Register):** Use `surface_container_highest` for the background of the "Register" button to keep it distinct but secondary to the main CTA.

### Turf Image Cards
- **Forbid dividers.** Separate the image, title, and price using `spacing-4` (1.4rem) of vertical white space.
- **The "Overhang" Technique:** Let the price badge or a "Top Rated" chip overlap the edge of the image by `spacing-2` to break the grid.

### Booking Inputs
- Use `surface_container_lowest` for the input field background to make it "recess" into the `surface_container_low` page section. Use `rounded-md` (0.375rem) for a modern, slightly sharp look.

### Additional Signature Components
- **Live Availability Chip:** A `secondary_container` chip with a pulsing `secondary` dot to signify real-time turf status.
- **The "Innings" Progress Bar:** Use for multi-step booking, styled with a `primary_container` fill and `surface_dim` track.

---

## 6. Do's and Don'ts

### Do:
- **Do** use asymmetrical spacing. For example, give a hero image more bottom margin than top margin to create a sense of forward "lean."
- **Do** use high-quality photography with high contrast and "action" focus.
- **Do** rely on the `surface` scale for hierarchy instead of lines.

### Don't:
- **Don't** use pure black (`#000000`). Always use `on_surface` (`#191c1d`) for a softer, more professional deep grey.
- **Don't** use standard 4px border radii. Mix `full` for buttons and `xl` (0.75rem) for cards to create a varied, custom feel.
- **Don't** clutter the view. If a section feels busy, increase the spacing to `spacing-16` (5.5rem) or `spacing-20` (7rem).