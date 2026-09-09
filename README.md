# 3W Social App

A **MERN stack mini social-post application** with a clean, modern dark-themed UI inspired by card-based social feeds. Built as a monorepo with separate `frontend/` and `backend/` directories.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js (Vite), Material UI (MUI) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **Image Upload** | Multer (local disk storage) |

## 📁 Project Structure

```
3w-social-app/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── models/          # User.js, Post.js (Mongoose schemas)
│   │   ├── controllers/     # auth.controller.js, post.controller.js
│   │   ├── routes/          # auth.routes.js, post.routes.js
│   │   ├── middleware/      # auth, upload, error middleware
│   │   ├── utils/           # generateToken.js, asyncHandler.js
│   │   └── server.js
│   ├── uploads/             # Uploaded images (gitignored)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance + API calls
│   │   ├── components/      # PostCard, Navbar, CreatePostModal, CommentSection, LikeButton
│   │   ├── pages/           # Login, Signup, Feed
│   │   ├── context/         # AuthContext
│   │   ├── theme/           # MUI dark theme customization
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/3w-social-app.git
cd 3w-social-app
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env from template
cp .env.example .env
# Edit .env with your values:
#   PORT=5000
#   MONGO_URI=your_mongodb_atlas_connection_string
#   JWT_SECRET=your_secret_key

npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env from template (already set for local dev)
cp .env.example .env

npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Posts
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/posts?page=1&limit=10` | Get paginated feed | Yes |
| GET | `/api/posts/:id` | Get single post | Yes |
| POST | `/api/posts` | Create post (multipart) | Yes |
| POST | `/api/posts/:id/like` | Toggle like | Yes |
| POST | `/api/posts/:id/comment` | Add comment | Yes |

### Response Format
All API responses follow: `{ success: Boolean, data: Object, message: String }`

## 📦 Database Collections

Only **2 MongoDB collections**:
1. **users** — username, email, hashed password, avatar
2. **posts** — author (ref User), text, image, likes[], comments[]

## ✨ Features

- ✅ JWT-based authentication (signup/login)
- ✅ Create posts with text, image, or both
- ✅ Validates that at least text OR image is present
- ✅ Like/unlike toggle with instant UI update
- ✅ Comments with instant UI update (no page reload)
- ✅ Paginated feed (newest first, "Load More" button)
- ✅ Dark theme with MUI components
- ✅ Responsive design (mobile-first)
- ✅ Protected routes (redirect to login if not authenticated)

## 🌐 Deployment

### Backend → Render
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add env vars from `.env.example`

### Frontend → Vercel
- Root directory: `frontend`
- Framework: Vite
- Add `VITE_API_BASE_URL` pointing to deployed backend URL
- Update backend CORS to allow frontend origin

### Database → MongoDB Atlas
- Create free cluster
- Whitelist `0.0.0.0/0` for dev
- Copy connection string to backend `.env`

## 🔗 Live Links

- **Frontend**: _[Add deployed URL]_
- **Backend API**: _[Add deployed URL]_

## 📸 Screenshots

_[Add screenshots after deployment]_

## 📝 License

MIT
