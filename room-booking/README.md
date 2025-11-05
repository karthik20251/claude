# Room Booking System

A full-stack Teams-style room booking system that allows users to reserve conference rooms with automatic conflict detection and availability management.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Interactive Calendar**: FullCalendar integration for intuitive booking visualization
- **Smart Room Assignment**: Automatic room assignment when preferred room is unavailable
- **Conflict Prevention**: Real-time conflict detection to prevent double bookings
- **Admin Dashboard**: Comprehensive room and booking management for administrators
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS
- **Real-time Updates**: Instant booking confirmations and cancellations

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- FullCalendar for calendar views
- React Router for navigation
- Axios for API calls
- React Hot Toast for notifications

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- express-validator for input validation
- helmet, cors, rate-limiting for security

## Project Structure

```
/room-booking/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── context/       # React context (Auth)
│   │   ├── utils/         # Helper functions
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                # Express backend
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── controllers/  # Route controllers
│   │   ├── middlewares/  # Custom middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   └── utils/        # Utilities & seed
│   ├── server.js         # Entry point
│   └── package.json
├── docker-compose.yml    # MongoDB container
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Docker (optional, for MongoDB)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd room-booking
```

### 2. Set Up MongoDB

**Option A: Using Docker (Recommended)**
```bash
docker-compose up -d
```
This will start:
- MongoDB on `localhost:27017`
- Mongo Express UI on `http://localhost:8081` (admin/admin123)

**Option B: Local MongoDB**
- Install MongoDB locally
- Ensure it's running on `localhost:27017`

### 3. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/room_booking
JWT_SECRET=your_secure_random_secret_key_here
JWT_EXPIRES_IN=2d
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

**Seed the database:**
```bash
npm run seed
```

**Start the server:**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd client
npm install
```

Create `.env` file in `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

**Start the development server:**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Usage

### Demo Credentials

After running the seed script, use these credentials:

**Admin Account:**
- Email: `admin@demo.com`
- Password: `Admin@123`

**User Accounts:**
- Email: `john@demo.com` / Password: `User@123`
- Email: `jane@demo.com` / Password: `User@123`
- Email: `bob@demo.com` / Password: `User@123`

### User Features

1. **View Calendar**: See all room bookings in calendar view
2. **Create Booking**:
   - Click on a date or "New Booking" button
   - Select date, time range, and purpose
   - Optionally choose a preferred room
   - System auto-assigns if preferred room is unavailable
3. **My Bookings**: View and manage your bookings
4. **Cancel Booking**: Cancel your own bookings

### Admin Features

1. **Manage Rooms**:
   - Add/edit/delete meeting rooms
   - Set capacity, location, amenities
   - Activate/deactivate rooms
2. **View All Bookings**: See all bookings across the organization
3. **Cancel Any Booking**: Admin can cancel any user's booking

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Rooms
- `GET /api/rooms` - Get all rooms (with filters)
- `POST /api/rooms` - Create room (Admin)
- `GET /api/rooms/:id` - Get room by ID
- `PATCH /api/rooms/:id` - Update room (Admin)
- `DELETE /api/rooms/:id` - Delete room (Admin)

### Bookings
- `GET /api/bookings` - Get all bookings (Admin) or with filters
- `GET /api/bookings/my` - Get current user's bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking by ID
- `PATCH /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

## Conflict Detection

The system prevents double bookings using the following logic:

```
For same room on same date, reject if:
  requestedStart < existingEnd && requestedEnd > existingStart
```

This ensures no overlapping bookings for any room.

## Auto-Assignment Feature

When creating a booking:
1. If `preferredRoomId` is provided and available → book that room
2. If preferred room unavailable → automatically find and assign first available room
3. If no rooms available → return error with 409 status

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **Helmet**: HTTP security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: express-validator for all inputs
- **MongoDB Injection Prevention**: Mongoose sanitization

## Development Commands

### Backend
```bash
npm run dev      # Start with nodemon
npm start        # Production start
npm run seed     # Seed database with sample data
```

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure MongoDB Atlas or production MongoDB
4. Use PM2 or similar for process management
5. Set up reverse proxy (nginx)

### Frontend
```bash
npm run build
```
Deploy `dist/` folder to static hosting (Vercel, Netlify, etc.)

### Environment Variables (Production)
Update API URLs and MongoDB connection strings for production environment.

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `docker-compose ps`
- Check connection string in `.env`
- Verify port 27017 is not in use

### Port Conflicts
- Backend default: 5000 (change in `.env`)
- Frontend default: 5173 (change in `vite.config.js`)

### CORS Errors
- Ensure frontend URL is allowed in backend CORS config
- Check `CLIENT_URL` in backend environment

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
