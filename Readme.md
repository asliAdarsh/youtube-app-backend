# YouTube App Backend

A comprehensive backend system for a YouTube-like video platform built with Node.js, Express, and MongoDB. This project provides a complete RESTful API for managing users, videos, playlists, comments, likes, tweets, and subscriptions.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Models](#models)
- [Usage](#usage)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

## ✨ Features

- **User Management**
  - User registration and authentication
  - JWT-based access and refresh tokens
  - Profile management (avatar, cover image)
  - Password hashing with bcrypt
  - Watch history tracking
  - Channel profile viewing

- **Video Management**
  - Video upload with thumbnails
  - Video metadata (title, description, duration)
  - View count tracking
  - Publish/unpublish functionality
  - Video search and filtering
  - Pagination support

- **Social Features**
  - Like/unlike videos, comments, and tweets
  - Comment on videos with reply support
  - Create and manage tweets
  - Subscribe/unsubscribe to channels
  - User dashboard with analytics

- **Playlist Management**
  - Create and manage playlists
  - Add/remove videos from playlists
  - Public/private playlist settings

- **Media Storage**
  - Cloudinary integration for media files
  - Support for video and image uploads
  - Automatic file handling with Multer

- **Security**
  - JWT authentication
  - Protected routes
  - CORS configuration
  - Cookie-based session management

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary
- **Environment Management**: dotenv
- **Development**: Nodemon

### Key Dependencies

```json
{
  "express": "^5.1.0",
  "mongoose": "^8.15.0",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^6.0.0",
  "cloudinary": "^2.6.1",
  "multer": "^2.0.0",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.5",
  "dotenv": "^16.5.0",
  "mongoose-aggregate-paginate-v2": "^1.1.4"
}
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas cloud database)
- Cloudinary account (for media storage)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/asliAdarsh/youtube-app-backend.git
   cd youtube-app-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory (see [Environment Variables](#environment-variables) section)

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start on the port specified in your `.env` file (default: 8000)

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8000
CORS_ORIGIN=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net

# JWT Tokens
ACCESS_TOKEN_SECRET=your_access_token_secret_key_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Note**: Replace the placeholder values with your actual credentials.

## 📁 Project Structure

```
youtube-app-backend/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── user.controller.js
│   │   ├── video.controller.js
│   │   ├── comment.controller.js
│   │   ├── playlist.controller.js
│   │   ├── subscription.controller.js
│   │   ├── tweet.controller.js
│   │   ├── like.controller.js
│   │   ├── dashboard.controller.js
│   │   └── healthcheck.controller.js
│   ├── models/             # Database schemas
│   │   ├── user.models.js
│   │   ├── video.models.js
│   │   ├── comment.models.js
│   │   ├── playlist.models.js
│   │   ├── subscription.models.js
│   │   ├── tweet.models.js
│   │   └── like.models.js
│   ├── routes/             # API routes
│   │   ├── user.routes.js
│   │   ├── video.routes.js
│   │   ├── comment.routes.js
│   │   ├── playlist.routes.js
│   │   ├── subscription.routes.js
│   │   ├── tweet.routes.js
│   │   ├── like.routes.js
│   │   ├── dashboard.routes.js
│   │   └── healthcheck.routes.js
│   ├── middlewares/        # Custom middleware
│   │   ├── auth.middleware.js
│   │   └── multer.middleware.js
│   ├── utils/              # Utility functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   ├── db/                 # Database configuration
│   │   └── index.js
│   ├── app.js              # Express app configuration
│   ├── constants.js        # Application constants
│   └── index.js            # Application entry point
├── public/                 # Static files
├── .env                    # Environment variables (not in repo)
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:8000/api/v1
```

### User Routes (`/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new user | No |
| POST | `/login` | Login user | No |
| POST | `/logout` | Logout user | Yes |
| POST | `/refresh-token` | Refresh access token | Yes |
| POST | `/change-password` | Change user password | Yes |
| GET | `/get-user` | Get current user details | Yes |
| PATCH | `/update-user` | Update user details | Yes |
| PATCH | `/update-avatar` | Update user avatar | Yes |
| PATCH | `/update-cover-image` | Update cover image | Yes |
| GET | `/c/:username` | Get channel profile | Yes |
| GET | `/history` | Get watch history | Yes |

### Video Routes (`/video`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all videos | Yes |
| POST | `/` | Upload a video | Yes |
| GET | `/:videoId` | Get video by ID | Yes |
| PATCH | `/:videoId` | Update video | Yes |
| DELETE | `/:videoId` | Delete video | Yes |
| PATCH | `/toggle/publish/:videoId` | Toggle publish status | Yes |

### Subscription Routes (`/subscriptions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/:channelId` | Subscribe to channel | Yes |
| DELETE | `/:channelId` | Unsubscribe from channel | Yes |
| GET | `/` | Get user subscriptions | Yes |

### Playlist Routes (`/playlist`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create playlist | Yes |
| GET | `/:playlistId` | Get playlist by ID | Yes |
| PATCH | `/:playlistId` | Update playlist | Yes |
| DELETE | `/:playlistId` | Delete playlist | Yes |
| PATCH | `/add/:videoId/:playlistId` | Add video to playlist | Yes |
| PATCH | `/remove/:videoId/:playlistId` | Remove video from playlist | Yes |

### Comment Routes (`/comment`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/:videoId` | Add comment to video | Yes |
| GET | `/:videoId` | Get video comments | Yes |
| PATCH | `/:commentId` | Update comment | Yes |
| DELETE | `/:commentId` | Delete comment | Yes |

### Tweet Routes (`/tweet`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create tweet | Yes |
| GET | `/user/:userId` | Get user tweets | Yes |
| PATCH | `/:tweetId` | Update tweet | Yes |
| DELETE | `/:tweetId` | Delete tweet | Yes |

### Like Routes (`/like`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/toggle/video/:videoId` | Toggle like on video | Yes |
| POST | `/toggle/comment/:commentId` | Toggle like on comment | Yes |
| POST | `/toggle/tweet/:tweetId` | Toggle like on tweet | Yes |
| GET | `/videos` | Get liked videos | Yes |

### Dashboard Routes (`/dashboard`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/stats` | Get channel statistics | Yes |
| GET | `/videos` | Get channel videos | Yes |

### Health Check (`/healthcheck`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Check API health | No |

## 📊 Models

### User Model
- username (unique)
- email (unique)
- fullName
- avatar (Cloudinary URL)
- coverImage (Cloudinary URL)
- watchHistory (array of video references)
- password (hashed)
- refreshToken
- timestamps

### Video Model
- videoFile (Cloudinary URL)
- thumbnail (Cloudinary URL)
- title
- description
- duration
- views
- isPublished
- owner (user reference)
- timestamps

### Comment Model
- content
- video (video reference)
- owner (user reference)
- timestamps

### Playlist Model
- name
- description
- videos (array of video references)
- owner (user reference)
- timestamps

### Subscription Model
- subscriber (user reference)
- channel (user reference)
- timestamps

### Tweet Model
- content
- owner (user reference)
- timestamps

### Like Model
- video (video reference, optional)
- comment (comment reference, optional)
- tweet (tweet reference, optional)
- likedBy (user reference)
- timestamps

## 💻 Usage

### Register a New User

```bash
POST /api/v1/users/register
Content-Type: multipart/form-data

Fields:
- username
- email
- fullName
- password
- avatar (file)
- coverImage (file, optional)
```

### Login

```bash
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

### Upload a Video

```bash
POST /api/v1/video
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Fields:
- title
- description
- videoFile (file)
- thumbnail (file)
```

### Get All Videos

```bash
GET /api/v1/video
Authorization: Bearer <access_token>
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👤 Author

**Adarsh Jaiswal**

- GitHub: [@asliAdarsh](https://github.com/asliAdarsh)

## 📝 License

This project is [ISC](https://opensource.org/licenses/ISC) licensed.

---

Made with ❤️ by Adarsh Jaiswal

