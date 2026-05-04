# 🚀 LoanBook — Complete Deployment Guide (Free Hosting)

## Stack Overview
- **Frontend**: React.js → Vercel (free)
- **Backend**: Node.js + Express → Render (free)
- **Database**: MongoDB Atlas (free 512MB cluster)

---

## 📁 Folder Structure

```
loan-app/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Borrower.js
│   │   ├── Loan.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── borrowers.js
│   │   ├── loans.js
│   │   ├── payments.js
│   │   └── dashboard.js
│   ├── .env.example
│   ├── render.yaml
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Layout.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Dashboard.js
    │   │   ├── Borrowers.js
    │   │   ├── BorrowerDetail.js
    │   │   ├── Loans.js
    │   │   ├── LoanDetail.js
    │   │   ├── Login.js
    │   │   └── Register.js
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── format.js
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    ├── .env.example
    ├── vercel.json
    └── package.json
```

---

## 🗄️ STEP 1 — MongoDB Atlas Setup (Free)

1. Go to https://www.mongodb.com/atlas and click **"Try Free"**
2. Sign up / log in
3. Create a new project: `LoanBook`
4. Click **"Build a Database"** → Choose **M0 Free Tier**
5. Choose a cloud provider (AWS) and region closest to you
6. Set database name: `loantracker`
7. **Create a database user:**
   - Username: `loanadmin`
   - Password: Generate a strong password (save it!)
8. **Network Access:** Click "Allow Access from Anywhere" → Add IP `0.0.0.0/0`
   (required for Render free tier which uses dynamic IPs)
9. **Get Connection String:**
   - Click Connect → Connect your application → Driver: Node.js
   - Copy the string: `mongodb+srv://loanadmin:<password>@cluster0.xxxxx.mongodb.net/loantracker`
   - Replace `<password>` with your actual password

---

## ⚙️ STEP 2 — Backend Setup

### Local Development

```bash
cd loan-app/backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
# Server runs at http://localhost:5000
```

### Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🎨 STEP 3 — Frontend Setup

### Local Development

```bash
cd loan-app/frontend
npm install
cp .env.example .env
# Edit .env:
# REACT_APP_API_URL=http://localhost:5000/api
npm start
# App runs at http://localhost:3000
```

---

## ☁️ STEP 4 — Deploy Backend to Render (Free)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/loanbook.git
   git push -u origin main
   ```

2. Go to https://render.com → Sign up (free)

3. Click **"New +"** → **"Web Service"**

4. Connect your GitHub repo → Select the repo → Set **Root Directory** to `backend`

5. Configure:
   - **Name:** `loanbook-api`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free

6. Add **Environment Variables**:
   ```
   MONGODB_URI = mongodb+srv://loanadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/loantracker
   JWT_SECRET  = your_64_char_hex_secret_here
   CLIENT_URL  = https://loanbook.vercel.app  (update after Vercel deploy)
   NODE_ENV    = production
   PORT        = 5000
   ```

7. Click **"Create Web Service"**

8. Wait 2-3 minutes. Your API will be at:
   `https://loanbook-api.onrender.com`

9. Test: Visit `https://loanbook-api.onrender.com/api/health`
   → Should return `{"status":"OK"}`

> ⚠️ **Note:** Render free tier spins down after 15min inactivity.
> First request may take 30-60 seconds to wake up. This is normal.

---

## 🌐 STEP 5 — Deploy Frontend to Vercel (Free)

1. Go to https://vercel.com → Sign up with GitHub (free)

2. Click **"New Project"** → Import your GitHub repo

3. Configure:
   - **Root Directory:** `frontend`
   - **Framework:** Create React App
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

4. Add **Environment Variable**:
   ```
   REACT_APP_API_URL = https://loanbook-api.onrender.com/api
   ```
   (Use your actual Render URL from Step 4)

5. Click **"Deploy"**

6. Your app will be live at: `https://loanbook.vercel.app`

7. **Update CORS on Render:**
   Go to Render → Environment → Update `CLIENT_URL` to your Vercel URL
   → Trigger a redeploy

---

## 🔗 STEP 6 — Connect Everything

After both are deployed, verify:

1. ✅ Frontend loads at your Vercel URL
2. ✅ Register a new account
3. ✅ Add a borrower, create a loan, record a payment
4. ✅ Dashboard shows correct totals

---

## 🧪 API Endpoints Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login & get JWT token |
| GET | /api/auth/me | Get current user |

### Borrowers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/borrowers | List all borrowers |
| POST | /api/borrowers | Create borrower |
| GET | /api/borrowers/:id | Get borrower + loans |
| PUT | /api/borrowers/:id | Update borrower |
| DELETE | /api/borrowers/:id | Delete borrower (cascade) |

### Loans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/loans | List loans (with ?status=overdue filter) |
| POST | /api/loans | Create loan (auto-calculates interest) |
| GET | /api/loans/:id | Get loan + payment history |
| PUT | /api/loans/:id | Update loan |
| DELETE | /api/loans/:id | Delete loan + payments |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payments | Record payment |
| DELETE | /api/payments/:id | Delete/undo payment |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Full summary stats |

---

## 🧮 Interest Calculation Formulas

### Simple Interest
```
SI = (P × R × T) / 100
Where: P = Principal, R = Rate % per annum, T = Time in years (months/12)
Total Amount = P + SI
```

### Compound Interest
```
A = P × (1 + R/100/n)^(n×T)
CI = A - P
Where: n = compounding frequency (12=monthly, 4=quarterly, 1=annually)
```

---

## 📊 Sample Data (Test with these)

```json
// Borrower
{ "name": "Suresh Patel", "phone": "9876543210", "notes": "Neighbour" }

// Loan (Simple Interest)
{
  "principal": 50000,
  "interestRate": 12,
  "interestType": "simple",
  "startDate": "2024-01-01",
  "durationMonths": 12,
  "purpose": "Business"
}
// → Interest: ₹6,000 | Total: ₹56,000

// Loan (Compound Monthly)
{
  "principal": 100000,
  "interestRate": 10,
  "interestType": "compound",
  "compoundFrequency": "monthly",
  "startDate": "2024-01-01",
  "durationMonths": 24
}
// → Interest: ₹22,039 | Total: ₹1,22,039
```

---

## 🔐 Environment Variables Summary

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/loantracker
JWT_SECRET=your_64_char_hex_random_string
PORT=5000
CLIENT_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-api.onrender.com/api
```

---

## 🛠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error | Update CLIENT_URL in Render env vars |
| MongoDB connection failed | Check Atlas IP whitelist (add 0.0.0.0/0) |
| API slow first load | Render free tier cold start — normal |
| JWT invalid | Ensure JWT_SECRET is consistent across deploys |
| Payments exceed balance | API validates — check remaining balance |

---

## 🚀 Upgrade Path (When You Need More)

- **Database:** MongoDB Atlas M2 ($9/mo) for 2GB + backups
- **Backend:** Render Starter ($7/mo) for always-on server
- **Frontend:** Vercel stays free forever for personal projects
- **Auth:** Add Google OAuth with passport.js
- **Export:** Add CSV export with `json2csv` npm package

---

*Built with ❤️ — LoanBook v1.0*
