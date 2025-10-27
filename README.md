# 📸 Momento - Social Media Platform

A modern, full-stack social media application built with the MERN stack. Share moments, connect with friends, and engage with a vibrant community.

![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?logo=mongodb)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey?logo=express)

## ✨ Features

### Core Functionality
- 🔐 **Authentication & Authorization** - Secure JWT-based authentication with bcrypt password hashing
- 👤 **User Profiles** - Customizable profiles with profile picture uploads and editable social media links (Twitter/LinkedIn)
- 📝 **Posts & Feed** - Create, view, and delete posts with image support (stored as base64 in MongoDB)
- 💬 **Comments** - Comment on posts with full CRUD operations and timestamps
- ❤️ **Likes** - Like/unlike posts and see like counts
- 👥 **Follow System** - Follow/unfollow users and view following lists (with proper access control)
- 👁️ **Profile Views** - Track unique profile visitors with viewer list
- 🔍 **Search** - Real-time debounced search to find users by name or email (500ms delay)
- 🗑️ **Account Deletion** - Delete account with full name confirmation and cascading deletion
- 🎨 **Theme Toggle** - Switch between light/dark modes (available on login page and navbar)

### Performance Optimizations
- ⚡ **Pagination** - Efficient data loading with backend pagination (10 posts per page)
- 🔄 **Infinite Scroll** - Seamless content loading as you scroll using IntersectionObserver
- 🖼️ **Lazy Loading** - Images load only when 50px before viewport
- 🗜️ **Image Compression** - Automatic client-side compression (60-80% size reduction)
  - Profile pictures: Max 800px, 70% quality
  - Post images: Max 1200px, 80% quality
- ⏱️ **Debounced Search** - 500ms delay reduces API calls by 90%
- 📦 **Base64 Storage** - Images stored directly in MongoDB for simplicity

### UI/UX Features
- 🎨 **Dark/Light Theme** - System-wide theme toggle with redux-persist
- 📱 **Responsive Design** - Fully mobile-friendly with Material-UI breakpoints
- 🔔 **Themed Notifications** - Material-UI Snackbar for success/error messages
- 🖼️ **Image Preview** - Preview images before posting with compression preview
- ⌨️ **Character Limit** - 500 character limit with real-time counter and warning
- 💀 **Default Avatars** - Auto-generated UI Avatars with user initials and random colors
- ⌛ **Loading States** - Skeleton loaders, spinners, and loading indicators
- 📭 **Empty States** - Friendly messages when content is empty
- ✅ **Confirmation Dialogs** - Material-UI dialogs for destructive actions (delete post, delete account)
- 🔒 **Access Control** - Can only edit your own following list, not others'
- 📏 **Flexible UI** - Username dropdown with dynamic width (150-250px) and ellipsis for long names

### Security & Privacy
- 🔐 **JWT Authentication** - Secure token-based auth with httpOnly considerations
- 🔒 **Password Hashing** - Bcrypt with 10 salt rounds
- 🛡️ **Protected Routes** - Middleware verification for all protected endpoints
- 👮 **Ownership Validation** - Users can only delete/edit their own content
- ⚠️ **Confirmation Flows** - Full name confirmation required for account deletion
- 🗑️ **Cascading Deletion** - Deleting account removes all posts and friend connections
- 🚫 **CORS Protection** - Configured allowed origins
- 🪖 **Helmet Security** - HTTP security headers

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Redux Toolkit** - State management
- **Material-UI (MUI)** - Component library & theming
- **React Router** - Client-side routing
- **Formik & Yup** - Form handling and validation
- **React Dropzone** - File upload handling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload middleware
- **Helmet** - Security headers
- **Morgan** - HTTP request logger

## 📁 Project Structure

```
Momento-main/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Avatar.jsx
│   │   │   ├── Friend.jsx
│   │   │   ├── UserImage.jsx
│   │   │   └── ...
│   │   ├── scenes/         # Page components
│   │   │   ├── homePage/
│   │   │   ├── loginPage/
│   │   │   ├── profilePage/
│   │   │   ├── navbar/
│   │   │   └── widgets/
│   │   ├── state/          # Redux store
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── server/                 # Express backend
│   ├── controllers/        # Route logic
│   │   ├── auth.js
│   │   ├── posts.js
│   │   └── users.js
│   ├── middleware/         # Custom middleware
│   │   └── auth.js
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── posts.js
│   │   └── users.js
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ installed
- **MongoDB Atlas** account (or local MongoDB instance)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/momento.git
cd momento
```

2. **Set up the Server**
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URL and JWT secret
npm install
npm start
```

3. **Set up the Client** (in a new terminal)
```bash
cd client
cp .env.example .env
# Edit .env if needed (default: http://localhost:3001)
npm install
npm start
```

4. **Open your browser**
```
http://localhost:3000
```

### Environment Variables

#### Server (`server/.env`)
```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
PORT=3001
```

#### Client (`client/.env`)
```env
REACT_APP_SERVER_URL=http://localhost:3001
```

## 📸 Screenshots

*Coming soon...*

## 🎯 API Endpoints

### Authentication
```
POST   /auth/register     - Register new user
POST   /auth/login        - Login user
```

### Users
```
GET    /users/:id              - Get user by ID
GET    /users/:id/friends      - Get user's following list
GET    /users/search?query=... - Search users (debounced)
PATCH  /users/:id/:friendId    - Follow/unfollow user
PATCH  /users/:id/social       - Update social media links
POST   /users/:id/view         - Track profile view
DELETE /users/:id              - Delete user account (requires full name confirmation)
```

### Posts
```
GET    /posts                  - Get all posts (paginated)
GET    /posts/:userId/posts    - Get user's posts (paginated)
POST   /posts                  - Create new post
DELETE /posts/:id              - Delete post
PATCH  /posts/:id/like         - Like/unlike post
POST   /posts/:id/comment      - Add comment
DELETE /posts/:id/comment/:commentId - Delete comment
```

**Pagination Parameters:**
- `?page=1` - Page number (default: 1)
- `?limit=10` - Items per page (default: 10)

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Protected API routes with auth middleware
- ✅ Helmet for security headers
- ✅ CORS configuration with allowed origins
- ✅ Input validation (Formik + Yup on frontend)
- ✅ Ownership validation for all delete/edit operations
- ✅ Environment variable protection (.env files gitignored)
- ✅ Full name confirmation for account deletion
- ✅ Cascading deletion (deletes user + all posts + friend connections)
- ✅ Access control for following lists (can't edit others' lists)

## 🎨 Key Features Explained

### Account Deletion with Safety
Users can delete their account from the navbar dropdown:
- Requires typing exact full name for confirmation
- Server-side validation of name match
- Cascading deletion: removes user, all their posts, and friend connections
- Automatically logs out after successful deletion

### Access Control for Following Lists
- When viewing your own profile: Can add/remove friends
- When viewing someone else's profile: Can only view their following list (no edit buttons)
- Redux state management prevents list corruption

### Theme Toggle Everywhere
Light/dark mode toggle available on:
- Login/Register page (top-right corner)
- Navbar (for authenticated users)
- Persists across sessions using redux-persist

### Debounced Search
Reduces API calls by 90% by waiting 500ms after user stops typing:
```javascript
// User types "John Smith" → Only 1 API call instead of 11!
```

### Infinite Scroll
Automatically loads more posts when scrolling near bottom using IntersectionObserver API.

### Lazy Loading Images
Images load only when they're 50px from entering the viewport, saving bandwidth and improving performance.

### Image Compression
All uploaded images are automatically compressed client-side:
- Profile pictures: Max 800px, 70% quality
- Post images: Max 1200px, 80% quality
- Reduces file sizes by 60-80%
- Images stored as base64 in MongoDB

### Real-time Updates
- New posts appear at the top immediately (no refresh needed)
- Friend count updates instantly when following/unfollowing
- Like counts and comments update in real-time

## 📚 Documentation

### Additional Features Implemented
- ✅ Light/Dark theme toggle on login page
- ✅ Delete account with full name confirmation
- ✅ Cascading deletion (user + posts + friend connections)
- ✅ Following list access control (view vs. edit)
- ✅ Dynamic username dropdown (responsive width)
- ✅ Real-time post updates (no refresh needed)
- ✅ Friend count live updates

### Performance Metrics
- **Search Optimization**: 90% reduction in API calls with 500ms debounce
- **Image Compression**: 60-80% file size reduction
- **Pagination**: 10 posts per page for optimal loading
- **Lazy Loading**: Images load 50px before viewport entry

## 🐛 Known Issues & Considerations

- Images stored as base64 in MongoDB (works but should migrate to Cloudinary/S3 for production)
- Base64 images increase document size (consider 16MB MongoDB document limit)
- No automated tests yet (recommended: Jest + React Testing Library)
- Some webpack deprecation warnings (non-breaking, suppressed with flags)
- Profile pictures use UI Avatars API as fallback (consider self-hosted solution)

## 🚧 Future Enhancements

### High Priority
- [ ] Migrate image storage to Cloudinary/AWS S3
- [ ] Add automated testing (Jest + React Testing Library)
- [ ] Implement real-time chat functionality (Socket.io)
- [ ] Add notifications system for likes, comments, follows
- [ ] Optimize database queries (indexing, aggregation)

### Medium Priority
- [ ] Add post sharing/reposting feature
- [ ] Create stories feature (24-hour expiry)
- [ ] Add video upload support
- [ ] Implement hashtags and mentions (@username)
- [ ] Add user verification badges
- [ ] Implement "Saved Posts" feature
- [ ] Add post editing capability
- [ ] Create "Explore" page with trending posts

### Low Priority
- [ ] Admin dashboard for moderation
- [ ] Implement CI/CD pipeline (GitHub Actions)
- [ ] Add Docker support for easy deployment
- [ ] Create mobile app (React Native)
- [ ] Add analytics dashboard for users
- [ ] Implement email notifications
- [ ] Add two-factor authentication
- [ ] Create API rate limiting
- [ ] Add post scheduling feature
- [ ] Implement content moderation (AI-based)

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Shubham Kumar**
- GitHub: [@ShubhamKr-047](https://github.com/ShubhamKr-047)

## 🙏 Acknowledgments

- Material-UI for the component library
- MongoDB Atlas for database hosting
- The MERN stack community

---

⭐ If you found this project helpful, please give it a star!
