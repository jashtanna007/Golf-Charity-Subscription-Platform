# 🟢 The Philanthropic Green
### *A Full-Stack Charity-Linked Subscription & Prize Platform*

**The Philanthropic Green** is a modern web application designed to gamify charitable giving. Users subscribe to support verified charities and, in return, receive entries into automated prize draws. This project demonstrates a complete end-to-end integration of secure payments, complex relational database management, and real-time UI updates.

---

## 🚀 Key Features
* **Stripe-Powered Subscriptions:** Secure recurring billing with automated "Active" status synchronization.
* **Dynamic Prize Draws:** A multi-stage draw lifecycle (Pending → Open → Published → Completed).
* **Winner Verification Engine:** Custom PostgreSQL logic to match user entries against winning numbers and calculate prize tiers (3, 4, or 5-number matches).
* **Charity Allocation:** Users can select a specific charity to receive a percentage of their subscription.
* **Admin Control Center:** Specialized dashboard for executing draws, managing users, and approving prize payouts.

---

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS, Lucide Icons
* **Backend/BaaS:** Supabase (PostgreSQL, Auth, Edge Functions)
* **Payments:** Stripe API (Subscriptions & Webhooks)
* **Deployment:** Vercel

---

## 🧩 Database Architecture & Integrity
A core focus of this project was ensuring **Strict Data Integrity** for the lottery system.

* **Atomic Draw Entries:** Implemented `UNIQUE` constraints across `(draw_id, user_id)` to prevent double-entry and ensure fair play.
* **Relational Mapping:** Optimized schema connecting `users`, `subscriptions`, `draw_entries`, and `winners`.
* **Custom Postgres Enums:** Used strict typing for `draw_status` and `payment_status` to ensure the frontend UI correctly reflects the database state.

> **Technical Solution:** Resolved a critical race condition by implementing a `unique_winner_per_draw` constraint, preventing duplicate prize records during automated draw execution.

---

## 📸 System Workflow

### 1. Subscription & Entry
Users must have an `active` Stripe subscription to enter a draw. Once a user selects their 5 numbers, the UI dynamically switches from an "Entry Grid" to a "Confirmed" state using conditional rendering.

### 2. Draw Execution
When a draw is moved to `completed`, the system identifies winners based on the following tiers:
* **Tier 1:** 5/5 Match (Jackpot)
* **Tier 2:** 4/5 Match
* **Tier 3:** 3/5 Match

### 3. Payout & Verification
Winners are logged in the `winners` table with a `pending` status. Admins verify the proof of play and approve the payout, which updates the user's **My Winnings** dashboard in real-time.

---

## ⚙️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/jashtanna007/Golf-Charity-Subscription-Platform.git](https://github.com/jashtanna007/Golf-Charity-Subscription-Platform.git)
    cd Golf-Charity-Subscription-Platform
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
    ```

4.  **Database Initialization:**
    Run the `schema.sql` file (found in the root) in your Supabase SQL Editor to set up the necessary tables, types, and triggers.

5.  **Run the application:**
    ```bash
    npm run dev
    ```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
