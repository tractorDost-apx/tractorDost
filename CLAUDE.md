<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Architecture & Design Rules

### 1. Spatial UI & Glassmorphism Design

- We strictly follow a dark, immersive "Vision Pro"-style spatial UI.
- Do NOT use generic tailwind classes like `bg-glass-bg` or hardcoded `backdrop-blur` for main elements.
- Instead, ALWAYS use the centralized Tailwind v4 `@utility` classes defined in `src/app/globals.css`:
  - `glass-panel`: Use for main structural cards, modal backgrounds, and large containers. It includes a deep blur (`48px`), a subtle white top-border reflection, heavy dark drop-shadows, and `1.5rem` (`3xl`) rounded corners.
  - `glass-inner`: Use for nested panels, cards within a `glass-panel`, or secondary data containers. It has lighter opacity, a `24px` blur, and `1rem` (`2xl`) rounded corners.
  - `glass-button`: Use for interactive elements, pills, and standalone buttons. It has an extreme `9999px` (`full`) border radius, `20px` blur, and a built-in hover state.
- Ensure the `spatial-background` remains dark (`#050505`) so the translucent panels pop.

### 2. Premium Page Header Layouts (CRITICAL)

Whenever building a new page (e.g., public pages, catalogs, forms), you MUST follow this exact header layout to maintain 100% UI consistency across the platform:

- **Wrapper**: `max-w-7xl mx-auto px-6 pt-12 pb-24 min-h-screen`
- **Header Section**:

```tsx
<section className="relative flex flex-col items-center justify-center pt-20 pb-16 text-center">
  <div className="relative z-10 max-w-3xl space-y-6">
    <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
      Regular Title Text <span className="text-lime-400">Highlighted Text</span>
    </h1>
    <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
      Subheading or description text goes here.
    </p>
  </div>
  {/* Absolute glow behind the header */}
  <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-400/5 blur-[120px]" />
</section>
```

- **Color Rules**: ONLY use neon green/lime (e.g., `text-lime-400`, `bg-lime-500`) for primary data highlights, active states, and accents to match the financial dashboard aesthetic. Do NOT use orange or red gradients for primary elements. Red should only be used semantically for negative values or declined transactions.
- **Buttons**: Use the `<SpatialButton>` component (`variant="primary"`, `variant="secondary"`, `variant="glass"`) for all standard buttons. Primary buttons should typically feature the neon green accent.

### 3. Forms & Inputs

- For forms placed inside a `glass-panel`, inputs should use:
  `bg-secondary/20 border border-border/50 rounded-xl px-4 py-3 text-foreground`
- Input focus states must be:
  `focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all`

### 4. Navigation & Links

- Always use Next.js `<Link href="...">` components for internal navigation. Do NOT use standard `<a>` tags.
- Ensure proper hover states for all interactive elements (e.g., `hover:text-lime-400`, `hover:-translate-y-1 hover:shadow-xl hover:shadow-lime-400/10 transition-all duration-300` for cards).

### 5. Proper TypeScript

- Use strict and robust TypeScript. Clearly define interfaces and types for all props, application state, and API responses. Avoid using `any`.
- Keep type definitions centralized in `src/types/` organized by domain (e.g., `src/types/models/`, `src/types/api/`, `src/types/forms/`).

### 6. Folder Structure & Path Conventions (CRITICAL)

- The project follows a strict domain-based grouping within standard Next.js folders. When writing new code or modifying existing features, ALWAYS adhere to this exact structure:
  - **Routes & Pages**: Use App Router `src/app/` with route groups: `(public)`, `(auth)`, `(dashboard)`, `(dealer)`, and `(admin)`.
  - **Components**: Placed in `src/components/`. Use `ui/` for generic elements (ShadCN style). Use domain folders like `tractors/`, `used-tractors/`, `dealers/`, `admin/`, `dashboard/` for feature-specific components.
  - **Hooks**: Placed in `src/hooks/` organized by domain (e.g., `src/hooks/tractors/`, `src/hooks/auth/`).
  - **API Layer**: Placed in `src/lib/api/` organized by domain (e.g., `src/lib/api/tractors.ts`).
  - **Utilities & Validators**: Use `src/lib/utils/` for helpers and `src/lib/validators/` for Zod schemas.
  - **State Management**: Use `src/store/slices/` for Redux Toolkit logic.
  - **Configuration & SEO**: Use `src/config/` for app constants/routes and `src/lib/seo/` for metadata generation.
  - **i18n**: Placed in `src/i18n/messages/` for translations.
- Do NOT create generic `features/` or `services/` folders at the root. Always use the predefined `src/components/[domain]`, `src/hooks/[domain]`, and `src/lib/api/[domain]` structure.
