# 🍳 RannaGhar — Server

> RannaGhar Recipe Sharing Platform — REST API built with Express.js, MongoDB & JWT Authentication.

![Node.js](https://img.shields.io/badge/Node.js-ESModule-339933?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-HTTPOnly_Cookie-000000?style=flat-square&logo=jsonwebtokens)
![Stripe](https://img.shields.io/badge/Stripe-22.2.3-635bff?style=flat-square&logo=stripe)

---

## 🔗 Base URL

```
https://rannaghar-server.vercel.app/api
```

---

## ✨ Features

- 🔐 JWT Authentication — HTTPOnly Cookie
- 🌐 Google OAuth token verify (server-side)
- 👮 Role-based middleware — User / Admin
- 🖼️ Image upload via **imgbb** API (multer + axios)
- 💳 **Stripe** payment intent & webhook
- 🛡️ Security — Helmet, CORS, Rate Limiting
- 📄 Server-side pagination
- 🗄️ MongoDB + Mongoose ODM

---

## 🛠️ Tech Stack

| Package | Purpose |
|---|---|
| `express` v5 | Web framework |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT generate & verify |
| `bcryptjs` | Password hashing |
| `cookie-parser` | HTTPOnly cookie read |
| `cors` | Cross-origin config |
| `helmet` | Security headers |
| `express-rate-limit` | API rate limiting |
| `multer` | File/image upload buffer |
| `axios` + `form-data` | imgbb API call |
| `stripe` | Payment processing |
| `dotenv` | Environment variables |

---

## 📁 Folder Structure

```
rannaghar-server/
│
├── src/
│   ├── config/
│   │   ├── db.js                  # MongoDB connect
│   │   └── stripe.js              # Stripe instance
│   │
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Recipe.model.js
│   │   ├── Favorite.model.js
│   │   ├── Report.model.js
│   │   └── Payment.model.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js         # /api/auth
│   │   ├── user.routes.js         # /api/users
│   │   ├── recipe.routes.js       # /api/recipes
│   │   ├── favorite.routes.js     # /api/favorites
│   │   ├── report.routes.js       # /api/reports
│   │   └── payment.routes.js      # /api/payments
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── recipe.controller.js
│   │   ├── favorite.controller.js
│   │   ├── report.controller.js
│   │   └── payment.controller.js
│   │
│   ├── middlewares/
│   │   ├── verifyToken.js         # JWT verify from cookie
│   │   ├── verifyAdmin.js         # Admin role check
│   │   ├── verifyPremium.js       # Premium check
│   │   ├── rateLimiter.js         # Rate limit config
│   │   └── uploadMiddleware.js    # Multer memoryStorage
│   │
│   ├── utils/
│   │   ├── generateToken.js       # jwt.sign()
│   │   ├── setCookie.js           # HTTPOnly cookie set
│   │   ├── uploadToImgbb.js       # Buffer → imgbb API
│   │   └── apiResponse.js         # Standard response format
│   │
│   └── index.js                   # Entry point
│
├── .env
├── .gitignore
├── README.md
└── package.json
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/google` | Public | Google token verify → JWT cookie |
| POST | `/api/auth/logout` | Private | Cookie clear |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | Get all users |
| GET | `/api/users/me` | Private | Get own profile |
| PATCH | `/api/users/me` | Private | Update profile |
| PATCH | `/api/users/:id/block` | Admin | Block/unblock user |
| GET | `/api/users/:email/role` | Private | Check role |

### Recipes
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/recipes` | Public | Get all recipes (pagination + filter) |
| GET | `/api/recipes/featured` | Public | Get featured recipes |
| GET | `/api/recipes/popular` | Public | Get most liked recipes |
| GET | `/api/recipes/:id` | Public | Get single recipe |
| POST | `/api/recipes` | Private | Create recipe |
| PATCH | `/api/recipes/:id` | Private | Update recipe |
| DELETE | `/api/recipes/:id` | Private/Admin | Delete recipe |
| PATCH | `/api/recipes/:id/like` | Private | Toggle like |
| PATCH | `/api/recipes/:id/feature` | Admin | Toggle featured |

### Favorites
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/favorites` | Private | Get my favorites |
| POST | `/api/favorites` | Private | Add favorite |
| DELETE | `/api/favorites/:recipeId` | Private | Remove favorite |

### Reports
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/reports` | Private | Report a recipe |
| GET | `/api/reports` | Admin | Get all reports |
| PATCH | `/api/reports/:id/dismiss` | Admin | Dismiss report |
| DELETE | `/api/reports/:id/remove-recipe` | Admin | Remove recipe |

### Payments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/payments/create-intent` | Private | Create Stripe payment intent |
| POST | `/api/payments/confirm` | Private | Confirm & save payment |
| GET | `/api/payments/my-payments` | Private | Get my payment history |
| GET | `/api/payments` | Admin | Get all transactions |
| POST | `/api/payments/premium` | Private | Premium membership |

### Upload
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/upload/image` | Private | Upload image to imgbb |

---

## ⚙️ Environment Variables

Create `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/rannaghar

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# Client
CLIENT_URL=http://localhost:3000

# Google OAuth (server-side verify)
GOOGLE_CLIENT_ID=your_google_client_id

# imgbb
IMGBB_API_KEY=your_imgbb_api_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

## 🚀 Installation & Run

```bash
# 1. Clone repository
git clone https://github.com/your-username/rannaghar-server.git
cd rannaghar-server

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Then add your own keys

# 4. Run development server
npm run dev
```

Server will run on → [http://localhost:5000](http://localhost:5000)

---

## 🗄️ Database Schema

### users
```js
{
  name: String,
  email: String,        // unique
  image: String,
  role: String,         // 'user' | 'admin'
  isBlocked: Boolean,   // default: false
  isPremium: Boolean,   // default: false
  createdAt, updatedAt
}
```

### recipes
```js
{
  recipeName: String,
  recipeImage: String,
  category: String,
  cuisineType: String,
  difficultyLevel: String,  // 'easy' | 'medium' | 'hard'
  preparationTime: Number,
  ingredients: [String],
  instructions: String,
  authorId: ObjectId,
  authorName: String,
  authorEmail: String,
  likesCount: Number,       // default: 0
  likedBy: [String],        // email array (duplicate prevent)
  isFeatured: Boolean,      // default: false
  isPurchased: Boolean,     // default: false
  price: Number,
  status: String,           // 'active' | 'deleted'
  createdAt, updatedAt
}
```

### favorites
```js
{
  userId: ObjectId,
  userEmail: String,
  recipeId: ObjectId,
  addedAt: Date
}
```

### reports
```js
{
  recipeId: ObjectId,
  reporterEmail: String,
  reason: String,    // 'spam' | 'offensive' | 'copyright'
  status: String,    // 'pending' | 'dismissed' | 'removed'
  createdAt
}
```

### payments
```js
{
  userId: ObjectId,
  userEmail: String,
  amount: Number,
  recipeId: ObjectId,      // null if premium
  type: String,            // 'recipe' | 'premium'
  transactionId: String,
  paymentStatus: String,   // 'success' | 'failed'
  paidAt: Date
}
```

---

## 🔒 Security

- JWT HTTPOnly Cookie — Protection against XSS
- Helmet — Security headers
- CORS — Only client origin allowed
- Rate Limiting — 100 requests per 15 minutes per IP
- bcryptjs — Password hash (saltRounds: 12)
- Admin middleware — All sensitive routes protected

---

## 🌐 Deployment (Vercel / Render)

```bash
# Production build
npm start
```

> ⚠️ Never push `.env` file to GitHub.
> Make sure `.env` is in `.gitignore`.

---

## 📄 License

MIT © 2026 RannaGhar