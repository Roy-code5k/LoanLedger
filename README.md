# MiniLedger 💳

A modern, light-fintech mobile application built for tracking money lent to friends. With MiniLedger, users sign in with their phone number and a secure mock OTP (printed strictly to the backend terminal), record loans, mark debts as repaid, and view clear real-time lending summaries with prominent overdue highlights.

---

## 📸 Key Features

- **Phone-Number Authentication**: Sign in using your mobile number and a single-use 6-digit mock OTP (printed **only** in the backend terminal—no third-party SMS or email delivery required).
- **Session Persistence**: JWT sessions stored securely on-device using Expo SecureStore.
- **Fintech Dashboard**:
  - **Total Lent Card**: Aggregated sum of all loans in Indian Rupees (`₹`).
  - **Total Repaid Card**: Track how much has been cleared.
  - **Overdue Indicator Card**: Prominently highlights pending loans past their calendar due date.
- **Loan Management**:
  - Add loans with friend's name, positive decimal amount, and calendar due date.
  - One-tap **"Mark Repaid"** action that instantly recalculates summaries.
  - Filter chips to view **All**, **Pending**, **Repaid**, or **Overdue** entries.
  - Pull-to-refresh and reactive UI updates.
- **Strict Data Isolation**: All database operations are user-scoped; users can never read or mutate other users' records.
- **Decimal-Safe Financial Aggregations**: Uses Prisma `Decimal(12, 2)` calculations rather than floating-point math.

---

## 🏗️ Architecture & Request Flow

```
   ┌────────────────────────────────────────┐
   │        React Native Mobile App         │
   │               (Expo SDK)               │
   └───────────────────┬────────────────────┘
                       │ HTTP / JSON (Bearer JWT)
                       ▼
   ┌────────────────────────────────────────┐
   │        Express Backend (Node.js)       │
   │  ┌──────────────────────────────────┐  │
   │  │   Zod Input Validation Layer     │  │
   │  ├──────────────────────────────────┤  │
   │  │   Auth Middleware (JWT Verify)   │  │
   │  ├──────────────────────────────────┤  │
   │  │   Rate Limiters (Express-Rate)   │  │
   │  └──────────────────┬───────────────┘  │
   └─────────────────────┼──────────────────┘
                         │ Prisma ORM (Decimal precision)
                         ▼
   ┌────────────────────────────────────────┐
   │       Supabase Hosted PostgreSQL       │
   │    (users, otp_challenges, loans)      │
   └────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Mobile App** | React Native, Expo SDK, TypeScript, React Navigation (Native Stack), Expo SecureStore, DateTimePicker |
| **Backend API** | Node.js (v24), Express, TypeScript, Zod, bcryptjs, jsonwebtoken, express-rate-limit |
| **Database & ORM** | Supabase (PostgreSQL), Prisma ORM (v6.x) |
| **Automated Testing** | Vitest, Supertest (20 integration & unit tests passing) |

---

## 📋 Prerequisites

- **Node.js**: `v20.x` or `v24.x` (verified on `v24.11.1`)
- **Package Manager**: `npm` (verified on `11.6.2`)
- **Expo Go App** (optional, for physical device testing) or Android / iOS Emulator
- **Supabase Account**: A free Supabase PostgreSQL project

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/MiniLedger.git
cd MiniLedger

# Install backend dependencies
cd backend
npm install

# Install mobile dependencies
cd ../mobile
npm install
```

### 2. Configure Environment Variables

Create `backend/.env` based on `backend/.env.example`:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your actual Supabase connection details and a secret:

```env
PORT=4000
NODE_ENV=development

# Supabase PostgreSQL Connection Strings
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"
JWT_EXPIRES_IN="7d"

# Rate Limiting
OTP_RATE_LIMIT_WINDOW_MINUTES=5
OTP_RATE_LIMIT_MAX_REQUESTS=5
```

> **Note:** Never commit `backend/.env` to version control. The root `.gitignore` protects it.

### 3. Apply Database Schema

Push the Prisma schema to your Supabase PostgreSQL database:

```bash
cd backend
npx prisma db push
```

---

## 💻 Running the Application

### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:4000`:
- Health check: `http://localhost:4000/api/health`
- When you request an OTP in the app, look at **this backend console** to see the 6-digit mock OTP!

### Start the Mobile App

In a separate terminal:

```bash
cd mobile
npm run start
```

- Press `a` to run on an **Android emulator**.
- Press `i` to run on an **iOS simulator** (macOS only).
- Press `w` to open in a **web browser**.
- Or scan the QR code with **Expo Go** on your physical phone (ensure your phone and PC are on the same Wi-Fi network).

---

## 🧪 Testing

The backend includes a comprehensive automated test suite covering:
- Health check endpoints
- Database connectivity & Prisma client integrity
- OTP generation, hashing, rate limiting, expiration, and replay prevention
- JWT authentication middleware
- User-scoped loan creation, listing, and validation
- Repayment authorization and duplicate prevention (409 Conflict)
- Accurate financial aggregations & due-date edge cases (loans due today are not overdue)

Run all tests:

```bash
cd backend
npm test
```

Expected output:
```text
Test Files  4 passed (4)
Tests       20 passed (20)
```

---

## 📡 API Contract Reference

All endpoints are prefixed with `/api`.

### Authentication Endpoints

#### `POST /api/auth/request-otp`
Generate a mock OTP (logged strictly in backend terminal).

```bash
curl -X POST http://localhost:4000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```
Response `200 OK`:
```json
{
  "message": "OTP generated. Check the backend terminal for this demo."
}
```

#### `POST /api/auth/verify-otp`
Verify OTP and receive a signed JWT.

```bash
curl -X POST http://localhost:4000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "123456"}'
```
Response `200 OK`:
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "c1f7b824-...",
    "phone": "+919876543210"
  }
}
```

---

### Loan Endpoints (Require `Authorization: Bearer <token>`)

#### `POST /api/loans`
Create a loan.

```bash
curl -X POST http://localhost:4000/api/loans \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "friendName": "Aman Sharma",
    "amount": "1500.00",
    "dueDate": "2026-11-20"
  }'
```
Response `201 Created`:
```json
{
  "id": "e2c3...",
  "userId": "c1f7...",
  "friendName": "Aman Sharma",
  "amount": "1500.00",
  "dueDate": "2026-11-20",
  "status": "PENDING",
  "isOverdue": false,
  "repaidAt": null,
  "createdAt": "2026-10-22T08:00:00.000Z",
  "updatedAt": "2026-10-22T08:00:00.000Z"
}
```

#### `GET /api/loans?status=ALL`
List authenticated user's loans. Supports `ALL`, `PENDING`, `REPAID`, `OVERDUE`.

#### `PATCH /api/loans/:id/repay`
Mark a pending loan as repaid. Returns `409 Conflict` if already repaid.

---

### Summary Endpoint

#### `GET /api/summary`
Get aggregated lending totals for authenticated user.

Response `200 OK`:
```json
{
  "totalLent": "8500.00",
  "totalRepaid": "2500.00",
  "overdueAmount": "1000.00",
  "currency": "INR"
}
```

**Business Rules**:
- **Total Lent**: Sum of all loans created by the user.
- **Total Repaid**: Sum of all loans with status `REPAID`.
- **Overdue Amount**: Sum of `PENDING` loans with `dueDate` strictly earlier than today's calendar date.
- Loans due **today** are **not** overdue.
- Repaid loans are **never** counted in overdue amount.

---

## 🔒 Security Best Practices

1. **No Client Database Access**: The mobile app communicates exclusively with the Express REST API.
2. **Terminal Mock OTP**: OTPs are generated server-side and never returned in API payloads.
3. **Password & OTP Hashing**: Stored using bcrypt with 10 salt rounds.
4. **Environment Isolation**: `.env` files are excluded from Git.
5. **Rate Limiting**: Protects against brute-force attacks on OTP endpoints.

---

## 📽️ Demo Recording Plan (2:30 min)

| Time | Demonstration | Focus Points |
| :--- | :--- | :--- |
| **0:00 – 0:25** | Intro & Stack Overview | Express + TypeScript, Prisma ORM, Supabase PostgreSQL, Expo Mobile. |
| **0:25 – 0:50** | Phone Login & Mock OTP | Request OTP, show mock code printed in backend terminal, verify OTP. |
| **0:50 – 1:20** | Dashboard & Add Loan | View summary cards, create loan with friend name, INR amount & due date. |
| **1:20 – 1:45** | Overdue Highlighting | Demonstrate overdue loan badge and overdue card summary calculation. |
| **1:45 – 2:10** | Mark as Repaid | Tap "Mark Repaid", observe instant status change and updated totals. |
| **2:10 – 2:30** | Automated Tests & Conclusion | Run `npm test` showing 20 passing unit/integration tests. |

---

## 📄 License

MIT
