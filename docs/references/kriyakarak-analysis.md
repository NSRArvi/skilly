# KriyaKarak Platform Study & Benchmark Reference for Skilly

This document stores the complete architecture, feature set, UX/UI design patterns, and business model analysis of [KriyaKarak](https://kriyakarak.com/). This serves as a permanent reference for designing and implementing future features in **Skilly**.

---

## 1. Executive Summary & Value Proposition

* **Platform Name**: KriyaKarak (ক্রিয়াকারক)
* **Domain**: `https://kriyakarak.com`
* **Target Market**: Bangladesh (creative talent, service professionals, local businesses, gig economy clients).
* **Tagline**: *"অনুসন্ধান করুন, প্রোফাইল দেখুন এবং সার্ভিস বুক করুন"* (Search, explore profiles, and book services).
* **Model**: Two-sided hybrid marketplace:
  1. **Direct Service Booking**: Browse fixed-price services and professional portfolios with calendar availability.
  2. **Job Marketplace**: Employers post custom requirements for free; verified professionals bid with proposals.
  3. **Creative Portfolio Showcase**: All-in-one profile serving as a digital resume and portfolio for Bangladeshi talent.

---

## 2. Design System & Visual Identity

### A. Color Palette
```css
:root {
  --brand-color: #0d5bff;         /* Electric Royal Blue (Primary Accent) */
  --brand-secondary: #407bff;     /* Vibrant Blue (Logo & Highlights) */
  --text-color: #000000;          /* Primary Headings */
  --design-black-color: #222222;  /* Body Text & High Contrast Icons */
  --common-card-bg: #f7f7f7;      /* Clean off-white surface for cards */
  --white: #ffffff;               /* Pure white background */
  --border-color: #e0e0e0;        /* Subtle divider borders */
  --success-color: #009939;       /* Verified badge green */
  --warning-color: #ffae00;       /* Star ratings amber */
  --error-color: #e94235;         /* Errors / alerts */
  --info-color: #6a9ad3;          /* Secondary info tags */
}
```

### B. Typography & Bilingual Styling
* **Primary Fonts**: `"DM Sans"`, `"Noto Sans Bengali"`, `"Kalpurush"`, sans-serif.
* **Script Integration**: Clean coexistence of Bengali typography and English technical/creative terminology (e.g. *UI/UX Designer*, *SEO Specialist*, *Meta Business Suite*).
* **Geometry**: Smooth border radiuses (`rounded-xl` / `rounded-2xl`, ~16px–24px) on cards, search bars, and action buttons.

### C. Hero & Layout Aesthetics
* **3D Curved Portfolio Slider**: Unique hero banner featuring circular rotating portfolio thumbnails framed by curved SVG shadows and wrappers (`slider-curved-wrapper.svg` & `slider-curved-shadow.svg`).
* **Layout Max Width**:
  * Desktop: `1200px` container.
  * Mobile: Clamped at `540px` with dedicated touch drawer and bottom navigation.
* **Clean Scroll**: Uses hidden scrollbars (`scrollbar-width: none`) for an app-like seamless aesthetic.

---

## 3. Taxonomy: 5 Core Industry Hubs (120+ Professions)

KriyaKarak categorizes all talent into five primary umbrellas:

1. **বিনোদন (Entertainment)**:
   * Influencers, Fashion Models, Actors, Actresses, Scriptwriters, Directors, Producers, Commercial Models, Singers, Magicians, Dancers & Choreographers, News Presenters, Podcasters, Comedians, Voiceover Artists, Calligraphers, Background Artists.
2. **প্রযুক্তি বিশেষজ্ঞ (Tech Experts)**:
   * Web Developers, App Developers, Game Developers, QA / Software Testers, Data Analysts, SEO Specialists, Software Engineers, UI/UX Designers, Animators, Motion Designers, Cybersecurity Analysts, Esports Gamers & Streamers, Content Writers, Translators.
3. **স্ট্র্যাটেজিস্ট ও পরামর্শদাতা (Strategists & Consultants)**:
   * Cinematographers, Event Photographers, Wedding Photographers, Corporate Photographers, Event Planners & Caterers, Band Musicians/DJs, PR Specialists, Study Abroad Consultants, Career Advisors, Business & Management Consultants, IT Consultants, Financial Advisors, Legal Counsel, Auditors, Accountants.
4. **সৌন্দর্য এবং সুস্থতা (Beauty & Wellness)**:
   * Makeup Artists, Bridal Makeup Specialists, Henna/Mehendi Artists, Hair Stylists, Massage Therapists, Tattoo Artists, Men's Grooming Experts, Physiotherapists, Yoga Instructors, Dietitians, Nail Technicians, Personal Fitness Trainers, Mental Health Counselors.
5. **বিশেষায়িত প্রফেশনাল (Specialized Professionals)**:
   * Chefs, Bakers, Architects, Interior Decorators & Designers, Civil/Mechanical Engineers, Journalists, Lawyers, Doctors, Nurses, Home Tutors, Sports Coaches, Product Designers.

---

## 4. Product Features & Architecture

### A. Two-Tier Verification System
1. **পরিচিতি ভেরিফাইড (Identity Verified)**: Verification of national identity via government-issued NID, Passport, or Birth Certificate.
2. **ভেরিফাইড প্রফেশনাল (Verified Professional)**: Portfolio and skill validation by platform admins.
3. **Talent Badges**:
   * *টপ রেটেড (Top Rated)*
   * *সেরা বিক্রেতা (Best Seller)*
   * *রাইজিং স্টার (Rising Star)*

### B. Cards & Directory Design (`/search` & `/feed`)
* **Professional Card**:
  * Avatar with verified ring indicator + checkmark badge.
  * Tier badge pill on top left (e.g., Top Rated / Rising Star).
  * Category / Profession label.
  * Full name with hover state color transition.
  * Verification status pill ("ভেরিফাইড প্রফেশনাল" or "পরিচিতি ভেরিফাইড").
  * Star rating with total review count: `5.0 (4)`.
  * Primary Action: **"বুক করুন" (Book Now)** or **"এক্সপার্টকে রিকোয়েস্ট করুন" (Request Expert)**.
* **Service Cards**:
  * Rich thumbnail/portfolio gallery preview.
  * Service title & short description.
  * Price starting rate in BDT (`৳`).
  * Direct booking button.

### C. Job Board & Bidding Engine (`/jobs`)
* **Free Job Posting for Employers**: Clients describe the project, select category tags, and post without upfront fees.
* **Key Job Card Metadata**:
  * Job title & target skills tags.
  * Budget in BDT (`২০,০০০ টাকা`).
  * Timeline / Deadline (`০৮/০৯/২০২৬ - ৩১/১০/২০২৬ ফ্লেক্সিবল`).
  * Location (e.g., *R9FV+29F ECB Chattar, Dhaka 1206* or *Banasree Main Rd, Dhaka 1219*).
  * Applicant tracker (e.g. *কেউ আবেদন করেনি* or application count).
* **Curated Proposals**: Expert applications undergo admin screening before reaching the client to avoid spam.

### D. Seller Onboarding & Tier Calculator (`/seller`)
* **Freemium Tier (৳0 / month)**:
  * 10 transactions/month.
  * ৳10,000 monthly withdrawal limit.
  * 2 GB portfolio media storage.
* **Dynamic Fee & Storage Calculator**:
  * Allows freelancers to calculate monthly platform fees based on expected volume.
  * Storage upgrade mechanism: Sellers can purchase extra storage using accumulated reward points or wallet balances.

### E. Domestic Financial Infrastructure
* **bKash**: Instant payouts directly to mobile wallets.
* **SSLCommerz**: Multi-channel gateway for debit/credit cards (Visa, MasterCard, Amex) and local mobile financial services.
* **Minimum Withdrawal**: ৳100 BDT.
* **Escrow & Safe Settlement**: Payments are held until service delivery confirmation.

---

## 5. Blueprint: Features to Adopt for Skilly

| Feature to Build | Specific Implementation in Skilly |
| :--- | :--- |
| **1. Dual Verification Badges** | Update `ProfessionalsCard.jsx` and database schema to distinguish between `is_identity_verified` (NID/Passport) and `is_pro_verified` (Skill vetting). |
| **2. Talent Tier Ribbons** | Add badges for "Top Rated", "Rising Star", and "Featured Expert" on professional cards. |
| **3. Portfolio Hero Carousel** | Create a curved or circular 3D portfolio preview slider showcasing top works on the Skilly landing page. |
| **4. Localized Filter Bar** | Add category filters matching the 5 major hubs (Tech, Creative/Entertainment, Consulting, Beauty, Specialized) plus Dhaka/regional location tags. |
| **5. Job Board Module** | Add `/jobs` where Bangladeshi businesses can post requirements with BDT budgets, deadlines, and locations. |
| **6. Local Payment Integrations** | Hook bKash and SSLCommerz for instant freelancer payouts and secure client escrow. |
| **7. Dual Language Support** | Provide an English/Bengali toggle for tech-savvy international clients vs local domestic service seekers. |
