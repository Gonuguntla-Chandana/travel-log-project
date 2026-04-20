# 🗺 Travel Log — MERN Stack Major Project

A full-stack travel journaling application where users can **pin locations on an interactive map**, attach photos, write reviews, and track their visited vs wishlist places — all with secure user authentication.

---

## 🌐 Live Demo

> **Frontend:** [your-app.netlify.app](https://app.netlify.com/teams/gonuguntla-chandana/projects)  
> **Backend API:** [your-api.onrender.com](https://dashboard.render.com/)

---

## 📸 Screenshots

### Login Page
![Login Page](screenshots/login.png)

### Map View with Pins
![Map View](screenshots/map.png)

### Pin Popup with Photo
![Pin Popup](screenshots/popup.png)

### Stats Dashboard
![Dashboard](screenshots/dashboard.png)

---

## ✨ Features

### 🔐 Authentication
- User **Register and Login** with email and password
- Passwords hashed securely using **bcryptjs**
- **JWT tokens** for protected routes
- Each user sees only their own pins — complete data privacy

### 🗺 Interactive Map
- Full-screen map powered by **MapLibre GL** and **MapTiler**
- Click anywhere on the map to **add a new pin**
- Click any pin to **view its details** in a popup
- **Navigation controls** — zoom in/out, compass reset

### 📍 Pin Management
- Add pins with **title, description, star rating (1–5), type and photo**
- Two pin types — **Visited** (📍) and **Wishlist** (🔖) with different markers
- **Filter buttons** — show All / Visited only / Wishlist only
- **Delete pins** with one click — removes from MongoDB and Cloudinary
- All pins **persist in MongoDB** — data survives page refresh

### 🔍 Search
- **Live search bar** in the navbar — filters pins by title and description as you type
- Shows result count badge while searching
- Works together with the type filter simultaneously

### 📸 Photo Uploads
- Upload a photo with each pin using **Cloudinary**
- Image preview before saving
- Photos displayed inside pin popups on the map
- Deleted pins automatically remove their image from Cloudinary

### 📊 Dashboard
- **Stats cards** — total pins, visited count, wishlist count, average rating, photos count
- **Top rated place** with its photo
- **Visited vs Wishlist** progress bars with percentages
- **Star rating breakdown** — how many 1⭐, 2⭐ ... 5⭐ ratings
- **Recent activity feed** — last 5 pins added with thumbnails

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | UI framework |
| MapLibre GL | Interactive map rendering |
| MapTiler API | Map tiles and styles |
| Axios | HTTP requests to backend |
| React Map GL | React wrapper for MapLibre |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| MongoDB | NoSQL database |
| Mongoose | MongoDB object modeling |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| Multer | File upload handling |
| Cloudinary | Cloud image storage |
| Helmet | HTTP security headers |
| Morgan | HTTP request logging |
| CORS | Cross-origin resource sharing |

---

## 📁 Project Structure

```
travel-log-project/
│
├── client/                          # React Frontend
│   ├── public/
│   └── src/
│       ├── pages/
│       │   ├── Login.js             # Register & Login page
│       │   ├── Login.css
│       │   ├── Dashboard.js         # Stats dashboard page
│       │   └── Dashboard.css
│       ├── App.js                   # Main map component
│       ├── App.css
│       └── index.js
│
├── server/                          # Express Backend
│   ├── middleware/
│   │   └── verifyToken.js           # JWT auth middleware
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   └── Log.js                   # Pin/Log schema
│   ├── routes/
│   │   ├── auth.js                  # Register & Login routes
│   │   └── logs.js                  # CRUD routes for pins
│   ├── utils/
│   │   └── cloudinary.js            # Cloudinary config
│   ├── .env                         # Environment variables
│   └── index.js                     # Server entry point
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free)
- Cloudinary account (free)
- MapTiler account (free)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/travel-log-project.git
cd travel-log-project
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```env
MONGO_URL=your_mongoDB_connectiuon_string
PORT=5000
JWT_SECRET=your_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the server:
```bash
node index.js
```

You should see:
```
Backend server running on port 5000
MongoDB Connected!
```

### 3. Setup the Frontend

```bash
cd client
npm install
```

Create a `.env` file inside `client/`:
```env
REACT_APP_MAPTILER_KEY=your_maptiler_key
REACT_APP_API_URL=http://localhost:5000
your-app.netlify.app  →  splendid-cheesecake-f20be3.netlify.app
your-api.onrender.com →  travel-log-project.onrender.com
```

Start the React app:
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔌 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | ❌ |
| POST | `/api/auth/login` | Login and get JWT token | ❌ |

### Log Routes — `/api/logs`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/logs` | Get all pins for logged-in user | ✅ |
| POST | `/api/logs` | Create a new pin (with optional image) | ✅ |
| DELETE | `/api/logs/:id` | Delete a pin (owner only) | ✅ |

---

## 🗄️ Database Schema

### User
```js
{
  username:   String (unique, required),
  email:      String (unique, required),
  password:   String (hashed, required),
  profilePic: String (default: ""),
  createdAt:  Date,
  updatedAt:  Date
}
```

### Log (Pin)
```js
{
  userId:      ObjectId (ref: User, required),
  title:       String (required),
  description: String (required),
  rating:      Number (1–5),
  type:        String ("visited" | "wishlist"),
  image:       String (Cloudinary URL),
  latitude:    Number (required),
  longitude:   Number (required),
  createdAt:   Date,
  updatedAt:   Date
}
```

---

## 🔒 Security Features

- Passwords hashed with **bcryptjs** (salt rounds: 10) — never stored in plain text
- **JWT tokens** expire after 7 days
- All pin routes protected with `verifyToken` middleware
- Users can only **read and delete their own pins** — ownership check on every request
- **Helmet.js** sets secure HTTP headers
- Images are deleted from Cloudinary when a pin is deleted — no orphaned data

---

## 👤 Author

**Chandana Gonuguntla** — Full Stack Developer, MERN Stack Developer, Blockchain Developer.  
📧 gonuguntlachandana093@gmail.com  
🐙 [github.com/Gonuguntla-Chandana](https://github.com/Gonuguntla-Chandana)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
