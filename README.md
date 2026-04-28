# 🚜 TractorDost — Frontend Folder Structure
> **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · ShadCN UI · TanStack Query · Redux Toolkit · next-intl
> **Version:** v1.0 | April 2026

---

## Root Structure

```
TractorDost/
├── .github/
│   └── workflows/
│       ├── ci.yml                        # Lint, type-check, test on PR
│       └── deploy.yml                    # Vercel deploy on merge to main
├── public/
│   ├── images/
│   │   ├── logos/                        # Brand logos (mahindra, swaraj, etc.)
│   │   ├── banners/                      # Hero banner images
│   │   └── placeholders/                 # Skeleton/fallback images
│   ├── icons/
│   │   ├── favicon.ico
│   │   ├── apple-touch-icon.png
│   │   └── manifest-icons/              # PWA icon set
│   ├── fonts/
│   │   └── noto-sans-devanagari/        # Hindi/regional font files
│   ├── site.webmanifest
│   └── robots.txt
├── src/
│   ├── app/                             # Next.js 14 App Router
│   ├── components/                      # All UI components
│   ├── lib/                             # Utilities, API clients, helpers
│   ├── hooks/                           # Custom React hooks
│   ├── store/                           # Redux Toolkit store
│   ├── types/                           # TypeScript interfaces & enums
│   ├── config/                          # App-wide config constants
│   ├── styles/                          # Global CSS
│   └── i18n/                            # Internationalisation
├── .env.local                           # Local environment variables
├── .env.example                         # Template for team
├── .eslintrc.json
├── .prettierrc
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── next-sitemap.config.js
└── package.json
```

---

## `/src/app/` — App Router (Route Tree)

```
src/app/
├── layout.tsx                           # Root layout — Providers, fonts, Toaster
├── globals.css                          # Global CSS imports
├── not-found.tsx                        # 404 page
├── error.tsx                            # Global error boundary
├── loading.tsx                          # Global loading skeleton
│
├── (public)/                            # Route group — no auth required
│   ├── layout.tsx                       # Public layout: Header + Footer
│   │
│   ├── page.tsx                         # / — Homepage
│   ├── about/
│   │   └── page.tsx                     # /about
│   ├── contact/
│   │   └── page.tsx                     # /contact
│   │
│   ├── tractors/                        # New Tractor Catalog
│   │   ├── page.tsx                     # /tractors — All tractors with filters
│   │   ├── loading.tsx
│   │   ├── popular/
│   │   │   └── page.tsx                 # /tractors/popular
│   │   ├── latest/
│   │   │   └── page.tsx                 # /tractors/latest
│   │   ├── upcoming/
│   │   │   └── page.tsx                 # /tractors/upcoming
│   │   ├── mini/
│   │   │   └── page.tsx                 # /tractors/mini
│   │   ├── 4wd/
│   │   │   └── page.tsx                 # /tractors/4wd
│   │   ├── 2wd/
│   │   │   └── page.tsx                 # /tractors/2wd
│   │   ├── electric/
│   │   │   └── page.tsx                 # /tractors/electric
│   │   ├── cng/
│   │   │   └── page.tsx                 # /tractors/cng
│   │   ├── ac-cabin/
│   │   │   └── page.tsx                 # /tractors/ac-cabin
│   │   └── [brand]/
│   │       ├── page.tsx                 # /tractors/[brand] — Brand listing
│   │       └── [model]/
│   │           ├── page.tsx             # /tractors/[brand]/[model] — PDP
│   │           └── loading.tsx
│   │
│   ├── used-tractors/                   # Used Tractor Marketplace
│   │   ├── page.tsx                     # /used-tractors — All listings
│   │   ├── loading.tsx
│   │   ├── certified/
│   │   │   └── page.tsx                 # /used-tractors/certified
│   │   └── [state]/
│   │       ├── page.tsx                 # /used-tractors/[state]
│   │       └── [district]/
│   │           ├── page.tsx             # /used-tractors/[state]/[district]
│   │           └── [slug]/
│   │               └── page.tsx         # /used-tractors/[state]/[district]/[slug]
│   │
│   ├── sell-used-tractor/
│   │   └── page.tsx                     # /sell-used-tractor — Sell funnel
│   │
│   ├── implements/                      # Farm Equipment
│   │   ├── page.tsx                     # /implements
│   │   └── [category]/
│   │       ├── page.tsx                 # /implements/[category]
│   │       └── [model]/
│   │           └── page.tsx             # /implements/[category]/[model]
│   │
│   ├── harvesters/
│   │   ├── page.tsx                     # /harvesters
│   │   └── [type]/
│   │       └── page.tsx                 # /harvesters/[type]
│   │
│   ├── tyres/
│   │   └── page.tsx                     # /tyres
│   │
│   ├── compare/
│   │   ├── page.tsx                     # /compare — Compare picker
│   │   └── [slug]/
│   │       └── page.tsx                 # /compare/mahindra-575-vs-swaraj-855
│   │
│   ├── emi-calculator/
│   │   └── page.tsx                     # /emi-calculator
│   │
│   ├── used-tractor-valuation/
│   │   └── page.tsx                     # /used-tractor-valuation
│   │
│   ├── on-road-price/
│   │   └── page.tsx                     # /on-road-price
│   │
│   ├── loan/
│   │   ├── page.tsx                     # /loan — Loan overview
│   │   └── [type]/
│   │       └── page.tsx                 # /loan/new-tractor, /loan/used-tractor, etc.
│   │
│   ├── dealers/
│   │   ├── page.tsx                     # /dealers — All dealers
│   │   ├── [brand]/
│   │   │   └── page.tsx                 # /dealers/[brand]
│   │   └── [state]/
│   │       ├── page.tsx                 # /dealers/[state]
│   │       └── [district]/
│   │           ├── page.tsx             # /dealers/[state]/[district]
│   │           └── [slug]/
│   │               └── page.tsx         # /dealers/[state]/[district]/[slug]
│   │
│   ├── service-centers/
│   │   └── page.tsx                     # /service-centers
│   │
│   ├── showrooms/
│   │   └── page.tsx                     # /showrooms
│   │
│   ├── news/
│   │   ├── page.tsx                     # /news — All news
│   │   └── [slug]/
│   │       └── page.tsx                 # /news/[slug] — Article detail
│   │
│   ├── blogs/
│   │   ├── page.tsx                     # /blogs
│   │   └── [slug]/
│   │       └── page.tsx                 # /blogs/[slug]
│   │
│   ├── videos/
│   │   ├── page.tsx                     # /videos
│   │   └── [slug]/
│   │       └── page.tsx                 # /videos/[slug]
│   │
│   ├── web-stories/
│   │   └── page.tsx                     # /web-stories
│   │
│   ├── faq/
│   │   ├── page.tsx                     # /faq
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   └── [[...seo]]/                      # Programmatic SEO catch-all
│       └── page.tsx                     # /best-tractor-under-7-lakh
│                                        # /45-hp-tractors
│                                        # /mahindra-tractors-in-up
│                                        # /used-swaraj-tractor-in-haryana
│                                        # /tractor-loan-in-rajasthan
│
├── (auth)/                              # Auth route group
│   ├── layout.tsx                       # Minimal layout (no header/footer)
│   ├── login/
│   │   └── page.tsx                     # /login
│   ├── register/
│   │   └── page.tsx                     # /register
│   └── verify-otp/
│       └── page.tsx                     # /verify-otp
│
├── (dashboard)/                         # Buyer/Seller dashboard — protected
│   ├── layout.tsx                       # Dashboard layout: sidebar + topbar
│   └── dashboard/
│       ├── page.tsx                     # /dashboard — Home overview
│       ├── profile/
│       │   └── page.tsx                 # /dashboard/profile
│       ├── favorites/
│       │   └── page.tsx                 # /dashboard/favorites
│       ├── my-listings/
│       │   └── page.tsx                 # /dashboard/my-listings
│       ├── my-enquiries/
│       │   └── page.tsx                 # /dashboard/my-enquiries
│       ├── my-valuations/
│       │   └── page.tsx                 # /dashboard/my-valuations
│       ├── saved-searches/
│       │   └── page.tsx                 # /dashboard/saved-searches
│       ├── compare-history/
│       │   └── page.tsx                 # /dashboard/compare-history
│       ├── loans/
│       │   └── page.tsx                 # /dashboard/loans
│       └── notifications/
│           └── page.tsx                 # /dashboard/notifications
│
├── (dealer)/                            # Dealer dashboard — protected
│   ├── layout.tsx                       # Dealer layout: sidebar
│   └── dealer/
│       ├── dashboard/
│       │   └── page.tsx                 # /dealer/dashboard
│       ├── profile/
│       │   └── page.tsx                 # /dealer/profile
│       ├── leads/
│       │   └── page.tsx                 # /dealer/leads
│       ├── inventory/
│       │   └── page.tsx                 # /dealer/inventory
│       ├── services/
│       │   └── page.tsx                 # /dealer/services
│       └── analytics/
│           └── page.tsx                 # /dealer/analytics
│
├── (admin)/                             # Admin panel — protected + role-gated
│   ├── layout.tsx                       # Admin layout: sidebar + breadcrumbs
│   └── admin/
│       ├── dashboard/
│       │   └── page.tsx                 # /admin/dashboard — KPI overview
│       ├── users/
│       │   ├── page.tsx                 # /admin/users — User list
│       │   └── [id]/
│       │       └── page.tsx             # /admin/users/[id] — User detail
│       ├── tractors/
│       │   ├── page.tsx                 # /admin/tractors — Catalog list
│       │   ├── new/
│       │   │   └── page.tsx             # /admin/tractors/new
│       │   └── [id]/
│       │       └── page.tsx             # /admin/tractors/[id] — Edit model
│       ├── brands/
│       │   ├── page.tsx
│       │   └── [id]/
│       │       └── page.tsx
│       ├── used-listings/
│       │   ├── page.tsx                 # /admin/used-listings — Moderation queue
│       │   └── [id]/
│       │       └── page.tsx
│       ├── equipment/
│       │   └── page.tsx
│       ├── dealers/
│       │   ├── page.tsx
│       │   └── [id]/
│       │       └── page.tsx
│       ├── leads/
│       │   ├── page.tsx                 # /admin/leads — CRM
│       │   └── [id]/
│       │       └── page.tsx             # /admin/leads/[id] — Lead detail
│       ├── finance/
│       │   └── page.tsx                 # /admin/finance — Bank partners
│       ├── valuation/
│       │   └── page.tsx                 # /admin/valuation — Depreciation rules
│       ├── content/
│       │   ├── page.tsx                 # /admin/content — CMS dashboard
│       │   ├── news/
│       │   │   ├── page.tsx
│       │   │   └── [id]/
│       │   │       └── page.tsx
│       │   └── blogs/
│       │       ├── page.tsx
│       │       └── [id]/
│       │           └── page.tsx
│       ├── banners/
│       │   └── page.tsx                 # /admin/banners — Homepage control
│       ├── seo/
│       │   └── page.tsx                 # /admin/seo — Programmatic SEO pages
│       ├── reports/
│       │   └── page.tsx                 # /admin/reports — Analytics
│       └── settings/
│           └── page.tsx                 # /admin/settings — App config
│
└── api/                                 # Next.js Route Handlers (BFF layer)
    ├── auth/
    │   ├── send-otp/route.ts
    │   ├── verify-otp/route.ts
    │   └── refresh/route.ts
    ├── revalidate/route.ts              # ISR on-demand revalidation webhook
    └── og/route.tsx                     # Dynamic Open Graph image generation
```

---

## `/src/components/` — Component Library

```
src/components/
│
├── ui/                                  # ShadCN primitives (auto-generated)
│   ├── accordion.tsx
│   ├── alert.tsx
│   ├── alert-dialog.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── command.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── popover.tsx
│   ├── progress.tsx
│   ├── radio-group.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── skeleton.tsx
│   ├── slider.tsx
│   ├── switch.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   └── tooltip.tsx
│
├── shared/                              # App-wide shared components
│   ├── providers.tsx                    # QueryClient + Redux + i18n providers
│   ├── page-loader.tsx                  # Full-page spinner
│   ├── error-boundary.tsx               # React error boundary wrapper
│   ├── seo-head.tsx                     # Dynamic meta / schema markup injector
│   ├── image-with-fallback.tsx          # Next/Image with placeholder fallback
│   ├── infinite-scroll.tsx              # Intersection Observer scroll trigger
│   ├── otp-input.tsx                    # 6-box OTP input field
│   ├── phone-input.tsx                  # +91 prefixed mobile input
│   ├── language-switcher.tsx            # EN/HI/MR/TE/TA toggle
│   ├── back-button.tsx
│   └── share-button.tsx                 # Native share / clipboard copy
│
├── layout/                              # Page shell components
│   ├── public-layout.tsx                # Header + main + Footer wrapper
│   ├── dashboard-layout.tsx             # Sidebar + topbar for buyer/seller
│   ├── dealer-layout.tsx                # Sidebar for dealer panel
│   ├── admin-layout.tsx                 # Sidebar + breadcrumbs for admin
│   │
│   ├── header/
│   │   ├── index.tsx                    # Root header (3-row structure)
│   │   ├── top-bar.tsx                  # Row 1: phone, WhatsApp, language, login
│   │   ├── search-bar.tsx               # Row 2: logo + dual-tab search
│   │   ├── mega-menu.tsx                # Row 3: primary nav with mega-menu
│   │   ├── mobile-nav.tsx               # Hamburger drawer for mobile
│   │   └── search-tabs/
│   │       ├── new-tractor-tab.tsx
│   │       ├── used-tractor-tab.tsx
│   │       ├── implements-tab.tsx
│   │       ├── dealer-tab.tsx
│   │       ├── compare-tab.tsx
│   │       └── news-tab.tsx
│   │
│   ├── footer/
│   │   ├── index.tsx                    # Full footer
│   │   ├── footer-links.tsx             # Link columns
│   │   ├── footer-brands.tsx            # Brand quick links
│   │   └── footer-bottom.tsx            # Copyright, legal links
│   │
│   ├── sidebar/
│   │   ├── dashboard-sidebar.tsx
│   │   ├── dealer-sidebar.tsx
│   │   └── admin-sidebar.tsx
│   │
│   └── breadcrumbs.tsx                  # Dynamic breadcrumb component
│
├── homepage/                            # Homepage-specific sections
│   ├── hero-banner.tsx                  # Auto-rotating carousel (Embla)
│   ├── brands-carousel.tsx              # 16+ brand logos strip
│   ├── popular-tractors-grid.tsx        # 8 tractor cards grid
│   ├── new-launches-row.tsx             # NEW badge cards
│   ├── upcoming-tractors-row.tsx        # Pre-launch with notify
│   ├── electric-tractors-row.tsx
│   ├── valuation-cta-widget.tsx         # Inline brand/model/year + Get Value
│   ├── used-tractors-nearby.tsx         # Geo-filtered used listings
│   ├── emi-calculator-widget.tsx        # Inline homepage EMI tool
│   ├── government-schemes-strip.tsx     # Yojana card
│   ├── implements-section.tsx
│   ├── harvester-section.tsx
│   ├── bank-partners-strip.tsx          # SBI, HDFC, ICICI logos
│   ├── testimonials-carousel.tsx        # Farmer review cards
│   ├── news-strip.tsx                   # Horizontal scroll news
│   └── app-download-banner.tsx          # Play Store CTA
│
├── tractors/                            # New Tractor Catalog components
│   ├── tractor-card.tsx                 # Listing card (used in grid)
│   ├── tractor-card-skeleton.tsx
│   ├── tractor-grid.tsx                 # Responsive card grid
│   ├── brand-card.tsx                   # Brand logo + model count card
│   ├── brand-grid.tsx
│   │
│   ├── filters/
│   │   ├── filter-sidebar.tsx           # Desktop persistent sidebar
│   │   ├── filter-drawer.tsx            # Mobile slide-in drawer
│   │   ├── filter-group.tsx             # Collapsible filter group wrapper
│   │   ├── brand-filter.tsx
│   │   ├── hp-filter.tsx
│   │   ├── price-range-filter.tsx
│   │   ├── drive-type-filter.tsx
│   │   ├── fuel-type-filter.tsx
│   │   ├── special-type-filter.tsx
│   │   └── sort-select.tsx
│   │
│   └── pdp/                             # Product Detail Page sections
│       ├── pdp-header.tsx               # Model name, brand, rating, price
│       ├── pdp-image-gallery.tsx        # 5+ images, zoom, thumbnail strip
│       ├── pdp-key-highlights.tsx       # HP, CC, gearbox — icon strip
│       ├── pdp-on-road-price-form.tsx   # Name + mobile OTP → lead capture
│       ├── pdp-spec-tabs.tsx            # Tabbed engine/transmission/PTO spec
│       ├── pdp-emi-calculator.tsx       # Inline pre-filled EMI widget
│       ├── pdp-price-by-state.tsx       # State-wise price table
│       ├── pdp-nearby-dealers.tsx       # 5 nearest certified dealers
│       ├── pdp-reviews.tsx              # Star breakdown + review list
│       ├── pdp-similar-tractors.tsx     # 6 cross-sell cards
│       ├── pdp-faqs.tsx                 # FAQ accordion (FAQPage schema)
│       ├── pdp-sticky-compare-bar.tsx   # Sticky bottom compare bar
│       └── pdp-cta-sidebar.tsx          # Sticky CTA column (desktop)
│
├── used-tractors/                       # Used Marketplace components
│   ├── used-listing-card.tsx            # Card with certified badge, price, hours
│   ├── used-listing-card-skeleton.tsx
│   ├── used-listing-grid.tsx
│   ├── certified-badge.tsx              # Green CERTIFIED overlay component
│   ├── hours-meter.tsx                  # Visual hours-driven meter bar
│   │
│   ├── filters/
│   │   ├── used-filter-sidebar.tsx
│   │   ├── used-filter-drawer.tsx
│   │   ├── state-district-filter.tsx
│   │   ├── year-range-filter.tsx
│   │   ├── ownership-filter.tsx
│   │   ├── hours-filter.tsx
│   │   └── condition-filter.tsx
│   │
│   ├── listing-detail/
│   │   ├── used-pdp-header.tsx
│   │   ├── used-pdp-gallery.tsx
│   │   ├── used-pdp-seller-info.tsx     # Masked phone; reveal after enquiry
│   │   ├── used-pdp-condition-report.tsx
│   │   ├── used-pdp-documents.tsx
│   │   └── used-pdp-enquiry-form.tsx
│   │
│   └── sell-funnel/                     # 5-step sell funnel
│       ├── sell-funnel-stepper.tsx      # Step progress indicator
│       ├── step-1-basic-details.tsx
│       ├── step-2-location.tsx
│       ├── step-3-photos.tsx            # Drag-and-drop image upload
│       ├── step-4-contact-otp.tsx
│       └── step-5-valuation-price.tsx   # Price output + slider
│
├── compare/                             # Comparison Engine
│   ├── compare-picker.tsx               # Search overlay to pick models
│   ├── compare-sticky-bar.tsx           # Floating bottom bar
│   ├── compare-table.tsx                # Full spec matrix table
│   ├── compare-row.tsx                  # Single spec row with winner highlight
│   ├── compare-header-card.tsx          # Model thumbnail + name card
│   └── compare-actions.tsx              # Share URL, Save, Export PDF, Loan CTA
│
├── emi/                                 # EMI & Finance
│   ├── emi-calculator.tsx               # Full calculator with all inputs
│   ├── emi-result-card.tsx              # Monthly EMI hero display
│   ├── amortization-table.tsx           # Month-by-month breakdown
│   ├── emi-pie-chart.tsx                # Principal vs Interest (Recharts)
│   └── loan-offers-list.tsx             # 3–5 bank offer cards
│
├── valuation/                           # Valuation Engine
│   ├── valuation-form.tsx               # All valuation inputs
│   ├── valuation-result.tsx             # Price bands output display
│   ├── price-range-bar.tsx              # MIN–MAX bar with marker
│   ├── depreciation-chart.tsx           # Timeline chart (Recharts)
│   └── valuation-cta.tsx               # Sell CTA after result
│
├── dealers/                             # Dealer Locator
│   ├── dealer-card.tsx
│   ├── dealer-grid.tsx
│   ├── dealer-map.tsx                   # Google Maps integration
│   ├── dealer-detail-header.tsx
│   ├── dealer-contact-panel.tsx         # Call / WhatsApp / Form
│   └── dealer-reviews.tsx
│
├── leads/                               # Lead Capture Modals & Forms
│   ├── get-price-modal.tsx              # On-Road price lead modal
│   ├── callback-widget.tsx              # Sticky 'Call Me' float button
│   ├── brochure-gate-modal.tsx          # Gated brochure download form
│   ├── test-drive-modal.tsx
│   ├── loan-enquiry-modal.tsx
│   └── lead-form-base.tsx               # Shared base: name, mobile, OTP, state
│
├── auth/                                # Auth flow components
│   ├── otp-login-form.tsx
│   ├── email-login-form.tsx
│   ├── register-form.tsx
│   ├── google-auth-button.tsx
│   └── auth-guard.tsx                   # Client-side protected route wrapper
│
├── dashboard/                           # Buyer/Seller dashboard widgets
│   ├── dashboard-stats-row.tsx          # Quick stats cards
│   ├── enquiry-table.tsx
│   ├── my-listing-card.tsx
│   ├── my-listing-actions.tsx           # Edit, Pause, Boost, Delete
│   ├── favorites-grid.tsx
│   ├── loan-application-tracker.tsx
│   ├── valuation-history-list.tsx
│   ├── notification-settings.tsx
│   └── profile-form.tsx
│
├── dealer-panel/                        # Dealer dashboard widgets
│   ├── lead-inbox-table.tsx
│   ├── lead-detail-card.tsx
│   ├── call-disposition-modal.tsx
│   ├── inventory-table.tsx
│   └── dealer-analytics-charts.tsx
│
├── admin/                               # Admin panel widgets
│   ├── kpi-card.tsx                     # Single KPI metric card
│   ├── kpi-grid.tsx                     # Dashboard KPI row
│   ├── data-table.tsx                   # Reusable sortable/filterable table
│   ├── data-table-toolbar.tsx           # Search + filter bar for table
│   ├── data-table-pagination.tsx
│   ├── tractor-form.tsx                 # Add/Edit tractor model form
│   ├── spec-tab-form.tsx                # Spec editor tabs
│   ├── image-upload-manager.tsx         # Gallery manager with reorder
│   ├── listing-moderation-card.tsx
│   ├── banner-editor.tsx                # Drag-and-drop homepage editor
│   ├── crm-lead-table.tsx
│   ├── lead-detail-panel.tsx
│   ├── audit-log-viewer.tsx
│   └── role-permission-matrix.tsx
│
├── search/                              # Global Search
│   ├── global-search-bar.tsx            # Header search input
│   ├── search-autocomplete.tsx          # Dropdown with suggestions
│   ├── search-results-page.tsx          # /search?q= results layout
│   ├── trending-searches.tsx            # Top 10 from Redis
│   └── recent-searches.tsx
│
└── forms/                               # Reusable form primitives
    ├── form-field-wrapper.tsx           # Label + input + error message
    ├── state-district-select.tsx        # Cascading state → district
    ├── brand-model-select.tsx           # Cascading brand → model
    ├── price-range-slider.tsx
    ├── image-uploader.tsx               # react-dropzone wrapper
    ├── rich-text-editor.tsx             # CMS content editor
    └── csv-import-form.tsx              # Admin bulk import
```

---

## `/src/lib/` — Utilities & API Layer

```
src/lib/
│
├── api/                                 # Axios API modules (one per domain)
│   ├── client.ts                        # Axios instance + interceptors
│   ├── auth.ts                          # /auth/* endpoints
│   ├── tractors.ts                      # /tractors/* endpoints
│   ├── used-listings.ts                 # /used-listings/* endpoints
│   ├── dealers.ts                       # /dealers/* endpoints
│   ├── leads.ts                         # /leads/* endpoints
│   ├── valuation.ts                     # /valuation endpoint
│   ├── emi.ts                           # /emi/calculate endpoint
│   ├── loan.ts                          # /loan-products, /loan-applications
│   ├── implements.ts
│   ├── news.ts
│   ├── compare.ts
│   ├── reviews.ts
│   ├── banners.ts
│   └── index.ts                         # Re-exports all
│
├── utils/
│   ├── format-currency.ts               # ₹ formatting (INR, lakh, crore)
│   ├── format-date.ts                   # Date helpers using date-fns
│   ├── format-number.ts                 # 50000 → 50K etc.
│   ├── slug.ts                          # Generate & parse slugs
│   ├── geo.ts                           # Haversine distance, geo-detection
│   ├── image.ts                         # CloudFront URL builder, compress
│   ├── emi-calc.ts                      # EMI formula (pure function)
│   ├── valuation-calc.ts                # Depreciation algorithm (pure)
│   ├── lead-score.ts                    # Intent scoring logic
│   └── cn.ts                            # clsx + tailwind-merge helper
│
├── validators/                          # Zod schemas
│   ├── auth.schema.ts                   # OTP, login, register
│   ├── tractor.schema.ts
│   ├── used-listing.schema.ts
│   ├── lead.schema.ts
│   ├── dealer.schema.ts
│   ├── review.schema.ts
│   └── sell-funnel.schema.ts            # Multi-step sell form
│
├── constants/
│   ├── brands.ts                        # Static brand list with logos
│   ├── states-districts.ts              # All Indian states + districts
│   ├── hp-ranges.ts                     # HP filter bands
│   ├── loan-types.ts
│   ├── lead-statuses.ts
│   ├── equipment-categories.ts
│   └── depreciation-curves.ts
│
└── seo/
    ├── generate-metadata.ts             # Dynamic Next.js metadata helper
    ├── schema-markup.ts                 # JSON-LD generators (Product, FAQ, etc.)
    ├── og-image.ts                      # Open Graph image URL builder
    └── programmatic-seo.ts             # SEO page template generator
```

---

## `/src/hooks/` — Custom React Hooks

```
src/hooks/
│
├── auth/
│   ├── use-auth.ts                      # Current user + auth state
│   ├── use-otp.ts                       # Send OTP, verify OTP, countdown
│   └── use-require-auth.ts              # Redirect hook for protected pages
│
├── tractors/
│   ├── use-tractors.ts                  # Paginated catalog with filters
│   ├── use-tractor.ts                   # Single model by slug
│   ├── use-popular-tractors.ts
│   ├── use-similar-tractors.ts
│   └── use-brands.ts
│
├── used-listings/
│   ├── use-used-listings.ts
│   ├── use-used-listing.ts
│   ├── use-create-listing.ts
│   └── use-listing-actions.ts          # Edit, pause, boost, mark-sold
│
├── dealers/
│   ├── use-dealers.ts
│   ├── use-dealer.ts
│   └── use-nearby-dealers.ts
│
├── leads/
│   ├── use-submit-lead.ts
│   ├── use-my-enquiries.ts
│   └── use-lead-actions.ts             # Admin/agent: assign, update status
│
├── search/
│   ├── use-search.ts                    # Global search with debounce
│   ├── use-autocomplete.ts
│   └── use-trending-searches.ts
│
└── ui/
    ├── use-local-storage.ts
    ├── use-debounce.ts
    ├── use-intersection-observer.ts     # Infinite scroll trigger
    ├── use-geo-location.ts              # Browser geolocation for nearby
    ├── use-media-query.ts               # Responsive breakpoint detection
    ├── use-compare.ts                   # Compare bar state actions
    └── use-wishlist.ts                  # Favorites add/remove
```

---

## `/src/store/` — Redux Toolkit

```
src/store/
│
├── index.ts                             # configureStore + RootState + AppDispatch
│
└── slices/
    ├── auth.slice.ts                    # user, isAuthenticated, isLoading
    ├── compare.slice.ts                 # modelIds[], maxModels: 4
    ├── search.slice.ts                  # query, filters, recent searches
    ├── ui.slice.ts                      # modals open/close, drawer state
    └── cart.slice.ts                    # Future: saved items / shortlist
```

---

## `/src/types/` — TypeScript Definitions

```
src/types/
│
├── models/
│   ├── user.ts                          # User, UserRole, UserProfile
│   ├── tractor.ts                       # Tractor, TractorSpec, TractorImage
│   ├── brand.ts                         # Brand
│   ├── used-listing.ts                  # UsedListing, ConditionGrade
│   ├── dealer.ts                        # Dealer, ServiceCenter
│   ├── lead.ts                          # Lead, LeadType, LeadStatus
│   ├── loan.ts                          # LoanPartner, LoanProduct, LoanApplication
│   ├── implement.ts                     # Implement, EquipmentCategory
│   ├── content.ts                       # BlogPost, NewsPost, Video
│   ├── valuation.ts                     # ValuationRequest, ValuationResult
│   └── index.ts                         # Re-exports all models
│
├── api/
│   ├── responses.ts                     # ApiResponse<T>, PaginatedResponse<T>
│   ├── errors.ts                        # ApiError, ValidationError
│   └── filters.ts                       # TractorFilters, UsedListingFilters
│
├── forms/
│   ├── auth-forms.ts                    # OtpForm, LoginForm, RegisterForm
│   ├── lead-forms.ts                    # GetPriceForm, CallbackForm
│   ├── sell-funnel.ts                   # Step1–5 form types
│   └── admin-forms.ts                   # TractorForm, DealerForm
│
└── enums/
    ├── roles.ts                          # UserRole enum
    ├── statuses.ts                       # LeadStatus, ListingStatus
    ├── fuel-types.ts
    └── condition-grades.ts
```

---

## `/src/config/` — App Configuration

```
src/config/
├── site.ts                              # App name, URLs, API base, locale defaults
├── routes.ts                            # All route constants (ROUTES object)
├── query-keys.ts                        # TanStack Query key factory
├── breakpoints.ts                       # Tailwind breakpoint values in JS
└── permissions.ts                       # RBAC permission map per role
```

---

## `/src/i18n/` — Internationalisation

```
src/i18n/
├── request.ts                           # next-intl server config
├── routing.ts                           # Locale routing config
└── messages/
    ├── en/
    │   ├── common.json                  # Shared UI strings
    │   ├── tractors.json
    │   ├── used-listings.json
    │   ├── auth.json
    │   ├── dashboard.json
    │   ├── emi.json
    │   └── errors.json
    ├── hi/
    │   └── (same structure as en/)
    ├── mr/
    │   └── (same structure)
    ├── te/
    │   └── (same structure)
    └── ta/
        └── (same structure)
```

---

## `/src/styles/` — Global Styles

```
src/styles/
├── globals.css                          # Tailwind directives + CSS variables
├── fonts.css                            # @font-face for Noto Sans Devanagari
└── animations.css                       # Custom keyframes (shimmer, slide, etc.)
```

---

## Key Config Files

```
├── next.config.ts
│   — images.domains (S3 CloudFront CDN)
│   — i18n locales config
│   — ISR revalidation settings
│   — Security headers (CSP, X-Frame, HSTS)
│
├── tailwind.config.ts
│   — Custom colors: brand.green, brand.orange, brand.yellow
│   — Custom fonts: hindi (Noto Sans Devanagari)
│   — ShadCN theme tokens
│
├── tsconfig.json
│   — paths: @/* → ./src/*
│   — strict: true
│
├── next-sitemap.config.js
│   — siteUrl from env
│   — Dynamic paths for tractors, used-listings, dealers, blogs
│
├── middleware.ts
│   — Protected routes: /dashboard, /dealer, /admin
│   — Role guard for /admin (checks user_role cookie)
│   — Locale detection and redirect
│
└── .env.local
    NEXT_PUBLIC_APP_URL=
    NEXT_PUBLIC_API_URL=
    NEXT_PUBLIC_GOOGLE_MAPS_KEY=
    NEXT_PUBLIC_RAZORPAY_KEY=
    NEXT_PUBLIC_FIREBASE_CONFIG=
```

---

## Component Count Summary

| Category | Files |
|---|---|
| UI Primitives (ShadCN) | 25 |
| Shared / Global | 12 |
| Layout (Header, Footer, Sidebars) | 18 |
| Homepage Sections | 15 |
| New Tractor Catalog + PDP | 20 |
| Used Marketplace + Sell Funnel | 22 |
| Comparison Engine | 6 |
| EMI & Finance | 5 |
| Valuation Engine | 5 |
| Dealers & Locator | 6 |
| Lead Capture Forms | 6 |
| Auth Flow | 5 |
| User Dashboard | 9 |
| Dealer Panel | 5 |
| Admin Panel | 14 |
| Search | 5 |
| Form Primitives | 7 |
| **Total Components** | **~185** |

---

## Development Build Order

```
Phase 1 → Shared + Layout + Auth components
Phase 2 → Homepage sections + New Tractor Catalog + PDP
Phase 3 → Used Marketplace + Sell Funnel + Valuation
Phase 4 → EMI Calculator + Loan + Dealer Locator
Phase 5 → Compare Engine + Search + Filters
Phase 6 → Dashboard (Buyer + Dealer + Admin)
Phase 7 → Content CMS + SEO pages + Notifications
```

---

*TractorDost — Frontend Structure v1.0 | April 2026 | Confidential*